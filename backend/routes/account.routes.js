const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/", verifyToken, accountController.getAccounts);

module.exports = router;
