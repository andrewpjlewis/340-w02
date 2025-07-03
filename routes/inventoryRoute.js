const express = require("express");
const router = express.Router();

const invCont = require("../controllers/inventoryController");
const invValidate = require("../utilities/inventory-validation");
const utilities = require("../utilities/");
const { body } = require("express-validator");

// Apply role check middleware to ALL inventory routes
// First verify JWT, then check role
router.use(utilities.checkJWTToken, utilities.checkEmployeeOrAdmin);

// Routes protected by middleware below:

router.get("/", invCont.showManagement);
router.get("/type/:classificationId", invCont.buildByClassificationId);
router.get("/detail/:inv_id", invCont.buildVehicleDetail);

router.get("/add-classification", utilities.handleErrors(invCont.buildAddClassificationForm));
router.get("/add-inventory", invCont.buildAddInventoryForm);

router.get("/getInventory/:classification_id", invCont.getInventoryJSON);

router.get(
  "/edit/:inv_id",
  utilities.handleErrors(async (req, res, next) => {
    console.log("Router GET /edit/:inv_id called with ID:", req.params.inv_id); // DEBUG
    return invCont.editInventoryView(req, res, next);
  })
);

router.get(
  "/delete/:inv_id",
  utilities.handleErrors(async (req, res, next) => {
    return invCont.buildDeleteConfirmation(req, res, next);
  })
);

// POST routes with validation and error handling
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invCont.addClassification)
);

router.post(
  "/add-inventory",
  [
    body("classification_id").notEmpty().withMessage("Classification is required"),
    body("inv_make")
      .trim()
      .isAlpha("en-US", { ignore: " " })
      .withMessage("Make must be alphabetic"),
    body("inv_model")
      .trim()
      .isAlphanumeric("en-US", { ignore: " " })
      .withMessage("Model must be alphanumeric"),
    body("inv_year").isInt({ min: 1900, max: 2099 }).withMessage("Year must be a valid number"),
    body("inv_description").trim().notEmpty().withMessage("Description is required"),
    body("inv_image").trim().notEmpty().withMessage("Image path is required"),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required"),
    body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a positive number"),
    body("inv_color")
      .trim()
      .isAlpha("en-US", { ignore: " " })
      .withMessage("Color is required and must be alphabetic"),
  ],
  utilities.handleErrors(invCont.addInventory)
);

router.post(
  "/update",
  [
    body("classification_id").notEmpty().withMessage("Classification is required"),
    body("inv_make")
      .trim()
      .isAlpha("en-US", { ignore: " " })
      .withMessage("Make must be alphabetic"),
    body("inv_model")
      .trim()
      .isAlphanumeric("en-US", { ignore: " " })
      .withMessage("Model must be alphanumeric"),
    body("inv_year").isInt({ min: 1900, max: 2099 }).withMessage("Year must be a valid number"),
    body("inv_description").trim().notEmpty().withMessage("Description is required"),
    body("inv_image").trim().notEmpty().withMessage("Image path is required"),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required"),
    body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a positive number"),
    body("inv_color")
      .trim()
      .isAlpha("en-US", { ignore: " " })
      .withMessage("Color is required and must be alphabetic"),
  ],
  utilities.handleErrors(invCont.updateInventory)
);

router.post(
  "/delete",
  utilities.handleErrors(async (req, res, next) => {
    return invCont.deleteItem(req, res, next);
  })
);

module.exports = router;