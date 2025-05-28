const utilities = require("../utilities")
const bcrypt = require("bcryptjs")
const session = require("express-session")

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

async function buildAccountHome(req, res, next) {
  let nav = await utilities.getNav()
  let messages = req.flash()

  res.render("account/account", {
    title: "My Account",
    nav,
    messages
  })
}
// async function registerAccount(account_firstname, account_lastname, account_email, account_password){
//   try {
//     const regResult = await accountModel.accountRegister(
//     account_firstname,
//     account_lastname,
//     account_email,
//     hashedPassword
//   )
//     const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
//     return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
//   } catch (error) {
//     return error.message
//   }
// }

// Hash the password before storing
  // let hashedPassword
  // try {
  //   // regular password and cost (salt is generated automatically)
  //   hashedPassword = await bcrypt.hashSync(account_password, 10)
  // } catch (error) {
  //   req.flash("notice", 'Sorry, there was an error processing the registration.')
  //   res.status(500).render("account/register", {
  //     title: "Registration",
  //     nav,
  //     errors: null,
  //   })
  // }


module.exports = {
  buildLogin,
  buildAccountHome,
}
