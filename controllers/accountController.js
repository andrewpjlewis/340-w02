const utilities = require("../utilities")
const bcrypt = require("bcryptjs")
const session = require("express-session")
const accountModel = require("../models/account-model")

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body

  const errors = []

  // Basic required fields check
  if (!account_firstname) errors.push("First name is required.")
  if (!account_lastname) errors.push("Last name is required.")
  if (!account_email) errors.push("Email is required.")
  if (!account_password) errors.push("Password is required.")

  // Email format check (basic regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (account_email && !emailRegex.test(account_email)) {
    errors.push("Invalid email format.")
  }

  // Password strength check
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{12,}$/
  if (account_password && !passwordRegex.test(account_password)) {
    errors.push("Password must be at least 12 characters, include an uppercase letter, a number, and a special character.")
  }

  // If there are validation errors, re-render the form
  if (errors.length > 0) {
    req.flash("notice", errors)
    return res.status(400).render("account/register", {
      title: "Registration",
      nav,
      errors,
      account_firstname,
      account_lastname,
      account_email
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount }
