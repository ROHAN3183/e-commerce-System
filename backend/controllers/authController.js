import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { sendOTP } from "../utils/sendOTP.js";

// Register
export const register = async (req, res) => {
    const { username, email, phone, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const user = await User.create({ username, email, phone, password: hashedPassword, otp, otpExpiry });

        await sendOTP(email, otp);

        res.status(201).json({ msg: "Registered successfully. OTP sent to email." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ msg: "Invalid or expired OTP" });
        }

        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.json({ msg: "OTP verified successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Login
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

        const token = generateToken(user._id);
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};
