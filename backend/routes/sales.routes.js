const express = require("express");
const router = express.Router();
const salesController = require("../controllers/sales.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/", verifyToken, salesController.createSale);
router.get("/", verifyToken, salesController.getSales);
router.get("/:id", verifyToken, salesController.getSaleDetails);

module.exports = router;
