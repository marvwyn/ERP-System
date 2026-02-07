const accountService = require("../services/account.service");

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await accountService.getAll();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};