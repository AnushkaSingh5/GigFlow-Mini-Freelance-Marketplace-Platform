// server/routes/gigRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getGigs, 
  getGig, 
  createGig, 
  getMyGigs,
  addAdmin,
  removeAdmin
} = require('../controllers/gigController');
const { protect } = require('../middleware/auth');

router.get('/', getGigs);
router.get('/my-gigs', protect, getMyGigs);
router.get('/:id', getGig);
router.post('/', protect, createGig);

// Admin management (owner-only)
router.post('/:id/admins', protect, addAdmin);
router.delete('/:id/admins/:userId', protect, removeAdmin);

module.exports = router;
