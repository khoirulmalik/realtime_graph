const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  tanggalUpload: {
    type: String,
    required: true, 
  },
  volumeBatu: {
    type: Number,
    required: true, 
  },
  jumlahBatu: {
    type: Number,
    required: true, 
  },
  namaFile: {
    type: String,
    required: true, 
  },
});

//model schema
const Upload = mongoose.model("Upload", uploadSchema);

module.exports = Upload;
