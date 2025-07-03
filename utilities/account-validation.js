const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");

const validate = {};

validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isString()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .isString()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),

    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must be at least 12 characters, include an uppercase letter, a number, and a special character."
      ),
  ];
};

validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    body("account_password").trim().notEmpty().withMessage("Password is required."),
  ];
};

validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};


validate.accountUpdateRules = () => [
  body("account_firstname").notEmpty().withMessage("First name required."),
  body("account_lastname").notEmpty().withMessage("Last name required."),
  body("account_email")
    .isEmail().withMessage("Valid email required.")
    .custom(async (email, { req }) => {
      const existing = await accountModel.getAccountByEmail(email);
      if (existing && existing.account_id != req.body.account_id) {
        throw new Error("Email already in use.");
      }
    })
];

validate.checkAccountUpdate = async (req, res, next) => {
  const errors = validationResult(req);
  const accountData = req.body;
  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData
    });
  }
  next();
};

validate.passwordUpdateRules = () => [
  body("account_password").isStrongPassword({
    minLength: 12,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }).withMessage("Password does not meet requirements.")
];

validate.checkPasswordUpdate = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData: req.body
    });
  }
  next();
};

module.exports = validate;