const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Хэрэглэгчийн нэрийг оруулна уу"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Хэрэглэгчийн email оруулна уу"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "имэйл хаягаа зөв оруулна уу",
    ],
  },
  role: {
    type: String,
    required: [true, "Хэрэглэгчийн эрхийг оруулна уу"],
    enum: ["user", "operator", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Нууц үгээ оруулна уу"],
    minLenght: 4,
    select: false, // хэрэглэгчийн нууц үгийг API аар дамжуулахгүй
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre("save", async function (next) {
  // Нууц үг өөрчлөгдөөгүй бол дараачийн middleware луу шилж
  if (!this.isModified("password")) next();

  // Нууц үг
  console.time("salt");
  const salt = await bcrypt.genSalt(10); //санамсаргүйн тоон утга үүсгэдэг
  console.timeEnd("salt");

  console.time("hash");
  this.password = await bcrypt.hash(this.password, salt);
  console.timeEnd("hash");
});

UserSchema.methods.getJsonWebToken = function () {
  const token = jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRESIN,
    }
  );
  return token;
};

UserSchema.methods.checkPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// нууц үг сэргээх үеийн random token generate хийх. Crypto ашиглах
UserSchema.methods.generatePasswordChangeToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // DB дээр хадгалагдах encrypted утга
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 минут

  console.log(resetToken); // хэрэглэгчид очих утга

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
