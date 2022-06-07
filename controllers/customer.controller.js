const db = require("../models");
const axios = require("axios");
const { Op } = require("sequelize");
const { decrypt } = require("../utils/encrypt");
const Customer = db.customer;
const SymbolTokenTable = db.tblSymbolMasterSwastika;
const PaymentTable = db.paymentsTable;
const PLReportTable = db.brokerPLReport;
const config = require(__dirname + "/../config/config.json");
const moment = require("moment");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "rzp_live_FszRm0UAwMx601",
  key_secret: "pp4wRLhBnGowan9SDnzDljVn",
});

exports.create = (req, res) => {
  const customer = {
    user_type_id: 2,
    broker_id: 1,
    name: "Paras Gadhiya",
    email: "paras.gadhiya@gmail.com",
    broker_client_password: "paras",
    broker_client_id: "ABCD12345",
    broker_client_twoFA: "paras",
    mobile_no: "9664834708",
    plan_id: 1,
    plan_category_id: 2,
    plan_start_date: new Date("2021-02-14"),
    plan_end_date: new Date("2022-02-13"),
    plan_status: true,
    charting_id: "6666385",
    charting_password: "data385",
    charting_ip: "78.129.179.141",
    otp: 1234,
    coupon_code: "MYDEALER",
    is_live_trade: true,
    status: true,
    terms_condition: true,
    last_login_time: new Date("2022-01-18 16:01:59"),
    last_login_time_insert: new Date("2022-01-19 11:28:46"),
    created_by: 0,
    updated_by: 1,
    role: "DEALER",
  };

  // Save Customer in the database
  Customer.create(customer)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the customer.",
      });
    });
};

exports.addCustomer = async (req, res) => {
  console.log(req.body,'reqqqqq')
  const broker = await Customer.findOne({ where: { id: req?.body?.brokerId } });
  const userExist = await Customer.findOne({
    where: {
      broker_client_id: req?.body?.broker_client_id,
      is_deleted: false,
    },
  });
  if (userExist) {
    return res.send({
      error: "User already existed with this clientID",
      success: false,
    });
  }
  const user = {
    user_type_id: 3,
    broker_id: 1,
    name: req?.body?.name,
    email: broker?.email,
    broker_client_id: req?.body?.broker_client_id,
    broker_client_password: req?.body?.password,
    broker_client_twoFA: req?.body?.twoFA,
    plan_id: 1,
    plan_start_date: new Date(),
    plan_end_date: new Date().setDate(new Date().getDate() + 7),
    created_by: broker?.id,
    role: "UNDER_DEALER",
  };
  Customer.create(user)
    .then((data) => {
      return res.send({ user: data, success: true });
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || "Some error occurred while adding the user.",
      });
    });
};

exports.editCustomer = async (req, res) => {
  console.log(req.body)
  const user = await Customer.findOne({ where: { id: req?.body?.userId } });
  if (!user) {
    return res.status(400).send({
      error: "User not found",
      success: false,
    });
  }
  const data = req?.body;
  user
    .update({
      name: data?.name,
      broker_client_password: data?.password,
      broker_client_twoFA: data?.twoFA,
    })
    .then((updatedUser) => {
      return res.send({ user: updatedUser, success: true });
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || "Some error occurred while editing the user.",
      });
    });
};

exports.getUsers = async (req, res) => {
  const users = await Customer.findAll({
    where: {
      created_by: req?.body?.brokerId,
      is_deleted: false,
    },
  });
  return res.send({ users, success: true });
};

exports.deleteUser = async (req, res) => {
  console.log(req.body)
  const user = await Customer.findOne({
    where: {
      id: req?.body?.userId,
    },
  });
  if (!user) {
    return res.status(400).send({
      error: "User not found",
      success: false,
    });
  }
  user
    .update({ 
      is_deleted: true,

     })
    .then((updatedUser) => {
      return res.send({ user: updatedUser, success: true });
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || "Some error occurred while deleting the user.",
      });
    });
};

