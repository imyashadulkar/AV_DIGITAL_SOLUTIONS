import multer from "multer";
// multer logic
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.name);
  }
});

const upload = multer({ storage });
export { upload };
