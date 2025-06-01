const {
  searchStores,
  getStoresByUser,
  getAllStores,
  getStoreDetails,
  addReview,
  editReview,
  deleteReview
} = require('../controllers/store');

module.exports = (db) => {
  const router = require('express').Router();

  router.get('/search', searchStores(db));
  router.get('/user/:userId', getStoresByUser(db));
  router.get('/', getAllStores(db));
  router.get('/:id', getStoreDetails(db));

  router.post('/:id/review', addReview(db)); // ✅ Add
  router.put('/:storeId/review/:reviewId', editReview(db)); // ✅ Edit
  router.delete('/:storeId/review/:reviewId', deleteReview(db)); // ✅ Delete

  return router;
};
