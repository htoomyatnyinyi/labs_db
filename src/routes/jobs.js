import express from "express";
import { sql_db } from "../db/db.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// Get all job postings excluding applied jobs for the authenticated user
router.get("/allposting", authenticate, (req, res) => {
  const userId = req.user.id; // Get the user ID from the token

  sql_db.query(
    `
    SELECT 
      p.id, 
      p.title, 
      p.company, 
      p.salary,
      p.location, 
      p.category, 
      p.employmentType, 
      p.posted_at AS posted, 
      p.description, 
      p.address,
      GROUP_CONCAT(DISTINCT r.responsibility SEPARATOR '; ') AS responsibilities,
      GROUP_CONCAT(DISTINCT rq.requirement SEPARATOR '; ') AS requirements
    FROM 
      posts p
    LEFT JOIN 
      responsibilities r ON p.id = r.post_id
    LEFT JOIN 
      requirements rq ON p.id = rq.post_id
    WHERE 
      p.id NOT IN (SELECT post_id FROM apply_job WHERE user_id = ?)
    GROUP BY 
      p.id
  `,
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

// applied job ဖြစ်ပြီးသားကို job listing မှာမပြပေးတော့ပါ။
// // Get all job postings with responsibilities and requirements
// router.get("/allposting", authenticate, (req, res) => {
//   sql_db.query(
//     `
//     SELECT
//       p.id,
//       p.title,
//       p.company,
//       p.salary,
//       p.location,
//       p.category,
//       p.employmentType,
//       p.posted_at AS posted,
//       p.description,
//       p.address,
//       GROUP_CONCAT(DISTINCT r.responsibility SEPARATOR '; ') AS responsibilities,
//       GROUP_CONCAT(DISTINCT rq.requirement SEPARATOR '; ') AS requirements
//     FROM
//       posts p
//     LEFT JOIN
//       responsibilities r ON p.id = r.post_id
//     LEFT JOIN
//       requirements rq ON p.id = rq.post_id
//     GROUP BY
//       p.id
//   `,
//     (err, results) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       res.json(results);
//     }
//   );
// });

// router.post("/create-posting", (req, res) => {
//   const {
//     title,
//     description,
//     responsibilities,
//     requirements,
//     salary,
//     location,
//     address,
//   } = req.body;

//   console.log(
//     title,
//     description,
//     responsibilities,
//     requirements,
//     salary,
//     location,
//     address
//   );
//   if (responsibilities && responsibilities.length > 0) {
//     const data = responsibilities.map((r) => r);
//     console.log(data, "at responsibilities");
//   }
// });

// Create a new job posting

router.post("/create-posting", authenticate, (req, res) => {
  const {
    title,
    description,
    responsibilities,
    requirements,
    salary,
    location,
    address,
  } = req.body;

  sql_db.query(
    "INSERT INTO posts (title, description, salary, location, address) VALUES (?, ?, ?, ?, ?)",
    [title, description, salary, location, address],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const postId = results.insertId;

      // Insert responsibilities
      if (responsibilities && responsibilities.length > 0) {
        const responsibilityValues = responsibilities.map((r) => [postId, r]);
        sql_db.query(
          "INSERT INTO responsibilities (post_id, responsibility) VALUES ?",
          [responsibilityValues],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
          }
        );
      }

      // Insert requirements
      if (requirements && requirements.length > 0) {
        const requirementValues = requirements.map((r) => [postId, r]);
        sql_db.query(
          "INSERT INTO requirements (post_id, requirement) VALUES ?",
          [requirementValues],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
          }
        );
      }

      res.status(201).json({ id: postId });
    }
  );
});

