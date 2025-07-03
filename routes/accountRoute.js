const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

// Route to deliver the "My Account" pages
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount));

// Registration and login POST routes
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  req.flash('notice', 'You have been logged out.');
  res.redirect('/account/login');
});


router.post("/update", 
  regValidate.accountUpdateRules(),
  regValidate.checkAccountUpdate,
  utilities.handleErrors(accountController.updateAccountInfo)
);

router.post("/update-password", 
  regValidate.passwordUpdateRules(),
  regValidate.checkPasswordUpdate,
  utilities.handleErrors(accountController.updateAccountPassword)
);

module.exports = router;
