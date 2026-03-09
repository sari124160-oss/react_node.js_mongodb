 
const Request = require('../models/Request');
const sendEmail = require('../utils/sendEmail');

// שליפת כל הבקשות עם פילטרים
exports.getRequests = async (req, res) => {
  try {
    const {
      idNumber,
      fromDate,
      toDate,
      city,
      minFee,
      maxFee,
      minSiblings,
      maxSiblings,
      sortBy,
      sortOrder
    } = req.query;

    const filter = { status: { $ne: 'אושר' } };

    if (idNumber) filter['personal.idNumber'] = idNumber;
    if (city) filter['personal.city'] = new RegExp(city, 'i');
    if (fromDate || toDate) {
      filter.submittedAt = {};
      if (fromDate) filter.submittedAt.$gte = new Date(fromDate);
      if (toDate) filter.submittedAt.$lte = new Date(toDate);
    }
    if (minFee || maxFee) {
      filter['studies.annualFee'] = {};
      if (minFee) filter['studies.annualFee'].$gte = Number(minFee);
      if (maxFee) filter['studies.annualFee'].$lte = Number(maxFee);
    }
    if (minSiblings || maxSiblings) {
      filter['family.siblingsUnder18'] = {};
      if (minSiblings) filter['family.siblingsUnder18'].$gte = Number(minSiblings);
      if (maxSiblings) filter['family.siblingsUnder18'].$lte = Number(maxSiblings);
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.submittedAt = -1;
    }

    const requests = await Request.find(filter)
      .select('personal.idNumber personal.firstName personal.lastName studies.track status submittedAt family.siblingsUnder18')
      .sort(sort);

    res.json(requests);

  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
};

// שליפת פרטי בקשה מלאה
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'בקשה לא נמצאה' });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
};

// עדכון סטטוס בקשה
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['אושר', 'נדחה'].includes(status)) {
      return res.status(400).json({ message: 'סטטוס לא תקף' });
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'בקשה לא נמצאה' });
    }

    // שליחת מייל על שינוי סטטוס ✅ שדרוג א'
    if (request.personal?.email) {
      const statusText = status === 'אושר' ? '✅ אושרה' : '❌ נדחתה';
      await sendEmail({
        to: request.personal.email,
        subject: `עדכון סטטוס בקשה — ${statusText}`,
        html: `
          <div dir="rtl" style="font-family: Arial; padding: 20px;">
            <h2>שלום ${request.personal.firstName},</h2>
            <p>בקשתך למענק <strong>${statusText}</strong></p>
            <p>מספר בקשה: <strong>${request._id}</strong></p>
            <br/>
            <a href="${process.env.CLIENT_URL}/status" 
               style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
              צפה בסטטוס הבקשה
            </a>
            <br/><br/>
            <p>בברכה,<br/>מערכת מענקים לסטודנטים</p>
          </div>
        `
      });
    }

    res.json({ message: `הבקשה ${status} בהצלחה`, request });

  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
};

// דשבורד סטטיסטיקות ✅ שדרוג ג'
exports.getStats = async (req, res) => {
  try {
    const total = await Request.countDocuments();
    const approved = await Request.countDocuments({ status: 'אושר' });
    const rejected = await Request.countDocuments({ status: 'נדחה' });
    const pending = await Request.countDocuments({ status: 'בהמתנה' });

    res.json({ total, approved, rejected, pending });

  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
};