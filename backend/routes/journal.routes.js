const express = require("express");
const router = express.Router();
const journalController = require("../controllers/journal.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
router.post("/", verifyToken, journalController.createManualJournal);
module.exports = router;