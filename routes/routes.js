// routes.js
const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/chart", (req, res) => {
  res.sendFile("chart.html", { root: path.join(__dirname, "../public") }); // Update path to public folder
});

router.get("/form", (req, res) => {
  res.sendFile("form.html", { root: path.join(__dirname, "../public") }); // Update path to public folder
});

router.get("/uploadss", (req, res) => {
  res.sendFile("test.html", { root: path.join(__dirname, "../public") }); // Update path to public folder
});

router.get("/allinone", (req, res) => {
  res.sendFile("uhuy.html", { root: path.join(__dirname, "../public") }); // Update path to public folder
});

module.exports = router;
