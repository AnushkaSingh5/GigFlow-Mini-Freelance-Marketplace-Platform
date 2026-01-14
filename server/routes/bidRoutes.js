// server/routes/bidRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createBid, 
  getBidsForGig, 
  hireBid,
  getMyBids 
} = require('../controllers/bidController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBid);
router.get('/my-bids', protect, getMyBids);
router.get('/:gigId', protect, getBidsForGig);
router.patch('/:bidId/hire', protect, hireBid);

module.exports = router;
