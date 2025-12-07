const LabCategory = require('../models/LabCategory.model');

// @desc    Create lab category
// @route   POST /api/lab/categories
// @access  Private (Super Admin, Admin)
exports.createCategory = async (req, res) => {
  try {
    const category = await LabCategory.create({
      ...req.body,
      name: req.body.name.toLowerCase().trim(),
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category name already exists' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error creating lab category', 
      error: error.message 
    });
  }
};

// @desc    Get all lab categories
// @route   GET /api/lab/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const categories = await LabCategory.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ name: 1 });
    res.status(200).json({ 
      success: true, 
      count: categories.length, 
      data: { categories } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching lab categories', 
      error: error.message 
    });
  }
};

// @desc    Get single lab category
// @route   GET /api/lab/categories/:id
// @access  Private
exports.getCategory = async (req, res) => {
  try {
    const category = await LabCategory.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lab category not found' 
      });
    }
    res.status(200).json({ success: true, data: { category } });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching lab category', 
      error: error.message 
    });
  }
};

// @desc    Update lab category
// @route   PUT /api/lab/categories/:id
// @access  Private (Super Admin, Admin)
exports.updateCategory = async (req, res) => {
  try {
    if (req.body.name) {
      req.body.name = req.body.name.toLowerCase().trim();
    }
    
    const category = await LabCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lab category not found' 
      });
    }
    
    res.status(200).json({ success: true, data: { category } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category name already exists' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error updating lab category', 
      error: error.message 
    });
  }
};

// @desc    Delete lab category
// @route   DELETE /api/lab/categories/:id
// @access  Private (Super Admin, Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const LabTest = require('../models/LabTest.model');
    
    // Check if any lab tests are using this category
    const testsUsingCategory = await LabTest.countDocuments({ 
      category: req.params.name || await LabCategory.findById(req.params.id).then(c => c?.name) 
    });
    
    if (testsUsingCategory > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category. ${testsUsingCategory} lab test(s) are using this category.` 
      });
    }
    
    const category = await LabCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lab category not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Lab category deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting lab category', 
      error: error.message 
    });
  }
};

