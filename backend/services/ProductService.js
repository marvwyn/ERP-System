const Product = require("../models/Products");

class ProductService {

  async createProduct(data, role) {
    if (role !== "owner") {
      throw new Error("Forbidden");
    }

    return await Product.create(data);
  }

  async getProducts(role) {

    const products = await Product.find();

    if (role === "employee") {
      return products.map(p => ({
        id: p._id,
        name: p.name,
        itemId: p.itemId,
        category: p.category,
        description: p.description,
        stock: p.stock,
        sellingPrice: p.sellingPrice
      }));
    }

    // Owner view
    return products.map(p => ({
      id: p._id,
      name: p.name,
      itemId: p.itemId,
      category: p.category,
      description: p.description,
      stock: p.stock,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      stockValue: p.stock * p.costPrice
    }));
  }
}

module.exports = new ProductService();