/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const baseController = require("./controllers/baseController")
const utilities = require('./utilities')
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require('./routes/accountRoute')
const flash = require('connect-flash')
const bodyParser = require('body-parser')

/* ***********************
* View Engine and Templates
*************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
* Middleware
* ************************/
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})
app.use("/account", accountRoute)

/* ***********************
 * Routes
 *************************/
app.use(require("./routes/static"))
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use("/inv", require("./routes/inventoryRoute"))
// Account Routes
app.use("/account", require("./routes/accountRoute"))
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: "😅 Whoops! Something went wrong... but at least you're not stuck in 1985."})
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  if(err.status == 404){ 
    message = err.message
    title = err.status
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?'
    title = (err.status === 500) ? 'Service Error' : (err.status || 'Server Error')
  }

  res.render("errors/error", {
    title,
    message,
    nav
  })
})

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})