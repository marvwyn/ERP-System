const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/", verifyToken, productController.getProducts);
router.post("/", verifyToken, productController.createProduct);

module.exports = router;