const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route POST /api/products
// @desc Create a new Product
// @access Private/Admin
router.post("/", protect, admin, async (req, res) => {
    console.log('🔄 POST /api/products - Creating new product');
    console.log('📦 Request body:', req.body);
    
    try {
        const { name,
             description, 
             price,
              discountPrice,
               countInStock, 
               category, 
               brand,
            sizes,
             colors, 
             collections, 
             material,
              gender, 
              images, 
              isFeatured, 
              isPublished,
               tags,
               dimensions,
               weight,
               sku,
            } = req.body;

            const product= new Product({ name,
             description, 
             price,
              discountPrice,
               countInStock, 
               category, 
               brand,
            sizes,
             colors, 
             collections, 
             material,
              gender, 
              images, 
              isFeatured, 
              isPublished,
               tags,
               dimensions,
               weight,
               sku,

               user:req.user._id //Refernce to the admin user who created it 

            })

        console.log('💾 Saving product to database...');
        const createdProduct = await product.save();
        console.log('✅ Product created successfully:', createdProduct._id);
        
        res.status(201).json(createdProduct); 

    } catch (error) {
        console.error('❌ Error creating product:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
});

// @route PUT /api/products/:id
// @desc Update an existing product by ID
// @access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
    console.log(`🔄 PUT /api/products/${req.params.id} - Updating product`);
    console.log('📦 Request body:', req.body);
    
    try {
        const { name,
             description, 
             price,
              discountPrice,
               countInStock, 
               category, 
               brand,
            sizes,
             colors, 
             collections, 
             material,
              gender, 
              images, 
              isFeatured, 
              isPublished,
               tags,
               dimensions,
               weight,
               sku,
            } = req.body;

        console.log(`🔍 Finding product with ID: ${req.params.id}`);
        const product = await Product.findById(req.params.id);

        if (product) {
            console.log('✅ Product found, updating fields...');
            // Update product fields
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.discountPrice = discountPrice || product.discountPrice;
            product.countInStock = countInStock || product.countInStock;
            product.category = category || product.category;
            product.brand = brand || product.brand;
            product.sizes = sizes || product.sizes;
            product.colors = colors || product.colors;
            product.collections = collections || product.collections;
            product.material = material || product.material;
            product.gender = gender || product.gender;
            product.images = images || product.images;
            product.isFeatured = 
                isFeatured !== undefined ? isFeatured : product.isFeatured;
            product.isPublished = 
                isPublished !== undefined ? isPublished : product.isPublished;
            product.tags = tags || product.tags;
            product.dimensions = dimensions || product.dimensions;
            product.weight = weight || product.weight;
            product.sku = sku || product.sku;

            console.log('💾 Saving updated product...');
            const updatedProduct = await product.save();
            console.log('✅ Product updated successfully');
            
            res.json(updatedProduct);
        } else {
            console.log('❌ Product not found');
            res.status(404).json({ message: "Product not found" });
        }

    } catch (error) {
        console.error('❌ Error updating product:', error);
        res.status(500).send("Server Error");
    }
});

// @route DELETE /api/products/:id
// @desc Delete a product by ID
// @access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
    console.log(`🗑️ DELETE /api/products/${req.params.id} - Deleting product`);
    
    try {
        console.log(`🔍 Finding product with ID: ${req.params.id}`);
        const product = await Product.findById(req.params.id);

        if (product) {
            console.log('✅ Product found, deleting...');
            await product.deleteOne();
            console.log('✅ Product deleted successfully');
            res.json({ message: "Product removed" });
        } else {
            console.log('❌ Product not found');
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        res.status(500).send("server Error");
    }
});

// @route GET /api/products
// @desc Get all products with optional query filters
// @access Public
router.get("/", async (req, res) => {
    console.log('🔄 GET /api/products - Fetching products with filters');
    console.log('🔍 Query parameters:', req.query);
    
    try {
        const { 
            collection, 
            size, 
            color, 
            gender, 
            minPrice, 
            maxPrice, 
            sortBy,
            search, 
            category, 
            material, 
            brand, 
            limit 
        } = req.query;

        let query = {};
        console.log('🔧 Building query...');

        // Filter logic
        if (collection && collection.toLocaleLowerCase() !=="all") {
            query.collections = collection;
            console.log(`🔍 Filter - collection: ${collection}`);
        }

        if (category && category.toLocaleLowerCase() !=="all") {
            query.category = category;
            console.log(`🔍 Filter - category: ${category}`);
        }

        if (material) {
            query.material = { $in: material.split(",") };
            console.log(`🔍 Filter - material: ${material}`);
        }

        if (brand) {
            query.brand = { $in: brand.split(",") };
            console.log(`🔍 Filter - brand: ${brand}`);
        }

        if (size) {
            query.sizes = { $in: size.split(",") };
            console.log(`🔍 Filter - size: ${size}`);
        }

        if (color) {
            query.colors = { $in: [color] };
            console.log(`🔍 Filter - color: ${color}`);
        }

        if (gender) {
            query.gender = gender;
            console.log(`🔍 Filter - gender: ${gender}`);
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) {
                query.price.$gte = Number(minPrice);
                console.log(`🔍 Filter - minPrice: ${minPrice}`);
            }
            if (maxPrice) {
                query.price.$lte = Number(maxPrice);
                console.log(`🔍 Filter - maxPrice: ${maxPrice}`);
            }
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
            console.log(`🔍 Filter - search: ${search}`);
        }

        console.log('✅ Final query object:', JSON.stringify(query, null, 2));

        // Sort Logic
        let sort = {};
        if (sortBy) {
            switch (sortBy) {
                case "priceAsc":
                    sort = { price: 1 };
                    console.log('🔍 Sort - price ascending');
                    break;
                case "priceDesc":
                    sort = { price: -1 };
                    console.log('🔍 Sort - price descending');
                    break;
                case "popularity":
                    sort = { rating: -1 };
                    console.log('🔍 Sort - popularity (rating)');
                    break;
                default:
                    console.log('🔍 Sort - default (none)');
                    break;   
            }
        }

        console.log('🔍 Sort object:', sort);
        console.log(`🔍 Limit: ${Number(limit) || 0}`);
 
        // Fetch products and apply sorting and Limit
        console.log('📦 Fetching products from database...');
        let products = await Product.find(query)
            .sort(sort)
            .limit(Number(limit) || 0);
        
        console.log(`✅ Found ${products.length} products`);
        console.log('📊 Products:', products.map(p => ({ id: p._id, name: p.name, category: p.category, gender: p.gender })));
        
        res.json(products);

    } catch (error) {
        console.error('❌ Error fetching products:', error);
        res.status(500).send("server Error");
    }
});

