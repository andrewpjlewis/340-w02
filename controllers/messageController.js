const messageModel = require("../models/messageModel");
const accountModel = require("../models/account-model");
const utilities = require("../utilities");

async function inbox(req, res) {
  const nav = await utilities.getNav();
  const messages = await messageModel.getInbox(res.locals.accountData.account_id);
  const unreadCount = await messageModel.getUnreadCount(res.locals.accountData.account_id);
  const archivedCount = await messageModel.getArchivedCount(res.locals.accountData.account_id);
  
  res.render("messages/inbox", {
    title: "Inbox",
    messages,
    unreadCount,
    archivedCount,
    nav,
  });
}

async function archive(req, res) {
  const nav = await utilities.getNav();
  const messages = await messageModel.getArchived(res.locals.accountData.account_id);
  res.render("messages/archive", {
    title: "Archived Messages",
    messages,
    nav,
  });
}

async function viewMessage(req, res) {
  const nav = await utilities.getNav();
  const message_id = parseInt(req.params.id);
  const account_id = res.locals.accountData.account_id;
  const message = await messageModel.getMessageById(message_id, account_id);
  if (message && !message.message_read && message.message_to === account_id) {
    await messageModel.markAsRead(message_id, account_id);
  }
  res.render("messages/message", {
    title: message.message_subject,
    message,
    nav,
  });
}

async function showComposeForm(req, res) {
  const nav = await utilities.getNav();
  const accounts = await accountModel.getAllAccountsExcept(res.locals.accountData.account_id);
  res.render("messages/compose", {
    title: "New Message",
    accounts,
    nav,
  });
}

async function sendMessage(req, res) {
  const { recipient, subject, body } = req.body;
  const sender = res.locals.accountData.account_id;

  if (!recipient || !subject || !body) {
    req.flash("notice", "All fields are required.");
    return res.redirect("/messages/compose");
  }

  await messageModel.createMessage(subject, body, recipient, sender);
  req.flash("notice", "Message sent successfully.");
  res.redirect("/messages/inbox");
}

async function handleArchive(req, res) {
  const message_id = parseInt(req.body.message_id);
  const account_id = res.locals.accountData.account_id;
  const action = req.body.action || "archive";

  if (action === "unarchive") {
    await messageModel.unarchiveMessage(message_id, account_id);
  } else {
    await messageModel.archiveMessage(message_id, account_id);
  }
  res.redirect("/messages/inbox");
}

async function handleDelete(req, res) {
  const message_id = parseInt(req.body.message_id);
  await messageModel.deleteMessage(message_id, res.locals.accountData.account_id);
  res.redirect("/messages/inbox");
}

async function toggleRead(req, res) {
  const message_id = parseInt(req.body.message_id);
  const account_id = res.locals.accountData.account_id;
  
  const message = await messageModel.getMessageById(message_id, account_id);
  if (!message) {
    req.flash("notice", "Message not found.");
    return res.redirect("/messages/inbox");
  }
  
  const newReadStatus = !message.message_read;
  
  await messageModel.setReadStatus(message_id, account_id, newReadStatus);
  res.redirect(`/messages/view/${message_id}`);
}

module.exports = {
  inbox,
  archive,
  viewMessage,
  showComposeForm,
  sendMessage,
  handleArchive,
  handleDelete,
  toggleRead,
};