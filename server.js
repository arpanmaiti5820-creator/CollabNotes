require("dotenv").config();
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const BREVO_API_KEY = process.env.BREVO_API_KEY;

async function sendBrevoEmail({ to, name, subject, textContent, htmlContent }) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "api-key": BREVO_API_KEY,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            sender: {
                name: "CollabNotes",
                email: "arpanmaiti5820@gmail.com"
            },
            to: [
                {
                    email: to,
                    name: name || "User"
                }
            ],
            subject,
            textContent,
            htmlContent
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Brevo API error: ${response.status} ${errorText}`);
    }

    return await response.json();
}

const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID = "499493306852-58v9ssight19i3m0trg3fd5tlo3f6i7d.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
// console.log("ENV CHECK:", {
//     mongo: !!process.env.MONGODB_URI,
//     smtpHost: process.env.BREVO_SMTP_HOST,
//     smtpPort: process.env.BREVO_SMTP_PORT,
//     smtpUserLength: process.env.BREVO_SMTP_USER?.length,
//     smtpPass: !!process.env.BREVO_SMTP_PASS
// });
// ==============================
// JWT Authentication Middleware
// ==============================

function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(403).json({
            success: false,
            message: "Invalid or expired token."
        });

    }
}


mongoose.connect(process.env.MONGODB_URI)
    .then(() => {

        console.log("MongoDB connected successfully");
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`CollabNotes running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });
// ==============================
// File Upload Configuration
// ==============================

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }

});

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "application/pdf"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPG, PNG, WEBP, GIF images and PDF files are allowed."
                )
            );
        }

    }

});
const app = express();
const PORT = process.env.PORT || 3000;

const notesFile = path.join(__dirname, "data", "notes.json");
const foldersFile =
    path.join(__dirname, "data", "folders.json");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));


// ==============================
// Helper functions
// ==============================

