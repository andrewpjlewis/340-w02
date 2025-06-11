const invModel = require("../models/inventory-model");
const utilities = require("../utilities");
const { validationResult } = require("express-validator");

const invCont = {};

/* ***************************
 *  Show Management Page
 * ************************** */
invCont.showManagement = async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    const inventoryList = await invModel.getInventory();

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      inventoryList,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build vehicle detail view by inventory id
 * ************************** */
invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicleData = await invModel.getVehicleById(inv_id);

    if (!vehicleData) {
      return res.status(404).render("errors/404", { message: "Vehicle not found" });
    }

    const vehicleHTML = utilities.generateVehicleDetailHTML(vehicleData);
    let nav = await utilities.getNav();

    res.render("./inventory/details", {
      title: `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicleHTML,
      vehicleData,
    });
  } catch (error) {
    next(error);
  }
};

// Existing classification handlers
invCont.buildAddClassificationForm = async (req, res) => {
  const nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

invCont.addClassification = async (req, res) => {
  const { classification_name } = req.body;
  const nav = await utilities.getNav();

  try {
    const result = await invModel.addNewClassification(classification_name);
    if (result) {
      req.flash("success", "Classification added successfully.");
      res.redirect("/inv");
    } else {
      req.flash("error", "Classification not added. Try again.");
      res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        classification_name,
        errors: null,
      });
    }
  } catch (error) {
    req.flash("error", "An error occurred while adding the classification.");
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      classification_name,
      errors: null,
    });
  }
};

// New: Show Add Inventory Form
invCont.buildAddInventoryForm = async (req, res) => {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildAddInventoryForm:", error);
    req.flash("error", "Error loading the add inventory form.");
    res.redirect("/inv");
  }
};

// New: Handle Add Inventory POST
invCont.addInventory = async (req, res) => {
  const nav = await utilities.getNav();
  const errors = validationResult(req);
  const classificationList = await utilities.buildClassificationList(req.body.classification_id);

  if (!errors.isEmpty()) {
    return res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors,
      ...req.body,
    });
  }

  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;

    const result = await invModel.addInventoryItem(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    );

    if (result) {
      req.flash("success", "New vehicle added successfully.");
      return res.redirect("/inv");
    } else {
      req.flash("error", "Failed to add vehicle. Please try again.");
      return res.render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        ...req.body,
      });
    }
  } catch (error) {
    req.flash("error", "An error occurred while adding the vehicle.");
    return res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      ...req.body,
    });
  }
};

module.exports = invCont;