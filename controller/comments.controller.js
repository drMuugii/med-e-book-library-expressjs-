const ExceptionalError = require("../utils/exceptionalError");
const asyncHandler = require("../middleware/asyncHandler");
const paginateSequelize = require("../utils/paginateSequelize");

exports.getComment = asyncHandler(async (req, res, next) => {
  let comment = await req.db.comment.findByPk(req.params.id);

  if (!comment) {
    throw new ExceptionalError(
      `${req.params.id} -- ийм id тай comment олдсонгүй`,
      400
    );
  }

  res.status(200).json({
    sucsess: true,
    user: await comment.getUser(),
    book: await comment.getBook(),
    // magic: Object.keys(req.db.comment.prototype),
    data: comment,
  });
});

exports.getComments = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginateSequelize(page, limit, req.db.comment);

  let query = { offset: pagination.start - 1, limit };

  if (req.query) {
    query.where = req.query;
  }

  if (select) {
    query.attributes = select;
  }

  if (sort) {
    query.order = sort
      .split(" ")
      .map((el) => [
        el.charAt(0) === "-" ? el.substring(1) : el,
        el.charAt(0) === "-" ? "DESC" : "ASC",
      ]);
  }

  const comments = await req.db.comment.findAll(query);

  res.status(200).json({
    sucsess: true,
    data: comments,
    pagination,
  });
});

exports.createComment = asyncHandler(async (req, res, next) => {
  const comment = await req.db.comment.create(req.body);

  res.status(200).json({
    sucsess: true,
    data: comment,
  });
});

exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await req.db.comment.findByPk(req.params.id);

  if (!comment) {
    throw new ExceptionalError(
      `${req.params.id} -- ийм id тай comment олдсонгүй`,
      400
    );
  }

  comment = await comment.update(req.body);

  res.status(200).json({
    success: true,
    data: comment,
  });
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
  let comment = await req.db.comment.findByPk(req.params.id);

  if (!comment) {
    throw new ExceptionalError(
      `${req.params.id} -- ийм id тай comment олдсонгүй`,
      400
    );
  }

  comment.destroy(req.body);

  res.status(200).json({
    sucsess: true,
    data: comment,
  });
});

// ! Lazy loading : сонгосон user ийн comment ийг дагуулж дуудах код
exports.getUserComments = asyncHandler(async (req, res, next) => {
  let user = await req.db.user.findByPk(req.params.id);

  if (!user) {
    throw new ExceptionalError(
      `${req.params.id} -- ийм id тай хэрэглэгч олдсонгүй`,
      400
    );
  }

  let comments = await user.getComments();

  res.status(200).json({
    sucsess: true,
    user,
    comments,
  });
});

// ! Eager loading : (нэг query гээр цөөн үйлдлээр,database талдаа хөнгөхөн амархан уншдаг) сонгосон book ийн comment ийг дагуулж дуудах код
exports.getBookComment = asyncHandler(async (req, res, next) => {
  let book = await req.db.book.findByPk(req.params.id, {
    include: req.db.comment,
  });

  if (!book) {
    throw new ExceptionalError(
      `${req.params.id} -- ийм id тай book олдсонгүй`,
      400
    );
  }

  res.status(200).json({
    sucsess: true,
    book,
  });
});