exports.getAllUserLogin = async (req, res) => {
  const users = await Customer.findAll({
    where: {
      created_by: req?.body?.brokerId,
      is_deleted: false,
    },
  });

  const fireAllLogin = users
    ?.filter(
      (user) =>
        new Date(user?.plan_end_date)?.getTime() + 5.76e7 > new Date().getTime()
    )
    ?.map(async (user) => {
      return await axios.post("http://localhost:9002/accesstoken", {
        app_id: config.app_id,
        api_secret: config.api_secret,
        username: user?.broker_client_id,
        password: user?.broker_client_password,
        twoFA: user?.broker_client_twoFA,
      });
    });
  try {
    const values = await Promise.all(fireAllLogin);
    if (values?.length == 0) {
      throw new Error("Login Failed..");
    }
    await Promise.all(
      values?.map(async (value) => {
        return await Customer.update(
          {
            token: value?.data?.access_token,
            is_live_trade: value?.data?.access_token ? true : false,
          },
          {
            where: {
              broker_client_id: JSON.parse(value?.config?.data)?.username,
            },
          }
        );
      })
    );
    const finalUsers = await Customer.findAll({
      where: {
        created_by: req?.body?.brokerId,
        is_deleted: false,
      },
    });
    return res.send({ users: finalUsers, success: true });
  } catch (err) {
    return res.send({
      message: err.message || "Some error occurred while logging the user.",
      success: false,
      status:500
    });
  }
};

exports.getSingleUserLogin = async (req, res) => {
  try {
    const user = await Customer.findOne({
      where: {
        id: req?.body?.userId,
      },
    });
    if (user?.token) {
      return res.status(400).send({
        error: "User already loggedin..",
        success: false,
      });
    }
    if (new Date(user?.plan_end_date)?.getTime() < new Date().getTime()) {
      return res.status(404).send({
        error: "Plan expired..",
        success: false,
      });
    }
    const value = await axios.post("http://localhost:9002/accesstoken", {
      app_id: config.app_id,
      api_secret: config.api_secret,
      username: user?.broker_client_id,
      password: user?.broker_client_password,
      twoFA: user?.broker_client_twoFA,
    });

    if (!value?.data?.access_token) {
      return res.status(400).send({
        error: "token not found",
        success: false,
      });
    }

    const updatedUser = await user.update({
      token: value?.data?.access_token,
      is_live_trade: true,
    });
    return res.send({ user: updatedUser, success: true });
  } catch (err) {
    return res.status(500).send({
      message: err.message || "Some error occurred while logging the user.",
    });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await Customer.findOne({
      where: {
        id: req?.body?.userId,
      },
    });
    if (!user) {
      return res.status(400).send({
        error: "User not found...",
        success: false,
      });
    }
    if (!user?.token) {
      return res.status(400).send({
        error: "User not loggedin",
        success: false,
      });
    }
    const updatedUser = await user.update({
      is_live_trade: req?.body?.status,
    });
    return res.send({ user: updatedUser, success: true });
  } catch (err) {
    return res.status(500).send({
      message: err.message || "Some error occurred while logging the user.",
    });
  }
};

