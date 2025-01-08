const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const Upload = require("../models/uploadModel"); 

// Time conversion
function getWIBTime() {
  const now = new Date(); 
  const options = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  // Formatter
  const formatter = new Intl.DateTimeFormat("id-ID", options);
  return formatter.format(now); 
}


exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang diunggah." });
  }

  const filePath = req.file.path;

  try {
    const image = fs.createReadStream(filePath);
    const form = new FormData();
    form.append("file", image);

    const aiApiUrl = "http://localhost:5000/upload"; // Endpoint AI lokal
    const aiResponse = await axios.post(aiApiUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log("Respons dari API AI:", aiResponse.data);

    const volumeBatu = parseFloat(aiResponse.data.batu_percentage);
    const jumlahBatu = aiResponse.data.jumlah_batu
      ? parseInt(aiResponse.data.jumlah_batu, 10)
      : 1;

    if (isNaN(volumeBatu)) {
      throw new Error("Volume batu yang diterima dari AI tidak valid.");
    }

    const uploadTimeString = getWIBTime(); 

    // Save result
    const uploadData = new Upload({
      tanggalUpload: uploadTimeString, 
      volumeBatu: volumeBatu,
      jumlahBatu: jumlahBatu,
      namaFile: req.file.filename,
    });

    res.status(200).json({
      message: "File dan data batu berhasil disimpan",
      uploadTime: uploadTimeString, // Tampilkan dalam format WIB
      file: req.file.filename,
      data: uploadData,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      message:
        "Terjadi kesalahan saat memproses gambar atau berkomunikasi dengan AI.",
      error: error.message,
    });
  } finally {
    // Hapus file setelah proses selesai
    fs.unlink(filePath, (err) => {
      if (err) console.error("Gagal menghapus file:", err);
    });
  }
};
