// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/inventoryController");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build vehicle detail view by inventory id
router.get("/detail/:inv_id", invController.buildVehicleDetail);

module.exports = router;