exports.getSymbols = async (req, res) => {
  try {
    const resp = await axios.get(
      `https://ant.aliceblueonline.com/api/v1/search?key=${req.query?.key}`
    );
    return res.send({ symbols: resp.data?.result, success: true });
  } catch (err) {
    return res.status(500).send({
      message: err.message || "Some error occurred while logging the user.",
    });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    if (req?.method === "GET") {
      const queryData = req?.query?.order?.split("|");
      const charting_key = queryData[6];
      const exchange = queryData[1];
      let symbol_token;
      if (exchange === "NFO" || exchange === "MCX" || exchange === "CDS") {
        const orderType = queryData[2];
        if (
          orderType == "stocknfo" ||
          orderType == "bankniftynfo" ||
          orderType == "niftynfo"
        ) {
          let searchSymbol = await SymbolTokenTable.findOne({
            where: { actual_symbol_name: queryData[0] },
          });
          let finalSymbol = `${queryData[0]} ${moment(
            searchSymbol?.dataValues?.expiry_date
          )
            .format("MMM")
            ?.toUpperCase()} FUT`;
          symbol_token = await axios.get(
            `https://ant.aliceblueonline.com/api/v1/search?key=${finalSymbol}`
          );
          symbol_token.data.result = symbol_token.data.result?.filter(
            (item) => {
              return (
                item?.symbol ===
                `${queryData[0]}${moment(searchSymbol?.dataValues?.expiry_date)
                  .format("YYMMM")
                  ?.toUpperCase()}FUT`
              );
            }
          );
        } else if (orderType == "bankniftyoption") {
          let subOrderType = queryData[0]?.split("_")[0];
          if (subOrderType == "BNCW") {
            let searchSymbol = await SymbolTokenTable.findOne({
              where: { actual_symbol_name: "BANKNIFTY" },
            });
            let finalSymbol = `BANKNIFTY ${queryData[0]?.split("_")[1]} CE`;
            symbol_token = await axios.get(
              `https://ant.aliceblueonline.com/api/v1/search?key=${finalSymbol}`
            );
            const isEndOfMonth =
              searchSymbol?.dataValues?.expiry_date?.length === 3;
            symbol_token.data.result = symbol_token.data.result?.filter(
              (item) => {
                return (
                  item?.symbol ===
                  `BANKNIFTY${
                    isEndOfMonth
                      ? moment().format("YYMMM")?.toUpperCase()
                      : moment(searchSymbol?.dataValues?.expiry_date)
                          .format("YYMDD")
                          ?.toUpperCase()
                  }${queryData[0]?.split("_")[1]}CE`
                );
              }
            );
          } else if (subOrderType == "BNPW") {
            let searchSymbol = await SymbolTokenTable.findOne({
              where: { actual_symbol_name: "BANKNIFTY" },
            });
            let finalSymbol = `BANKNIFTY ${queryData[0]?.split("_")[1]} PE`;
            symbol_token = await axios.get(
              `https://ant.aliceblueonline.com/api/v1/search?key=${finalSymbol}`
            );
            const isEndOfMonth =
              searchSymbol?.dataValues?.expiry_date?.length === 3;
            symbol_token.data.result = symbol_token.data.result?.filter(
              (item) => {
                return (
                  item?.symbol ===
                  `BANKNIFTY${
                    isEndOfMonth
                      ? moment().format("YYMMM")?.toUpperCase()
                      : moment(searchSymbol?.dataValues?.expiry_date)
                          .format("YYMDD")
                          ?.toUpperCase()
                  }${queryData[0]?.split("_")[1]}PE`
                );
              }
            );
          }
        } else if (orderType == "niftyoption") {
          let subOrderType = queryData[0]?.split("_")[0];
          if (subOrderType == "NFWC") {
            let searchSymbol = await SymbolTokenTable.findOne({
              where: { actual_symbol_name: "NIFTY" },
            });
            let finalSymbol = `NIFTY ${queryData[0]?.split("_")[1]} CE`;
            symbol_token = await axios.get(
              `https://ant.aliceblueonline.com/api/v1/search?key=${finalSymbol}`
            );
            const isEndOfMonth =
              searchSymbol?.dataValues?.expiry_date?.length === 3;
            symbol_token.data.result = symbol_token.data.result?.filter(
              (item) => {
                return (
                  item?.symbol ===
                  `NIFTY${
                    isEndOfMonth
                      ? moment().format("YYMMM")?.toUpperCase()
                      : moment(searchSymbol?.dataValues?.expiry_date)
                          .format("YYMDD")
                          ?.toUpperCase()
                  }${queryData[0]?.split("_")[1]}CE`
                );
              }
            );
          } else if (subOrderType == "NFWP") {
            let searchSymbol = await SymbolTokenTable.findOne({
              where: { actual_symbol_name: "NIFTY" },
            });
            let finalSymbol = `NIFTY ${queryData[0]?.split("_")[1]} PE`;
            symbol_token = await axios.get(
              `https://ant.aliceblueonline.com/api/v1/search?key=${finalSymbol}`
            );
            const isEndOfMonth =
              searchSymbol?.dataValues?.expiry_date?.length === 3;
            symbol_token.data.result = symbol_token.data.result?.filter(
              (item) => {
                return (
                  item?.symbol ===
                  `NIFTY${
                    isEndOfMonth
                      ? moment().format("YYMMM")?.toUpperCase()
                      : moment(searchSymbol?.dataValues?.expiry_date)
                          .format("YYMDD")
                          ?.toUpperCase()
                  }${queryData[0]?.split("_")[1]}PE`
                );
              }
            );
          }
        } else if (orderType == "mcxnfo") {
          let searchSymbol = await SymbolTokenTable.findOne({
            where: { exchange: "MCX", actual_symbol_name: queryData[0] },
          });
          let finalSymbol = `${queryData[0]} ${moment(
            searchSymbol?.dataValues?.expiry_date
          )
            .format("MMM")
            ?.toUpperCase()} FUT`;
          symbol_token = await axios.get(
            `https://ant.aliceblueonline.com/api/v1/search?key=${finalSymbol}`
          );
        } else if (orderType == "nsecurrency") {
          let searchSymbol = await SymbolTokenTable.findOne({
            where: { exchange: "CDS", actual_symbol_name: queryData[0] },
          });
          let finalSymbol = `${queryData[0]} ${moment(
            searchSymbol?.dataValues?.expiry_date
          )
            .format("MMM")
            ?.toUpperCase()} FUT`;

          symbol_token = await axios.get(
            `https://ant.aliceblueonline.com/api/v1/search?key=${finalSymbol}`
          );
          symbol_token.data.result = symbol_token.data.result?.filter(
            (item) => {
              return (
                item?.symbol ===
                `${queryData[0]}${moment(searchSymbol?.dataValues?.expiry_date)
                  .format("YYMMM")
                  ?.toUpperCase()}FUT`
              );
            }
          );
        }
      } else {
        symbol_token = await axios.get(
          `https://ant.aliceblueonline.com/api/v1/search?key=${queryData[0]}`
        );
      }
      const quantity = queryData[5];
      const order_side = queryData[4];
      const product = queryData[3];
      const decryptedKey = decrypt({
        encryptedData: charting_key,
      });
      const users = decryptedKey?.split(";")?.slice(0, -1);
      const values = await Promise.all(
        users?.map(async (user) => {
          let orderDetails = {
            exchange: exchange,
            order_type: "MARKET",
            instrument_token: symbol_token?.data?.result?.[0]?.token,
            quantity: Number(quantity),
            order_side: order_side,
            validity: "DAY",
            product: product,
            client_id: user,
            user_order_id: 0,
            device: "WEB",
          };
          const userData = await Customer.findOne({
            where: {
              broker_client_id: user,
            },
          });
          if (!userData?.is_live_trade) {
            return null;
          }
          return await axios.post(
            "https://ant.aliceblueonline.com/api/v1/orders",
            { ...orderDetails },
            { headers: { Authorization: `Bearer ${userData?.token}` } }
          );
        })
      );
      return res
        .status(200)
        .send({ message: "Order placed successfully..", success: true });
    } else {
      const decryptedKey = decrypt({
        encryptedData: req.body?.charting_key,
      });
      const users = decryptedKey?.split(";")?.slice(0, -1);
      const values = await Promise.all(
        users?.map(async (user) => {
          let orderDetails = {
            exchange: req.body?.exchange,
            order_type: "MARKET",
            instrument_token: req.body?.symbol_token,
            quantity: Number(req.body?.quantity),
            order_side: req.body?.order_side,
            validity: "DAY",
            product: req.body?.product,
            client_id: user,
            user_order_id: 0,
            device: "WEB",
          };
          const userData = await Customer.findOne({
            where: {
              broker_client_id: user,
            },
          });
          if (!userData?.is_live_trade) {
            return null;
          }
          return await axios.post(
            "https://ant.aliceblueonline.com/api/v1/orders",
            { ...orderDetails },
            { headers: { Authorization: `Bearer ${userData?.token}` } }
          );
        })
      );
      return res
        .status(200)
        .send({ message: "Order placed successfully..", success: true });
    }
  } catch (error) {
    return res.status(500).send({
      error: error?.message || "Some error occurred while placing order",
      success: false,
    });
  }
};

