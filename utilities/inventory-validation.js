const { body, validationResult } = require("express-validator");
const utilities = require(".");

const invValidate = {};

invValidate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name must not contain spaces or special characters.")
  ];
};

invValidate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      classification_name,
      errors
    });
    return;
  }

  next();
};

module.exports = invValidate;