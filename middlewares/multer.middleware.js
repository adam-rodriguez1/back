const multer = require("multer");
// limitation for upload at 2 mo
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = upload;
