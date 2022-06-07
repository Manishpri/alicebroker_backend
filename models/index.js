const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(
//     config.database,
//     config.username,
//     config.password,
//     config
//   );
// }
sequelize = new Sequelize('dematade', 'root', '12345', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: 'false',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});


fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.customer = require("./customer")(sequelize, Sequelize);
db.brokerChartingKey = require("./broker_charting_key")(sequelize, Sequelize);
db.tblSymbolMasterSwastika = require("./tbl_symbol_master_swastika")(
  sequelize,
  Sequelize
);
db.paymentsTable = require("./tbl_payments")(sequelize, Sequelize);
db.brokerPLReport = require("./tbl_broker_pl_report")(sequelize, Sequelize);

module.exports = db;
