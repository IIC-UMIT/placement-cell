import pandas as pd
import firebase_admin
from firebase_admin import credentials, auth

# Initialize Firebase Admin
cred = credentials.Certificate("secret/iiic-umit-firebase-adminsdk-7jdc4-a5c4ecc0d0.json")
firebase_admin.initialize_app(cred)

# Read Excel file
df = pd.read_excel("your_excel_file.xlsx")  # Replace with your actual file path

def generate_password(roll_no, email):
    username = email.split("@")[0]
    return f"{roll_no}_{username}"

def create_firebase_user(email, password):
    try:
        user = auth.create_user(
            email=email,
            password=password
        )
        print(f"`User created: {email}")
    except auth.EmailAlreadyExistsError:
        print(f"User already exists: {email}")
    except Exception as e:
        print(f"Error creating user {email}: {e}")

# Iterate over rows
for index, row in df.iterrows():
    email = str(row.get("Email", "")).strip()
    roll_no = str(row.get("Roll no (As per ID card)", "")).strip()
    
    if email and roll_no and "@" in email:
        password = generate_password(roll_no, email)
        create_firebase_user(email, password)
