// server/controllers/gigController.js
const Gig = require('../models/Gig');
const User = require('../models/User');
const Notification = require('../models/Notification');
const socket = require('../socket');

// @desc    Get all open gigs with search
// @route   GET /api/gigs
exports.getGigs = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = { status: 'open' };

    // Search by title (case-insensitive)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Gig.countDocuments(query);

    res.status(200).json({
      success: true,
      count: gigs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      gigs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single gig
// @route   GET /api/gigs/:id
exports.getGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('ownerId', 'name email')
      .populate('admins', 'name email');

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    res.status(200).json({
      success: true,
      gig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new gig
// @route   POST /api/gigs
exports.createGig = async (req, res) => {
  try {
    const { title, description, budget, admins } = req.body;

    // Only the authenticated user can create a gig and will be set as the owner
    // Optionally, owner can provide an array of admin user IDs to assign as admins
    // Normalize admins list: only accept an array of user IDs, remove falsy and the owner id, dedupe
    let adminsList = Array.isArray(admins) ? admins.filter(Boolean).map(a => String(a)) : [];
    adminsList = [...new Set(adminsList.filter(a => a !== String(req.user._id)))];

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user._id,
      admins: adminsList
    });

    await gig.populate('ownerId', 'name email');
    await gig.populate('admins', 'name email');

    res.status(201).json({
      success: true,
      gig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add an admin to a gig by email (Owner only)
// @route   POST /api/gigs/:id/admins
exports.addAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    // Only owner can add admins
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can manage admins' });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) return res.status(404).json({ success: false, message: 'User with that email not found' });

    // Prevent adding owner as admin
    if (userToAdd._id.toString() === gig.ownerId.toString()) {
      return res.status(400).json({ success: false, message: 'Owner cannot be added as admin' });
    }

    if (Array.isArray(gig.admins) && gig.admins.some(a => a.toString() === userToAdd._id.toString())) {
      return res.status(400).json({ success: false, message: 'User is already an admin' });
    }

    gig.admins = Array.isArray(gig.admins) ? [...gig.admins, userToAdd._id] : [userToAdd._id];
    await gig.save();
    await gig.populate('admins', 'name email');

    // Persist notification for the newly added admin
    let notif = null;
    try {
      notif = await Notification.create({
        userId: userToAdd._id,
        type: 'adminAssigned',
        message: `You have been assigned as an admin for the gig "${gig.title}"`,
        data: { gigId: gig._id }
      });
    } catch (err) {
      console.warn('Failed to persist adminAssigned notification:', err.message);
    }

    // Emit real-time notice (if connected)
    try {
      const io = socket.getIO();
      io.to(`user:${userToAdd._id}`).emit('adminAssigned', {
        id: notif?._id,
        message: notif?.message || `You have been assigned as an admin for ${gig.title}`,
        gigId: gig._id
      });
    } catch (err) {
      console.warn('Socket.io not initialized or emit failed:', err.message);
    }

    res.status(200).json({ success: true, gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove an admin from a gig (Owner only)
// @route   DELETE /api/gigs/:id/admins/:userId
exports.removeAdmin = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can manage admins' });
    }

    const userId = req.params.userId;
    if (!Array.isArray(gig.admins) || !gig.admins.some(a => a.toString() === userId)) {
      return res.status(404).json({ success: false, message: 'Admin not found on this gig' });
    }

    gig.admins = gig.admins.filter(a => a.toString() !== userId);
    await gig.save();
    await gig.populate('admins', 'name email');

    res.status(200).json({ success: true, gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's posted gigs and gigs they administer
// @route   GET /api/gigs/my-gigs
exports.getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({
      $or: [
        { ownerId: req.user._id },
        { admins: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: gigs.length,
      gigs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
