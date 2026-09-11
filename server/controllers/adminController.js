const Participant = require('../models/Participant');
const Passage = require('../models/Passage');
const Result = require('../models/Result');
const PDFDocument = require('pdfkit');
const { toggleFreeze, getFreezeStatus, setFrozenSnapshot, getLeaderboard } = require('./leaderboardController');

const EXPORT_COLUMNS = [
  'Rank',
  'Participant ID',
  'Name',
  'Roll Number',
  'Course',
  'Year',
  'Section',
  'R1 WPM',
  'R1 Accuracy',
  'R1 Score',
  'R2 WPM',
  'R2 Accuracy',
  'R2 Score',
  'R3 WPM',
  'R3 Accuracy',
  'R3 Score',
  'Disqualified',
  'Final Score',
];

const escapeHtml = (value) =>
  String(value === undefined || value === null ? '' : value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

const pdfColumnValues = (row) => [
  row.rank,
  row.participantId,
  row.name,
  row.rollNumber,
  row.course,
  row.year,
  row.section,
  row.r1_wpm,
  row.r1_accuracy,
  row.r1_score,
  row.r2_wpm,
  row.r2_accuracy,
  row.r2_score,
  row.r3_wpm,
  row.r3_accuracy,
  row.r3_score,
  row.isDisqualified,
  row.finalScore,
];

// Generate a real PDF (landscape A4) with the complete results table.
function buildPdfExport(rows) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 22 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const rawWidths = [30, 52, 84, 42, 34, 20, 22, 36, 36, 40, 36, 36, 40, 36, 36, 40, 32, 46];
    const pageMargin = doc.page.margins.left;
    const pageWidth = doc.page.width - pageMargin * 2;
    const widthScale = pageWidth / rawWidths.reduce((a, b) => a + b, 0);
    const widths = rawWidths.map((w) => w * widthScale);
    const rowHeight = 15;
    const headerHeight = 17;
    const cellFontSize = 6.5;

    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1B2A9E').text('TECXEL TYPING CHAMPIONSHIP 2026', { align: 'center' });
    doc.moveDown(0.15);
    doc.font('Helvetica').fontSize(9).fillColor('#444444').text('Official Championship Results - Full Record', { align: 'center' });
    doc.moveDown(0.15);
    doc.fontSize(7.5).fillColor('#777777').text(`Generated: ${new Date().toLocaleString()}  |  Total Participants: ${rows.length}`, { align: 'center' });
    doc.moveDown(0.5);

    let y = doc.y;

    const renderHeader = () => {
      doc.rect(pageMargin, y, pageWidth, headerHeight).fill('#1B2A9E');
      let x = pageMargin;
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7.2);
      EXPORT_COLUMNS.forEach((label, i) => {
        doc.text(label, x + 2, y + headerHeight / 2 - 3, { width: widths[i] - 4, height: headerHeight - 8, lineBreak: false });
        x += widths[i];
      });
      y += headerHeight;
    };

    const renderRow = (row, index) => {
      if (y + rowHeight > doc.page.height - 30) {
        doc.addPage();
        y = doc.page.margins.top;
        renderHeader();
      }
      if (index % 2 === 0) {
        doc.rect(pageMargin, y, pageWidth, rowHeight).fill('#F0F4FF');
      } else {
        doc.rect(pageMargin, y, pageWidth, rowHeight).fill('#FFFFFF');
      }
      const values = pdfColumnValues(row);
      let x = pageMargin;
      doc.fillColor('#333333').font('Helvetica').fontSize(cellFontSize);
      values.forEach((val, i) => {
        doc.text(String(val === undefined || val === null ? '' : val), x + 2, y + rowHeight / 2 - 3, {
          width: widths[i] - 4,
          height: rowHeight - 6,
          lineBreak: false,
        });
        x += widths[i];
      });
      y += rowHeight;
    };

    renderHeader();
    rows.forEach((row, idx) => renderRow(row, idx));

    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(7).fillColor('#888888').text('TECXEL  |  Think Beyond, Build Beyond  |  Speed 50% + Accuracy 50%', { align: 'center' });

    doc.end();
  });
}

