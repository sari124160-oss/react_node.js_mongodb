 
const Request = require('../models/Request');
const Draft = require('../models/Draft');
const sendEmail = require('../utils/sendEmail');

// הגשת בקשה
exports.submitRequest = async (req, res) => {
  try {
    const userId = req.user.id;

    const existing = await Request.findOne({ userId, status: 'בהמתנה' });
    if (existing) {
      return res.status(400).json({ message: 'כבר קיימת בקשה פתוחה' });
    }

    const request = await Request.create({
      userId,
      ...req.body,
      status: 'בהמתנה',
      submittedAt: new Date()
    });

    await Draft.findOneAndDelete({ userId });

    if (req.body.personal?.email) {
      await sendEmail({
        to: req.body.personal.email,
        subject: 'בקשתך התקבלה — מערכת מענקים',
        html: `
          <div dir="rtl" style="font-family: Arial; padding: 20px;">
            <h2>שלום ${req.body.personal.firstName},</h2>
            <p>בקשתך למענק התקבלה בהצלחה!</p>
            <p>מספר בקשה: <strong>${request._id}</strong></p>
            <p>סטטוס: <strong>בהמתנה</strong></p>
            <p>נעדכן אותך בכל שינוי סטטוס.</p>
            <br/>
            <p>בברכה,<br/>מערכת מענקים לסטודנטים</p>
          </div>
        `
      });
    }

    res.status(201).json({ message: 'הבקשה נקלטה בהצלחה!', request });

  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
};

// שמירת טיוטה
exports.saveDraft = async (req, res) => {
  try {
    const userId = req.user.id;

    const draft = await Draft.findOneAndUpdate(
      { userId },
      { userId, data: req.body, lastSaved: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: 'טיוטה נשמרה ✓', draft });

  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
};

// שליפת טיוטה
exports.getDraft = async (req, res) => {
  try {
    const draft = await Draft.findOne({ userId: req.user.id });
    res.json(draft || null);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
};

// סטטוס בקשה אחרונה
exports.getStatus = async (req, res) => {
  try {
    const request = await Request.findOne({ userId: req.user.id })
      .sort({ submittedAt: -1 });

    if (!request) {
      return res.status(404).json({ message: 'לא נמצאה בקשה' });
    }

    res.json({
      status: request.status,
      submittedAt: request.submittedAt,
      id: request._id
    });

  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
};

// העלאת קבצים
exports.uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'לא הועלו קבצים' });
    }

    const files = {};
    req.files.forEach(file => {
      files[file.fieldname] = file.path;
    });

    res.json({ message: 'הקבצים הועלו בהצלחה', files });

  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
};