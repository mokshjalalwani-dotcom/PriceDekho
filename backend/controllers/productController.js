import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';

// @desc    Fetch all products with advanced filtering
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 12;
    const page = Number(req.query.page) || 1;

    // --- Text search ---
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { tags: { $regex: req.query.keyword, $options: 'i' } },
            { shortDescription: { $regex: req.query.keyword, $options: 'i' } },
          ]
        }
      : {};

    // --- Category filter ---
    let categoryFilter = {};
    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      if (category) {
        categoryFilter = { category: category._id };
      } else if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        categoryFilter = { category: req.query.category };
      }
    }

    // --- Brand filter (supports comma-separated slugs or IDs) ---
    let brandFilter = {};
    if (req.query.brand) {
      const brandSlugs = req.query.brand.split(',');
      const brands = await Brand.find({ slug: { $in: brandSlugs } });
      if (brands.length > 0) {
        brandFilter = { brand: { $in: brands.map(b => b._id) } };
      } else {
        // Try as IDs
        const validIds = brandSlugs.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length > 0) {
          brandFilter = { brand: { $in: validIds } };
        }
      }
    }

    // --- Price range filter ---
    let priceFilter = {};
    if (req.query.minPrice || req.query.maxPrice) {
      priceFilter.sellingPrice = {};
      if (req.query.minPrice) priceFilter.sellingPrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) priceFilter.sellingPrice.$lte = Number(req.query.maxPrice);
      // Also check legacy price field
      priceFilter = {
        $or: [
          { sellingPrice: priceFilter.sellingPrice },
          { price: priceFilter.sellingPrice },
        ]
      };
    }

    // --- Availability filter ---
    let availabilityFilter = {};
    if (req.query.availability) {
      availabilityFilter = { availability: req.query.availability };
    }

    // --- Visibility filter (public always sees visible only) ---
    const visibilityFilter = { isVisible: { $ne: false } };

    // --- Category-specific field filters ---
    const categoryFieldFilters = {};
    const reservedKeys = [
      'page', 'pageSize', 'keyword', 'category', 'brand', 'sortBy',
      'minPrice', 'maxPrice', 'availability', 'color', 'subCategory'
    ];
    Object.keys(req.query).forEach(key => {
      if (!reservedKeys.includes(key) && req.query[key]) {
        // Check if it's a categoryFields filter
        categoryFieldFilters[`categoryFields.${key}`] = { $regex: req.query[key], $options: 'i' };
      }
    });

    // --- SubCategory filter ---
    let subCategoryFilter = {};
    if (req.query.subCategory) {
      subCategoryFilter = { subCategory: req.query.subCategory };
    }

    // --- Color filter ---
    let colorFilter = {};
    if (req.query.color) {
      colorFilter = { color: { $regex: req.query.color, $options: 'i' } };
    }

    // --- Sort ---
    const sortMap = {
      price_asc: { sellingPrice: 1, price: 1 },
      price_desc: { sellingPrice: -1, price: -1 },
      rating_desc: { rating: -1 },
      newest: { createdAt: -1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
      discount_desc: { discountPercentage: -1 },
    };
    const sortOrder = sortMap[req.query.sortBy] || { createdAt: -1 };

    const finalQuery = {
      ...keyword,
      ...categoryFilter,
      ...brandFilter,
      ...subCategoryFilter,
      ...availabilityFilter,
      ...visibilityFilter,
      ...colorFilter,
      ...categoryFieldFilters,
      ...(Object.keys(priceFilter).length > 0 ? priceFilter : {}),
    };

    const count = await Product.countDocuments(finalQuery);
    const products = await Product.find(finalQuery)
      .populate('category', 'name slug icon')
      .populate('brand', 'name slug logo')
      .sort(sortOrder)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Fetch single product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug icon')
      .populate('brand', 'name slug logo');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/id/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug icon')
      .populate('brand', 'name slug logo');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get products to compare
// @route   GET /api/products/compare?ids=id1,id2
// @access  Public
export const getProductsToCompare = async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    if (ids.length === 0) {
      return res.status(400).json({ message: 'No product IDs provided' });
    }

    const products = await Product.find({ _id: { $in: ids } })
      .populate('category', 'name slug')
      .populate('brand', 'name slug');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get similar products (same category, different product)
// @route   GET /api/products/:id/similar
// @access  Public
export const getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const similar = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isVisible: { $ne: false },
    })
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .limit(8)
      .sort({ isFeatured: -1, rating: -1 });

    res.json(similar);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get products by category slug
// @route   GET /api/products/category/:slug
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const pageSize = Number(req.query.pageSize) || 12;
    const page = Number(req.query.page) || 1;

    const query = { category: category._id, isVisible: { $ne: false } };

    // Apply subCategory filter if provided
    if (req.query.subCategory) {
      query.subCategory = req.query.subCategory;
    }

    // Apply brand filter if provided (supports comma-separated slugs or IDs)
    if (req.query.brand) {
      const brandSlugs = req.query.brand.split(',');
      const brandsMatch = await Brand.find({ slug: { $in: brandSlugs } });
      if (brandsMatch.length > 0) {
        query.brand = { $in: brandsMatch.map(b => b._id) };
      } else {
        // Try as IDs
        const validIds = brandSlugs.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length > 0) {
          query.brand = { $in: validIds };
        }
      }
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug icon')
      .populate('brand', 'name slug logo')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // Get available brands for this category
    const brandIds = await Product.distinct('brand', { category: category._id });
    const brands = await Brand.find({ _id: { $in: brandIds } }).select('name slug');

    // Get distinct subCategory values for this category
    const subCategories = await Product.distinct('subCategory', {
      category: category._id,
      subCategory: { $nin: [null, ''] }
    });

    res.json({
      category,
      products,
      brands,
      subCategories,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Search products
// @route   GET /api/products/search?q=query
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) {
      return res.json({ products: [], total: 0 });
    }

    const products = await Product.find({
      isVisible: { $ne: false },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
        { modelNumber: { $regex: q, $options: 'i' } },
      ]
    })
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .limit(20)
      .sort({ isFeatured: -1, rating: -1 });

    res.json({ products, total: products.length });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
