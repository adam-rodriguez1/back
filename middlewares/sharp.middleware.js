const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const processImage = async (fileBuffer, originalName) => {
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  // Nettoyage du nom de fichier : remplace les espaces et caractères spéciaux par des underscores
  const cleanName = originalName
    .normalize("NFD") // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-zA-Z0-9.\-_]/g, "_"); // Remplace les caractères spéciaux

  const filename = `${Date.now()}-${cleanName}`;
  const filePath = path.join("uploads", filename);

  console.log("Chemin complet de l'image à enregistrer :", filePath);

  await sharp(fileBuffer).resize({ width: 800 }).jpeg({ quality: 80 }).toFile(filePath);

  console.log("Image traitée et enregistrée avec succès :", filename);

  return `http://localhost:4000/uploads/${filename}`;
};

module.exports = processImage;
