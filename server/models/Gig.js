// server/models/Gig.js
const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [1, 'Budget must be at least $1']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Additional users who are admins on this gig (have access/manage rights)
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }], // array of user IDs with admin access (default empty)
  status: {
    type: String,
    enum: ['open', 'assigned'],
    default: 'open'
  }
}, { timestamps: true });

// Index for search functionality
gigSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Gig', gigSchema);
