const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getBooks,
  getBook,
  createBook,
  deleteBook,
  updateBook,
  uploadBookPic,
} = require("../controller/books.controller");

const { getBookComment } = require("../controller/comments.controller");

const router = express.Router(); // номны route ийг өөр route ашиглаж болох код -->UPDATED ашиглахаа болив

//  * "/api/v1/books" -->
router
  .route("/")
  .get(getBooks)
  .post(protect, authorize("admin", "operator"), createBook);

router.use(protect);
//  * "/api/v1/books/:id" -->
router
  .route("/:id")
  .get(getBook)
  .delete(authorize("admin", "operator"), deleteBook)
  .put(authorize("admin", "operator"), updateBook);

//  * "/api/v1/books/:id/upload-pic" -->
router
  .route("/:id/upload-pic")
  .put(authorize("admin", "operator"), uploadBookPic);

//  * MYSQL * "/api/v1/books/:id/comments" -->
router
  .route("/:id/comments")
  .get(authorize("admin", "operator"), getBookComment);

module.exports = router;
