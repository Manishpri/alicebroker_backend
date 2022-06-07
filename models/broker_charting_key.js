module.exports = (sequelize, Sequelize) => {
  const BrokerChartingKey = sequelize.define("broker_charting_key", {
    group_name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    charting_key: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    dealer_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    is_deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });

  return BrokerChartingKey;
};
