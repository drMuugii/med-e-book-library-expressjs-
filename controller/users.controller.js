const User = require("../models/User.model");
const path = require("path");
const ExceptionalError = require("../utils/exceptionalError");
// const asyncHandler = require("../middleware/asyncHandler");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

//user register
exports.registerUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  const token = user.getJsonWebToken();

  res.status(200).json({
    sucsess: true,
    token,
    user: user,
  });
});

exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // оролтыг шалгана
  if (!email || !password) {
    throw new ExceptionalError("Имэйл, Нууц үгээ дамжуулна уу", 400);
  }
  // Тухайн хэрэглэгчийг хайна

  const user = await User.findOne({ email }).select("+password"); // "+password" нууц үгийг user дотроо хадгалах

  if (!user) {
    throw new ExceptionalError("Имэйл, Нууц үгээ зөв оруулна уу 1", 401);
  }

  //  олсон хэрэглэгчийн нууц үгийг шалгана
  const ok = await user.checkPassword(password);

  if (!ok) {
    throw new ExceptionalError("Имэйл, Нууц үгээ зөв оруулна уу 2", 401);
  }

  res.status(200).json({
    sucsess: true,
    token: user.getJsonWebToken(),
    user: user,
  });
});

exports.getUsers = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, User);

  const users = await User.find(req.query, select)
    .skip(pagination.start - 1)
    .sort(sort)
    .limit(limit);

  res.status(200).json({
    sucsess: true,
    data: users,
    pagination,
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ExceptionalError(
      req.params.id + "ID-тэй хэрэглэгч олдсонгүй!",
      400
    );
  }

  res.status(200).json({
    sucsess: true,
    data: user,
  });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(200).json({
    sucsess: true,
    data: user,
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ExceptionalError(
      req.params.id + "---> ID-тай хэрэглэгч олдсонгүй",
      400
    );
  }

  res.status(200).json({
    sucsess: true,
    data: user,
    message: "АМЖИЛТТАЙ ЗАСВАРЛАГДЛАА",
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ExceptionalError(
      req.params.id + "--->ID-тай хэрэглэгч олдсонгүй",
      400
    );
  }

  user.remove();

  res.status(200).json({
    sucsess: true,
    data: user,
    message: "АМЖИЛТТАЙ УСТГАГДЛАА",
  });
});

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    throw new ExceptionalError("Нууц үг сэргээх имэйл хаягаа оруулна уу!", 400);
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new ExceptionalError(req.body.email + "Имэйл хаяг олдсонгүй !", 400);
  }

  const resetToken = user.generatePasswordChangeToken();
  user.save();

  // await user.save({ valitadeBeforeSave: false });  // шалгалт хийхгүй хүчээр хадгалах

  // * Имэйл илгээнэ
  const link = `http://medebook.mn/changepassword/${resetToken}`;

  const message = ` Сайна байна уу <br><br> Та нууц үгээ солих хүсэлт илгээлээ <br> Нууц үгээ доорх линк дээр дарж солино уу <br><br>
  <a target="_blanks" href="${link}">${link}</a><br><br>Өдрийг сайхан өнгөрүүлээрэй`;

  const info = await sendEmail({
    email: user.email,
    subject: "Нууц үг өөрчлөх хүсэлт",
    message,
  });

  console.log("Message sent: %s", info.messageId);

  res.status(200).json({
    sucsess: true,
    resetToken,
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.resetToken || !req.body.password) {
    throw new ExceptionalError("Та Token болон нууц үгээ дамжуулна уу!", 400);
  }

  const encrypted = crypto
    .createHash("sha256")
    .update(req.body.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: encrypted,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ExceptionalError("Хүчингзй TOKEN байна", 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = user.getJsonWebToken();

  res.status(200).json({
    sucsess: true,
    token,
    user: user,
  });
});
