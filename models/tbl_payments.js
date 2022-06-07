module.exports = (sequelize, Sequelize) => {
  const paymentsTable = sequelize.define(
    "tbl_payments",
    {
      razorpay_payment_id: {
        type: Sequelize.STRING,
      },
      customer_id: {
        type: Sequelize.INTEGER,
      },
      order_id: {
        type: Sequelize.STRING,
      },
      category_id: {
        type: Sequelize.INTEGER,
      },
      plan_id: {
        type: Sequelize.INTEGER,
      },
      amount: {
        type: Sequelize.DECIMAL,
      },
      gst: {
        type: Sequelize.DECIMAL,
      },
      plan_start_date: {
        type: Sequelize.DATE,
      },
      plan_end_date: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.STRING,
      },
      error_code: {
        type: Sequelize.STRING,
      },
      method: {
        type: Sequelize.STRING,
      },
      fee: {
        type: Sequelize.DECIMAL,
      },
      pay_date: {
        type: Sequelize.DATE,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    { timestamps: false, freezeTableName: true }
  );

  return paymentsTable;
};
