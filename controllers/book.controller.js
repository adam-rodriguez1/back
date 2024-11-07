const processImage = require("../middlewares/sharp.middleware.js");
const fs = require("fs");
const path = require("path");
const Book = require("../models/book.model.js");
const mongoose = require("mongoose");

exports.getBestRatedBooks = async (req, res) => {
  try {
    const bestRatedBooks = await Book.find().sort({ averageRating: -1 }).limit(3);
    if (!bestRatedBooks || bestRatedBooks.length === 0) {
      return res.status(404).json(new Error());
    }
    res.status(200).json(bestRatedBooks);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json(new Error());
    }
    res.json(book);
  } catch (error) {
    res.status(500).json(error);
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

    const newBook = new Book({ ...parsedBook, imageUrl, ratings: [], averageRating: 0 });
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json(new Error());
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json(new Error());
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

exports.updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json(new Error());
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json(new Error());
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

exports.rateBook = async (req, res) => {
  try {
    const { userId, rating } = req.body;
    const bookId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json(new Error());
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json(new Error());
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json(new Error());
    }

    if (book.ratings.find((r) => r.userId === userId)) {
      return res.status(400).json(new Error());
    }

    book.ratings.push({ userId, grade: rating });
    book.averageRating = book.ratings.reduce((sum, r) => sum + r.grade, 0) / book.ratings.length;

    await book.save();
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json(error);
  }
};
