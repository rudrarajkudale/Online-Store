const bcrypt = require('bcrypt');


const getStats = (db) => (req, res) => {
  const countQuery = (table) =>
    new Promise((resolve) => {
      db.query(`SHOW TABLES LIKE ?`, [table], (err, tables) => {
        if (err || tables.length === 0) {
          return resolve(0);
        }
        db.query(`SELECT COUNT(*) AS total FROM ??`, [table], (err, result) => {
          if (err) return resolve(0);
          resolve(result[0].total);
        });
      });
    });

  Promise.all([countQuery('users'), countQuery('stores'), countQuery('reviews')])
    .then(([users, stores, reviews]) => {
      res.json({ users, stores, reviews });
    })
    .catch(() => {
      res.status(500).json({ error: 'Error fetching stats' });
    });
};

const getUsers = (db) => (req, res) => {
  const query = `
    SELECT 
      u.id AS user_id,
      u.name AS user_name,
      u.email AS user_email,
      u.address AS user_address,
      u.role AS user_role,
      s.id AS store_id,
      s.name AS store_name,
      s.email AS store_email,
      s.address AS store_address,
      IFNULL(ROUND(AVG(r.rating), 2), 0) AS average_rating
    FROM users u
    LEFT JOIN stores s ON s.user_id = u.id
    LEFT JOIN reviews r ON r.store_id = s.id
    GROUP BY u.id, s.id
    ORDER BY u.id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users with stores:', err);
      return res.status(500).json({ error: 'Error fetching users' });
    }

    const usersMap = new Map();

    results.forEach(row => {
      if (!usersMap.has(row.user_id)) {
        usersMap.set(row.user_id, {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
          address: row.user_address,
          role: row.user_role,
          stores: [],
        });
      }

      if (row.store_id) {
        usersMap.get(row.user_id).stores.push({
          id: row.store_id,
          name: row.store_name,
          email: row.store_email,
          address: row.store_address,
          average_rating: parseFloat(row.average_rating),
        });
      }
    });

    const users = Array.from(usersMap.values());
    res.json(users);
  });
};


const addUser = (db) => async (req, res) => {
  const { name, email, password, address, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }
  try {
    db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertQuery = 'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)';
      db.query(insertQuery, [name, email, hashedPassword, address || '', role], (err2) => {
        if (err2) return res.status(500).json({ error: 'Error adding user' });
        res.status(201).json({ message: 'User added successfully' });
      });
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateUser = (db) => async (req, res) => {
  const userId = req.params.id;
  const { name, email, password, address, role } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }
  try {
    db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], async (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length > 0) {
        return res.status(400).json({ error: 'Email already in use by another user' });
      }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateQuery = 'UPDATE users SET name = ?, email = ?, address = ?, role = ?, password = ? WHERE id = ?';
        db.query(updateQuery, [name, email, address || '', role, hashedPassword, userId], (err2) => {
          if (err2) return res.status(500).json({ error: 'Error updating user' });
          res.json({ message: 'User updated successfully' });
        });
      } else {
        const updateQuery = 'UPDATE users SET name = ?, email = ?, address = ?, role = ? WHERE id = ?';
        db.query(updateQuery, [name, email, address || '', role, userId], (err2) => {
          if (err2) return res.status(500).json({ error: 'Error updating user' });
          res.json({ message: 'User updated successfully' });
        });
      }
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteUser = (db) => (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM users WHERE id = ?', [userId], (err) => {
    if (err) return res.status(500).json({ error: 'Error deleting user' });
    res.json({ message: 'User deleted successfully' });
  });
};


const getAllStores = (db) => (req, res) => {
  const query = `
    SELECT
      s.id,
      s.name,
      s.email,
      s.address,
      s.user_id,
      IFNULL(ROUND(AVG(r.rating), 2), 0) AS average_rating
    FROM stores s
    LEFT JOIN reviews r ON s.id = r.store_id
    GROUP BY s.id, s.name, s.email, s.address, s.user_id
    ORDER BY s.name ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching stores:', err);
      return res.status(500).json({ error: 'Failed to fetch stores' });
    }
    res.json(results);
  });
};


const addStore = (db) => (req, res) => {
  const { user_id, name, address } = req.body; 

  if (!user_id || !name) {
    return res.status(400).json({ error: 'User ID and Store Name are required' });
  }
  if (name.trim().length < 20 || name.trim().length > 60) {
    return res.status(400).json({ error: 'Store name must be between 20 and 60 characters' });
  }

  db.query('SELECT email, role FROM users WHERE id = ?', [user_id], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userEmail = results[0].email;
    const currentRole = results[0].role;

    const insertQuery = `
      INSERT INTO stores (name, email, address, user_id)
      VALUES (?, ?, ?, ?)
    `;
    console.log(insertQuery);
    db.query(insertQuery, [name, userEmail, address || '', user_id], (err) => {
      if (err) {
        console.error('Insert store error:', err);
        return res.status(500).json({ error: 'Failed to add store' });
      }

      if (currentRole !== 'store owner') {
        db.query('UPDATE users SET role = ? WHERE id = ?', ['store owner', user_id], (err) => {
          if (err) {
            console.error('Failed to update user role to store owner:', err);
          }
          return res.status(201).json({ message: 'Store added successfully, user role updated' });
        });
      } else {
        return res.status(201).json({ message: 'Store added successfully' });
      }
    });
  });
};


const deleteStore = (db) => (req, res) => {
  const storeId = req.params.id;
  if (!storeId) return res.status(400).json({ error: 'Store ID is required' });

  const deleteQuery = `DELETE FROM stores WHERE id = ?`;
  db.query(deleteQuery, [storeId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete store' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json({ success: true, message: 'Store deleted successfully' });
  });
};

const updateStore = (db) => (req, res) => {
  const storeId = req.params.id;
  const { name, address } = req.body;

  if (!storeId) return res.status(400).json({ error: 'Store ID is required' });
  if (!name) return res.status(400).json({ error: 'Store name is required' });

  const updateQuery = `
    UPDATE stores
    SET name = ?, address = ?
    WHERE id = ?
  `;

  db.query(updateQuery, [name, address || '', storeId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update store' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json({ success: true, message: 'Store updated successfully' });
  });
};

const getReviewsByStore = (db) => (req, res) => {
  const storeId = req.params.storeId;
  if (!storeId) return res.status(400).json({ error: 'Store ID is required' });

  const query = `
    SELECT r.id, r.rating, r.message, r.created_at, u.id AS user_id, u.name AS user_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.store_id = ?
    ORDER BY r.created_at DESC
  `;
  db.query(query, [storeId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch reviews' });
    res.json(results);
  });
};

const addReview = (db) => (req, res) => {
  const { store_id, user_id, rating, message } = req.body;
  if (!store_id || !user_id || !rating) return res.status(400).json({ error: 'Store ID, User ID and rating are required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

  const insertQuery = `
    INSERT INTO reviews (store_id, user_id, rating, message)
    VALUES (?, ?, ?, ?)
  `;
  db.query(insertQuery, [store_id, user_id, rating, message || null], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to add review' });
    res.status(201).json({ message: 'Review added successfully' });
  });
};

module.exports = {
  getStats,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getAllStores,
  addStore,
  updateStore,
  deleteStore,
  getReviewsByStore,
  addReview,
};
