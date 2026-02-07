const express = require("express");
const cors = require("cors");
const salesRoutes = require("../routes/sales.routes");
const authRoutes = require("../routes/auth.routes");
const productRoutes = require("../routes/product.routes");
const ledgerRoutes = require("../routes/ledger.routes");
const accountRoutes = require("../routes/account.routes");
const journalRoutes = require("../routes/journal.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/journal", journalRoutes);

module.exports = app;
