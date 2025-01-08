const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Setup multer storage 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir); 
      console.log("Folder 'uploads/' dibuat");
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname); // Nama file unik
    console.log("Menyimpan file dengan nama:", uniqueName);
    cb(null, uniqueName);
  },
});

// Type Middleware
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error(
      "Tipe file tidak valid, hanya gambar (jpeg, jpg, png) yang diperbolehkan"
    );
    error.status = 400;
    return cb(error, false);
  }
  cb(null, true);
};

// Multer config
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, //  5MB
  },
  fileFilter: fileFilter,
}).single("file"); 

//error handling
module.exports = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ message: "Multer error", error: err.message });
    } else if (err) {
      return res
        .status(400)
        .json({ message: "Error upload", error: err.message });
    }

    next();
  });
};
