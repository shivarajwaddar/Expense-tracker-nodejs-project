const Sequelize = require("sequelize");
const sequelize = require("../util/db-connection");

const DownloadedFile = sequelize.define("downloadedFile", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fileUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  fileName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = DownloadedFile;
