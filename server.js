const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bookRoutes = require("./routes/book.route.js");
const authRoutes = require("./routes/auth.route.js");
const app = express();

mongoose
  .connect("mongodb+srv://bob:FqviE6vVZWZSACuJ@coursback.6hzbk.mongodb.net/Projet6", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.error("Erreur de connexion à MongoDB:", err));

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api", bookRoutes);

const PORT = 4000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
