const pool = require("../database/");

async function registerAccount(account_firstname, account_lastname, account_email, hashedPassword) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword,
    ]);
  } catch (error) {
    return error.message;
  }
}

async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
}

async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query("SELECT * FROM account WHERE account_email = $1", [account_email]);
    return result.rows[0];
  } catch (error) {
    return null;
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail };
