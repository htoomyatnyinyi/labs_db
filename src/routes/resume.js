import express from "express";
import multer from "multer";
import { sql_db } from "../db/db.js";
import fs from "fs";
import path from "path";
// import authenticate from "../middleware/authenticate.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "resume_uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, "lab_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route to upload a resume
router.post("/upload", authenticate, upload.single("file"), (req, res) => {
  console.log("Upload resume route hit");
  const user_id = req.user.id;
  const file_path = req.file.path;
  const file_name = req.file.filename;
  const file_type = req.file.mimetype;

  const query =
    "INSERT INTO userResume (user_id, file_path, file_name, file_type) VALUES (?, ?, ?, ?)";
  sql_db.query(
    query,
    [user_id, file_path, file_name, file_type],
    (err, result) => {
      if (err) {
        console.error("Error inserting resume:", err);
        return res.status(500).json({ error: "Failed to upload resume" });
      }
      res.status(200).json({ message: "Resume uploaded successfully" });
    }
  );
});

// Route to fetch the latest resume for the logged-in user
router.get("/resume", authenticate, (req, res) => {
  const userId = req.user.id;
  const query =
    "SELECT * FROM userResume WHERE user_id = ? ORDER BY id DESC LIMIT 1";
  sql_db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch resumes" });
    }
    res.status(200).json(results);
  });
});

router.get("/pdf/:filename", authenticate, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join("resume_uploads", filename);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      res.status(404).send("File not found");
    } else {
      // res.cookie("pdfURL", data);
      console.log("Serving file:", filePath);
      res.setHeader("Content-Type", "application/pdf");
      res.send(data);
    }
  });
});

export default router;
