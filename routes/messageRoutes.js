const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const utilities = require("../utilities/");

router.use(utilities.checkJWTToken); // secure all routes

router.get("/inbox", messageController.inbox);
router.get("/archive", messageController.archive);
router.get("/compose", messageController.showComposeForm);
router.post("/send", messageController.sendMessage);
router.get("/view/:id", messageController.viewMessage);
router.post("/archive", messageController.handleArchive);
router.post("/delete", messageController.handleDelete);
router.post("/toggle-read", messageController.toggleRead);

module.exports = router;