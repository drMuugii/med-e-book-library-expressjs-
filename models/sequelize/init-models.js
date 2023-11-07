var DataTypes = require("sequelize").DataTypes;
var _book = require("./book");
var _category = require("./category");
var _comment = require("./comment");
var _user = require("./user");

function initModels(sequelize) {
  var book = _book(sequelize, DataTypes);
  var category = _category(sequelize, DataTypes);
  var comment = _comment(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  comment.belongsTo(book, { as: "book", foreignKey: "bookId" });
  book.hasMany(comment, { as: "comments", foreignKey: "bookId" });
  book.belongsTo(category, { as: "category", foreignKey: "categoryId" });
  category.hasMany(book, { as: "books", foreignKey: "categoryId" });
  comment.belongsTo(user, { as: "user", foreignKey: "userId" });
  user.hasMany(comment, { as: "comments", foreignKey: "userId" });

  return {
    book,
    category,
    comment,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
