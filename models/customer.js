module.exports = (sequelize, Sequelize) => {
  const Customer = sequelize.define(
    "tbl_customers",
    {
      user_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      broker_id: {
        type: Sequelize.INTEGER,
      },
      alice_client_id: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      twoFA: {
        type: Sequelize.STRING,
      },
      mobile_no: {
        type: Sequelize.STRING,
      },
      plan_id: {
        type: Sequelize.INTEGER,
      },
      plan_category_id: {
        type: Sequelize.INTEGER,
      },
      plan_start_date: {
        type: Sequelize.DATE,
      },
      plan_end_date: {
        type: Sequelize.DATE,
      },
      plan_status: {
        type: Sequelize.INTEGER,
      },
      payment_id: {
        type: Sequelize.STRING,
      },
      payment_date: {
        type: Sequelize.DATE,
      },
      payment_amount: {
        type: Sequelize.DECIMAL,
      },
      gst_amount: {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      payment_status: {
        type: Sequelize.STRING,
      },
      charting_id: {
        type: Sequelize.STRING,
      },
      charting_password: {
        type: Sequelize.STRING,
      },
      charting_ip: {
        type: Sequelize.STRING,
      },
      cust_p_l: {
        type: Sequelize.DECIMAL,
      },
      plan_start_date: {
        type: Sequelize.DATE,
      },
      otp: {
        type: Sequelize.INTEGER,
      },
      coupon_code: {
        type: Sequelize.STRING,
      },
      token: {
        type: Sequelize.TEXT,
      },
      expires_in: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.TEXT,
      },
      is_live_trade: {
        type: Sequelize.BOOLEAN,
        default: false,
      },
      status: {
        type: Sequelize.BOOLEAN,
      },
      terms_condition: {
        type: Sequelize.BOOLEAN,
      },
      last_login_time: {
        type: Sequelize.DATE,
      },
      last_login_time_insert: {
        type: Sequelize.DATE,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
      },
      updated_by: {
        type: Sequelize.INTEGER,
      },
      broker_client_id: {
        type: Sequelize.STRING,
      },
      broker_client_password: {
        type: Sequelize.STRING,
      },
      broker_portal_login: {
        type: Sequelize.INTEGER,
      },
      broker_client_twoFA: {
        type: Sequelize.STRING,
      },
      role: {
        type: Sequelize.ENUM,
        values: ["USER", "DEALER", "UNDER_DEALER"],
      },
      auto_renew: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    { timestamps: false, freezeTableName: true }
  );

  return Customer;
};
