const multer = require("multer");
const path=require("path")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log("originalfile",file)
      cb(null, path.
        join
        (__dirname,
        `../uploads/`
        ));
    },
    filename: function (req, file, cb) {
      console.log("file ka naam hai",file.originalname)
      cb(null, file.originalname);
    },
  });
  
module.exports.upload = multer({ storage: storage });