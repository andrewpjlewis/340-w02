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
    const classificationSelect = await utilities.buildClassificationList();

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      inventoryList,
      classificationSelect,
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
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);

    if (!data || data.length === 0) {
      throw new Error("No vehicles found for this classification.");
    }

    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    console.error("Classification View Error:", error.message);
    res.status(500).render("errors/500", {
      title: "Server Error",
      message: "An error occurred while loading vehicles for this classification.",
    });
  }
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

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  console.log("EditInventoryView called with inv_id:", req.params.inv_id);  // DEBUG
  const inv_id = parseInt(req.params.inv_id);
  
  try {
    let nav = await utilities.getNav();
    const itemData = await invModel.getVehicleById(inv_id);

    if (!itemData) {
      console.log(`No inventory found for id ${inv_id}`); // DEBUG
      return res.status(404).render("errors/404", { message: "Vehicle not found" });
    }

    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    console.error("Error in editInventoryView:", error);
    next(error);
  }
};


invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList()
  res.render('./inventory/management', {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationSelect,
  })
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res) => {
  try {
    const classification_id = parseInt(req.params.classification_id);
    console.log("Received classification ID:", classification_id);

    const invData = await invModel.getInventoryByClassificationId(classification_id);
    console.log("Fetched inventory data:", invData);

    // If no data, still respond with empty array
    return res.json(invData || []);
  } catch (error) {
    console.error("Error in getInventoryJSON:", error);

    // Send JSON error response instead of rendering a view
    res.status(500).json({ error: "Server error while fetching inventory data" });
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build Delete Confirmation View
 * ************************** */
invCont.buildDeleteConfirmation = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicleData = await invModel.getVehicleById(inv_id);
    const nav = await utilities.getNav();

    if (!vehicleData) {
      req.flash("error", "Vehicle not found.");
      return res.redirect("/inv");
    }

    res.render("./inventory/delete-confirm", {
      title: `Delete ${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      errors: null,
      ...vehicleData,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Delete Inventory Item
 *  Unit 5, Delete Activity
 * ************************** */
invCont.deleteItem = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult.rowCount) {
    req.flash("notice", 'The deletion was successful.')
    res.redirect('/inv/')
  } else {
    req.flash("notice", 'Sorry, the delete failed.')
    res.redirect(`/inv/delete/inv_id`)
  }
};

module.exports = invCont;