const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getCategories,
  createCategory,
  getCategory,
  updateCategories,
  deleteCategories,
} = require("../controller/categories.controller");

//  "/api/v1/categories" -->
router
  .route("/")
  .get(getCategories)
  .post(protect, authorize("admin"), createCategory);

router
  .route("/:id")
  .get(getCategory)
  .put(protect, authorize("admin", "operator"), updateCategories)
  .delete(protect, authorize("admin"), deleteCategories);

//  ! * "/api/v1/categories/:id/books" --> Номны route ийг холбов -UPDATED ашиглахаа болив
// const booksRouter = require("./books.route");
// router.use("/:categoryId/books", booksRouter);

//  * "/api/v1/categories/:id/books" --> Номны controller той холбов.
const { getCategoryBooks } = require("../controller/books.controller");
router.route("/:categoryId/books").get(getCategoryBooks);

module.exports = router;
