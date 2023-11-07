const Category = require("../models/Category.model");
const ExceptionalError = require("../utils/exceptionalError");
const asyncHandler = require("../middleware/asyncHandler");
const paginate = require("../utils/paginate");

exports.getCategories = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Category);

  const categories = await Category.find(req.query, select)
    .skip(pagination.start - 1)
    .sort(sort)
    .limit(limit);

  res.status(200).json({
    sucsess: true,
    data: categories,
    pagination,
  });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate("booksInfo");

  if (!category) {
    throw new ExceptionalError(req.params.id + "ID-тэй категори байхгүй!", 405);
  }

  res.status(200).json({
    sucsess: true,
    data: category,
  });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);

  res.status(200).json({
    sucsess: true,
    data: category,
  });
});

exports.updateCategories = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new ExceptionalError(
      req.params.id + "---> ID-тай категиор байхгүй",
      400
    );
  }

  res.status(200).json({
    sucsess: true,
    data: category,
    message: "АМЖИЛТТАЙ ЗАСВАРЛАГДЛАА",
  });
});

exports.deleteCategories = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ExceptionalError(
      req.params.id + "--->ID-тай категиор байхгүй",
      400
    );
  }

  category.remove();

  res.status(200).json({
    sucsess: true,
    data: category,
    message: "АМЖИЛТТАЙ УСТГАГДЛАА",
  });
});
