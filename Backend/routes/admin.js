const express = require('express');
const {
  getStats,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getAllStores,
  addStore,
  updateStore,
  deleteStore,
} = require('../controllers/admin');

module.exports = (db) => {
  const router = express.Router();

  router.get('/stats', (req, res) => getStats(db)(req, res));

  router.get('/users', (req, res) => getUsers(db)(req, res));           
  router.post('/users', (req, res) => addUser(db)(req, res));           
  router.put('/users/:id', (req, res) => updateUser(db)(req, res));    
  router.delete('/users/:id', (req, res) => deleteUser(db)(req, res)); 

  router.get('/stores', (req, res) => getAllStores(db)(req, res));       
  router.post('/stores', (req, res) => addStore(db)(req, res));           
  router.put('/stores/:id', (req, res) => updateStore(db)(req, res));     
  router.delete('/stores/:id', (req, res) => deleteStore(db)(req, res));  

  return router;
};
