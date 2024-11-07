const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const processImage = async (fileBuffer, originalName) => {
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  const cleanName = originalName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_");

  const filename = `${Date.now()}-${cleanName}`;
  const filePath = path.join("uploads", filename);

  await sharp(fileBuffer).resize({ width: 800 }).jpeg({ quality: 80 }).toFile(filePath);

  return `http://localhost:4000/uploads/${filename}`;
};

module.exports = processImage;
