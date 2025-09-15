import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import axios from "axios";
import "../styles/StudentMockTest.css";

const MockTestsPage = ({ studentId }) => {
    const [studentData, setStudentData] = useState(null);
    const [mocktestStatus, setMocktestStatus] = useState(false);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch student data from Firebase
    useEffect(() => {
        const userRef = firebase.database().ref(`Students/2026/CST/${studentId}`);
        userRef.on("value", (snapshot) => {
            const data = snapshot.val();
            setStudentData(data);
            setMocktestStatus(data?.mocktestStatus === true);
            setLoading(false);
        });
        return () => userRef.off();
    }, [studentId]);

    if (loading) return <p>Loading...</p>;

    // ✅ Payment Handler
    const handlePayment = async () => {
        try {
            // 1️⃣ Create Razorpay order from backend
            const { data: order } = await axios.post("http://localhost:5000/create-order", {
                amount: 99,
            });

            const options = {
                key: "YOUR_RAZORPAY_KEY", // replace with real key
                amount: order.amount,
                currency: "INR",
                name: "MockTests + Interview Resources",
                description: "Access premium mock tests & interview prep resources",
                order_id: order.id,
                handler: async function (response) {
                    // 2️⃣ Verify payment with backend
                    const verifyRes = await axios.post("http://localhost:5000/verify-payment", {
                        payment_id: response.razorpay_payment_id,
                        order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        user_id: studentId,
                        invoice_no: order.invoice_no,
                    });

                    if (verifyRes.data.success) {
                        alert("Payment successful! 🎉 Access unlocked.");
                        firebase
                            .database()
                            .ref(`Students/2026/CST/${studentId}`)
                            .update({ mocktestStatus: true });
                        setMocktestStatus(true);
                    } else {
                        alert("Payment verification failed ❌");
                    }
                },
                prefill: {
                    name: studentData?.name || "User",
                    email: studentData?.email || "test@example.com",
                    contact: studentData?.phone || "9999999999",
                },
                theme: {
                    color: "#1a73e8",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            alert("Payment error. Please try again.");
        }
    };

    return (
        <div className="mocktests-page">
            {/* ✅ Overlay if not paid */}
            {!mocktestStatus && (
                <div className="overlay">
                    <div className="overlay-content">
                        <h2>Unlock Mock Tests & Interview Resources 🚀</h2>
                        <p>Pay just ₹99 to access:</p>
                        <ul>
                            <li>✔ 20+ Mock Tests</li>
                            <li>✔ Interview Preparation Notes</li>
                            <li>✔ Resume Templates</li>
                            <li>✔ Exclusive Resources</li>
                        </ul>
                        <button>Pay ₹99 to Unlock</button>
                    </div>
                </div>
            )}

            {/* ✅ Actual Content (only visible after payment) */}
            {mocktestStatus && (
                <div className="content">
                    <h1>Mock Tests</h1>
                    <p>Welcome, {studentData?.name}! 🎉</p>
                    <p>You now have access to mock tests and interview resources.</p>
                    {/* Add your mock test + interview resources UI here */}
                </div>
            )}
        </div>
    );
};

export default MockTestsPage;
