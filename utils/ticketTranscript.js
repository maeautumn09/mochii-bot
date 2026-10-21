const fs = require("fs");
const path = require("path");

const { buildTicketTranscript } = require("../utils/ticketTranscript");

// ticket transcript generation helper lives in utils/ticketTranscript.js

module.exports = {
  buildTicketTranscript,
  ensureTranscriptsFolder() {
    const folder = path.join(__dirname, "..", "transcripts");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    return folder;
  },
};
