import express from "express";
import { sql_db } from "../db/db.js"; // Assuming sql_db is your database connection
import verifyToken from "../middleware/verifyToken.js"; // Middleware to verify JWT token
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// Get all users
router.get("/users", authenticate, (req, res) => {
  console.log(req.session, req.cookies);

  sql_db.query("SELECT * FROM useraccount", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ###################################
// ######### USER PROFILE ############
// ###################################

// Get a user by ID (using req.user) base on token
router.get("/profile", authenticate, (req, res) => {
  const userId = req.user.id; // Assuming the user's ID is stored in req.user.id
  sql_db.query(
    "SELECT * FROM useraccount WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(results[0]); // Return the first (and only) user object
    }
  );
});

router.delete("/profile", authenticate, (req, res) => {
  const userId = req.user.id;
  sql_db.query(
    "DELETE FROM useraccount WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    }
  );
});

router.put("/profile", authenticate, (req, res) => {
  // Uncomment authenticate when available
  const userId = req.user.id;
  // const userId = req.user ? req.user.id : 1; // get user id from req.user
  const { username, phone, first_name, last_name, gender } = req.body;

  // Data Validation
  if (!username || !phone || !first_name || !last_name || !gender) {
    return res.status(400).json({
      message:
        "All fields (username, phone, first_name, last_name, gender) are required.",
    });
  }

  // More robust validation (example using regex for phone number)
  const phoneRegex = /^\d{10}$/; // Example: 10-digit phone number
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number format." });
  }

  // Use prepared statements to prevent SQL injection
  const query =
    "UPDATE useraccount SET username = ?, phone = ?, first_name = ?, last_name = ?, gender = ? WHERE id = ?";
  sql_db.query(
    query,
    [username, phone, first_name, last_name, gender, userId],
    (err, results) => {
      if (err) {
        console.error("Database error:", err); // Log the error for debugging
        return res
          .status(500)
          .json({ error: "Failed to update user profile." }); // Generic error message for security
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      if (results.changedRows === 0) {
        return res
          .status(200)
          .json({ message: "No changes were made to the profile.", username });
      }

      res.json({ message: "User updated successfully.", username });
    }
  );
});

// ##############################################
// ### CAUTIONS::: For Specific Admin Account ###
// ##############################################

// Get a user by id not profile for specific admin
router.get("/user/:id", authenticate, (req, res) => {
  const { id } = req.params;
  sql_db.query(
    "SELECT * FROM useraccount WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(results[0]); // Return the first (and only) user object
    }
  );
});

// Need to check the query
// Update a user by ID
// router.put("/user/:id", authenticate, (req, res) => {
//   console.log(req, " check");
//   const { id } = req.params;
//   const { username, password, userType } = req.body;

//   // Validate request body
//   if (!username || !password || ) {
//     return res
//       .status(400)
//       .json({ message: "Please provide username, password, and userType." });
//   }

//   sql_db.query(
//     "UPDATE users SET username = ?, password = ?, userType = ? WHERE id = ?",
//     [username, password, userType, id],
//     (err, results) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       if (results.affectedRows === 0) {
//         return res.status(404).json({ message: "User not found" });
//       }
//       res.json({ message: "User updated successfully" });
//     }
//   );
// });

// Delete a user by ID
router.delete("/user/:id", authenticate, (req, res) => {
  const { id } = req.params;
  sql_db.query("DELETE FROM users WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  });
});

export default router;
