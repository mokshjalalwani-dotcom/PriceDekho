import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const CORE_SLUGS = [
  'tv', 'projector', 'sound-system', 'refrigerator', 'washing-machines', 
  'dishwashers', 'air-conditioners', 'fan', 'vacuum-cleaner', 'ghar-ghanti', 
  'oven', 'water-purifier', 'mixer', 'gas-stove', 'geyser', 'personal-care'
];
// --- Multer config for image uploads ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/products'));
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// =====================================================
// PRODUCT CRUD
// =====================================================

// Admin: Get all products (including hidden)
router.get('/products', protect, admin, async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('category', 'name slug icon')
      .populate('brand', 'name slug logo')
      .sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Add a new product
router.post('/products', protect, admin, async (req, res) => {
  try {
    const productData = { ...req.body };

    // Sync price fields
    if (productData.sellingPrice && !productData.price) {
      productData.price = productData.sellingPrice;
    } else if (productData.price && !productData.sellingPrice) {
      productData.sellingPrice = productData.price;
    }

    const product = new Product(productData);
    const createdProduct = await product.save();
    const populated = await Product.findById(createdProduct._id)
      .populate('category', 'name slug')
      .populate('brand', 'name slug');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Update a product
router.put('/products/:id', protect, admin, async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Sync price fields
    if (updateData.sellingPrice) {
      updateData.price = updateData.sellingPrice;
    } else if (updateData.price) {
      updateData.sellingPrice = updateData.price;
    }

    // Auto-update availability
    if (updateData.countInStock !== undefined && updateData.countInStock <= 0) {
      updateData.availability = 'Out of Stock';
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category', 'name slug')
      .populate('brand', 'name slug');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Delete a product
router.delete('/products/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// =====================================================
// STOCK & VISIBILITY
// =====================================================

// Admin: Update stock quantity
router.patch('/products/:id/stock', protect, admin, async (req, res) => {
  try {
    const { countInStock } = req.body;
    if (countInStock === undefined || countInStock < 0) {
      return res.status(400).json({ message: 'Valid stock quantity required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.countInStock = countInStock;
    product.availability = countInStock > 0 ? 'In Stock' : 'Out of Stock';
    await product.save();

    res.json({ message: 'Stock updated', countInStock: product.countInStock, availability: product.availability });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Toggle visibility
router.patch('/products/:id/visibility', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.isVisible = !product.isVisible;
    await product.save();

    res.json({ message: `Product ${product.isVisible ? 'visible' : 'hidden'}`, isVisible: product.isVisible });
  } catch (error) {
    console.error('Visibility toggle error:', error);
    res.status(400).json({ message: error.message });
  }
});

// =====================================================
// IMAGE UPLOAD
// =====================================================

// Admin: Upload product images
router.post('/products/:id/images', protect, admin, upload.array('images', 10), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const imageUrls = req.files.map(f => `/uploads/products/${f.filename}`);

    // Add to gallery
    product.galleryImages.push(...imageUrls);

    // Set mainImage if not set
    if (!product.mainImage && imageUrls.length > 0) {
      product.mainImage = imageUrls[0];
    }

    // Sync images array
    product.images = [product.mainImage, ...product.galleryImages].filter(Boolean);

    await product.save();
    res.json({ message: 'Images uploaded', images: product.images, galleryImages: product.galleryImages });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Remove a gallery image
router.delete('/products/:id/images/:idx', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const idx = parseInt(req.params.idx);
    if (idx < 0 || idx >= product.galleryImages.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    product.galleryImages.splice(idx, 1);
    product.images = [product.mainImage, ...product.galleryImages].filter(Boolean);
    await product.save();

    res.json({ message: 'Image removed', galleryImages: product.galleryImages });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// =====================================================
// SPECIFICATION GROUPS
// =====================================================

// Admin: Add spec group
router.post('/products/:id/specs', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.specGroups.push(req.body);
    await product.save();

    res.json({ message: 'Spec group added', specGroups: product.specGroups });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Update spec group
router.put('/products/:id/specs/:gid', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const group = product.specGroups.id(req.params.gid);
    if (!group) return res.status(404).json({ message: 'Spec group not found' });

    group.groupName = req.body.groupName || group.groupName;
    group.fields = req.body.fields || group.fields;
    await product.save();

    res.json({ message: 'Spec group updated', specGroups: product.specGroups });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Delete spec group
router.delete('/products/:id/specs/:gid', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.specGroups.pull({ _id: req.params.gid });
    await product.save();

    res.json({ message: 'Spec group deleted', specGroups: product.specGroups });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// =====================================================
// CATEGORIES
// =====================================================

// Admin: Add Category
router.post('/categories', protect, admin, async (req, res) => {
  try {
    const { name, slug, iconKey, displayOrder, subCategories } = req.body;
    
    // Auto-shift display order logic
    if (displayOrder !== undefined) {
      await Category.updateMany(
        { displayOrder: { $gte: displayOrder } },
        { $inc: { displayOrder: 1 } }
      );
    }
    
    const category = await Category.create({
      name, slug, iconKey, displayOrder, subCategories, isActive: true
    });
    
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `Category with this ${field} already exists.` });
    }
    res.status(400).json({ message: error.message });
  }
});

// Admin: Update Category
router.put('/categories/:id', protect, admin, async (req, res) => {
  try {
    const { name, slug, iconKey, displayOrder, subCategories } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    if (displayOrder !== undefined && displayOrder !== category.displayOrder) {
      // Auto-shift logic
      await Category.updateMany(
        { displayOrder: { $gte: displayOrder } },
        { $inc: { displayOrder: 1 } }
      );
    }
    
    category.name = name || category.name;
    
    // Core categories protection
    if (CORE_SLUGS.includes(category.slug)) {
      if ((slug && slug !== category.slug) || (iconKey !== undefined && iconKey !== category.iconKey)) {
        return res.status(400).json({ message: 'Cannot modify slug or iconKey of core system categories.' });
      }
    } else {
      category.slug = slug || category.slug;
      if (iconKey !== undefined) category.iconKey = iconKey;
    }
    
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    
    if (subCategories !== undefined) {
      // Check for removed subcategories
      if (category.subCategories && category.subCategories.length > 0) {
        const incomingNames = subCategories.map(s => s.name);
        const removedSubs = category.subCategories.filter(s => {
          const sName = typeof s === 'string' ? s : s.name;
          return !incomingNames.includes(sName);
        });

        if (removedSubs.length > 0) {
          for (const sub of removedSubs) {
            const subName = typeof sub === 'string' ? sub : sub.name;
            const inUseCount = await Product.countDocuments({ category: category._id, subCategory: subName });
            if (inUseCount > 0) {
              return res.status(400).json({ message: `Cannot delete subcategory '${subName}'. It is used by ${inUseCount} product(s). Please move them or disable the subcategory instead.` });
            }
          }
        }
      }
      category.subCategories = subCategories;
    }
    
    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `Category with this ${field} already exists.` });
    }
    res.status(400).json({ message: error.message });
  }
});

// Admin: Toggle Category Active Status (Soft Delete)
router.patch('/categories/:id/toggle', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    category.isActive = !category.isActive;
    await category.save();
    res.json({ message: `Category ${category.isActive ? 'enabled' : 'disabled'}`, category });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// =====================================================
// BRANDS
// =====================================================

// Admin: Add Brand
router.post('/brands', protect, admin, async (req, res) => {
  try {
    const { name, slug, categories } = req.body;
    const brand = await Brand.create({ name, slug, categories, isActive: true });
    res.status(201).json(brand);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `Brand with this ${field} already exists.` });
    }
    res.status(400).json({ message: error.message });
  }
});

// Admin: Update Brand
router.put('/brands/:id', protect, admin, async (req, res) => {
  try {
    const { name, slug, categories } = req.body;
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    
    if (name) brand.name = name;
    if (slug) brand.slug = slug;
    if (categories !== undefined) brand.categories = categories;
    
    const updated = await brand.save();
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `Brand with this ${field} already exists.` });
    }
    res.status(400).json({ message: error.message });
  }
});

// Admin: Toggle Brand Active Status (Soft Delete)
router.patch('/brands/:id/toggle', protect, admin, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    
    brand.isActive = !brand.isActive;
    await brand.save();
    res.json({ message: `Brand ${brand.isActive ? 'enabled' : 'disabled'}`, brand });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