function getNotes() {
    try {
        const data = fs.readFileSync(notesFile, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveNotes(notes) {
    fs.writeFileSync(
        notesFile,
        JSON.stringify(notes, null, 2)
    );
}
// ==============================
// Folder helpers
// ==============================

function getFolders() {

    try {

        const data =
            fs.readFileSync(
                foldersFile,
                "utf8"
            );

        return JSON.parse(data);

    } catch (error) {

        return [];

    }

}


function saveFolders(folders) {
    console.log("Saving folders to:", foldersFile);
    console.log("Folders:", folders);
    fs.writeFileSync(
        foldersFile,
        JSON.stringify(
            folders,
            null,
            2
        )
    );
    console.log("Folders saved successfully");
}


// ==============================
// Get folders
// ==============================

app.get("/api/folders", authenticateToken, (req, res) => {

    const folders = getFolders();

    // Get the logged-in user's email from JWT
    const userEmail = req.user.email;

    const userFolders = folders.filter(
        folder => folder.ownerEmail === userEmail
    );

    res.json(userFolders);
});


// ==============================
// Create folder
// ==============================
app.post("/api/folders", authenticateToken, (req, res) => {

    const folders = getFolders();

    const { name } = req.body;

    // Get owner from verified JWT
    const ownerEmail = req.user.email;

    if (!name) {
        return res.status(400).json({
            message: "Folder name is required."
        });
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
        return res.status(400).json({
            message: "Folder name cannot be empty."
        });
    }

    const existingFolder = folders.find(
        folder =>
            folder.name.toLowerCase() === trimmedName.toLowerCase() &&
            folder.ownerEmail === ownerEmail
    );

    if (existingFolder) {
        return res.status(409).json({
            message: "This folder already exists."
        });
    }

    const newFolder = {
        id: Date.now(),
        name: trimmedName,
        ownerEmail: ownerEmail,
        createdAt: new Date().toISOString()
    };

    folders.push(newFolder);

    saveFolders(folders);

    res.status(201).json({
        success: true,
        message: "Folder created successfully.",
        folder: newFolder
    });
});
// ==============================
// Get all notes
// ==============================

app.get("/api/notes", authenticateToken, (req, res) => {
    const notes = getNotes();

    const userEmail = req.user.email;

    // Never return trashed notes in the normal notes list
    const activeNotes = notes.filter(note => !note.trashed);

    // If no user email is provided,
    // return only public active notes
    if (!userEmail) {
        return res.json(
            activeNotes.filter(note => note.visibility === "public")
        );
    }

    // Logged-in user can see:
    // 1. All active public notes
    // 2. Their own active private notes
    const visibleNotes = activeNotes.filter(note =>
        note.visibility === "public" ||
        note.ownerEmail === userEmail
    );

    res.json(visibleNotes);
});

// ==============================
// Get trashed notes
// ==============================

app.get("/api/notes/trash", authenticateToken, (req, res) => {

    const notes = getNotes();

    const userEmail = req.user.email;

    if (!userEmail) {
        return res.status(401).json({
            message: "Please login first."
        });
    }

    const trashNotes = notes.filter(note =>
        note.trashed === true &&
        note.ownerEmail === userEmail
    );

    res.json(trashNotes);
});

// ==============================
// Get single note
// ==============================

app.get("/api/notes/:id", authenticateToken, (req, res) => {
    const notes = getNotes();

    const id = Number(req.params.id);
    const userEmail = req.user.email || "";

    const note = notes.find(note => note.id === id);

    if (!note) {
        return res.status(404).json({
            message: "Note not found."
        });
    }

    // Trashed notes cannot be opened
    if (note.trashed) {
        return res.status(404).json({
            message: "Note not found."
        });
    }

    // Public notes can be viewed by anyone
    if (note.visibility === "public") {
        return res.json(note);
    }

    // Private notes can only be viewed by their owner
    if (note.ownerEmail === userEmail) {
        return res.json(note);
    }

    return res.status(403).json({
        message: "You do not have permission to view this note."
    });
});




// ==============================
// Create note
// ==============================
app.post(
    "/api/notes",
    authenticateToken,
    upload.single("file"),
    (req, res) => {

        try {
            const notes = getNotes();

            const {
                title,
                content,
                folder,
                visibility
            } = req.body;

            // Get owner from JWT
            const ownerEmail = req.user.email;

            if (!title || !content) {
                return res.status(400).json({
                    success: false,
                    message: "Title and content are required."
                });
            }

            const newNote = {
                id: Date.now(),
                title: title.trim(),
                content: content.trim(),
                folder: folder || "General",
                favorite: false,
                favoriteBy: [],
                likedBy: [],
                ownerEmail: ownerEmail,
                visibility: visibility === "public"
                    ? "public"
                    : "private",
                updatedAt: "Just now",
                file: null
            };

            // If a file was uploaded
            if (req.file) {
                newNote.file = {
                    name: req.file.originalname,
                    type: req.file.mimetype,
                    url: `/uploads/${req.file.filename}`
                };
            }

            notes.push(newNote);

            saveNotes(notes);

            res.status(201).json({
                success: true,
                message: "Note created successfully.",
                note: newNote
            });

        } catch (error) {

            console.error("Create note error:", error);

            res.status(500).json({
                success: false,
                message: "Failed to create note."
            });
        }
    }
);



app.patch("/api/notes/:id/favorite", authenticateToken, (req, res) => {

    const notes = getNotes();

    const id = Number(req.params.id);
    const userEmail = req.user.email;

    const noteIndex = notes.findIndex(
        note => note.id === id
    );

    if (noteIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Note not found."
        });
    }

    const note = notes[noteIndex];

    // Only public notes or the user's own private notes
    // can be favorited.
    if (
        note.visibility !== "public" &&
        note.ownerEmail !== userEmail
    ) {
        return res.status(403).json({
            success: false,
            message: "You do not have permission to favorite this note."
        });
    }

    // Make sure favoriteBy exists
    if (!Array.isArray(note.favoriteBy)) {
        note.favoriteBy = [];
    }

    const alreadyFavorite =
        note.favoriteBy.includes(userEmail);

    if (alreadyFavorite) {

        note.favoriteBy =
            note.favoriteBy.filter(
                email => email !== userEmail
            );

    } else {

        note.favoriteBy.push(userEmail);

    }

    saveNotes(notes);

    res.json({
        success: true,
        message: alreadyFavorite
            ? "Removed from favorites."
            : "Added to favorites.",
        favorite: !alreadyFavorite
    });
});

// ==============================
// Like / Unlike note
// ==============================

app.patch("/api/notes/:id/like", authenticateToken, (req, res) => {

    const notes = getNotes();

    const id = Number(req.params.id);
    const userEmail = req.user.email;

    const noteIndex = notes.findIndex(
        note => note.id === id
    );

    if (noteIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Note not found."
        });
    }

    const note = notes[noteIndex];

    // Only public notes or the user's own private notes
    // can be liked.
    if (
        note.visibility !== "public" &&
        note.ownerEmail !== userEmail
    ) {
        return res.status(403).json({
            success: false,
            message: "You do not have permission to like this note."
        });
    }

    // Support older notes
    if (!Array.isArray(note.likedBy)) {
        note.likedBy = [];
    }

    const alreadyLiked = note.likedBy.includes(userEmail);

    if (alreadyLiked) {

        // Unlike
        note.likedBy = note.likedBy.filter(
            email => email !== userEmail
        );

    } else {

        // Like
        note.likedBy.push(userEmail);

    }

    saveNotes(notes);

    res.json({
        success: true,
        liked: !alreadyLiked,
        likeCount: note.likedBy.length
    });
});

