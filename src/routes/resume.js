import express from "express";
import multer from "multer";
import { sql_db } from "../db.js";
import verifyToken from "../middleware/verifyToken.js";
import fs from "fs";
import path from "path";
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

// Create the upload-resume route
router.post(
  "/upload-resume",
  verifyToken,
  upload.single("file"),
  (req, res) => {
    console.log(req.user.id);
    const user_id = req.user.id;
    const file_path = req.file.path;
    const file_name = req.file.filename;
    const file_type = req.file.mimetype;

    const query =
      "INSERT INTO resumes (user_id, file_path, file_name, file_type) VALUES (?, ?, ?, ?)";
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
  }
);

router.get("/pdf/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join("resume_uploads", filename);
  console.log(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(404).send("File not found");
    } else {
      res.setHeader("Content-Type", "application/pdf");
      res.send(data);
    }
  });
});

router.get("/resume", verifyToken, (req, res) => {
  //   console.log(req.params, "check at specific id");
  //   const resume_id = req.user.id;
  //   console.log(resume_id, req.user, "from token");
  const userId = req.user.id;
  //   const query = "SELECT * FROM resumes WHERE user_id = ?";
  const query =
    "SELECT * FROM resumes WHERE user_id = ? ORDER BY id DESC LIMIT 1";
  sql_db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch resumes" });
    }
    res.status(200).json(results);
  });
});

router.get("/applied-jobs/:postId", (req, res) => {
  const { postId } = req.params;
  console.log(postId, "check");
  const query = `
      SELECT 
          u.id AS user_id,
          u.username,
          u.email,
          p.id AS post_id,
          p.title AS post_title,
          r.file_name AS resume_file_name,
          r.file_path AS resume_file_path,
          aj.uploaded_at AS application_date
      FROM 
          apply_job aj
      JOIN 
          users u ON aj.user_id = u.id
      JOIN 
          posts p ON aj.post_id = p.id
      JOIN 
          resumes r ON aj.user_id = r.user_id
      WHERE 
          p.id = ?;
  `;
  try {
    const [rows] = sql_db.execute(query, [postId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database query failed" });
  }
});

export default router;

// before edit the retrive data
// import express from "express";
// import multer from "multer";
// import { sql_db } from "../db.js";
// import verifyToken from "../middleware/verifyToken.js";

// const router = express.Router();

// // Configure multer for file upload
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "resume_uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, "lab_" + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// // Create the upload-resume route
// router.post(
//   "/upload-resume",
//   verifyToken,
//   upload.single("file"),
//   (req, res) => {
//     console.log(req.user.id);
//     const user_id = req.user.id;
//     const file_path = req.file.path;
//     const file_name = req.file.filename;
//     const file_type = req.file.mimetype;

//     const query =
//       "INSERT INTO resumes (user_id, file_path, file_name, file_type) VALUES (?, ?, ?, ?)";
//     sql_db.query(
//       query,
//       [user_id, file_path, file_name, file_type],
//       (err, result) => {
//         if (err) {
//           console.error("Error inserting resume:", err);
//           return res.status(500).json({ error: "Failed to upload resume" });
//         }
//         res.status(200).json({ message: "Resume uploaded successfully" });
//       }
//     );
//   }
// );

// router.get("/resume", verifyToken, (req, res) => {
//   //   console.log(req.params, "check at specific id");
//   //   const resume_id = req.user.id;
//   //   console.log(resume_id, req.user, "from token");
//   const userId = req.user.id;
//   //   const query = "SELECT * FROM resumes WHERE user_id = ?";
//   const query =
//     "SELECT * FROM resumes WHERE user_id = ? ORDER BY id DESC LIMIT 1";
//   sql_db.query(query, [userId], (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: "Failed to fetch resumes" });
//     }
//     res.status(200).json(results);
//   });
// });
// export default router;
