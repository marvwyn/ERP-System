const db = require("../config/db");
const ledgerService = require("../services/LedgerService");

exports.getCashLedger = async (req, res) => {
  try {

    const openingBalance = Number(req.query.opening || 0);

    const data = await ledgerService.getCashLedger(openingBalance);

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLedger = async (req, res) => {
    try {
      const { account, from, to } = req.query;
  
      const data =
        await ledgerService.getLedger(account, from, to);
  
      res.json(data);
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};  