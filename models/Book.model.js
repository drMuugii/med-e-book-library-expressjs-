const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const BookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Номын нэрийг оруулна уу"],
      unique: true,
      trim: true,
      maxlength: [150, "Номын нэр 150 тэмдэгтээс хэтрэхгүй  байх ёстой"],
    },
    author: {
      type: String,
      required: [true, "Зохиогчын нэрийг оруулна уу"],
      trim: true,
      maxlength: [250, "Зохиогчын нэр 250 тэмдэгт байх ёстой"],
    },
    content: {
      type: String,
      trim: true,
      maxlength: [5000, "Номын тухай мэдээлэл дээд тал нь 5000 тэмдэгт"],
    },
    picture: {
      type: String,
      default: "no-picture.jpg",
    },
    price: {
      type: Number,
      min: [10000, "Үнэ хамгийн багадаа 10000 байх ёстой"],
      // required: [true, "Номын үнэ оруулна уу"],
    },
    rating: {
      type: Number,
      min: [1, "Үнэлгээ хамгийн багадаа 1 байх ёстой"],
      max: [10, "Үнэлгээ хамгийн ихдээ 10 байх ёстой"],
    },
    available: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },

    category: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Category",
      // justOne: false,
    },
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    updateUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Aggregate ашиглан категорийн номын дундаж үнийг тооцоолох Mongoose static функц болон post save middleware ашиглах
BookSchema.statics.computeCategoryAveragePrice = async function (catId) {
  const obj = await this.aggregate([
    { $match: { category: catId } },
    { $group: { _id: "$category", avgPrice: { $avg: "$price" } } },
  ]);

  console.log(obj);
  let avgPrice = null;

  if (obj.length > 0) avgPrice = obj[0].avgPrice;

  await this.model("Category").findByIdAndUpdate(catId, {
    averagePrice: avgPrice,
  });

  return obj;
};

BookSchema.post("save", function () {
  this.constructor.computeCategoryAveragePrice(this.category);
});

BookSchema.post("remove", function () {
  this.constructor.computeCategoryAveragePrice(this.category);
});

// author ийн овог нэрийг салгах код virtual ашиглав
BookSchema.virtual("Book.author").get(function () {
  if (!this.author) return "";
  let tokens = this.author.split(" ");
  if (tokens.length === 1) this.author.split(".");
  if (tokens.length === 2) return tokens[1];
  return tokens[0];
});

module.exports = mongoose.model("Book", BookSchema);
