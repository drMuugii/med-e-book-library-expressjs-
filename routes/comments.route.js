const express = require("express");
const { protect, authorize } = require("../middleware/protect");
const {
  createComment,
  updateComment,
  deleteComment,
  getComment,
  getComments,
} = require("../controller/comments.controller");
const router = express.Router();

router.use(protect);

//  * "/api/v1/comments" -->
router
  .route("/")
  .post(authorize("admin", "operator", "user"), createComment)
  .get(authorize("admin", "operator", "user"), getComments);

router
  .route("/:id")
  .get(authorize("admin", "operator", "user"), getComment)
  .put(authorize("admin", "operator", "user"), updateComment)
  .delete(authorize("admin"), deleteComment);

module.exports = router;
