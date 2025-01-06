import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const sql_db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

sql_db.connect((err) => {
  if (err) {
    console.error("ERROR CONNECTING TO THE DATABASE:", err.stack);
    return;
  }
  console.log(`CONNECTED TO THE MYSQL DATABASE: ${process.env.DB_HOST}`);

  // Create the database if it doesn't exist
  const dbName = process.env.DB_DATABASE;
  sql_db.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err) => {
    if (err) {
      console.error("ERROR CREATING DATABASE:", err);
      return;
    }
    console.log(`DATABASE '${dbName}' READY`);

    // Switch to the created database
    sql_db.changeUser({ database: dbName }, (err) => {
      if (err) {
        console.error("ERROR SWITCHING DATABASE:", err);
        return;
      }
      console.log(`SWITCHED TO DATABASE: ${dbName}`);

      // Define all the table creation queries
      const tableQueries = [
        // Create 'userAccount' table
        `CREATE TABLE IF NOT EXISTS userAccount (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) UNIQUE,
          phone VARCHAR(20),
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          gender ENUM('male', 'female', 'other', 'none'),
          date_of_birth DATE,
          location VARCHAR(255),
          verified BOOLEAN DEFAULT FALSE,
          active BOOLEAN DEFAULT TRUE,
          bios TEXT,
          profile_img VARCHAR(255),
          cover_img VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        // Create 'jobPost' table
        `CREATE TABLE IF NOT EXISTS jobPost (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          salary DECIMAL(10,1) NOT NULL,
          location VARCHAR(255),
          address VARCHAR(255),
          company_name VARCHAR(255),
          license VARCHAR(100),
          category VARCHAR(255),
          company_logo VARCHAR(255),
          post_img VARCHAR(255),
          employmentType ENUM('Full-time', 'Part-time', 'Apprenticeship', 'OJT'),
          posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        // Create 'jobResponsibilities' table
        `CREATE TABLE IF NOT EXISTS jobResponsibilities (
          id INT AUTO_INCREMENT PRIMARY KEY,
          post_id INT NOT NULL,
          responsibility TEXT NOT NULL,
          FOREIGN KEY (post_id) REFERENCES jobPost(id) ON DELETE CASCADE
        )`,
        // Create 'jobRequirements' table
        `CREATE TABLE IF NOT EXISTS jobRequirements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          post_id INT NOT NULL,
          requirement TEXT NOT NULL,
          FOREIGN KEY (post_id) REFERENCES jobPost(id) ON DELETE CASCADE
        )`,
        // Create 'userResume' table
        `CREATE TABLE IF NOT EXISTS userResume (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES userAccount(id),
          file_path VARCHAR(255),
          file_name VARCHAR(255),
          file_type VARCHAR(50),
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,

        // // Create 'userAppliedJob' table
        // `CREATE TABLE IF NOT EXISTS userAppliedJob (
        //   id INT AUTO_INCREMENT PRIMARY KEY,
        //   user_id INT NOT NULL,
        //   post_id INT NOT NULL,
        //   resume_id INT NOT NULL,
        //   FOREIGN KEY (user_id) REFERENCES userAccount(id),
        //   FOREIGN KEY (post_id) REFERENCES jobPost(id),
        //   FOREIGN KEY (resume_id) REFERENCES userResume(id),
        //   status ENUM('pending', 'interviewed', 'rejected', 'offered') NOT NULL DEFAULT 'pending',
        //   applied BOOLEAN DEFAULT TRUE,
        //   applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        //   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        // )`,
        // // Create 'userSaveJob' table
        // `CREATE TABLE userSaveJob (
        //   save_id INT AUTO_INCREMENT PRIMARY KEY,
        //   user_id INT NOT NULL,
        //   post_id INT NOT NULL,
        //   FOREIGN KEY (user_id) REFERENCES userAccount(id),
        //   FOREIGN KEY (post_id) REFERENCES jobPost(post_id)
        //   saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        // )`,
        `CREATE TABLE IF NOT EXISTS userAppliedJob (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          post_id INT NOT NULL,
          resume_id INT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES userAccount(id),
          FOREIGN KEY (post_id) REFERENCES jobPost(id),
          FOREIGN KEY (resume_id) REFERENCES userResume(id),
          status ENUM('pending', 'interviewed', 'rejected', 'offered') NOT NULL DEFAULT 'pending',
          applied BOOLEAN DEFAULT TRUE,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
        // Creaet 'userSaveJob' table
        `CREATE TABLE IF NOT EXISTS userSaveJob (
          save_id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          post_id INT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES userAccount(id),
          FOREIGN KEY (post_id) REFERENCES jobPost(id),
          saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      ];

      // Execute all the table creation queries
      tableQueries.forEach((query) => {
        sql_db.query(query, (err) => {
          if (err) {
            console.error(`ERROR EXECUTING QUERY:\n${query}\nERROR:`, err);
          }
        });
      });
      console.log("ALL TABLES CREATED OR VERIFIED SUCCESSFULLY");
    });
  });
});

export { sql_db };
