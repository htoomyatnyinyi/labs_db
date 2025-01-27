import express from "express";
import { sql_db } from "../../db/db.js";
import authenticate from "../../middleware/authenticate.js";

const router = express.Router();

router.get("/dashboard", (req, res) => {
  const postQuery = ` select jobpost.*, useraccount.* from jobpost join useraccount`;
  sql_db.query(postQuery, (err, getJobs) => {
    if (err) return res.status(500).json({ error: err.message });
    if (getJobs.length === 0)
      return res.status(404).json({ message: "Job post not found" });

    res.json(getJobs);
  });
});

router.get("/dashboard/stats", (req, res) => {
  const Query = `
  select jobpost.title, jobpost.salary, useraccount.username 
  from 
  jobpost join useraccount
  `;
  sql_db.query(Query, (err, getStats) => {
    if (err) return res.status(500).json({ error: err.message });
    if (getStats.length === 0)
      return res.status(404).json({ message: "Job post not found" });

    res.json(getStats);
  });
});

router.get("/dashboard/stats", (req, res) => {
  const Query = `
  select jobpost.title, jobpost.salary, useraccount.username 
  from 
  jobpost join useraccount
  `;
  sql_db.query(Query, (err, getStats) => {
    if (err) return res.status(500).json({ error: err.message });
    if (getStats.length === 0)
      return res.status(404).json({ message: "Job post not found" });

    res.json(getStats);
  });
});

export default router;
