const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const Upload = require("../models/uploadModel"); 

// Fungsi untuk mengonversi waktu saat ini ke format WIB (Asia/Jakarta)
function getWIBTime() {
  const now = new Date(); // Waktu saat ini
  const options = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  // Menggunakan Intl.DateTimeFormat untuk memformat waktu
  const formatter = new Intl.DateTimeFormat("id-ID", options);
  return formatter.format(now); // Mengembalikan string waktu dalam format WIB
}

// Fungsi untuk mengonversi string WIB ke objek Date untuk MongoDB
function parseWIBTime(dateString) {
  const [day, month, year, hour, minute, second] = dateString
    .replace(/,/g, "") // Hapus koma
    .split(/[\s/:.]/); // Pisahkan berdasarkan spasi, garis miring, atau titik

  // Membuat objek Date dengan zona waktu lokal
  const date = new Date(year, month - 1, day, hour, minute, second);

  // Menyesuaikan dengan UTC+7 (WIB)
  const offset = 7 * 60 * 60 * 1000; // Offset dalam milidetik
  return new Date(date.getTime() - offset); // Simpan sebagai UTC
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

    const uploadTimeString = getWIBTime(); // Dapatkan waktu dalam format WIB
    const tanggalUpload = parseWIBTime(uploadTimeString); // Konversi ke objek Date

    // Simpan informasi file dan hasil AI ke MongoDB
    const uploadData = new Upload({
      tanggalUpload: uploadTimeString, // Simpan sebagai objek Date
      volumeBatu: volumeBatu,
      jumlahBatu: jumlahBatu,
      namaFile: req.file.filename,
    });

    // // Menyimpan ke MongoDB
    // await uploadData.save();

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
