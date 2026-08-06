require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Contact = require("./models/contact");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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
app.post("/contact", async (req, res) => {
    try {
    const contact = new Contact({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    service: req.body.service,
    message: req.body.message
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