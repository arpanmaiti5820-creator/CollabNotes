// Google OAuth Client ID
const GOOGLE_CLIENT_ID =
    "499493306852-58v9ssight19i3m0trg3fd5tlo3f6i7d.apps.googleusercontent.com";

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const switchMode = document.getElementById("switchMode");
const switchMessage = document.getElementById("switchMessage");

const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");

const loginMessage = document.getElementById("loginMessage");
const signupMessage = document.getElementById("signupMessage");

let isLoginMode = true;


// -------------------------
// Switch Login / Signup
// -------------------------

switchMode.addEventListener("click", () => {

    isLoginMode = !isLoginMode;

    loginMessage.textContent = "";
    signupMessage.textContent = "";

    if (isLoginMode) {

        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");

        formTitle.textContent = "Welcome back";

        formSubtitle.textContent =
            "Sign in to continue to your workspace.";

        switchMessage.textContent =
            "Don't have an account?";

        switchMode.textContent =
            "Create account";

    } else {

        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");

        formTitle.textContent = "Create your account";

        formSubtitle.textContent =
            "Start organizing your ideas today.";

        switchMessage.textContent =
            "Already have an account?";

        switchMode.textContent =
            "Sign in";

    }

});


// -------------------------
// Password show/hide
// -------------------------

document.querySelectorAll(".password-toggle").forEach(button => {

    button.addEventListener("click", () => {

        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);

        if (input.type === "password") {

            input.type = "text";
            button.textContent = "Hide";

        } else {

            input.type = "password";
            button.textContent = "Show";

        }

    });

});


// -------------------------
// Login
// -------------------------

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    loginMessage.className = "message";
    loginMessage.textContent = "Signing in...";

    try {

        const response = await fetch("/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        loginMessage.className = "message success";
        loginMessage.textContent = data.message;

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        // Later we'll redirect to dashboard
        setTimeout(() => {

            window.location.href = "/dashboard.html";

        }, 800);

    } catch (error) {

        loginMessage.className = "message error";
        loginMessage.textContent = error.message;

    }

});


// -------------------------
// Signup
// -------------------------

signupForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name =
        document.getElementById("signupName").value.trim();

    const email =
        document.getElementById("signupEmail").value.trim();

    const password =
        document.getElementById("signupPassword").value;

    signupMessage.className = "message";
    signupMessage.textContent = "Creating account...";

    try {

        const response = await fetch("/api/signup", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                password
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        signupMessage.className = "message success";
        signupMessage.textContent = data.message;

        setTimeout(() => {

            switchMode.click();

        }, 1000);

    } catch (error) {

        signupMessage.className = "message error";
        signupMessage.textContent = error.message;

    }

});


// -------------------------
// Google button
// -------------------------

// ==============================
// Google Login
// ==============================

const googleBtn = document.getElementById("googleBtn");

googleBtn.addEventListener("click", () => {
    if (
        !window.google ||
        !google.accounts ||
        !google.accounts.id
    ) {
        alert("Google Login is still loading. Please try again.");
        return;
    }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin
    });

    google.accounts.id.prompt();
});

async function handleGoogleLogin(response) {
    try {
        const res = await fetch("/api/google-login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                credential: response.credential
            })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            alert(data.message || "Google login failed.");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Google login error:", error);
        alert("Something went wrong during Google login.");
    }
}
// -------------------------
// Forgot Password
// -------------------------

document.getElementById("forgotPassword").addEventListener("click", async (event) => {

    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();

    if (!email) {
        alert("Please enter your email address first.");
        return;
    }

    const message = document.getElementById("loginMessage");

    message.className = "message";
    message.textContent = "Sending password reset link...";

    try {

        const response = await fetch("/api/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        message.className = "message success";
        message.textContent = data.message;

    } catch (error) {

        message.className = "message error";
        message.textContent = error.message;

    }

});