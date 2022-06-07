module.exports = (sequelize, Sequelize) => {
  const brokerPLReport = sequelize.define(
    "tbl_broker_pl_report",
    {
      client_name: {
        type: Sequelize.STRING,
      },
      client_id: {
        type: Sequelize.STRING,
      },
      exchange: {
        type: Sequelize.STRING,
      },
      symbol_name: {
        type: Sequelize.STRING,
      },
      product: {
        type: Sequelize.STRING,
      },
      buy_qty: {
        type: Sequelize.INTEGER,
      },
      sell_qty: {
        type: Sequelize.INTEGER,
      },
      p_and_l: {
        type: Sequelize.DECIMAL,
      },
    },
    { timestamps: true }
  );

  return brokerPLReport;
};
