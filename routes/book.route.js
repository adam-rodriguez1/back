const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer.middleware");
const bookController = require("../controllers/book.controller");

router.get("/books", bookController.getAllBooks);
router.get("/books/:id", bookController.getBookById);
router.post("/books", upload.single("image"), bookController.createBook);
router.get("/books/bestrating", bookController.getBestRatedBooks);

router.delete("/books/:id", bookController.deleteBook);
router.put("/books/:id", upload.single("image"), bookController.updateBook);

module.exports = router;
