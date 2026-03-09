const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('סיסמה חייבת להכיל לפחות 8 תווים');
  if (!/[A-Z]/.test(password)) errors.push('סיסמה חייבת להכיל לפחות אות גדולה אחת');
  if (!/[0-9]/.test(password)) errors.push('סיסמה חייבת להכיל לפחות ספרה אחת');
  if (!/[!@#$%^&*]/.test(password)) errors.push('סיסמה חייבת להכיל תו מיוחד (!@#$%^&*)');
  return errors;
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, idNumber: user.idNumber },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { idNumber, firstName, lastName, password } = req.body;

    if (!idNumber || !firstName || !lastName || !password) {
      return res.status(400).json({ message: 'נא למלא את כל השדות' });
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ message: passwordErrors });
    }

    const existingUser = await User.findOne({ idNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'משתמש עם מ.ז זה כבר קיים' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      idNumber,
      firstName,
      lastName,
      password: hashedPassword
    });

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'נרשמת בהצלחה!',
      user: {
        idNumber: user.idNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { idNumber, password } = req.body;

    if (!idNumber || !password) {
      return res.status(400).json({ message: 'נא למלא מ.ז וסיסמה' });
    }

    const user = await User.findOne({ idNumber });
    if (!user) {
      return res.status(400).json({ message: 'מ.ז או סיסמה שגויים' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'מ.ז או סיסמה שגויים' });
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'התחברת בהצלחה!',
      user: {
        idNumber: user.idNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת', error: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'התנתקת בהצלחה' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת' });
  }
};