// Generate a Word-compatible .doc document (HTML inside Word XML envelope).
function buildDocExport(rows) {
  const now = new Date().toLocaleString();

  const headerCells = EXPORT_COLUMNS.map(
    (h) => `<th style="padding:6px 5px;border:1px solid #999999;background:#1B2A9E;color:#FFFFFF;font-size:9px;">${escapeHtml(h)}</th>`
  ).join('');

  const bodyRows = rows
    .map((row, idx) => {
      const bg = idx % 2 === 0 ? '#F0F4FF' : '#FFFFFF';
      const cells = pdfColumnValues(row)
        .map((v) => `<td style="padding:4px 5px;border:1px solid #BBBBBB;font-size:9px;">${escapeHtml(v)}</td>`)
        .join('');
      return `<tr style="background:${bg};">${cells}</tr>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>TECXEL Typing Championship Results</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
  <style>
    body { font-family: Calibri, Arial, sans-serif; }
    h1 { color: #1B2A9E; font-size: 20px; text-align: center; margin: 0 0 4px 0; }
    h2 { color: #1B2A9E; font-size: 13px; text-align: center; margin: 0 0 4px 0; }
    p { font-size: 10px; color: #444444; text-align: center; margin: 3px 0; }
    table { border-collapse: collapse; width: 100%; margin-top: 12px; }
  </style>
</head>
<body>
  <h1>TECXEL TYPING CHAMPIONSHIP 2026</h1>
  <h2>Official Championship Results - Full Record</h2>
  <p>Generated: ${now} &nbsp;|&nbsp; Total Participants: ${rows.length}</p>
  <table cellspacing="0" cellpadding="4" border="1">
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <p style="margin-top:16px;">TECXEL &nbsp;|&nbsp; Think Beyond, Build Beyond &nbsp;|&nbsp; Speed 50% + Accuracy 50%</p>
</body>
</html>`;
}

// GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const totalParticipants = await Participant.countDocuments();
    const activeParticipants = await Participant.countDocuments({ isActive: true, isDisqualified: false });
    const disqualifiedCount = await Participant.countDocuments({ isDisqualified: true });

    const r1Count = await Result.countDocuments({ round: 1 });
    const r2Count = await Result.countDocuments({ round: 2 });
    const r3Count = await Result.countDocuments({ round: 3 });
    const completedAllCount = await Result.countDocuments({ round: 3, finalScore: { $ne: null } });

    const passagesCount = await Passage.countDocuments({ isActive: true });

    return res.status(200).json({
      totalParticipants,
      activeParticipants,
      disqualifiedCount,
      completed: {
        round1: r1Count,
        round2: r2Count,
        round3: r3Count,
        allThree: completedAllCount,
      },
      passagesCount,
      isFrozen: getFreezeStatus(),
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    return res.status(500).json({ message: 'Error retrieving dashboard stats' });
  }
};

// GET /api/admin/participants
const getParticipants = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { participantId: searchRegex },
        { rollNumber: searchRegex },
        { email: searchRegex },
        { course: searchRegex },
      ];
    }

    const total = await Participant.countDocuments(query);
    const participants = await Participant.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Attach completed rounds summary for each participant
    const participantIds = participants.map((p) => p.participantId);
    const results = await Result.find({ participantId: { $in: participantIds } }).select('participantId round roundScore');

    const roundsMap = {};
    results.forEach((r) => {
      if (!roundsMap[r.participantId]) roundsMap[r.participantId] = [];
      roundsMap[r.participantId].push(r.round);
    });

    const enrichedParticipants = participants.map((p) => ({
      ...p.toObject(),
      roundsCompleted: (roundsMap[p.participantId] || []).sort(),
    }));

    return res.status(200).json({
      participants: enrichedParticipants,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    console.error('Admin get participants error:', error);
    return res.status(500).json({ message: 'Error retrieving participants' });
  }
};

// GET /api/admin/results
const getResults = async (req, res) => {
  try {
    const { round, participantId } = req.query;
    const query = {};

    if (round) {
      query.round = parseInt(round, 10);
    }
    if (participantId) {
      query.participantId = participantId.trim().toUpperCase();
    }

    const results = await Result.find(query).sort({ completedAt: -1 }).limit(200);

    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving results' });
  }
};

// GET /api/admin/passages
const getPassages = async (req, res) => {
  try {
    const { round } = req.query;
    const query = {};
    if (round) {
      query.round = parseInt(round, 10);
    }
    const passages = await Passage.find(query).sort({ round: 1, createdAt: -1 });
    return res.status(200).json({ passages });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving passages' });
  }
};

