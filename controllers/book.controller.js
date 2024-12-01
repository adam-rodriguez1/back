const processImage = require("../middlewares/sharp.middleware.js");
const fs = require("fs");
const path = require("path");
const Book = require("../models/book.model.js");

// fonction to get the three best rated books
exports.getBestRatedBooks = async (req, res) => {
  try {
    const bestRatedBooks = await Book.find().sort({ averageRating: -1 }).limit(3);

    res.status(200).json(bestRatedBooks);
  } catch (error) {
    res.status(500).json(error);
  }
};
//to get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json(error);
  }
};
// to get a book by id
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json(new Error("id du livre incorrecte"));
    }
    res.json(book);
  } catch (error) {
    res.status(500).json(error);
  }
};
// to create a new book with a image and average rating set to 0
exports.createBook = async (req, res) => {
  try {
    const { book } = req.body;
    const parsedBook = JSON.parse(book);
    let imageUrl = "";
    if (req.file) {
      imageUrl = await processImage(req.file.buffer, req.file.originalname);
    }

    const newBook = new Book({ ...parsedBook, imageUrl, ratings: [], averageRating: 0 });
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(500).json(error);
  }
};
// to delete a book
exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json(new Error("id du livre incorrecte"));
    }
    if (book.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer ce livre." });
    }

    const imagePath = path.join(__dirname, "../uploads", path.basename(book.imageUrl));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Book.findByIdAndDelete(bookId);
    res.status(200).json();
  } catch (error) {
    res.status(500).json(error);
  }
};
// to update a book
exports.updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (book.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer ce livre." });
    }

    let updatedData = req.body.book ? JSON.parse(req.body.book) : req.body;
    if (req.file) {
      const oldImagePath = path.join(__dirname, "../uploads", path.basename(book.imageUrl));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      const newImageUrl = await processImage(req.file.buffer, req.file.originalname);
      updatedData.imageUrl = newImageUrl;
    }

    const updatedBook = await Book.findByIdAndUpdate(bookId, updatedData, { new: true });
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(500).json(error);
  }
};
// to rate a book, and average rating
exports.rateBook = async (req, res) => {
  try {
    const rating = req.body.rating;
    const userId = req.userId;
    const bookId = req.params.id;

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: "La note doit être entre 0 et 5." });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Livre introuvable." });
    }

    const existingRating = book.ratings.find((entry) => entry.userId === userId);
    if (existingRating) {
      return res.status(400).json({ message: "Vous avez déjà noté ce livre." });
    }

    book.ratings.push({ userId, grade: rating });

    let totalSum = 0;
    book.ratings.forEach((entry) => {
      totalSum += entry.grade;
    });
    book.averageRating = Math.round((totalSum / book.ratings.length) * 10) / 10;

    await book.save();
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "Erreur interne.", error: error.message });
  }
};
