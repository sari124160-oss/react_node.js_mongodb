 
const mongoose = require('mongoose');

const siblingSchema = new mongoose.Schema({
  idNumber: String,
  firstName: String,
  lastName: String,
  birthDate: Date
});

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // פרטים אישיים
  personal: {
    idNumber: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthDate: { type: Date, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    mobile: { type: String, required: true },
    phone: { type: String },
    email: { type: String }
  },

  // פרטי משפחה
  family: {
    father: {
      idNumber: String,
      firstName: String,
      lastName: String
    },
    mother: {
      idNumber: String,
      firstName: String,
      lastName: String
    },
    siblingsUnder18: { type: Number, default: 0 },
    siblingsOver21WithKids: { type: Number, default: 0 },
    siblings: [siblingSchema]
  },

  // פרטי לימודים
  studies: {
    track: { type: String, required: true },
    institution: { type: String, required: true },
    years: { type: Number, required: true },
    annualFee: { type: Number, required: true }
  },

  // פרטי בנק
  bank: {
    idNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    bankNumber: { type: String, required: true },
    branchNumber: { type: String, required: true },
    accountNumber: { type: String, required: true }
  },

  // קבצים
  files: {
    studentId: { type: String },
    fatherID: { type: String },
    motherID: { type: String },
    studyConfirmation: { type: String },
    bankConfirmation: { type: String }
  },

  // סטטוס
  status: {
    type: String,
    enum: ['בהמתנה', 'אושר', 'נדחה'],
    default: 'בהמתנה'
  },

  submittedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);