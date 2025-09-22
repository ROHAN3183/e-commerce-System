// ---------------- Common Functions ---------------- //

function getFormData(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => data[key] = value);
    return data;
}

function validateEmail(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/;
    if (!email) { alert("Email cannot be empty"); return false; }
    if (!pattern.test(email)) { alert("Invalid email"); return false; }
    return true;
}

function validatePassword(password) {
    if (!password) { alert("Password cannot be empty"); return false; }
    if (password.length < 6) { alert("Password must be at least 6 characters"); return false; }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        alert("Password must contain at least one letter and one number");
        return false;
    }
    return true;
}

function validateOTP(otp) {
    if (!otp) { alert("OTP cannot be empty"); return false; }
    if (!/^\d{6}$/.test(otp)) { alert("OTP must be 6 digits"); return false; }
    return true;
}

function redirectTo(page) {
    window.location.href = page;
}

// ---------------- Backend API ---------------- //

const API_BASE = "https://didactic-space-guacamole-x5prgg99g6gv296j-6000.app.github.dev/api/auth";

// Register
async function registerUser(user) {
    const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    });
    return res.json();
}

// Verify OTP
async function verifyOTP(data) {
    const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return res.json();
}

// Login
async function loginUser(credentials) {
    const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
    });
    return res.json();
}

// ---------------- Register Page ---------------- //

async function handleRegister(event) {
    event.preventDefault();
    const { name, email, phone, password } = getFormData("registerForm");

    if (!name) { alert("Name cannot be empty"); return; }
    if (!validateEmail(email) || !validatePassword(password)) return;

    try {
        const result = await registerUser({ username: name, email, phone, password });
        if (result.msg) {
            alert(result.msg);
            // store email temporarily for OTP page
            localStorage.setItem("pendingEmail", email);
            redirectTo("otp-verify.html");
        } else {
            alert("Registration failed: " + (result.error || "Unknown error"));
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

// ---------------- OTP Verify Page ---------------- //

async function handleOTPVerify(event) {
    event.preventDefault();
    const otp = document.getElementById("otp").value.trim();
    if (!validateOTP(otp)) return;

    const email = localStorage.getItem("pendingEmail");
    try {
        const result = await verifyOTP({ email, otp });
        console.log("OTP verify response:", result);

        if (result.token || result.msg?.toLowerCase().includes("success")) {
            if (result.token) {
                localStorage.setItem("authToken", result.token);
            }
            localStorage.removeItem("pendingEmail"); // cleanup
            alert("OTP verified successfully!");
            setTimeout(() => redirectTo("login.html"), 200);
        } else {
            alert("OTP verification failed: " + (result.msg || "Unknown error"));
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}


// ---------------- Login Page ---------------- //

async function handleLogin(event) {
    event.preventDefault();
    const { email, password } = getFormData("loginForm");

    if (!validateEmail(email) || !validatePassword(password)) return;

    try {
        const result = await loginUser({ email, password });
        if (result.token) {
            localStorage.setItem("authToken", result.token);
            alert("Login successful!");
            redirectTo("index.html");
        } else {
            alert("Login failed: " + (result.msg || "Unknown error"));
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

// ---------------- Event Listeners ---------------- //

const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
}

const otpForm = document.getElementById("otpForm");
if (otpForm) {
    otpForm.addEventListener("submit", handleOTPVerify);
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
}
