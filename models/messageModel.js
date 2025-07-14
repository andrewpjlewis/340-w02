const pool = require("../database/");

async function createMessage(subject, body, to, from) {
  const sql = `
    INSERT INTO message (message_subject, message_body, message_to, message_from)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const result = await pool.query(sql, [subject, body, to, from]);
  return result.rows[0];
}

async function getInbox(account_id) {
  const sql = `
    SELECT m.*, a.account_firstname, a.account_lastname
    FROM message m
    JOIN account a ON m.message_from = a.account_id
    WHERE message_to = $1 AND message_archived = FALSE
    ORDER BY message_created DESC;
  `;
  const result = await pool.query(sql, [account_id]);
  return result.rows;
}

async function getArchived(account_id) {
  const sql = `
    SELECT m.*, a.account_firstname, a.account_lastname
    FROM message m
    JOIN account a ON m.message_from = a.account_id
    WHERE message_to = $1 AND message_archived = TRUE
    ORDER BY message_created DESC;
  `;
  const result = await pool.query(sql, [account_id]);
  return result.rows;
}

async function getMessageById(message_id, account_id) {
  const sql = `
    SELECT m.*, f.account_firstname AS sender_firstname, f.account_lastname AS sender_lastname
    FROM message m
    JOIN account f ON m.message_from = f.account_id
    WHERE m.message_id = $1 AND (m.message_to = $2 OR m.message_from = $2);
  `;
  const result = await pool.query(sql, [message_id, account_id]);
  return result.rows[0];
}

async function markAsRead(message_id, account_id) {
  const sql = `
    UPDATE message SET message_read = TRUE
    WHERE message_id = $1 AND message_to = $2;
  `;
  return await pool.query(sql, [message_id, account_id]);
}

async function archiveMessage(message_id, account_id) {
  const sql = `
    UPDATE message SET message_archived = TRUE
    WHERE message_id = $1 AND message_to = $2;
  `;
  return await pool.query(sql, [message_id, account_id]);
}

async function unarchiveMessage(message_id, account_id) {
  const sql = `
    UPDATE message SET message_archived = FALSE
    WHERE message_id = $1 AND message_to = $2;
  `;
  return await pool.query(sql, [message_id, account_id]);
}

async function deleteMessage(message_id, account_id) {
  const sql = `
    DELETE FROM message WHERE message_id = $1 AND message_to = $2;
  `;
  return await pool.query(sql, [message_id, account_id]);
}

async function getUnreadCount(account_id) {
  const sql = `
    SELECT COUNT(*) FROM message
    WHERE message_to = $1 AND message_read = FALSE AND message_archived = FALSE;
  `;
  const result = await pool.query(sql, [account_id]);
  return parseInt(result.rows[0].count);
}

async function getArchivedCount(account_id) {
  const sql = `
    SELECT COUNT(*) FROM message
    WHERE message_to = $1 AND message_archived = TRUE;
  `;
  const result = await pool.query(sql, [account_id]);
  return parseInt(result.rows[0].count);
}

async function setReadStatus(message_id, account_id, status) {
  const sql = `
    UPDATE message SET message_read = $3
    WHERE message_id = $1 AND message_to = $2;
  `;
  return await pool.query(sql, [message_id, account_id, status]);
}

module.exports = {
  createMessage,
  getInbox,
  getArchived,
  getMessageById,
  markAsRead,
  archiveMessage,
  unarchiveMessage,
  deleteMessage,
  getUnreadCount,
  getArchivedCount,
  setReadStatus,
};