// Get a job posting by ID
router.get("/post/:id", (req, res) => {
  const { id } = req.params;
  sql_db.query(
    `
    SELECT 
      p.id, 
      p.title, 
      p.company, 
      p.location, 
      p.category, 
      p.employmentType, 
      p.posted_at AS posted, 
      p.description, 
      p.address,
      GROUP_CONCAT(DISTINCT r.responsibility SEPARATOR '; ') AS responsibilities,
      GROUP_CONCAT(DISTINCT rq.requirement SEPARATOR '; ') AS requirements
    FROM 
      posts p
    LEFT JOIN 
      responsibilities r ON p.id = r.post_id
    LEFT JOIN 
      requirements rq ON p.id = rq.post_id
    WHERE 
      p.id = ?
    GROUP BY 
      p.id
  `,
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      res.json(results[0]);
    }
  );
});

// Update a job posting by ID
router.put("/post/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    responsibilities,
    requirements,
    salary,
    location,
    address,
  } = req.body;
  sql_db.query(
    "UPDATE posts SET title = ?, description = ?, salary = ?, location = ?, address = ? WHERE id = ?",
    [title, description, salary, location, address, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Job posting not found" });
      }

      // Update responsibilities
      if (responsibilities) {
        sql_db.query(
          "DELETE FROM responsibilities WHERE post_id = ?",
          [id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            const responsibilityValues = responsibilities.map((r) => [id, r]);
            sql_db.query(
              "INSERT INTO responsibilities (post_id, responsibility) VALUES ?",
              [responsibilityValues],
              (err, result) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }
                console.log(
                  result.affectedRows,
                  result.insertId,
                  result.warningStatus
                );
              }
            );
          }
        );
      }

      // Update requirements
      if (requirements) {
        sql_db.query(
          "DELETE FROM requirements WHERE post_id = ?",
          [id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            const requirementValues = requirements.map((r) => [id, r]);
            sql_db.query(
              "INSERT INTO requirements (post_id, requirement) VALUES ?",
              [requirementValues],
              (err) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }
              }
            );
          }
        );
      }

      res.json({ message: "Job posting updated successfully" });
    }
  );
});

// Delete a job posting by ID
router.delete("/post/:id", authenticate, (req, res) => {
  const { id } = req.params;
  sql_db.query("DELETE FROM posts WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Job posting not found" });
    }
    res.json({ message: "Job posting deleted successfully" });
  });
});

export default router;

// THE CODE UPDATE FROM DB.JS AND JOBS.JS UPDAET FROM CHATGPT.

// import express from "express";
// import { sql_db } from "../db.js";
// import verifyToken from "../middleware/verifyToken.js";

// const router = express.Router();

// // Get all job postings with responsibilities and requirements
// router.get("/allposting", (req, res) => {
//   sql_db.query(
//     `
//     SELECT
//       p.id,
//       p.title,
//       p.company,
//       p.location,
//       p.category,
//       p.employmentType,
//       p.posted_at AS posted,
//       p.description,
//       p.address,
//       GROUP_CONCAT(DISTINCT r.responsibility SEPARATOR '; ') AS responsibilities,
//       GROUP_CONCAT(DISTINCT rq.requirement SEPARATOR '; ') AS requirements
//     FROM
//       posts p
//     LEFT JOIN
//       responsibilities r ON p.id = r.post_id
//     LEFT JOIN
//       requirements rq ON p.id = rq.post_id
//     GROUP BY
//       p.id
//   `,
//     (err, results) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       res.json(results);
//     }
//   );
// });

// // Create a new job posting
// router.post("/create-posting", verifyToken, (req, res) => {
//   const {
//     title,
//     description,
//     responsibilities,
//     requirements,
//     salary,
//     location,
//     address,
//   } = req.body;
//   sql_db.query(
//     "INSERT INTO posts (title, description, salary, location, address) VALUES (?, ?, ?, ?, ?)",
//     [title, description, salary, location, address],
//     (err, results) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       const postId = results.insertId;

//       // Insert responsibilities
//       if (responsibilities && responsibilities.length > 0) {
//         const responsibilityValues = responsibilities.map((r) => [postId, r]);
//         sql_db.query(
//           "INSERT INTO responsibilities (post_id, responsibility) VALUES ?",
//           [responsibilityValues],
//           (err) => {
//             if (err) {
//               return res.status(500).json({ error: err.message });
//             }
//           }
//         );
//       }

//       // Insert requirements
//       if (requirements && requirements.length > 0) {
//         const requirementValues = requirements.map((r) => [postId, r]);
//         sql_db.query(
//           "INSERT INTO requirements (post_id, requirement) VALUES ?",
//           [requirementValues],
//           (err) => {
//             if (err) {
//               return res.status(500).json({ error: err.message });
//             }
//           }
//         );
//       }

//       res.status(201).json({ id: postId });
//     }
//   );
// });

// // Get a job posting by ID
// router.get("/post/:id", (req, res) => {
//   const { id } = req.params;
//   sql_db.query(
//     `
//     SELECT
//       p.id,
//       p.title,
//       p.company,
//       p.location,
//       p.category,
//       p.employmentType,
//       p.posted_at AS posted,
//       p.description,
//       p.address,
//       GROUP_CONCAT(DISTINCT r.responsibility SEPARATOR '; ') AS responsibilities,
//       GROUP_CONCAT(DISTINCT rq.requirement SEPARATOR '; ') AS requirements
//     FROM
//       posts p
//     LEFT JOIN
//       responsibilities r ON p.id = r.post_id
//     LEFT JOIN
//       requirements rq ON p.id = rq.post_id
//     WHERE
//       p.id = ?
//     GROUP BY
//       p.id
//   `,
//     [id],
//     (err, results) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       if (results.length === 0) {
//         return res.status(404).json({ message: "Job posting not found" });
//       }
//       res.json(results[0]);
//     }
//   );
// });

// // Update a job posting by ID
// router.put("/post/:id", verifyToken, (req, res) => {
//   const { id } = req.params;
//   const {
//     title,
//     description,
//     responsibilities,
//     requirements,
//     salary,
//     location,
//     address,
//   } = req.body;
//   sql_db.query(
//     "UPDATE posts SET title = ?, description = ?, salary = ?, location = ?, address = ? WHERE id = ?",
//     [title, description, salary, location, address, id],
//     (err, results) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       if (results.affectedRows === 0) {
//         return res.status(404).json({ message: "Job posting not found" });
//       }

//       // Update responsibilities
//       if (responsibilities) {
//         sql_db.query(
//           "DELETE FROM responsibilities WHERE post_id = ?",
//           [id],
//           (err) => {
//             if (err) {
//               return res.status(500).json({ error: err.message });
//             }
//             const responsibilityValues = responsibilities.map((r) => [id, r]);
//             sql_db.query(
//               "INSERT INTO responsibilities (post_id, responsibility) VALUES ?",
//               [responsibilityValues],
//               (err) => {
//                 if (err) {
//                   return res.status(500).json({ error: err.message });
//                 }
//               }
//             );
//           }
//         );
//       }

//       // Update requirements
//       if (requirements) {
//         sql_db.query(
//           "DELETE FROM requirements WHERE post_id = ?",
//           [id],
//           (err) => {
//             if (err) {
//               return res.status(500).json({ error: err.message });
//             }
//             const requirementValues = requirements.map((r) => [id, r]);
//             sql_db.query(
//               "INSERT INTO requirements (post_id, requirement) VALUES ?",
//               [requirementValues],
//               (err) => {
//                 if (err) {
//                   return res.status(500).json({ error: err.message });
//                 }
//               }
//             );
//           }
//         );
//       }

//       res.json({ message: "Job posting updated successfully" });
//     }
//   );
// });

// // Delete a job posting by ID
// router.delete("/post/:id", verifyToken, (req, res) => {
//   const { id } = req.params;
//   sql_db.query("DELETE FROM posts WHERE id = ?", [id], (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     if (results.affectedRows === 0) {
//       return res.status(404).json({ message: "Job posting not found" });
//     }
//     res.json({ message: "Job posting deleted successfully" });
//   });
// });

// export default router;
