const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "user",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(245),
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      password: {
        type: DataTypes.CHAR(10),
        allowNull: false,
      },
      // ? Virtual талбар үүсгэх - зөвхөн getUserComments route дээр ажиллаж байгаа
      about: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.name} - ${this.email} (${this.role})`;
        },
      },
    },
    {
      sequelize,
      tableName: "user",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