// POST /api/admin/passage
const addPassage = async (req, res) => {
  try {
    const { round, title, content, difficulty } = req.body;
    if (!round || !title || !content) {
      return res.status(400).json({ message: 'Round, title, and content are required.' });
    }

    const newPassage = new Passage({
      round: parseInt(round, 10),
      title: title.trim(),
      content: content.trim(),
      difficulty: difficulty || 'easy',
      characterCount: content.trim().length,
      isActive: true,
    });

    await newPassage.save();
    return res.status(201).json({ passage: newPassage });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating passage', error: error.message });
  }
};

// PUT /api/admin/passage/:id
const updatePassage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.content) {
      updateData.characterCount = updateData.content.trim().length;
    }

    const updated = await Passage.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Passage not found' });
    }
    return res.status(200).json({ passage: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating passage' });
  }
};

// DELETE /api/admin/passage/:id
const deletePassage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Passage.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Passage not found' });
    }
    return res.status(200).json({ success: true, message: 'Passage deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting passage' });
  }
};

// POST /api/admin/disqualify
const disqualifyParticipant = async (req, res) => {
  try {
    const { participantId, reason } = req.body;
    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required.' });
    }

    const participant = await Participant.findOneAndUpdate(
      { participantId: participantId.trim().toUpperCase() },
      { isDisqualified: true },
      { new: true }
    );

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found.' });
    }

    return res.status(200).json({ success: true, message: `Participant ${participant.participantId} disqualified.` });
  } catch (error) {
    return res.status(500).json({ message: 'Error disqualifying participant' });
  }
};

// POST /api/admin/re-qualify
const requalifyParticipant = async (req, res) => {
  try {
    const { participantId } = req.body;
    const participant = await Participant.findOneAndUpdate(
      { participantId: participantId.trim().toUpperCase() },
      { isDisqualified: false },
      { new: true }
    );

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found.' });
    }

    return res.status(200).json({ success: true, message: `Participant ${participant.participantId} re-qualified.` });
  } catch (error) {
    return res.status(500).json({ message: 'Error re-qualifying participant' });
  }
};

