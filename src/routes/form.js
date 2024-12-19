import express from "express";
import { sql_db } from "../db.js";
// import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// POST route to save form data
router.post("/form-data", (req, res) => {
  const { title, date, array } = req.body;

  // Serialize the array as a JSON string
  const arrayData = JSON.stringify(array);

  // Insert the form data into the database
  const query =
    "INSERT INTO form_data (title, date, array_data) VALUES (?, ?, ?)";
  sql_db.query(query, [title, date, arrayData], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).send("Error saving form data");
    }
    res.status(200).send("Form data saved successfully");
  });
});

// GET route to fetch form data
router.get("/form-data", (req, res) => {
  const query = "SELECT * FROM form_data";
  sql_db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).send("Error fetching form data");
    }
    // Parse array_data back to JSON
    const formattedResults = results.map((item) => ({
      ...item,
      array_data: JSON.parse(item.array_data),
    }));
    res.status(200).json(formattedResults);
  });
});

export default router;
