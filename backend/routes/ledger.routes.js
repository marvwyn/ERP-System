const express = require("express");
const router = express.Router();
const ledgerController = require("../controllers/ledger.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/", verifyToken, ledgerController.getLedger);
router.get("/cash", verifyToken, ledgerController.getCashLedger);

module.exports = router;