exports.getOrdersHistory = async (req, res) => {
  try {
    const orderHistory = [];
    const users = await Customer.findAll({
      where: {
        created_by: req?.body?.brokerId,
        is_deleted: false,
      },
    });
    const results = await Promise.all(
      users
        ?.filter((item) => item?.dataValues?.token)
        ?.map(async (user) => {
          return await axios.get(
            `https://ant.aliceblueonline.com/api/v1/orders?type=completed&client_id=${user?.broker_client_id}`,
            {
              headers: { Authorization: `Bearer ${user?.dataValues?.token}` },
            }
          );
        })
    );
    return res.status(200).send({
      orders: results?.map((result) =>
        result?.data?.data?.orders?.map((order) => {
          return {
            ...order,
            client_name: users?.find(
              (user) => user?.broker_client_id === order?.client_id
            )?.name,
          };
        })
      ),
      success: true,
    });
  } catch (error) {
    return res.status(500).send({
      error: error?.message || "Some error occurred while placing order",
      success: false,
    });
  }
};

exports.getPositions = async (req, res) => {
  try {
    // const positions = [];
    const users = await Customer.findAll({
      where: {
        created_by: req?.body?.brokerId,
        is_deleted: false,
      },
    });
    const results = await Promise.all(
      users
        ?.filter((item) => item?.dataValues?.token)
        ?.map(async (user) => {
          return await axios.get(
            `https://ant.aliceblueonline.com/api/v1/positions?type=historical&client_id=${user?.broker_client_id}`,
            {
              headers: { Authorization: `Bearer ${user?.dataValues?.token}` },
            }
          );
        })
    );
    return res.status(200).send({
      positions: results?.map((result) =>
        result?.data?.data?.map((position) => {
          return {
            ...position,
            client_name: users?.find(
              (user) => user?.broker_client_id === position?.client_id
            )?.name,
          };
        })
      ),
      success: true,
    });
  } catch (error) {
    return res.status(500).send({
      error: error?.message || "Some error occurred while getting position",
      success: false,
    });
  }
};

