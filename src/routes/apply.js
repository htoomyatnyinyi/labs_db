import express from "express";
import { sql_db } from "../db/db.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// Route to all jobs applied by a specific user by token id no need to add number
router.get("/applied", authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
    SELECT posts.id, posts.title, posts.company, posts.location, posts.category, posts.employmentType, posts.salary, posts.description
         FROM apply_job
         JOIN posts ON apply_job.post_id = posts.id
         WHERE apply_job.user_id = ?
    `;

    const [results] = await sql_db.promise().query(query, [userId]);
    return res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    return res.status(500).json({ message: "Error fetching applied jobs." });
  }
});

// Route to apply for a job
router.post("/apply", authenticate, async (req, res) => {
  // console.log(req.body);
  try {
    const { userId, postId, resumeId } = req.body;
    // console.log(userId, postId, resumeId);

    if (!userId || !postId || !resumeId) {
      return res
        .status(400)
        .json({ error: "User ID, Resume ID, and Post ID are required." });
    }

    const query = `INSERT INTO apply_job (user_id, post_id, resume_id) VALUES (?, ?, ?)`;
    const [result] = await sql_db
      .promise()
      .query(query, [userId, postId, resumeId]);

    // to get 'pending', 'succeeded', 'rejected'
    const check_query = `SELECT status from apply_job where id=?`;
    const [res_result] = await sql_db.promise().query(check_query, [postId]);
    const [info] = res_result;
    // console.log(res_result, info);

    return res.status(200).json({
      message: "Job application successful!",
      info,
      applicationId: result.insertId,
    });

    // const check_query = `SELECT status from apply_job where id=?`;
    // another option or verions of fetching info 'pending', 'succeeded' etc
    // const [check_result] = await sql_db.promise().query(check_query, [postId]);
    // console.log(check_result, "at db");
    // return res.status(200).json({
    //   message: "Job application successful!",
    //   status: check_result,
    //   applicationId: result.insertId,
    // });
  } catch (error) {
    console.error("Error applying for job:", error);
    return res.status(500).json({ error: "Failed to apply for job." });
  }
});

// Route to update job application status
// THIS LINE OS CODE IS FULL OF ERROR RETURN I THINK IT IS BEST FEATURE FOR OTHER
router.put("/application/:id/status", authenticate, async (req, res) => {
  const applicationId = req.params.id;
  const { status } = req.body;

  // console.log(applicationId, "and", status, "check");

  try {
    // Update status query
    const query = `UPDATE apply_job SET status = ? WHERE id = ?`;
    const [result] = await sql_db
      .promise()
      .query(query, [status, applicationId]);

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "Application status updated successfully",
      });
    } else {
      res.status(404).json({ message: "Application not found" });
    }

    // ANOTHER OPTION FOR ARRAY DESTRUCTURE
    //  const [ResultHeader] = await sql_db
    //    .promise()
    //    .query(query, [status, applicationId]);

    //  console.log(ResultHeader.affectedRows, "check", ResultHeader);
    //  if (ResultHeader.affectedRows > 0) {
    //    res
    //      .status(200)
    //      .json({ message: "Application status updated successfully" });
    //  } else {
    //    res.status(404).json({ message: "Application not found" });
    //  }
  } catch (error) {
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

export default router;
