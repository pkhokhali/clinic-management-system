const Inventory = require('../models/Inventory.model');
const Supplier = require('../models/Supplier.model');

// Inventory CRUD
exports.createInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: { inventoryItem } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating inventory item', error: error.message });
  }
};

exports.getInventoryItems = async (req, res) => {
  try {
    const { category, isLowStock, isActive } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    let inventoryItems = await Inventory.find(query)
      .populate('supplier', 'name')
      .sort({ itemName: 1 });
    
    if (isLowStock === 'true') {
      inventoryItems = inventoryItems.filter(item => item.quantity <= item.reorderLevel);
    }

    res.status(200).json({ success: true, count: inventoryItems.length, data: { inventoryItems } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching inventory items', error: error.message });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!inventoryItem) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    res.status(200).json({ success: true, data: { inventoryItem } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating inventory item', error: error.message });
  }
};

// Supplier CRUD
exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: { supplier } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating supplier', error: error.message });
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: req.query.isActive !== 'false' }).sort({ name: 1 });
    res.status(200).json({ success: true, count: suppliers.length, data: { suppliers } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching suppliers', error: error.message });
  }
};
