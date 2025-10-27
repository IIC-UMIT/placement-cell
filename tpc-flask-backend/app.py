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
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

app = Flask(__name__)
razorpay_client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_SECRET_KEY")))
# Allow CORS for development origins (localhost)
from flask_cors import CORS

# Allow CORS for these origins including localhost and multiple deployed URLs
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://iiicumit.com", "https://iiic-umit.web.app", "https://iiic-umit.firebaseapp.com"]}},
     allow_headers=["Authorization", "Content-Type"],
     methods=["GET", "POST", "OPTIONS"],
     supports_credentials=True)

load_dotenv() # This line loads the variables from .env

# Now your existing code will work, loading values from the .env file
SENDER_EMAIL = os.getenv("SMTP_USER")
SENDER_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))

if not SENDER_PASSWORD:
    print("⚠️ SMTP_PASSWORD not set. Emails will fail until SMTP_PASSWORD (app password) is provided via env var.")

# Initialize Firebase Admin SDK
cred = credentials.Certificate("secret/iiic-umit-firebase-adminsdk-7jdc4-a5c4ecc0d0.json")
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
            <p>Please log in.</p>
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


def send_email_plain(recipient, subject, body):
    """Send a plain HTML body to recipient. Used by /send-email where caller provides a body string."""
    try:
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = recipient
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "html"))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=20)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        resp = server.sendmail(SENDER_EMAIL, recipient, msg.as_string())
        server.quit()
        # sendmail returns an empty dict on success
        if resp:
            print("⚠️ sendmail response (non-empty) =>", resp)
        return True
    except Exception as e:
        # Log detailed exception for debugging and re-raise or return error details
        print("❌ Error sending plain email:", repr(e))
        return False, str(e)

@app.route("/send-email", methods=["POST"])
def send_email_route():
    data = request.get_json()
    print("Incoming request data:", data)  # Log the incoming request for debugging

    email = data.get("email")
    subject = data.get("subject")
    body = data.get("body")

    if not email or not subject or not body:
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    # Use the plain sender which accepts (recipient, subject, body)
    result = send_email_plain(email, subject, body)
    if result is True:
        return jsonify({"success": True, "message": f"Email sent to {email}"})
    else:
        # result is (False, errorString) or False
        err_msg = result[1] if isinstance(result, tuple) else "Failed to send email"
        print("❌ send-email failed for", email, ":", err_msg)
        return jsonify({"success": False, "error": err_msg}), 500

@app.route("/create-user", methods=["POST"])
def create_user():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        name = data.get("name")
        roll_no = data.get("rollNo")
        role = data.get("role", "Student")  # Default role is "Student"
        # Accept branch and gradYear from payload (optional)
        branch = data.get("branch")
        grad_year = data.get("gradYear") or data.get("grad_year")

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
                "createdOn": created_on
            }
            # Add optional fields if provided
            if branch:
                user_data["branch"] = branch
            if grad_year:
                user_data["graduationYear"] = grad_year

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

        # Return success response including uid
        return jsonify({"success": True, "message": f"User {email} created successfully", "uid": user.uid}), 200
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
        payment_id = data.get('payment_id')
        order_id = data.get('order_id')
        razorpay_signature = data.get('razorpay_signature')
        grad_year = data.get('grad_year')
        user_id = data.get('user_id')
        invoice_no = data.get('invoice_no')
        # branch may not always be present in payload; default to 'general' if missing
        branch = data.get('branch', 'general')

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
    
                # transaction_data = {
                #     'payment_id': payment_id,
                #     'order_id': order_id,
                #     'payment_amount_in_rs': payment_amount_in_rs,
                #     'status': 'received',  # Payment status
                #     'time_received': time_received,
                #     'restaurant_name': restaurant_data.get('Restaurant_Name', 'N/A'),
                #     'restaurant_id': restaurant_data.get('Restaurant_ID', 'N/A'),
                #     'payment_by': user_id,
                #     'invoice_no': invoice_no,
                # }

                # db.reference(f"transactions/{order_id}").set(transaction_data)

            return jsonify({'success': True, 'message': 'Payment verified successfully'})
        else:
            return jsonify({'success': False, 'message': 'Payment verification failed'}), 400

    except Exception as e:
        print(f"Error during payment verification: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/send-password-reset", methods=["POST"])
def send_password_reset():
    """
    Generate a Firebase password reset link (Admin SDK), extract the oobCode & apiKey
    and email a custom link that points to the website reset page:
      https://iiicumit.com/reset-password?mode=resetPassword&oobCode=...&apiKey=...
    This prevents redirecting users to the default firebaseapp.com hosted page.
    """
    try:
        data = request.get_json() or {}
        email = data.get("email")
        if not email:
            return jsonify({"success": False, "error": "Missing email"}), 400

        # Generate the Firebase password reset link (contains oobCode & apiKey in query)
        try:
            generated_link = auth.generate_password_reset_link(email)
        except Exception as e:
            print("❌ Error generating password reset link:", e)
            return jsonify({"success": False, "error": str(e)}), 500

        # Parse the generated link and extract required query params
        try:
            parsed = urlparse(generated_link)
            qs = parse_qs(parsed.query)
            oob_code = qs.get("oobCode", [None])[0]
            api_key = qs.get("apiKey", [None])[0]
            mode = qs.get("mode", ["resetPassword"])[0]
        except Exception as e:
            print("❌ Error parsing generated link:", e)
            return jsonify({"success": False, "error": "Failed to parse link"}), 500

        if not oob_code or not api_key:
            print("❌ Missing oobCode or apiKey in generated link:", generated_link)
            return jsonify({"success": False, "error": "Invalid reset link generated"}), 500

        # Construct a site link that points to your website reset page
        site_reset_url = f"https://iiicumit.com/reset-password?mode={mode}&oobCode={oob_code}&apiKey={api_key}"

        # Compose email body (HTML)
        subject = "Reset your IIIC account password"
        body = f"""
        <html><body>
          <p>Hello,</p>
          <p>Follow this link to reset your IIIC account password on our website:</p>
          <p><a href="{site_reset_url}">Reset your password</a></p>
          <p>If you didn't request this, ignore this email.</p>
          <p>Regards,<br/>IIIC Team</p>
        </body></html>
        """

        # Send the custom email using existing helper
        email_sent = send_email_plain(email, subject, body)
        if not email_sent:
            return jsonify({"success": False, "error": "Failed to send email"}), 500

        return jsonify({"success": True, "message": "Reset email sent"}), 200

    except Exception as e:
        print("❌ Unexpected error in send-password-reset:", e)
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
