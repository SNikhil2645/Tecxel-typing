const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    participantId: {
      type: String,
      required: true,
      ref: 'Participant',
      uppercase: true,
    },
    round: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
    },
    typedText: {
      type: String,
      required: true,
    },
    targetText: {
      type: String,
      required: true,
    },
    correctCharacters: {
      type: Number,
      required: true,
    },
    totalCharacters: {
      type: Number,
      required: true,
    },
    errors: {
      type: Number,
      required: true,
    },
    wpm: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    speedScore: {
      type: Number,
      required: true,
    },
    roundScore: {
      type: Number,
      required: true,
    },
    finalScore: {
      type: Number,
    },
    rank: {
      type: Number,
    },
    tabSwitches: {
      type: Number,
      default: 0,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true, // in seconds
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

resultSchema.index({ participantId: 1, round: 1 }, { unique: true });
resultSchema.index({ finalScore: -1 });

module.exports = mongoose.model('Result', resultSchema);
