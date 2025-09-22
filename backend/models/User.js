import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpiry: { type: Date }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