// ==============================
// Update note
// ==============================
app.put("/api/notes/:id", authenticateToken, (req, res) => {
    const notes = getNotes();

    const index = notes.findIndex(
        note => note.id === Number(req.params.id)
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Note not found"
        });
    }

    const userEmail = req.user.email;

    // Check ownership
    if (
        !userEmail ||
        notes[index].ownerEmail !== userEmail
    ) {
        return res.status(403).json({
            success: false,
            message: "You can only edit your own notes."
        });
    }

    const { title, content, folder, visibility } = req.body;

    notes[index] = {
        ...notes[index],
        title: title || notes[index].title,
        content: content || notes[index].content,
        folder: folder || notes[index].folder,
        visibility:
            visibility === "public"
                ? "public"
                : notes[index].visibility,
        updatedAt: "Just now"
    };

    saveNotes(notes);

    res.json(notes[index]);

});


// ==============================
// Delete note
// ==============================

app.delete("/api/notes/:id", authenticateToken, (req, res) => {
    const notes = getNotes();
    const id = Number(req.params.id);
    const ownerEmail = req.user.email;

    const noteIndex = notes.findIndex(note => note.id === id);

    if (noteIndex === -1) {
        return res.status(404).json({
            message: "Note not found."
        });
    }

    const note = notes[noteIndex];

    // Only owner can delete
    if (note.ownerEmail !== ownerEmail) {
        return res.status(403).json({
            message: "You cannot delete this note."
        });
    }

    // Move note to Trash
    note.trashed = true;
    note.trashedAt = new Date().toISOString();

    saveNotes(notes);

    res.json({
        success: true,
        message: "Note moved to Trash."
    });
});

// ==============================
// Login API
// ==============================

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find user in MongoDB
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Check if this is a Google-only account
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "This account uses Google login. Please continue with Google."
            });
        }

        // Compare entered password with hashed password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Login successful
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong during login."
        });
    }
});


// ==============================
// Signup API
// ==============================

app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Hash password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully!",
            user: {
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong while creating the account."
        });
    }
});

// ==============================
// Forgot Password API
// ==============================


