const processImage = require("../middlewares/sharp.middleware.js");
const fs = require("fs");
const path = require("path");
const Book = require("../models/book.model.js");
const mongoose = require("mongoose");

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des livres" });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du livre" });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { book } = req.body;
    const parsedBook = JSON.parse(book);

    let imageUrl = "";
    if (req.file) {
      imageUrl = await processImage(req.file.buffer, req.file.originalname);
    }

    const newBook = new Book({
      ...parsedBook,
      imageUrl,
      ratings: [],
      averageRating: 0,
    });

    const savedBook = await newBook.save();
    res.status(201).json({ message: "Livre ajouté avec succès", book: savedBook });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout du livre" });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log(`ID reçu : ${bookId}`);

    // Vérifiez si l'ID est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      console.log("ID invalide");
      return res.status(400).json({ message: "ID invalide" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      console.log("Livre non trouvé dans la base de données");
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    // Suppression
    const imagePath = path.join(__dirname, "../uploads", path.basename(book.imageUrl));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log("Image supprimée avec succès");
    }

    await Book.findByIdAndDelete(bookId);
    console.log("Livre supprimé avec succès :", bookId);
    res.status(200).json({ message: "Livre supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

exports.getBestRatedBooks = async (req, res) => {
  try {
    const bestRatedBooks = await Book.find().sort({ averageRating: -1 }).limit(3);
    console.log("Meilleurs livres récupérés :", bestRatedBooks);

    if (!bestRatedBooks || bestRatedBooks.length === 0) {
      return res.status(404).json({ message: "Aucun livre trouvé" });
    }

    res.status(200).json(bestRatedBooks);
  } catch (error) {
    console.error("Erreur lors de la récupération des meilleurs livres :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des meilleurs livres", error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log(`ID reçu pour mise à jour : ${bookId}`);

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    let updatedData = {};

    if (req.body.book) {
      updatedData = JSON.parse(req.body.book);
    } else {
      updatedData = req.body;
    }

    if (req.file) {
      console.log("Nouvelle image reçue");

      const oldImagePath = path.join(__dirname, "../uploads", path.basename(book.imageUrl));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log("Ancienne image supprimée");
      }

      const newImageUrl = await processImage(req.file.buffer, req.file.originalname);
      console.log("Nouvelle URL d'image :", newImageUrl);
      updatedData.imageUrl = newImageUrl;
    }

    console.log("Données envoyées pour mise à jour :", updatedData);

    const updatedBook = await Book.findByIdAndUpdate(bookId, updatedData, { new: true });
    console.log("Livre mis à jour :", updatedBook);

    res.status(200).json({ message: "Livre mis à jour avec succès", book: updatedBook });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du livre" });
  }
};
