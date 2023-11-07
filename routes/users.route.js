const express = require("express");

const {
  registerUser,
  loginUser,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  forgetPassword,
  resetPassword,
} = require("../controller/users.controller");
const { getUserBooks } = require("../controller/books.controller");
const { getUserComments } = require("../controller/comments.controller");
const { protect, authorize } = require("../middleware/protect");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forget-password").post(forgetPassword);
router.route("/reset-password").post(resetPassword);

router.use(protect); // энэ мөрнөөс доошх бүх router үүд protect ийг ашиглана

//  * /api/v1/users -->
router
  .route("/")
  .get(authorize("admin", "operator"), getUsers)
  .post(authorize("admin"), createUser);
router
  .route("/:id")
  .get(authorize("admin", "operator"), getUser)
  .put(authorize("admin"), updateUser)
  .delete(authorize("admin"), deleteUser);

router.route("/:id/books").get(getUserBooks);

// * MYSQL /api/v1/users/:id/comments -->
router
  .route("/:id/comments")
  .get(authorize("admin", "operator"), getUserComments);
module.exports = router;
