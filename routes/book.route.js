const express = require("express");
const router = express.Router();
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const Book = require("../models/book.model");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 },
});

router.get("/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    console.error("Erreur lors de la récupération des livres :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des livres" });
  }
});

router.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });
    res.json(book);
  } catch (error) {
    console.error("Erreur lors de la récupération du livre :", error);
    res.status(500).json({ message: "Erreur lors de la récupération du livre" });
  }
});

router.post("/books", upload.single("image"), async (req, res) => {
  try {
    const { book } = req.body;
    const parsedBook = JSON.parse(book);

    let imageUrl = "";
    if (req.file) {
      if (!fs.existsSync("uploads")) {
        fs.mkdirSync("uploads");
      }
      const filename = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join("uploads", filename);

      await sharp(req.file.buffer).resize({ width: 800 }).jpeg({ quality: 80 }).toFile(filePath);

      imageUrl = `/uploads/${filename}`;
    }

    const newBook = new Book({
      ...parsedBook,
      imageUrl,
      averageRating: 0,
      ratings: [],
    });

    const savedBook = await newBook.save();
    res.status(201).json({ message: "Livre ajouté avec succès", book: savedBook });
  } catch (error) {
    console.error("Erreur lors de l'ajout du livre :", error);
    res.status(500).json({ message: "Erreur lors de l'ajout du livre", error: error.message });
  }
});

module.exports = router;
