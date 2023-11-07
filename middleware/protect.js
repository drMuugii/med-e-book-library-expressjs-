const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const ExceptionalError = require("../utils/exceptionalError");
const User = require("../models/User.model");

exports.protect = asyncHandler(async (req, res, next) => {
  if (!req.headers.authorization) {
    throw new ExceptionalError(
      "Энэ үйлдлийг хийхэд таны эрх хүрэгүй байна. Та эхлээд Логин хийнэ үү эсвэл Authoriziotion header дээрээ TOKEN ээ дамжуулна уу",
      401
    );
  }

  // web ийн header ийн authorization дотроох token ийг салгахж авах
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    throw new ExceptionalError("Token байхгүй байна", 400);
  }
  // token ийг зөв эсэхийг шалгах
  const tokenObj = jwt.verify(token, process.env.JWT_SECRET);

  console.log(tokenObj);

  req.userId = tokenObj.id; // tokenObj дотор user Id оруулж өгч байна
  req.userRole = tokenObj.role; // tokenObj дотор user role оруулж өгч байна

  next();
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      throw new ExceptionalError(
        "Таны эрх [" + req.userRole + "] энэ үйлдлийг гүйцэтгэхэд хүрэлцэхгүй!",
        403
      );
    }

    next();
  };
};
