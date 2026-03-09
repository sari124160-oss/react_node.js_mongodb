 
const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  lastSaved: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Draft', draftSchema);