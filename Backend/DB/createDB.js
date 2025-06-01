require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

connection.connect(async (err) => {
  if (err) throw err;
  console.log('Connected to MySQL');

  connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`, (err) => {
    if (err) throw err;
    console.log(`Database '${process.env.DB_NAME}' dropped if existed`);

    connection.query(`CREATE DATABASE ${process.env.DB_NAME}`, (err) => {
      if (err) throw err;
      console.log(`Database '${process.env.DB_NAME}' created`);

      connection.changeUser({ database: process.env.DB_NAME }, async (err) => {
        if (err) throw err;

        const createUsersTable = `
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(60) CHECK (CHAR_LENGTH(name) BETWEEN 20 AND 60),
            email VARCHAR(100) UNIQUE CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
            address VARCHAR(400),
            password VARCHAR(255),
            role ENUM('admin', 'store owner', 'user') DEFAULT 'user'
          )
        `;

        const createStoresTable = `
          CREATE TABLE IF NOT EXISTS stores (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(60) NOT NULL CHECK (CHAR_LENGTH(name) BETWEEN 20 AND 60),
            email VARCHAR(100) NOT NULL CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
            address VARCHAR(400),
            user_id INT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `;

        const createReviewsTable = `
          CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            store_id INT NOT NULL,
            user_id INT NOT NULL,
            rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `;

        connection.query(createUsersTable, (err) => {
          if (err) throw err;
          console.log('Users table created or already exists');

          connection.query(createStoresTable, (err) => {
            if (err) throw err;
            console.log('Stores table created or already exists');

            connection.query(createReviewsTable, (err) => {
              if (err) throw err;
              console.log('Reviews table created or already exists');

              const adminEmail = 'rudra@gmail.com';
              connection.query('SELECT * FROM users WHERE email = ?', [adminEmail], async (err, results) => {
                if (err) throw err;

                if (results.length === 0) {
                  const hashedPassword = await bcrypt.hash('12345678', 10);
                  const adminInsert = `
                    INSERT INTO users (name, email, password, address, role)
                    VALUES ('Rudraraj Navanath Kudale', ?, ?, 'Kothrud', 'admin')
                  `;
                  connection.query(adminInsert, [adminEmail, hashedPassword], (err) => {
                    if (err) throw err;
                    console.log('Default admin user inserted');
                    connection.end();
                  });
                } else {
                  connection.end();
                }
              });
            });
          });
        });
      });
    });
  });
});
