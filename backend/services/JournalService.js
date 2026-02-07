const mongoose = require("mongoose");
const Journal = require("../models/Journal");
const Account = require("../models/Account");

class JournalService {

  async createManualJournal(data) {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      console.log("data: ", data);
      
      const { date, narration, entries } = data;

      const totalDebit = entries.reduce(
        (sum, e) => sum + Number(e.debit || 0),
        0
      );

      const totalCredit = entries.reduce(
        (sum, e) => sum + Number(e.credit || 0),
        0
      );

      if (totalDebit !== totalCredit) {
        throw new Error("Journal is not balanced");
      }

      const voucherNo = "JV-" + Date.now();

      const formattedEntries = [];

      for (const entry of entries) {

        const account = await Account.findById(entry.accountId);

        if (!account) {
          throw new Error("Invalid account");
        }

        formattedEntries.push({
          accountId: account._id,
          accountName: account.name,
          debit: Number(entry.debit || 0),
          credit: Number(entry.credit || 0),
        });
      }

      const journal = await Journal.create([{
        voucherNo,
        voucherType: "JV",
        date,
        narration,
        entries: formattedEntries
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return journal[0]._id;

    } catch (error) {

      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

module.exports = new JournalService();