exports.squareOffOrder = async (req, res) => {
  try {
    let orderDetails = {
      exchange: req.body?.exchange,
      order_type: "MARKET",
      instrument_token: req.body?.symbol_token,
      quantity: Number(req.body?.quantity),
      order_side: req.body?.order_side,
      validity: "DAY",
      product: req.body?.product,
      client_id: req.body?.client_id,
      user_order_id: 0,
      device: "WEB",
    };
    const userData = await Customer.findOne({
      where: {
        broker_client_id: req.body?.client_id,
      },
    });
    if (!userData?.is_live_trade) {
      return res.status(500).send({
        error: "Square off failed due to user status off...",
        success: false,
      });
    }
    await axios.post(
      "https://ant.aliceblueonline.com/api/v1/orders",
      { ...orderDetails },
      { headers: { Authorization: `Bearer ${userData?.token}` } }
    );
    return res
      .status(200)
      .send({ message: "Order Squared off successfully..", success: true });
  } catch (error) {
    return res.status(500).send({
      error: error?.message || "Some error occurred while square off order",
      success: false,
    });
  }
};

exports.setPaymentData = async (req, res) => {
  try {
    const response = await razorpay.payments.fetch(
      req?.body?.razorpay_payment_id
    );
    if (!response?.captured) {
      return res.status(500).send({
        error: "Payment capture failed..",
        success: false,
      });
    }
    const user = await Customer.findOne({ where: { id: req?.body?.userId } });

    const payment = {
      razorpay_payment_id: req?.body?.razorpay_payment_id,
      customer_id: req?.body?.userId,
      order_id: req?.body?.razorpay_order_id,
      plan_id: 11,
      amount: Number((response?.amount / 100) * 0.82),
      gst: Number((response?.amount / 100) * 0.18),
      plan_end_date: moment().add(1, "M"),
      status: "captured",
      method: response?.method,
      fee: Number(response?.fee / 100),
      pay_date: new Date(),
    };
    await PaymentTable.create(payment);
    const updatedUser = await user.update({
      plan_id: 11,
      plan_end_date: moment().add(1, "M"),
      plan_status: 1,
      payment_id: req?.body?.razorpay_payment_id,
      payment_date: new Date(),
      payment_amount: Number((response?.amount / 100) * 0.82),
      gst_amount: Number((response?.amount / 100) * 0.18),
    });
    return res.status(200).send({ user: updatedUser, success: true });
  } catch (error) {
    return res.status(500).send({
      error: error?.message || "Some error occurred while payment",
      success: false,
    });
  }
};

exports.getPLReport = async (req, res) => {
  try {
    const clientIds = req.body.clientIds;
    const startDate = new Date(`${req.body?.startDate} 00:00:00`);
    const endDate = new Date(`${req.body?.endDate} 00:00:00`);
    let PLData = await Promise.all(
      clientIds?.map((clientId) => {
        return PLReportTable.findAll({
          where: {
            client_id: clientId,
            [Op.or]: [
              {
                createdAt: {
                  [Op.between]: [startDate, endDate],
                },
              },
            ],
          },
        });
      })
    );
    return res
      .status(200)
      .send({ report: []?.concat.apply([], PLData), success: true });
  } catch (error) {
    return res.status(500).send({
      error: error?.message || "Some error occurred while fetching P&L report",
      success: false,
    });
  }
};