app.post("/api/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        // Do not reveal whether an account exists
        if (!user) {
            return res.json({
                success: true,
                message:
                    "If an account exists with this email, a password reset link will be sent."
            });
        }

        // Google-only accounts do not have a CollabNotes password
        if (!user.password && user.googleId) {
            return res.json({
                success: true,
                message:
                    "This account uses Google Login. Please continue with Google."
            });
        }

        // Generate a secure random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store only a hash of the token in MongoDB
        const hashedResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Save hashed token and expiry
        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpires = new Date(
            Date.now() + 15 * 60 * 1000
        );

        await user.save();

        // Reset-password page URL
        const resetLink =
            `${process.env.APP_URL}/reset-password.html?token=${resetToken}`;

        // Send reset email through Brevo
        await sendBrevoEmail({
            to: normalizedEmail,
            name: user.name || "there",
            subject: "Reset your CollabNotes password",

            textContent:
                `Hello ${user.name || "there"},\n\n` +
                `We received a request to reset your CollabNotes password.\n\n` +
                `Click the link below to create a new password:\n` +
                `${resetLink}\n\n` +
                `This link will expire in 15 minutes.\n\n` +
                `If you did not request a password reset, you can safely ignore this email.\n\n` +
                `— CollabNotes`,

            htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px;">
            <h2>Reset your CollabNotes password</h2>

            <p>Hello ${user.name || "there"},</p>

            <p>
                We received a request to reset your CollabNotes password.
            </p>

            <p>
                Click the button below to create a new password:
            </p>

            <p>
                <a
                    href="${resetLink}"
                    style="
                        display: inline-block;
                        padding: 12px 20px;
                        background: #6d5dfc;
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                    "
                >
                    Reset Password
                </a>
            </p>

            <p>
                This link will expire in <strong>15 minutes</strong>.
            </p>

            <p>
                If you did not request a password reset, you can safely
                ignore this email.
            </p>

            <p>— CollabNotes</p>
        </div>
    `
        });

        res.json({
            success: true,
            message:
                "If an account exists with this email, a password reset link has been sent."
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
});
// -------------------------
// Reset Password
// -------------------------

app.post("/api/reset-password", async (req, res) => {

    try {

        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                message: "Token and new password are required."
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        const hashedResetToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedResetToken,
            resetPasswordExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "Reset link is invalid or has expired."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        // Invalidate the reset token after successful use
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        console.log("Password reset successful for:", user.email);

        res.json({
            message: "Password reset successfully."
        });

    } catch (error) {

        console.error("Reset password error:", error);

        res.status(500).json({
            message: "Unable to reset password."
        });

    }

});

// ==============================
// Google Login API
// ==============================

app.post("/api/google-login", async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required."
            });
        }

        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(401).json({
                success: false,
                message: "Invalid Google credential."
            });
        }

        const {
            sub: googleId,
            email,
            name,
            email_verified: emailVerified
        } = payload;

        if (!email || !emailVerified) {
            return res.status(401).json({
                success: false,
                message: "Google email could not be verified."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find existing account
        let user = await User.findOne({
            email: normalizedEmail
        });

        // Create a new account if it doesn't exist
        if (!user) {
            user = await User.create({
                name: name || "Google User",
                email: normalizedEmail,
                googleId
            });
        } else {
            // Link Google account if this email already exists
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        }

        // Create our normal CollabNotes JWT
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            success: true,
            message: "Google login successful!",
            token,
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Google login error:", error);

        res.status(401).json({
            success: false,
            message: "Google authentication failed."
        });
    }
});

// Start server
// ==============================

app.patch("/api/notes/:id/restore", authenticateToken, (req, res) => {

    const notes = getNotes();

    const id = Number(req.params.id);

    const ownerEmail = req.user.email;

    const note = notes.find(
        note => note.id === id
    );

    if (!note) {
        return res.status(404).json({
            message: "Note not found."
        });
    }

    if (note.ownerEmail !== ownerEmail) {
        return res.status(403).json({
            message: "You cannot restore this note."
        });
    }

    note.trashed = false;
    delete note.trashedAt;

    saveNotes(notes);

    res.json({
        success: true,
        message: "Note restored."
    });

});

app.delete("/api/notes/:id/permanent", authenticateToken, (req, res) => {
    console.log("🔥 PERMANENT DELETE ROUTE HIT", req.params.id);
    const notes = getNotes();

    const id = Number(req.params.id);

    const ownerEmail = req.user.email;

    const noteIndex = notes.findIndex(
        note => note.id === id
    );

    if (noteIndex === -1) {
        return res.status(404).json({
            message: "Note not found."
        });
    }

    const note = notes[noteIndex];
    console.log("NOTE BEING DELETED:", note);
    console.log("FILE ATTACHED:", note.file);

    // Only the owner can permanently delete the note
    if (note.ownerEmail !== ownerEmail) {
        return res.status(403).json({
            message: "You cannot delete this note."
        });
    }

    // Delete attached file if it exists
    if (note.file && note.file.url) {

        const filename = path.basename(note.file.url);

        const filePath = path.resolve(
            __dirname,
            "uploads",
            filename
        );

        try {

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

        } catch (error) {

            console.error("File deletion error:", error);

            return res.status(500).json({
                success: false,
                message: "Could not delete the attached file."
            });
        }
    }

    // Remove note from notes.json
    notes.splice(noteIndex, 1);

    saveNotes(notes);

    res.json({
        success: true,
        message: "Note permanently deleted."
    });
});