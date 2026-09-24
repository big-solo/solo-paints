require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Contact = require("./models/contact");
const nodemailer = require("nodemailer");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});
//console.log(process.cwd());
//console.log(process.env);
const app = express();
app.use(cors());
app.use(express.json());
console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error(err);
  });
// GET route
app.get("/", (req, res) => {
    res.send("Welcome to solo paint Backend!");
});
// POST route
app.post("/contact", upload.single("sampleImage"), async (req, res) => {
    try {
let imageUrl = "";

if (req.file) {
    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "solo-paints"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        stream.end(req.file.buffer);
    });

    imageUrl = result.secure_url;
}

const contact = new Contact({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    service: req.body.service,
    message: req.body.message,
    imageUrl: imageUrl
});
        await contact.save();
const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "New Solo Paints Customer Message",
  html: `
    <h2>New Customer Message</h2>

    <p><strong>Name:</strong> ${contact.name}</p>
    <p><strong>Email:</strong> ${contact.email}</p>
    <p><strong>Phone:</strong> ${contact.phone}</p>
    <p><strong>Service:</strong> ${contact.service}</p>
    <p><strong>Message:</strong> ${contact.message}</p>

    ${contact.imageUrl ? `
        <p>
            <strong>Sample Image:</strong>
            <a href="${contact.imageUrl}" target="_blank">
                View Customer's Sample Image
            </a>
        </p>
    ` : ""}
`

});
        console.log("Email sent:", info.response);
        res.status(201).json({
            success: true,
            message: "Message saved successfully!"
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});
// Verify admin token
function verifyAdminToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Access denied"
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.admin = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });

    }
}
// Get all contacts
app.get("/contacts", verifyAdminToken, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching contacts." });
    }
});
// Delete a contact
app.delete("/contacts/:id", verifyAdminToken, async (req, res) => {

    try {

        await Contact.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Contact deleted successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error deleting contact."
        });

    }

});


// Start the server// Delete a contact

// Admin Login
// Admin login
app.post("/admin/login", (req, res) => {

    const { username, password } = req.body;

    if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    ) {

        const token = jwt.sign(
            { username: username },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.json({
            success: true,
            message: "Login successful",
            token: token
        });
    }

    res.status(401).json({
        success: false,
        message: "Invalid username or password"
    });

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});