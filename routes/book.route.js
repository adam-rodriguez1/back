const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const bookController = require("../controllers/book.controller");

// Routes publiques
router.get("/books", bookController.getAllBooks);
router.get("/books/bestrating", bookController.getBestRatedBooks);
router.get("/books/:id", bookController.getBookById);
router.post("/books/:id/rating", bookController.rateBook); // Pas d'auth ici

// Routes protégées
router.post("/books", authMiddleware, upload.single("image"), bookController.createBook);
router.put("/books/:id", authMiddleware, upload.single("image"), bookController.updateBook);
router.delete("/books/:id", authMiddleware, bookController.deleteBook);

module.exports = router;