// @route GET /api/products/best-seller
// @desc Retrieve the product with highest rating
// @access Public
router.get("/best-seller", async (req, res) => {
    console.log('🔄 GET /api/products/best-seller - Finding best seller');
    
    try {
        console.log('🔍 Finding product with highest rating...');
        const bestSeller = await Product.findOne().sort({ rating: -1 });

        if (bestSeller) {
            console.log('✅ Best seller found:', bestSeller._id, bestSeller.name);
            console.log('⭐ Rating:', bestSeller.rating);
            res.json(bestSeller);
        } else {
            console.log('❌ No best seller found - checking for any published product...');
            // Try to get any published product as fallback
            const fallbackProduct = await Product.findOne({ isPublished: true });
            
            if (fallbackProduct) {
                console.log('✅ Fallback product found:', fallbackProduct._id, fallbackProduct.name);
                res.json(fallbackProduct);
            } else {
                console.log('❌ No products found at all');
                res.json(null);
            }
        }
    } catch (error) {
        console.error('❌ Error finding best seller:', error);
        res.status(500).json({ 
            message: "Server Error",
            error: error.message 
        });
    }
});

// @route GET /api/products/new-arrivals
// @desc Retrieve latest 8 products - Creation date
// @access Public
router.get("/new-arrivals", async (req, res) => {
    console.log('🔄 GET /api/products/new-arrivals - Finding new arrivals');
    
    try {
        console.log('🔍 Finding latest 8 products...');
        const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
        console.log(`✅ Found ${newArrivals.length} new arrivals`);
        
        res.json(newArrivals);
    } catch (error) {
        console.error('❌ Error finding new arrivals:', error);
        res.status(500).send("Server Error");
    }
});

// @route GET /api/products/:id
// @desc Get a single product by ID
// @access Public
router.get("/:id", async (req, res) => {
    console.log(`🔄 GET /api/products/${req.params.id} - Finding product by ID`);
    
    try {
        console.log(`🔍 Finding product with ID: ${req.params.id}`);
        const product = await Product.findById(req.params.id);
        
        if (product) {
            console.log('✅ Product found:', product.name);
            res.json(product);
        } else {
            console.log('❌ Product not found');
            res.status(404).json({ message: "Product Not Found" });
        }
    } catch (error) {
        console.error('❌ Error finding product:', error);
        res.status(500).send("Server Error");
    }
});

// @route GET /api/products/similar/:id
// @desc Retrieve similar products based on the current product's gender and category
// @access Public
router.get("/similar/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`🔄 GET /api/products/similar/${id} - Finding similar products`);
    
    try {
        console.log(`🔍 Finding base product with ID: ${id}`);
        const product = await Product.findById(id);

        if (!product) {
            console.log('❌ Base product not found');
            return res.status(404).json({ message: "Product not found" });
        }

        console.log(`✅ Base product found: ${product.name}`);
        console.log(`🔍 Category: ${product.category}, Gender: ${product.gender}`);

        // First try: exact match (same category + same gender)
        console.log('🔍 Looking for exact matches (same category + gender)...');
        let similarProducts = await Product.find({
            _id: { $ne: id },
            category: product.category,
            gender: product.gender,
        }).limit(4);

        console.log(`✅ Found ${similarProducts.length} exact matches`);

        // Second try: if no exact matches, try same category OR same gender
        if (similarProducts.length === 0) {
            console.log('🔍 No exact matches, looking for similar (same category OR gender)...');
            similarProducts = await Product.find({
                _id: { $ne: id },
                $or: [
                    { category: product.category },
                    { gender: product.gender }
                ]
            }).limit(4);
            
            console.log(`✅ Found ${similarProducts.length} similar products`);
        }

        console.log('📊 Similar products:', similarProducts.map(p => ({ id: p._id, name: p.name })));
        res.json(similarProducts);

    } catch (error) {
        console.error('❌ Error finding similar products:', error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;