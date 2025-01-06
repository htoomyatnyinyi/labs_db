import express from "express";
// import { sql_db } from "../db.js"; // Assuming sql_db is your database connection
import { sql_db } from "../db/db.js";
const router = express.Router();

// API endpoint for search
router.get("/search", (req, res) => {
  const searchTerm = req.query.q;
  sql_db.query(
    "SELECT * FROM jobPost WHERE title LIKE ?",
    [`%${searchTerm}%`],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.json(results);
      }
    }
  );
});

export default router;
