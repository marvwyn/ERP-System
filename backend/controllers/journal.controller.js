const journalService = require("../services/JournalService");

exports.createManualJournal = async (req, res) => {
    try {
      const journalId = await journalService.createManualJournal(req.body);
      res.json({ message: "Journal created", journalId });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};
  