import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { sql_db } from "../db/db.js";

dotenv.config();

const router = express.Router();

// Utility functions (unchanged)
const generateUsername = () => `s_${crypto.randomBytes(4).toString("hex")}`;

const getUsernameFromEmail = (email) =>
  email.includes("@")
    ? email.substring(0, email.indexOf("@"))
    : generateUsername();

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

const setAuthCookie = (res, authToken) => {
  res.cookie("authToken", authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use HTTPS in production
    sameSite: "strict", // Important for CSRF protection
    maxAge: 86400000, // 1 day (in milliseconds)
    path: "/", // Crucial: Makes the cookie available across your entire site
    // domain: ".yourdomain.com", // Only needed if your frontend is on a subdomain
  });
};

// Signup route (unchanged)
router.post("/signup", (req, res) => {
  const { identifier, password, confirmPassword } = req.body;

  if (!identifier || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const checkUserQuery =
    "SELECT * FROM useraccount WHERE email = ? OR phone = ? OR username = ?";
  const checkUserParams = [identifier, identifier, identifier];

  sql_db.query(checkUserQuery, checkUserParams, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      return res
        .status(400)
        .json({ message: "Email, phone, or username already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const generatedUsername = identifier.includes("@mlab.com")
      ? getUsernameFromEmail(identifier)
      : /^\d+$/.test(identifier) && identifier.length > 7
      ? generateUsername()
      : null;

    if (!generatedUsername) {
      return res.status(400).json({
        message: "Invalid identifier format",
        suggestion: "Use a valid email or phone number",
      });
    }

    // SQL
    const insertUserQuery =
      "INSERT INTO useraccount (email, phone, password, username) VALUES (?, ?, ?, ?)";

    const insertUserParams = [
      identifier.includes("@jobseeker.com") ? identifier : null,
      /^\d+$/.test(identifier) ? identifier : null,
      hashedPassword,
      generatedUsername,
    ];

    sql_db.query(insertUserQuery, insertUserParams, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const userId = result.insertId;

      const authToken = generateToken({
        id: userId,
        username: generatedUsername,
        email: identifier,
      });

      setAuthCookie(res, authToken); // set cookies with authToken and expires 1 hour

      res.status(201).json({ message: "User created successfully", authToken });
    });
  });
});

// Signin route
router.post("/signin", (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Identifier and password are required" });
  }

  const query =
    "SELECT * FROM useraccount WHERE email = ? OR phone = ? OR username = ?";
  const queryParams = [identifier, identifier, identifier];

  sql_db.query(query, queryParams, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const authToken = generateToken(user);

    // req.session.authToken = authToken;

    // req.session.user = {
    //   id: user.id,
    //   username: user.username,
    //   email: user.email,
    // };

    setAuthCookie(res, authToken);

    res.status(200).json({
      message: "User signed in successfully",
      user: { id: user.id, username: user.username, email: user.email },
      // Do not send authToken in the JSON response if you are using cookies for authentication
    });
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("authToken", { path: "/" });
  res.status(200).json({ message: "User logged out successfully" });
});

// Refresh route (Improved)
router.get("/refresh", (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" }); // More specific message
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newToken = generateToken(decoded); // Use the decoded user info
    res.cookie("authToken", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400000, // 1 day
      path: "/",
    });

    res.status(200).json({ message: "Token refreshed" }); // 200 OK
  } catch (err) {
    console.error("Token verification error:", err); // Log the error for debugging
    return res.status(403).json({ message: "Invalid or expired token" }); // More accurate message
  }
});

export default router;
