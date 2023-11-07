/**
 * ?    RESTful API ийн мөрдөх 6 дизайн:
 * * 1. Client / Server архитехтурs
 * * 2. Нэгдсэн интерфэйсээр хандах (uniform interface)
 * * 3. Server талын app ийн төлөвийг хадгалж явах ёсгүй (stateless)
 * * 4. Төрөл бүрийн шатанд Cache лэх боломжтой
 * * 5. Тусдаа бие даан ажиллах үе давхрагуудаас тогтох (layered)
 * * 6. Шаардлагатай үед server ээс Client руу нэмэлт код өгөх (code on demand)
 */

const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const rfs = require("rotating-file-stream");
const connectDB = require("./config/db");
const colors = require("colors"); // *terminal дээрх мэссэжийг өнгөтэй болгох lib
const errorHandler = require("./middleware/error.middleware");
var morgan = require("morgan");
const logger = require("./middleware/logger.middleware");
const fileUpload = require("express-fileupload");
//  Router оруулж ирэх
const categoriesRoutes = require("./routes/categories.route");
const booksRoutes = require("./routes/books.route");
const usersRoutes = require("./routes/users.route");
const commentsRoutes = require("./routes/comments.route");
const injectDB = require("./middleware/injectDB.middleware");
const cors = require("cors");

// App ийн тохиргоог process.env рүү ачааллах
dotenv.config({ path: "./config/config.env" });

const db = require("./config/db-mysql");

const app = express();

connectDB(); // DB холбож байгааг тохиргооны dotenv.config ийн доор бичигдэх ёстой

// create a write stream (in append mode)
var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});

// var whitelist = [
//   "http://localhost:5500",
//   "http://localhost:5501",
//   "http://localhost:8000",
// ];
// var corsOptions = {
//   origin: function (origin, callback) {
//     console.log(origin);
//     if (whitelist.indexOf(origin) !== -1) {
//       // зөвшөөрсөн
//       callback(null, true);
//     } else {
//       // зөвшөөрөхгүй
//       callback(new Error("horigloj baina by CORS"));
//     }
//   },
// };

app.use(express.json()); // Body parser буюу req д обектээр орж ирсэн мэссэж болгоны body хэсгийг шалгаад хэрэв json өгөгдөл байвал  req ийн body хэсэгт хийж өгөөрэй гэдэг express.json() код
// app.use(cors(corsOptions)); // cors ийн хамгаалалт
app.use(fileUpload());
app.use(logger);
app.use(injectDB(db));
app.use(morgan("combined", { stream: accessLogStream }));
app.use("/api/v1/categories", categoriesRoutes); // categories controllor дуудаж байгаа
app.use("/api/v1/books", booksRoutes); // book controllor дуудаж байгаа
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/comments", commentsRoutes);

app.use(errorHandler); // заавал controllor дуудаж бга кодны доор бичнэ

// MYSQL руу sync хийх код

db.user.belongsToMany(db.book, { through: db.comment });
db.book.belongsToMany(db.user, { through: db.comment });

db.user.hasMany(db.comment);
db.comment.belongsTo(db.user);

db.book.hasMany(db.comment);
db.comment.belongsTo(db.book);

db.category.hasMany(db.book);
db.book.belongsTo(db.category);

db.sequelize
  .sync()
  .then((result) => {
    console.log("Sync хийгдлээ");
  })
  .catch((err) => console.log(err));

const server = app.listen(
  process.env.Port,
  console.log(
    `Express server ${process.env.Port} порт дээр аяслаа...`.rainbow.bold
  )
);

// server дээр гарсан алдааг terminal дээр барьж авах код
process.on("unhandledRejection", (err, promise) => {
  console.log(`Алдаа гарлаа: ${err.message}`.red.underline.bold);
  server.close(() => {
    process.exit(1);
  });
});
