const searchStores = (db) => (req, res) => {
  const { query } = req.query;
  const sql = `
    SELECT s.*, 
           IFNULL(ROUND(AVG(r.rating), 1), 0) AS rating,
           COUNT(r.id) AS review_count
    FROM stores s
    LEFT JOIN reviews r ON s.id = r.store_id
    WHERE s.name LIKE ? OR s.address LIKE ?
    GROUP BY s.id
  `;
  const searchTerm = `%${query}%`;
  db.query(sql, [searchTerm, searchTerm], (err, results) => {
    if (err) return res.status(500).send('Search failed');
    res.json(results);
  });
};

const getAllStores = (db) => (req, res) => {
  const sql = `
    SELECT s.*, 
           IFNULL(ROUND(AVG(r.rating), 1), 0) AS rating,
           COUNT(r.id) AS review_count
    FROM stores s
    LEFT JOIN reviews r ON s.id = r.store_id
    GROUP BY s.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch stores' });
    res.json(results);
  });
};

const getStoresByUser = (db) => (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
      s.id AS store_id, s.name AS store_name, s.email, s.address, s.user_id AS owner_id,
      IFNULL(ROUND(AVG(rv.rating), 1), 0) AS rating,
      COUNT(rv.id) AS review_count
    FROM stores s
    LEFT JOIN reviews rv ON s.id = rv.store_id
    WHERE s.user_id = ?
    GROUP BY s.id
    ORDER BY s.name ASC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ error: 'Failed to fetch stores' });
    }
    res.json(results);
  });
};

const getStoreDetails = (db) => (req, res) => {
  const storeId = req.params.id;

  const storeQuery = `
    SELECT s.*, u.name AS owner_name, u.email,
           IFNULL(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
           COUNT(r.id) AS review_count
    FROM stores s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN reviews r ON s.id = r.store_id
    WHERE s.id = ?
    GROUP BY s.id
  `;

  const reviewQuery = `
    SELECT r.id, r.rating, r.message, r.created_at, 
           u.name AS user_name, u.id AS user_id
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.store_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(storeQuery, [storeId], (err, storeResults) => {
    if (err) {
      console.error('Error in storeQuery:', err);
      return res.status(500).json({ error: 'Failed to fetch store details' });
    }

    if (storeResults.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    db.query(reviewQuery, [storeId], (err, reviewResults) => {
      if (err) {
        console.error('Error in reviewQuery:', err);
        return res.status(500).json({ error: 'Failed to fetch reviews' });
      }

      res.json({
        ...storeResults[0],
        reviews: reviewResults
      });
    });
  });
};

const addReview = (db) => (req, res) => {
  const storeId = req.params.id;
  const { user_id, rating, message } = req.body;

  if (!user_id || !rating || !message) {
    return res.status(400).json({ error: 'Missing user_id, rating or message' });
  }

  const query = `
    INSERT INTO reviews (store_id, user_id, rating, message, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(query, [storeId, user_id, rating, message], (err, result) => {
    if (err) {
      console.error('Error inserting review:', err);
      return res.status(500).json({ error: 'Failed to add review' });
    }

    res.status(201).json({ success: true, reviewId: result.insertId });
  });
};

const editReview = (db) => (req, res) => {
  const { storeId, reviewId } = req.params;
  const { rating, message } = req.body;

  if (!rating || !message) {
    return res.status(400).json({ error: 'Missing rating or message' });
  }

  const query = `
    UPDATE reviews
    SET rating = ?, message = ?
    WHERE id = ? AND store_id = ?
  `;

  db.query(query, [rating, message, reviewId, storeId], (err, result) => {
    if (err) {
      console.error("Error updating review:", err);
      return res.status(500).json({ error: 'Failed to update review' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ success: true, message: 'Review updated' });
  });
};

const deleteReview = (db) => (req, res) => {
  const { storeId, reviewId } = req.params;

  const query = `
    DELETE FROM reviews
    WHERE id = ? AND store_id = ?
  `;

  db.query(query, [reviewId, storeId], (err, result) => {
    if (err) {
      console.error("Error deleting review:", err);
      return res.status(500).json({ error: 'Failed to delete review' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted' });
  });
};

module.exports = {
  searchStores,
  getStoresByUser,
  getAllStores,
  getStoreDetails,
  addReview,
  editReview,
  deleteReview
};
