import express from "express";
import { sql_db } from "../db/db.js"; // Assuming your database connection is in this file

import authenticate from "../middleware/authenticate.js"; // Middleware for authentication

const router = express.Router();

// Apply for a job
router.post("/apply-job", authenticate, async (req, res) => {
  const userId = req.user.id;
  const { post_id, resume_id } = req.body;

  if (!post_id || !resume_id) {
    return res
      .status(400)
      .json({ error: "Post ID and Resume ID are required." });
  }

  try {
    // Check if the user has already applied for the job
    const isAlreadyApplied = await checkIfAlreadyApplied(userId, post_id);
    if (isAlreadyApplied) {
      const applicationStatus = await getApplicationStatus(post_id);
      return res.status(200).json({
        message: "User has already applied for this job.",
        results: applicationStatus,
      });
    }

    // Insert the application
    await applyForJob(userId, post_id, resume_id);
    const applicationStatus = await getApplicationStatus(post_id);
    res.status(200).json({
      message: "Applied successfully.",
      results: applicationStatus,
    });
  } catch (error) {
    console.error("Error applying for job:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while applying for the job." });
  }
});

// Helper function to check if the user has already applied for a job
const checkIfAlreadyApplied = (userId, post_id) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM userAppliedJob WHERE user_id = ? AND post_id = ? ;`;
    sql_db.query(query, [userId, post_id], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0);
    });
  });
};

// Helper function to get application status for a job
const getApplicationStatus = (post_id) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT post_id, status FROM userAppliedJob WHERE post_id = ? LIMIT 1`;
    sql_db.query(query, [post_id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Helper function to insert a new job application
const applyForJob = (userId, post_id, resume_id) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO userAppliedJob (user_id, post_id, resume_id) VALUES (?, ?, ?)`;
    sql_db.query(query, [userId, post_id, resume_id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

export default router;
