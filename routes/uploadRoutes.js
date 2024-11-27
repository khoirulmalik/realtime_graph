const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware"); 
const uploadController = require("../controllers/uploadController");

router.post("/upload", upload, uploadController.uploadImage); 
module.exports = router;
