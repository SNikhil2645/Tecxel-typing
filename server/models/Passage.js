const mongoose = require('mongoose');

const passageSchema = new mongoose.Schema(
  {
    round: {
      type: Number,
      required: [true, 'Round number is required'],
      enum: [1, 2, 3],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
    },
    characterCount: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

passageSchema.pre('save', function (next) {
  if (this.content) {
    this.characterCount = this.content.length;
  }
  next();
});

passageSchema.index({ round: 1, isActive: 1 });

module.exports = mongoose.model('Passage', passageSchema);
