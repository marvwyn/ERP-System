const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Product = require("../models/Products");
const Journal = require("../models/Journal");
const Account = require("../models/Account");

class SalesService {

  async createSale(data, userId) {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      const { items, payment_type, discount = 0 } = data;

      let subtotal = 0;
      let totalProfit = 0;
      const saleItems = [];

      // 🔹 1️⃣ Process each item
      for (const item of items) {

        const product = await Product.findById(item.product_id).session(session);

        if (!product) {
          throw new Error("Product not found");
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const lineTotal = item.quantity * item.price;
        const profit =
          (item.price - product.costPrice) * item.quantity;

        subtotal += lineTotal;
        totalProfit += profit;

        // reduce stock
        product.stock -= item.quantity;
        await product.save({ session });

        // snapshot item
        saleItems.push({
          productId: product._id,
          itemId: product.itemId,
          name: product.name,
          quantity: item.quantity,
          sellingPrice: item.price,
          costPrice: product.costPrice,
          lineTotal,
          profit
        });
      }

      const totalAmount = subtotal - discount;
      const netProfit = totalProfit - discount;

      const invoiceNo = "INV-" + Date.now();

      // 🔹 2️⃣ Create Sale Document

      const sale = await Sale.create([{
        invoiceNo,
        date: new Date(),
        items: saleItems,
        subtotal,
        discount,
        totalAmount,
        totalProfit: netProfit,
        paymentType: payment_type,
        createdBy: userId
      }], { session });

      // 🔹 3️⃣ Fetch Accounts

      const cashAccount = await Account.findOne({ name: "CASH" }).session(session);
      const salesAccount = await Account.findOne({ name: "SALES" }).session(session);
      const discountAccount = await Account.findOne({ name: "DISCOUNT" }).session(session);

      if (!cashAccount || !salesAccount) {
        throw new Error("Required accounts missing");
      }

      // 🔹 4️⃣ Create Journal Entry

      const journalEntries = [
        {
          accountId: cashAccount._id,
          accountName: cashAccount.name,
          debit: totalAmount,
          credit: 0
        },
        {
          accountId: salesAccount._id,
          accountName: salesAccount.name,
          debit: 0,
          credit: subtotal
        }
      ];

      if (discount > 0 && discountAccount) {
        journalEntries.push({
          accountId: discountAccount._id,
          accountName: discountAccount.name,
          debit: discount,
          credit: 0
        });
      }

      await Journal.create([{
        voucherNo: invoiceNo,
        voucherType: "SALE",
        date: new Date(),
        narration: `Sale invoice ${invoiceNo}`,
        entries: journalEntries
      }], { session });

      // 🔹 5️⃣ Commit Transaction

      await session.commitTransaction();
      session.endSession();

      return sale[0]._id;

    } catch (error) {

      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // 🔹 Get invoices with date filter

  async getInvoices(role, fromDate, toDate) {

    const filter = {};

    if (fromDate && toDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
    
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
    
      filter.createdAt = {
        $gte: start,
        $lte: end
      };
    }
    
    const sales = await Sale.find(filter).sort({ createdAt: -1 });
    

    const oneSale = await Sale.findOne();
    
    if (role === "employee") {
      return sales.map(s => ({
        id: s._id,
        createdAt: s.createdAt,
        invoiceNo: s.invoiceNo,
        date: s.date,
        paymentType: s.paymentType,
        totalAmount: s.totalAmount
      }));
    }

    return sales;
  }

  // 🔹 Get invoice details

  async getInvoiceDetails(saleId, role) {
    const sale = await Sale.findById(saleId);
    if (!sale) throw new Error("Invoice not found");

    const items = sale.items || [];
    console.log("enteredn getInvoiceDetails: ",items);

    const grossProfit = items.reduce(
      (sum, item) => sum + Number(item.profit || 0),
      0
    );
    
    if (role === "employee") {
      return {
        invoice: {
          ...sale.toObject(),
        },
        items: sale.items.map(i => ({
          itemId: i.itemId,
          name: i.name,
          quantity: i.quantity,
          sellingPrice: i.sellingPrice,
          lineTotal: i.lineTotal
        }))
      };
    }
    console.log("grossProfit: ",grossProfit);
    
    return {
      invoice: {
        ...sale.toObject(),
        grossProfit,
        },
      items: sale.items
    };
  }
}

module.exports = new SalesService();
