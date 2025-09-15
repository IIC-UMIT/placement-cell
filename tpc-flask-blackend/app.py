# import re
# import spacy
# import pandas as pd
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity

# # Load SpaCy NLP model
# nlp = spacy.load("en_core_web_sm")

# # Predefined job roles and required skills (Example Dataset)
# jobs = {
#     "Software Engineer": ["Python", "Java", "Data Structures", "Algorithms", "Machine Learning", "Django", "Flask"],
#     "Data Scientist": ["Python", "R", "Machine Learning", "Deep Learning", "NLP", "Statistics", "SQL"],
#     "Embedded Systems Engineer": ["C", "C++", "Microcontrollers", "RTOS", "PCB Design", "IoT"],
#     "Mechanical Design Engineer": ["AutoCAD", "SolidWorks", "FEA", "Matlab", "Product Design"]
# }

# # Function to extract skills from resume
# def extract_skills(text):
#     doc = nlp(text)
#     skills = []
#     for token in doc:
#         if token.ent_type_ in ["ORG", "PRODUCT", "WORK_OF_ART"] or token.pos_ in ["NOUN", "PROPN"]:
#             skills.append(token.text)
#     return list(set(skills))

# # Function to match resume with job roles
# def match_jobs(resume_skills):
#     scores = {}
#     for job, required_skills in jobs.items():
#         vectorizer = TfidfVectorizer()
#         tfidf_matrix = vectorizer.fit_transform([" ".join(resume_skills), " ".join(required_skills)])
#         similarity = cosine_similarity(tfidf_matrix)[0][1]
#         scores[job] = similarity
#     return sorted(scores.items(), key=lambda x: x[1], reverse=True)

# # Function to find missing skills
# def suggest_skills(resume_skills, job):
#     required_skills = set(jobs[job])
#     missing_skills = required_skills - set(resume_skills)
#     return list(missing_skills)

# # Sample resume text
# resume_text = "Experienced in Python, Java, and Flask. Worked on Machine Learning projects and data processing."  
# resume_skills = extract_skills(resume_text)

# # Get best job match
# matched_jobs = match_jobs(resume_skills)
# best_job = matched_jobs[0][0] if matched_jobs else "No match found"

# # Suggest missing skills
# missing_skills = suggest_skills(resume_skills, best_job) if best_job in jobs else []

# # Output results
# print(f"Extracted Skills: {resume_skills}")
# print(f"Best Matched Job: {best_job}")
# print(f"Missing Skills to Learn: {missing_skills}")


from flask import Flask, request, jsonify
from flask_cors import CORS
import razorpay
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import firebase_admin
from firebase_admin import credentials, auth, db
import time  # Import the time module for generating timestamps
from datetime import datetime  # Import datetime module

app = Flask(__name__)
razorpay_client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_SECRET_KEY")))
CORS(app)  # Allow CORS for all routes

# ✅ Update with your sender email + app password
SENDER_EMAIL = "iiicumit@gmail.com"
SENDER_PASSWORD = "pfyd hjtj ncih nhxz"  # Replace with the generated App Password
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# Initialize Firebase Admin SDK
cred = credentials.Certificate("c:/Users/Sanjana/placement-cell/tpc-flask-blackend/secret/iiic-umit-firebase-adminsdk-7jdc4-a5c4ecc0d0.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://iiic-umit-default-rtdb.asia-southeast1.firebasedatabase.app/"  # Replace with your Firebase Realtime Database URL
})

def send_email(recipient, subject, name, email, password):
    try:
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = recipient
        msg["Subject"] = subject

        # Use HTML content for the email body
        html_body = f"""
        <html>
        <body>
            <p>Hello <strong>{name}</strong>,</p>
            <p>Your account has been created successfully. Below are your login credentials:</p>
            <p><strong>Email:</strong> {email}<br>
            <strong>Password:</strong> {password}</p>
            <p>Please log in and change your password after your first login.</p>
            <p>Regards,<br>IIIC Team</p>
        </body>
        </html>
        """
        msg.attach(MIMEText(html_body, "html"))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, recipient, msg.as_string())
        server.quit()

        return True
    except Exception as e:
        print("❌ Error sending email:", e)
        return False

@app.route("/send-email", methods=["POST"])
def send_email_route():
    data = request.get_json()
    print("Incoming request data:", data)  # Log the incoming request for debugging

    email = data.get("email")
    subject = data.get("subject")
    body = data.get("body")

    if not email or not subject or not body:
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    success = send_email(email, subject, body)

    if success:
        return jsonify({"success": True, "message": f"Email sent to {email}"})
    else:
        return jsonify({"success": False, "error": "Failed to send email"}), 500

