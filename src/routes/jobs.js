import express from "express";
import { sql_db } from "../db/db.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// This code responsibilites and requirement not working with db from frontend and .rest api
// // Add a new job post with responsibilities and requirements
// router.post("/jobs", authenticate, (req, res) => {
//   const {
//     title,
//     description,
//     salary,
//     location,
//     address,
//     company_name,
//     license,
//     category,
//     company_logo,
//     post_img,
//     employmentType,
//     responsibilities,
//     requirements,
//   } = req.body;

//   const postQuery = `INSERT INTO jobPost (title, description, salary, location, address, company_name, license, category, company_logo, post_img, employmentType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//   sql_db.query(
//     postQuery,
//     [
//       title,
//       description,
//       salary,
//       location,
//       address,
//       company_name,
//       license,
//       category,
//       company_logo,
//       post_img,
//       employmentType,
//     ],
//     (err, postResults) => {
//       if (err) return res.status(500).json({ error: err.message });

//       const postId = postResults.insertId;

//       // Insert responsibilities
//       const responsibilityQuery = `INSERT INTO jobResponsibilities (post_id, responsibility) VALUES ?`;
//       // Validate responsibilities
//       if (!Array.isArray(responsibilities)) {
//         return res
//           .status(400)
//           .json({ error: "Responsibilities must be an array." });
//       }

//       try {
//         const responsibilityValues = responsibilities.map((resp) => [resp]);

//         // Proceed with your database logic
//         console.log("Mapped Responsibilities:", responsibilityValues);
//       } catch (error) {
//         console.error("Error:", error.message);
//         res.status(500).json({ error: "Internal Server Error" });
//       }

//       //   const responsibilityValues = responsibilities.map((resp) => [
//       //     postId,
//       //     resp,
//       //   ]);

//       sql_db.query(responsibilityQuery, [responsibilityValues], (err) => {
//         if (err) return res.status(500).json({ error: err.message });

//         // Insert requirements
//         const requirementQuery = `INSERT INTO jobRequirements (post_id, requireme nt) VALUES ?`;
//         const requirementValues = requirements.map((req) => [postId, req]);

//         sql_db.query(requirementQuery, [requirementValues], (err) => {
//           if (err) return res.status(500).json({ error: err.message });

//           res
//             .status(201)
//             .json({ message: "Job post created successfully", postId });
//         });
//       });
//     }
//   );
// });

// Add a new job post
router.post("/jobs", authenticate, (req, res) => {
  const {
    title,
    description,
    salary,
    location,
    address,
    company_name,
    license,
    category,
    company_logo,
    post_img,
    employmentType,
    responsibilities,
    requirements,
  } = req.body;

  // Validate inputs
  if (!Array.isArray(responsibilities) || !Array.isArray(requirements)) {
    return res.status(400).json({
      error: "Responsibilities and Requirements must be arrays.",
    });
  }

  const postQuery = `INSERT INTO jobPost (title, description, salary, location, address, company_name, license, category, company_logo, post_img, employmentType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  sql_db.query(
    postQuery,
    [
      title,
      description,
      salary,
      location,
      address,
      company_name,
      license,
      category,
      company_logo,
      post_img,
      employmentType,
    ],
    (err, postResults) => {
      if (err) return res.status(500).json({ error: err.message });

      const postId = postResults.insertId;

      // Insert responsibilities
      const responsibilityQuery = `INSERT INTO jobResponsibilities (post_id, responsibility) VALUES ?`;
      const responsibilityValues = responsibilities.map((resp) => [
        postId,
        resp,
      ]);

      sql_db.query(responsibilityQuery, [responsibilityValues], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Insert requirements
        const requirementQuery = `INSERT INTO jobRequirements (post_id, requirement) VALUES ?`;
        const requirementValues = requirements.map((req) => [postId, req]);

        sql_db.query(requirementQuery, [requirementValues], (err) => {
          if (err) return res.status(500).json({ error: err.message });

          res
            .status(201)
            .json({ message: "Job post created successfully", postId });
        });
      });
    }
  );
});

router.get("/jobs", (req, res) => {
  const postQuery = `SELECT * FROM jobpost`;
  sql_db.query(postQuery, (err, getJobs) => {
    if (err) return res.status(500).json({ error: err.message });
    if (getJobs.length === 0)
      return res.status(404).json({ message: "Job post not found" });

    res.json(getJobs);
  });
});

// Get a single job post with its responsibilities and requirements
router.get("/jobs/:id", (req, res) => {
  const { id } = req.params;

  const postQuery = `SELECT * FROM jobPost WHERE id = ?`;
  sql_db.query(postQuery, [id], (err, postResults) => {
    if (err) return res.status(500).json({ error: err.message });

    if (postResults.length === 0)
      return res.status(404).json({ message: "Job post not found" });

    const responsibilitiesQuery = `SELECT responsibility FROM jobResponsibilities WHERE post_id = ?`;
    sql_db.query(responsibilitiesQuery, [id], (err, responsibilities) => {
      if (err) return res.status(500).json({ error: err.message });

      const requirementsQuery = `SELECT requirement FROM jobRequirements WHERE post_id = ?`;
      sql_db.query(requirementsQuery, [id], (err, requirements) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          ...postResults[0],
          responsibilities: responsibilities.map((r) => r.responsibility),
          requirements: requirements.map((r) => r.requirement),
        });
      });
    });
  });
});

// Update a job post and its responsibilities and requirements
router.put("/jobs/:id", (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    salary,
    location,
    address,
    company_name,
    license,
    category,
    company_logo,
    post_img,
    employmentType,
    responsibilities,
    requirements,
  } = req.body;

  const postQuery = `UPDATE jobPost SET title = ?, description = ?, salary = ?, location = ?, address = ?, company_name = ?, license = ?, category = ?, company_logo = ?, post_img = ?, employmentType = ? WHERE id = ?`;

  sql_db.query(
    postQuery,
    [
      title,
      description,
      salary,
      location,
      address,
      company_name,
      license,
      category,
      company_logo,
      post_img,
      employmentType,
      id,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Update responsibilities
      const deleteResponsibilitiesQuery = `DELETE FROM jobResponsibilities WHERE post_id = ?`;
      sql_db.query(deleteResponsibilitiesQuery, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const responsibilityQuery = `INSERT INTO jobResponsibilities (post_id, responsibility) VALUES ?`;
        const responsibilityValues = responsibilities.map((resp) => [id, resp]);

        sql_db.query(responsibilityQuery, [responsibilityValues], (err) => {
          if (err) return res.status(500).json({ error: err.message });

          // Update requirements
          const deleteRequirementsQuery = `DELETE FROM jobRequirements WHERE post_id = ?`;
          sql_db.query(deleteRequirementsQuery, [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            const requirementQuery = `INSERT INTO jobRequirements (post_id, requirement) VALUES ?`;
            const requirementValues = requirements.map((req) => [id, req]);

            sql_db.query(requirementQuery, [requirementValues], (err) => {
              if (err) return res.status(500).json({ error: err.message });

              res.json({ message: "Job post updated successfully" });
            });
          });
        });
      });
    }
  );
});

// Delete a job post with its responsibilities and requirements
router.delete("/jobs/:id", (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM jobPost WHERE id = ?`;
  sql_db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Job post deleted successfully" });
  });
});
// #############################################
// ###### FEATURES before edit ###################
// ###########################

