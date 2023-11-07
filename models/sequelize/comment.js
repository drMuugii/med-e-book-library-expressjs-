const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "comment",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "book",
          key: "id",
        },
      },
      comments: {
        type: DataTypes.STRING(250),
        allowNull: false,
        // ? getter func - ашиглаж comment ийн эхний үсэгийг томоор болгох код
        get() {
          let comments = this.getDataValue("comments").toLowerCase();
          return comments.charAt(0).toUpperCase() + comments.slice(1);
        },
        // ? setter func - ашиглаж орж ирсэн утгыг өөрчлөх. Жш зохисгүй үгийг өөр үгээр солих
        set(value) {
          this.setDataValue("comments", value.replace("тэнэг", "тиймэрхүү"));
        },
      },
    },
    {
      sequelize,
      tableName: "comment",
      timestamps: true,
    }
  );
};
