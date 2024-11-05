const express = require("express");
const router = express.Router();
const Book = require("../models/book.model.js");

router.get("/books", async (req, res) => {
  try {
    const books = await Book.find();

    if (books.length === 0) {
      return res.status(404).json({ message: "No Books Available" });
    }
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/books/bestrating", async (req, res) => {
  try {
    const topBooks = await Book.find().sort({ averageRating: -1 }).limit(3);

    res.json(topBooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
