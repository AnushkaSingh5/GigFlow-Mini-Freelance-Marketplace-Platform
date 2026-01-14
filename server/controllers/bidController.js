// server/controllers/bidController.js
const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const socket = require('../socket');
const Notification = require('../models/Notification');

// @desc    Submit a bid
// @route   POST /api/bids
exports.createBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);
    
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This gig is no longer accepting bids'
      });
    }

    // Prevent owner or admins from bidding on their own gig
    const isOwner = gig.ownerId.toString() === req.user._id.toString();
    const isAdmin = Array.isArray(gig.admins) && gig.admins.some(a => a.toString() === req.user._id.toString());
    if (isOwner || isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'You cannot bid on a gig you own or manage'
      });
    }

    // Check for existing bid
    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user._id
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a bid for this gig'
      });
    }

    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
      price
    });

    await bid.populate('freelancerId', 'name email');

    res.status(201).json({
      success: true,
      bid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all bids for a gig (Owner only)
// @route   GET /api/bids/:gigId
exports.getBidsForGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Only gig owner or admins can see bids
    const isOwner = gig.ownerId.toString() === req.user._id.toString();
    const isAdmin = Array.isArray(gig.admins) && gig.admins.some(a => a.toString() === req.user._id.toString());

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the gig owner or assigned admins can view bids'
      });
    }

    const bids = await Bid.find({ gigId: req.params.gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Hire a freelancer (ATOMIC OPERATION)
// @route   PATCH /api/bids/:bidId/hire
exports.hireBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the bid
    const bid = await Bid.findById(req.params.bidId).session(session);

    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Find the gig
    const gig = await Gig.findById(bid.gigId).session(session);

    if (!gig) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Verify the requester is the gig owner or an admin
    const isOwner = gig.ownerId.toString() === req.user._id.toString();
    const isAdmin = Array.isArray(gig.admins) && gig.admins.some(a => a.toString() === req.user._id.toString());

    if (!isOwner && !isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Only the gig owner or an assigned admin can hire'
      });
    }

    // Attempt to atomically claim the gig and hire the bid using conditional updates
    // 1) Set gig status to 'assigned' only if it is still 'open'
    const updatedGig = await Gig.findOneAndUpdate(
      { _id: gig._id, status: 'open' },
      { $set: { status: 'assigned' } },
      { new: true, session }
    );

    if (!updatedGig) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'This gig has already been assigned'
      });
    }

    // 2) Set chosen bid to 'hired' only if it's still pending
    const updatedBid = await Bid.findOneAndUpdate(
      { _id: bid._id, gigId: bid.gigId, status: 'pending' },
      { $set: { status: 'hired' } },
      { new: true, session }
    );

    if (!updatedBid) {
      // Could not move bid to hired (it may have been processed concurrently)
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'This bid cannot be hired (already processed)'
      });
    }

    // 3) Reject all other bids for this gig
    await Bid.updateMany(
      { gigId: bid.gigId, _id: { $ne: bid._id } },
      { status: 'rejected' },
      { session }
    );

    await session.commitTransaction();


    // Populate for response with the updated documents
    await updatedBid.populate('freelancerId', 'name email');
    await updatedGig.populate('ownerId', 'name email');

    // Persist a notification for the freelancer so they see it when they next login
    let notif = null;
    try {
      notif = await Notification.create({
        userId: updatedBid.freelancerId._id,
        type: 'hired',
        message: `You have been hired for ${updatedGig.title}!`,
        data: { gigId: updatedGig._id, bidId: updatedBid._id }
      });
    } catch (err) {
      console.warn('Failed to persist notification:', err.message);
    }

    // Emit a real-time notification to the hired freelancer (include notification id when available)
    try {
      const io = socket.getIO();
      io.to(`user:${updatedBid.freelancerId._id}`).emit('hired', {
        id: notif?._id,
        message: notif?.message || `You have been hired for ${updatedGig.title}!`,
        gigId: updatedGig._id,
        bidId: updatedBid._id
      });
    } catch (err) {
      console.warn('Socket.io not initialized or emit failed:', err.message);
    }

    res.status(200).json({
      success: true,
      message: 'Freelancer hired successfully!',
      bid: updatedBid,
      gig: updatedGig
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get user's bids
// @route   GET /api/bids/my-bids
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate({
        path: 'gigId',
        select: 'title description budget status',
        populate: {
          path: 'ownerId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