// POST /api/admin/reset-round
const resetRound = async (req, res) => {
  try {
    const { participantId, round } = req.body;
    const roundNumber = parseInt(round, 10);

    if (!participantId || ![1, 2, 3].includes(roundNumber)) {
      return res.status(400).json({ message: 'Valid participantId and round (1, 2, or 3) are required.' });
    }

    const trimmedId = participantId.trim().toUpperCase();

    // Delete the specific result
    const deleted = await Result.findOneAndDelete({ participantId: trimmedId, round: roundNumber });

    // Also clear finalScore from all rounds for this participant if round was reset
    await Result.updateMany({ participantId: trimmedId }, { $unset: { finalScore: 1, rank: 1 } });

    return res.status(200).json({
      success: true,
      message: `Round ${roundNumber} for participant ${trimmedId} has been reset.`,
      deleted: Boolean(deleted),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error resetting round' });
  }
};

// DELETE /api/admin/participant/:participantId
const deleteParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;
    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required.' });
    }

    const trimmedId = participantId.trim().toUpperCase();

    // Delete participant record
    const deletedParticipant = await Participant.findOneAndDelete({ participantId: trimmedId });
    if (!deletedParticipant) {
      return res.status(404).json({ message: 'Participant not found.' });
    }

    // Delete all associated round results so no orphaned records remain
    const deletedResults = await Result.deleteMany({ participantId: trimmedId });

    return res.status(200).json({
      success: true,
      message: `Participant ${trimmedId} and ${deletedResults.deletedCount} associated result(s) deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting participant:', error);
    return res.status(500).json({ message: 'Error deleting participant' });
  }
};

// POST /api/admin/freeze-leaderboard
const toggleLeaderboardFreeze = async (req, res) => {
  try {
    const { frozen } = req.body;
    toggleFreeze(frozen);

    return res.status(200).json({
      success: true,
      isFrozen: getFreezeStatus(),
      message: getFreezeStatus() ? 'Leaderboard frozen' : 'Leaderboard unfrozen (live)',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error toggling leaderboard freeze' });
  }
};

// POST /api/admin/reset-leaderboard
// Admin-only: wipes every round result so the leaderboard starts fresh.
const resetLeaderboard = async (req, res) => {
  try {
    toggleFreeze(false);
    setFrozenSnapshot(null);
    const deleted = await Result.deleteMany({});
    return res.status(200).json({
      success: true,
      deletedCount: deleted.deletedCount,
      message: `Leaderboard reset. ${deleted.deletedCount} result record(s) cleared.`,
    });
  } catch (error) {
    console.error('Reset leaderboard error:', error);
    return res.status(500).json({ message: 'Error resetting leaderboard' });
  }
};

// GET /api/admin/export
const exportResults = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

    const participants = await Participant.find().select('participantId name rollNumber course year section email isDisqualified');
    const results = await Result.find().sort({ participantId: 1, round: 1 });

    const resultsByParticipant = {};
    results.forEach((r) => {
      if (!resultsByParticipant[r.participantId]) {
        resultsByParticipant[r.participantId] = {};
      }
      resultsByParticipant[r.participantId][`r${r.round}`] = r;
    });

    const exportRows = participants.map((p) => {
      const pResults = resultsByParticipant[p.participantId] || {};
      const r1 = pResults.r1 || {};
      const r2 = pResults.r2 || {};
      const r3 = pResults.r3 || {};

      let finalScore = r3.finalScore || null;
      if (!finalScore && r1.roundScore && r2.roundScore && r3.roundScore) {
        finalScore = Math.round(((r1.roundScore + r2.roundScore + r3.roundScore) / 3) * 100) / 100;
      }

      return {
        participantId: p.participantId,
        name: p.name,
        rollNumber: p.rollNumber,
        course: p.course,
        year: p.year,
        section: p.section,
        email: p.email,
        isDisqualified: p.isDisqualified ? 'YES' : 'NO',
        r1_wpm: r1.wpm || '',
        r1_accuracy: r1.accuracy || '',
        r1_score: r1.roundScore || '',
        r2_wpm: r2.wpm || '',
        r2_accuracy: r2.accuracy || '',
        r2_score: r2.roundScore || '',
        r3_wpm: r3.wpm || '',
        r3_accuracy: r3.accuracy || '',
        r3_score: r3.roundScore || '',
        finalScore: finalScore || '',
      };
    });

    // Sort by finalScore descending
    exportRows.sort((a, b) => (Number(b.finalScore) || 0) - (Number(a.finalScore) || 0));
    exportRows.forEach((row, i) => {
      row.rank = i + 1;
    });

    if (format === 'pdf') {
      const pdfBuffer = await buildPdfExport(exportRows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="tecxel_typing_championship_results.pdf"');
      return res.status(200).send(pdfBuffer);
    }

    if (format === 'doc') {
      const docHtml = buildDocExport(exportRows);
      res.setHeader('Content-Type', 'application/msword');
      res.setHeader('Content-Disposition', 'attachment; filename="tecxel_typing_championship_results.doc"');
      return res.status(200).send(docHtml);
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="tecxel_typing_championship_results.json"');
      return res.status(200).send(JSON.stringify(exportRows, null, 2));
    }

    // Default: CSV format
    const headers = [
      'Participant ID',
      'Name',
      'Roll Number',
      'Course',
      'Year',
      'Section',
      'Email',
      'Disqualified',
      'R1 WPM',
      'R1 Accuracy',
      'R1 Score',
      'R2 WPM',
      'R2 Accuracy',
      'R2 Score',
      'R3 WPM',
      'R3 Accuracy',
      'R3 Score',
      'Final Score',
    ];

    const csvLines = [];
    csvLines.push(headers.join(','));

    exportRows.forEach((row) => {
      const line = [
        `"${row.participantId}"`,
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.rollNumber}"`,
        `"${row.course}"`,
        `"${row.year}"`,
        `"${row.section}"`,
        `"${row.email}"`,
        `"${row.isDisqualified}"`,
        row.r1_wpm,
        row.r1_accuracy,
        row.r1_score,
        row.r2_wpm,
        row.r2_accuracy,
        row.r2_score,
        row.r3_wpm,
        row.r3_accuracy,
        row.r3_score,
        row.finalScore,
      ];
      csvLines.push(line.join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tecxel_typing_championship_results.csv"');
    return res.status(200).send(csvLines.join('\n'));
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ message: 'Error exporting results' });
  }
};

module.exports = {
  getDashboardStats,
  getParticipants,
  getResults,
  getPassages,
  addPassage,
  updatePassage,
  deletePassage,
  disqualifyParticipant,
  requalifyParticipant,
  resetRound,
  deleteParticipant,
  toggleLeaderboardFreeze,
  resetLeaderboard,
  exportResults,
  buildPdfExport,
  buildDocExport,
};
