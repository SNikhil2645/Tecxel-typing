const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Participant = require('../models/Participant');
const Admin = require('../models/Admin');

// Helper to generate JWT
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'tecxl_jwt_secret', {
    expiresIn: '24h',
  });
};

// Generate next Participant ID (e.g. TCX-001)
const generateParticipantId = async () => {
  let count = await Participant.countDocuments();
  let candidateId = `TCX-${String(count + 1).padStart(3, '0')}`;
  while (await Participant.exists({ participantId: candidateId })) {
    count++;
    candidateId = `TCX-${String(count + 1).padStart(3, '0')}`;
  }
  return candidateId;
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, rollNumber, course, year, section, email, phone, password } = req.body;

    if (!name || !rollNumber || !course || !year || !section || !email || !password) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedRoll = rollNumber.trim().toUpperCase();

    // Check duplicates
    const existingEmail = await Participant.findOne({ email: trimmedEmail });
    if (existingEmail) {
      return res.status(409).json({ message: 'A participant with this email is already registered.' });
    }

    const existingRoll = await Participant.findOne({ rollNumber: trimmedRoll });
    if (existingRoll) {
      return res.status(409).json({ message: 'A participant with this roll number is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const participantId = await generateParticipantId();

    const participant = new Participant({
      name: name.trim(),
      rollNumber: trimmedRoll,
      course: course.trim(),
      year: Number(year),
      section: section.trim().toUpperCase(),
      email: trimmedEmail,
      phone: phone ? phone.trim() : undefined,
      password: hashedPassword,
      participantId,
    });

    await participant.save();

    const token = generateToken({
      participantId: participant.participantId,
      id: participant._id,
      email: participant.email,
    });

    return res.status(201).json({
      message: 'Registration successful!',
      participantId: participant.participantId,
      token,
      participant: {
        id: participant._id,
        participantId: participant.participantId,
        name: participant.name,
        rollNumber: participant.rollNumber,
        course: participant.course,
        year: participant.year,
        section: participant.section,
        email: participant.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { participantId, password } = req.body;

    if (!participantId || !password) {
      return res.status(400).json({ message: 'Participant ID and password are required.' });
    }

    const trimmedId = participantId.trim().toUpperCase();
    const participant = await Participant.findOne({ participantId: trimmedId });

    if (!participant) {
      return res.status(401).json({ message: 'Invalid Participant ID or password.' });
    }

    if (participant.isDisqualified) {
      return res.status(403).json({ message: 'This participant account has been disqualified.' });
    }

    const isMatch = await bcrypt.compare(password, participant.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Participant ID or password.' });
    }

    const token = generateToken({
      participantId: participant.participantId,
      id: participant._id,
      email: participant.email,
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      participant: {
        id: participant._id,
        participantId: participant.participantId,
        name: participant.name,
        rollNumber: participant.rollNumber,
        course: participant.course,
        year: participant.year,
        section: participant.section,
        email: participant.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// POST /api/auth/admin/login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Admin email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    let admin = await Admin.findOne({ email: trimmedEmail });

    // Auto-seed default admin if configured in env and no admin exists
    if (!admin && process.env.ADMIN_EMAIL && trimmedEmail === process.env.ADMIN_EMAIL.toLowerCase()) {
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      admin = await Admin.create({
        email: trimmedEmail,
        password: hashedPassword,
        role: 'superadmin',
      });
      console.log(`[Admin] Initialized default admin account: ${trimmedEmail}`);
    }

    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = generateToken({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    return res.status(200).json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Server error during admin login', error: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const participant = await Participant.findOne({ participantId: req.participantId }).select('-password');
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    return res.status(200).json({ participant });
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getMe,
};
