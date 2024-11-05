const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const router = express.Router();

require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;
console.log("Clé secrète :", SECRET_KEY);
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Début de la vérification de l'utilisateur avec email :", email);

    // Vérifier l'existence de l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier le mot de passe
    console.log("Utilisateur trouvé. Vérification du mot de passe.");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Générer le token JWT
    console.log("Mot de passe valide. Génération du token.");
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
    console.log("Token généré :", token);

    // Envoyer la réponse
    res.json({ userId: user._id, token });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur lors de la connexion", error: error.message });
  }
});

module.exports = router;
