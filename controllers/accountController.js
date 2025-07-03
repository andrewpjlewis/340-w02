const utilities = require("../utilities");
const bcrypt = require("bcryptjs");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult.rowCount > 0) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav();
  const accountData = res.locals.accountData;
  res.render("account/login-success", {
    title: "Account Management",
    nav,
    accountData,
    errors: null,
    messages: req.flash()
  });
}

async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav();
  const account_id = parseInt(req.params.account_id);
  const accountData = await accountModel.getAccountById(account_id);

  res.render("account/update", {
    title: "Update Account",
    nav,
    accountData,
    errors: null,
  });
}

async function updateAccountInfo(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  const result = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);
  const nav = await utilities.getNav();

  if (result) {
    // Get updated account info
    const updatedAccount = await accountModel.getAccountById(account_id);
    if (!updatedAccount) {
      req.flash("error", "Could not retrieve updated account info.");
      return res.redirect("/account/update/" + account_id);
    }

    // Remove sensitive info before signing token
    delete updatedAccount.account_password;

    // Generate new JWT token with updated info
    const newToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });

    // Set the new token cookie, just like in login
    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", newToken, { httpOnly: true, maxAge: 3600 * 1000 });
    } else {
      res.cookie("jwt", newToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
    }

    req.flash("success", "Account updated.");
    res.redirect("/account");
  } else {
    req.flash("error", "Update failed.");
    res.redirect("/account/update/" + account_id);
  }
}

async function updateAccountPassword(req, res) {
  const { account_id, account_password } = req.body;
  const hashedPassword = await bcrypt.hash(account_password, 10);
  const result = await accountModel.updateAccountPassword(account_id, hashedPassword);
  const nav = await utilities.getNav();

  if (result) {
    req.flash("success", "Password updated.");
    res.redirect("/account");
  } else {
    req.flash("error", "Password update failed.");
    res.redirect("/account/update/" + account_id);
  }
}



module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildAccountManagement,
  buildUpdateAccount,
  updateAccountInfo,
  updateAccountPassword,
};