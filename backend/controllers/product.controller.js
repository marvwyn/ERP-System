const productService = require("../services/ProductService");

exports.getProducts = async (req, res) => {
  try {
    const role = req.user.role;

    const products = await productService.getProducts(role);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
    try {
      const id = await productService.createProduct(
        req.body,
        req.user.role
      );
  
      res.json({ message: "Product created", id });
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  };