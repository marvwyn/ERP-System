const db = require("../config/db");
const salesService = require("../services/SalesService");

exports.createSale = async (req, res) => {
  try {
    const sale_id = await salesService.createSale(
      req.body,
      req.user.id
    );

    res.json({ message: "Sale created", sale_id });
  } catch (error) {
    console.error("CREATE SALE ERROR:", error); 
    res.status(500).json({ message: error.message });
  }
};

exports.getSales = async (req, res) => {
    try {
      const { from, to } = req.query;
      const sales = await salesService.getInvoices(
        req.user.role,
        from,
        to
      );
  
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};  

exports.getSaleDetails = async (req, res) => {
    try {
      const data = await salesService.getInvoiceDetails(
        req.params.id,
        req.user.role
      );
  
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
  