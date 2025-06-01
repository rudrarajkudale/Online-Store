const bcrypt = require('bcrypt');

const signup = (db) => async (req, res) => {
  try {
    const { name, email, address, country, state, city, password, role } = req.body;
    if (!name || !email || !address || !password) {
      return res.status(400).json({ error: 'Name, email, address, and password are required' });
    }

    const fullAddress = `${address}, ${city || ''}, ${state || ''}, ${country || ''}`
      .replace(/, ,/g, ',')
      .replace(/, $/, '');

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, email, fullAddress, hashedPassword, role || 'user'], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' });
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      res.status(201).json({ id: result.insertId, role: role || 'user' });
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = (db) => async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
      if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      res.json({ id: user.id, role: user.role });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updatePassword = (db) => async (req, res) => {
  try {
    const { id, oldPassword, newPassword } = req.body;
    if (!id || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'User id, oldPassword, and newPassword are required' });
    }

    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [id], async (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
      if (results.length === 0) return res.status(404).json({ error: 'User not found' });

      const user = results[0];
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Incorrect old password' });

      const hashedNew = await bcrypt.hash(newPassword, 10);
      db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNew, id], (err) => {
        if (err) return res.status(500).json({ error: 'Password update failed' });
        res.json({ message: 'Password updated successfully' });
      });
    });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserNameById = (db) => (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'User ID is required' });

  db.query('SELECT name FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ name: results[0].name });
  });
};

module.exports = { signup, login, updatePassword, getUserNameById };
