import transporter from "../config/nodemailer.js";
import dotenv from "dotenv";
dotenv.config();


export const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`
    };

    await transporter.sendMail(mailOptions);
};
