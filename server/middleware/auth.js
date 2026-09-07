const jwt = require('jsonwebtoken');
const Participant = require('../models/Participant');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tecxl_jwt_secret');

    const participant = await Participant.findOne({ participantId: decoded.participantId });
    if (!participant) {
      return res.status(401).json({ message: 'Participant not found or token expired.' });
    }

    if (!participant.isActive) {
      return res.status(403).json({ message: 'Participant account is inactive.' });
    }

    if (participant.isDisqualified) {
      return res.status(403).json({ message: 'Participant has been disqualified from the championship.' });
    }

    req.participant = participant;
    req.participantId = participant.participantId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
  }
};

module.exports = auth;
