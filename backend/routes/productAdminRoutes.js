const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dropdown", async (req, res) => {
  try {
    console.log("Dropdown endpoint hit"); // Debug log
    const products = await Product.find({}, 'name _id').sort({ name: 1 });
    console.log("Products found:", products.length); // Debug log
    res.json(products);
  } catch (error) {
    console.error("Dropdown error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route GET /api/admin/products
// @desc Get all products (Admin only)
// @access Private/Admin
router.get("/", protect, admin, async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route POST /api/admin/products
// @desc Create a new product (Admin only)
// @access Private/Admin
router.post("/", protect, admin, async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
});

// @route PUT /api/admin/products/:id
// @desc Update a product (Admin only)
// @access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
});

// @route DELETE /api/admin/products/:id
// @desc Delete a product (Admin only)
// @access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});



module.exports = router;