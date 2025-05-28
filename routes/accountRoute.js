// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")

// Route to deliver the "My Account" page
router.get("/login", utilities.handleErrors(accountController.buildAccountHome))

// Export the router
module.exports = router