// Apply for a Job
// router.post("/apply-job", (req, res) => {
//   const { user_id, post_id, resume_id } = req.body;
//   try {
//     const [result] = sql_db.query(
//       `INSERT INTO userAppliedJob (user_id, post_id, resume_id) VALUES (?, ?, ?)`,
//       [user_id, post_id, resume_id]
//     );
//     res.status(201).json({
//       message: "Job application submitted successfully",
//       applicationId: result.insertId,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error applying for the job", error });
//   }
// });

// // Save a Job
// router.post("/save-job", (req, res) => {
//   const { user_id, post_id } = req.body;
//   try {
//     const [result] = sql_db.query(
//       `INSERT INTO userSaveJob (user_id, post_id) VALUES (?, ?)`,
//       [user_id, post_id]
//     );
//     res
//       .status(201)
//       .json({ message: "Job saved successfully", saveId: result.insertId });
//   } catch (error) {
//     res.status(500).json({ message: "Error saving the job", error });
//   }
// });

// // Get Applied Jobs

// router.get("/applied-jobs/:user_id", (req, res) => {
//   const { user_id } = req.params;
//   try {
//     const [result] = sql_db.query(
//       `SELECT * FROM userAppliedJob WHERE user_id = ?`,
//       [user_id]
//     );
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching applied jobs", error });
//   }
// });
// // Get Saved Jobs
// router.get("/saved-jobs/:user_id", (req, res) => {
//   const { user_id } = req.params;
//   try {
//     const [result] = sql_db.query(
//       `SELECT * FROM userSaveJob WHERE user_id = ?`,
//       [user_id]
//     );
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching saved jobs", error });
//   }
// });

// ###################################
// ########## AFTER EDIT By Profile Id #############
// ###################################

router.post("/apply-job", authenticate, (req, res) => {
  const userId = req.user.id;
  const { post_id, resume_id } = req.body;

  console.log(post_id, resume_id, "from apply job frontend to backend");

  try {
    sql_db.query(
      `INSERT INTO userAppliedJob (user_id, post_id, resume_id) VALUES (?, ?, ?)`,
      [userId, post_id, resume_id],
      (err, results) => {
        if (err) return res.status(500).json({ err: "error" });
        res.status(200).json({ message: "Applied Successfully" });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error fetching applied jobs", error });
  }
});
router.post("/save-job", authenticate, (req, res) => {
  const userId = req.user.id;
  const { post_id } = req.body;

  console.log(post_id, "from apply job frontend to backend");

  try {
    sql_db.query(
      `INSERT INTO userSaveJob (user_id, post_id) VALUES (?, ?)`,
      [userId, post_id],
      (err, results) => {
        if (err) return res.status(500).json({ err: "error" });
        res.status(200).json({ message: "Saved Successfully" });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error fetching applied jobs", error });
  }
});

router.get("/applied-job", authenticate, (req, res) => {
  const userId = req.user.id;

  try {
    sql_db.query(
      `SELECT * FROM userAppliedJob WHERE user_id = ?`,
      [userId],
      (error, result) => {
        if (error) return res.status(500).json(error.message);
        res.send(result);
      }
    );
    // res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applied jobs", error });
  }
});
router.get("/saved-job", authenticate, (req, res) => {
  const userId = req.user.id;

  try {
    sql_db.query(
      `SELECT * FROM userSaveJob WHERE user_id = ?`,
      [userId],
      (error, result) => {
        if (error) return res.status(500).json(error.message);
        res.send(result);
      }
    );
    // res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applied jobs", error });
  }
});

export default router;
// SELECT
// jp.*,
// GROUP_CONCAT(jr.responsibility SEPARATOR ', ') AS responsibilities,
// GROUP_CONCAT(jrq.requirement SEPARATOR ', ') AS requirements
// FROM
// jobpost jp
// LEFT JOIN
// jobResponsibilities jr ON 1=1
// LEFT JOIN
// jobRequirements jrq ON jp.id = jrq.post_id
// GROUP BY
// jp.id
// 4;
