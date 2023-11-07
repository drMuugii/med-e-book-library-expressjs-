const Book = require("../models/Book.model");
const path = require("path");
const Category = require("../models/Category.model");
const ExceptionalError = require("../utils/exceptionalError");
// const asyncHandler = require("../middleware/asyncHandler");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const User = require("../models/User.model");

// ? "/api/v1/books" -->
exports.getBooks = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;
  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Book);

  const books = await Book.find(req.query, select)
    .populate({
      path: "category",
      select: "name description averagePrice",
    })
    .skip(pagination.start - 1)
    .sort(sort)
    .limit(limit);

  res.status(200).json({
    sucsess: true,
    count: books.length,
    data: books,
    pagination,
  });
});

// ? "/api/v1/categories/:catId/books" -->
exports.getCategoryBooks = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Book);

  // req.query, select
  const books = await Book.find(
    { ...req.query, category: req.params.categoryId },
    select
  )
    .skip(pagination.start - 1)
    .sort(sort)
    .limit(limit);

  res.status(200).json({
    sucsess: true,
    count: books.length,
    data: books,
    pagination,
  });
});

exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new ExceptionalError(
      req.params.id + "-->Id-тэй ном байхгүй байна.",
      404
    );
  }

  res.status(200).json({
    sucsess: true,
    data: book,
  });
});

exports.createBook = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.body.category);

  if (!category) {
    throw new ExceptionalError(
      req.body.category + "ID-тэй категори байхгүй!",
      400
    );
  }

  req.body.createUser = req.userId;

  const book = await Book.create(req.body);

  res.status(200).json({
    sucsess: true,
    data: book,
  });
});

exports.updateBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new ExceptionalError(req.params.id + "---> ID-тай ном байхгүй", 400);
  }
  // эхлээд Логин хийсэн хүн дараа нь тухайн номыг үүсгэсэн хүнийг шалгана. Хэрэв мөн бол цааш үйлдлыг хийнэ
  if (book.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new ExceptionalError(
      "Та зөвхөн өөрийнхөө номыг засварлах эрхтэй",
      403
    );
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    book[attr] = req.body[attr];
    console.log(attr);
  }

  book.save();

  res.status(200).json({
    sucsess: true,
    data: book,
    message: "АМЖИЛТТАЙ ЗАСВАРЛАГДЛАА",
  });
});

exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new ExceptionalError(
      req.params.id + "-->Id-тэй ном байхгүй байна.",
      400
    );
  }

  if (book.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new ExceptionalError(
      "Та зөвхөн өөрийнхөө номыг засварлах эрхтэй",
      403
    );
  }

  const user = await User.findById(req.userId);

  book.remove();

  res.status(200).json({
    sucsess: true,
    data: book,
    deletedUser: user.name,
    message: "АМЖИЛТТАЙ УСТГАГДЛАА",
  });
});

// api/books/:id/pic -->  Номын зураг оруулах
exports.uploadBookPic = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new ExceptionalError(req.params.id + "---> ID-тай ном байхгүй", 400);
  }

  // pic upload хийх код
  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    throw new ExceptionalError("Та заавал зураг upload хийнэ уу", 400);
  }

  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new ExceptionalError(
      "Зургын файлын хэмжээ хэтэрсэн байна = 100кб",
      400
    );
  }
  // upload хийж байгаа файлыг pic_bookId.extention болгох код
  file.name = `pic_${req.params.id}${path.parse(file.name).ext}`;

  // upload хийсэн файлыг өөрийн фолдэрт зөөх
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, (err) => {
    if (err) {
      throw new ExceptionalError(
        "Файл хуулах явцад алдаа гарлаа-->" + err.message,
        400
      );
    }
    //  номын шинээр орж ирсэн picture ээр picture ийн нэрийг солих
    book.picture = file.name;
    book.save();

    res.status(200).json({
      success: true,
      data: file.name,
      message: "АМЖИЛТТАЙ UPLOAD ХИЙГДЛЭЭ",
    });
  });
});

exports.getUserBooks = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;
  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Book);

  req.query.createUser = req.userId;

  console.log(req.query);

  const books = await Book.find(req.query, select)
    .populate({
      path: "category",
      select: "name description averagePrice",
    })
    .skip(pagination.start - 1)
    .sort(sort)
    .limit(limit);

  res.status(200).json({
    sucsess: true,
    count: books.length,
    data: books,
    pagination,
  });
});
