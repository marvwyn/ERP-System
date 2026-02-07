const Account = require("../models/Account");

class AccountService {
  async getAll() {
    return await Account.find();
  }
}

module.exports = new AccountService();