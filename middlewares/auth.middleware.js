const jwt = require("jsonwebtoken");
require("dotenv").config();

//middleware for users verifications
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    res.status(403).json(new Error("non authorisé"));
  }
};
