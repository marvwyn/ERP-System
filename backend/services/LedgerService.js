const Journal = require("../models/Journal");

class LedgerService {

  async getLedger(accountName, fromDate, toDate) {

    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
  
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    const openingResult = await Journal.aggregate([
      { $unwind: "$entries" },
      {
        $match: {
          "entries.accountName": accountName,
          createdAt: { $lt: start }
        }
      },
      {
        $group: {
          _id: null,
          totalDebit: { $sum: "$entries.debit" },
          totalCredit: { $sum: "$entries.credit" }
        }
      }
    ]);

    const openingBalance =
      openingResult.length > 0
        ? openingResult[0].totalDebit - openingResult[0].totalCredit
        : 0;

    const transactionsRaw = await Journal.aggregate([
      { $unwind: "$entries" },
      {
        $match: {
          "entries.accountName": accountName,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $project: {
          date: 1,
          voucherNo: 1,
          voucherType: 1,
          narration: 1,
          debit: "$entries.debit",
          credit: "$entries.credit"
        }
      },
      { $sort: { createdAt: 1 } }
    ]);

    let balance = Number(openingBalance);

    const transactions = transactionsRaw.map(tx => {
      balance += Number(tx.debit) - Number(tx.credit);

      return {
        ...tx,
        balance
      };
    });

    return {
      openingBalance,
      transactions,
      closingBalance: balance
    };
  }

  async getCashLedger(fromDate, toDate) {
    return this.getLedger("CASH", fromDate, toDate);
  }  

}

module.exports = new LedgerService();
