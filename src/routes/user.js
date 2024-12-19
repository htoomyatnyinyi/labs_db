import express from "express";
import { sql_db } from "../db/db.js"; // Assuming sql_db is your database connection
import verifyToken from "../middleware/verifyToken.js"; // Middleware to verify JWT token
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// Get all users
router.get("/users", authenticate, (req, res) => {
  console.log(req.session, req.cookies);

  sql_db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get a user by id not profile
router.get("/user/:id", authenticate, (req, res) => {
  console.log(req.params);

  const { id } = req.params;
  sql_db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(results[0]); // Return the first (and only) user object
  });
});

// Update a user by ID
router.put("/user/:id", authenticate, (req, res) => {
  console.log(req, " check");
  // const { id } = req.params;
  // const { username, password, userType } = req.body;

  // // Validate request body
  // if (!username || !password || !userType) {
  //   return res
  //     .status(400)
  //     .json({ message: "Please provide username, password, and userType." });
  // }

  // sql_db.query(
  //   "UPDATE users SET username = ?, password = ?, userType = ? WHERE id = ?",
  //   [username, password, userType, id],
  //   (err, results) => {
  //     if (err) {
  //       return res.status(500).json({ error: err.message });
  //     }
  //     if (results.affectedRows === 0) {
  //       return res.status(404).json({ message: "User not found" });
  //     }
  //     res.json({ message: "User updated successfully" });
  //   }
  // );
});

// Delete a user by ID
// router.delete("/user/:id", authenticate, (req, res) => {
//   const { id } = req.params;
//   sql_db.query("DELETE FROM users WHERE id = ?", [id], (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     if (results.affectedRows === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json({ message: "User deleted successfully" });
//   });
// });

// Get a user by ID (using req.user) base on token
router.get("/profile", authenticate, (req, res) => {
  const userId = req.user.id; // Assuming the user's ID is stored in req.user.id
  sql_db.query("SELECT * FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(results[0]); // Return the first (and only) user object
  });
});

export default router;

// import express from "express";
// // import jwt from "jsonwebtoken";

// import { sql_db } from "../db.js";
// const router = express.Router();

// // Get all users
// router.get("/users", (req, res) => {
//   sql_db.query("SELECT * FROM users", (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });

// // Get a user by ID
// router.get("/:id", (req, res) => {
//   const { id } = req.params;
//   sql_db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     if (results.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json(results[0]);
//   });
// });

// // Update a user by ID
// router.put("/:id", (req, res) => {
//   const { id } = req.params;
//   const { username, password, userType } = req.body;
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

// // Delete a user by ID
// router.delete("/:id", (req, res) => {
//   const { id } = req.params;
//   sql_db.query("DELETE FROM users WHERE id = ?", [id], (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     if (results.affectedRows === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json({ message: "User deleted successfully" });
//   });
// });

// export default router;