@app.route("/create-user", methods=["POST"])
def create_user():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        name = data.get("name")
        roll_no = data.get("rollNo")
        role = data.get("role", "Student")  # Default role is "Student"

        if not email or not password or not name or not role:  # Ensure role is provided
            return jsonify({"success": False, "error": "Missing required fields"}), 400

        # Create user in Firebase Authentication
        try:
            user = auth.create_user(
                email=email,
                password=password,
                display_name=name
            )
            print(f"✅ User created in Firebase: {user.uid}")
        except Exception as e:
            print(f"❌ Error creating user in Firebase: {e}")
            return jsonify({"success": False, "error": f"Firebase error: {str(e)}"}), 500

        # Save user details in Firebase Realtime Database
        try:
            # Format the current timestamp
            created_on = datetime.now().strftime("%m/%d/%Y, %I:%M:%S %p")
            user_data = {
                "email": email,
                "name": name,
                "role": role,
                "rollNo": roll_no,
                "createdOn": created_on  # Use formatted timestamp
            }
            db.reference(f"users/{role}/{user.uid}").set(user_data)  # Save under the correct role key
            print(f"✅ User details saved in Realtime Database: {user.uid}")
        except Exception as e:
            print(f"❌ Error saving user details in Realtime Database: {e}")
            return jsonify({"success": False, "error": f"Database error: {str(e)}"}), 500

        # Send email with credentials
        subject = "Your IIIC Account Credentials"
        try:
            email_sent = send_email(email, subject, name, email, password)
            if not email_sent:
                raise Exception("Failed to send email")
        except Exception as e:
            print(f"❌ Error sending email: {e}")
            return jsonify({"success": False, "error": f"Email error: {str(e)}"}), 500

        # Return success response
        return jsonify({"success": True, "message": f"User {email} created successfully"}), 200
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return jsonify({"success": False, "error": f"Unexpected error: {str(e)}"}), 500

@app.route('/create-order', methods=['POST'])
def create_order():
    try:
        data = request.get_json()
        amount = data['amount']
        currency = 'INR'

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        invoice_no = f"{timestamp}"

        order_data = {
            'amount': amount * 100,
            'currency': currency,
            'receipt': invoice_no,
        }

        order = razorpay_client.order.create(data=order_data)
        return jsonify({
            'id': order['id'],
            'amount': order['amount'],
            'invoice_no': invoice_no,
        })

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


# Route to verify the payment
@app.route('/verify-payment', methods=['POST'])
def verify_payment():
    try:
        data = request.get_json()
        payment_id = data['payment_id']
        order_id = data['order_id']
        razorpay_signature = data['razorpay_signature']
        grad_year = data['grad_year']
        user_id = data['user_id']
        invoice_no = data['invoice_no']

        generated_signature = razorpay_client.utility.verify_payment_signature({
            'razorpay_payment_id': payment_id,
            'razorpay_order_id': order_id,
            'razorpay_signature': razorpay_signature,
        })

        if generated_signature:
            order = razorpay_client.order.fetch(order_id)
            payment_amount_in_rs = order['amount'] / 100  # Convert from paise to INR

            time_received = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            payment_data = {
                'payment_id': payment_id,
                'order_id': order_id,
                'payment_amount_in_rs': payment_amount_in_rs,
                'status': 'received',  # Payment status
                'time_received': time_received,
                'payment_by': user_id,
                'invoice_no': invoice_no
            }

            db.reference(f"Students/{grad_year}/{branch}/{user_id}").set(payment_data)

            # Fetch restaurant details
    
                transaction_data = {
                    'payment_id': payment_id,
                    'order_id': order_id,
                    'payment_amount_in_rs': payment_amount_in_rs,
                    'status': 'received',  # Payment status
                    'time_received': time_received,
                    'restaurant_name': restaurant_data.get('Restaurant_Name', 'N/A'),
                    'restaurant_id': restaurant_data.get('Restaurant_ID', 'N/A'),
                    'payment_by': user_id,
                    'invoice_no': invoice_no,
                }

                db.reference(f"transactions/{order_id}").set(transaction_data)

            return jsonify({'success': True, 'message': 'Payment verified successfully'})
        else:
            return jsonify({'success': False, 'message': 'Payment verification failed'}), 400

    except Exception as e:
        print(f"Error during payment verification: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
