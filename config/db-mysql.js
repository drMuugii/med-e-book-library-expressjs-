const Sequelize = require("sequelize");

var db = {};

const sequelize = new Sequelize(
  process.env.SEQUELIZE_DATABASE,
  process.env.SEQUELIZE_USER,
  process.env.SEQUELIZE_USER_PASSWORD,
  {
    host: process.env.SEQUELIZE_HOST,
    port: process.env.SEQUELIZE_PORT,
    dialect: process.env.SEQUELIZE_DIALECT,
    define: {
      freezeTableName: true,
    },
    pool: {
      max: 10, // connnection
      min: 0, // connnection
      acquire: 60000, // хүлээх хугацаа 60сек
      idle: 10000, // connection ийг 10 сек хүлээнэ
    },
    operatorAliases: false, // $gt, $lt гэх мэт syntax ийг дамжуулахгүй
  }
);

const models = [
  require("../models/sequelize/book"),
  require("../models/sequelize/user"),
  require("../models/sequelize/comment"),
  require("../models/sequelize/category"),
];

models.forEach((model) => {
  const seqModel = model(sequelize, Sequelize);
  db[seqModel.name] = seqModel;
});

db.sequelize = sequelize;

module.exports = db;
