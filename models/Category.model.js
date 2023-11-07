const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Категорийн нэрийг оруулна уу"],
      unique: true,
      trim: true,
      maxlength: [50, "Катергоирийн нэр 50 тэмдэгт байх ёстой"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Категорийн тайлбарыг оруулна уу"],
      maxlength: [500, "Катергоирийн тайлбарыг 500 тэмдэгт байх ёстой"],
    },
    picture: {
      type: String,
      default: "no-picture.jpg",
    },
    averagePrice: Number,
    averageRating: {
      type: Number,
      min: [1, "Үнэлгээ хамгийн багадаа 1 байх ёстой"],
      max: [10, "Үнэлгээ хамгийн ихдээ 10 байх ёстой"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Категорийн мэдээлэл доор Book с нэмэлт мэдээлэл оруулах
// CategorySchema.virtual("booksInfo", {
//   ref: "Book", // ? ямар model тэй холбогдох гэж байгааг заана
//   localField: "_id", // ? category.model ийн аль талбарийг ашиглаж болхогдохыг зааж өгнө
//   foreignField: "category", //? book ийн юу тай бологдох ийг зааж өгнө. book.model ийн "category" property тай fk ээр холбоно
//   justOne: true,
// });

CategorySchema.pre("remove", async function (next) {
  console.log("removing ....");
  await this.model("Book").deleteMany({ category: this._id });
  next();
});

CategorySchema.pre("save", function (next) {
  // Slug ийг ашиглаж name ийг хөрвүүлэх код.
  this.slug = slugify(this.name);
  this.averageRating = Math.floor(Math.random() * 10) + 1;
  // Дундаж үнэ автоматаар бичигдэх код--> UPDATED book model дээр шинэ ном нэмэгдхэд энэ тооцолол хийгддэл болсон
  // this.averagePrice = Math.floor(Math.random() * 100000) + 3000;
  next();
});

module.exports = mongoose.model("Category", CategorySchema);
