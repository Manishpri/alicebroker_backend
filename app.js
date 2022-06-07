const express = require("express");
const cors = require("cors");
const db = require("./models");
const Razorpay = require("razorpay");
const moment = require("moment");
const axios = require("axios");
const { Op } = require("sequelize");

const app = express();

const razorpay = new Razorpay({
  key_id: "rzp_live_FszRm0UAwMx601",
  key_secret: "pp4wRLhBnGowan9SDnzDljVn",
});

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Dematade Backend" });
});

app.post("/api/razorpay", async (req, res) => {
  const payment_capture = 1;
  const amount = 500;
  const currency = "INR";
  const options = {
    amount: amount * 100,
    currency,
    receipt: req?.body?.customerId,
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.log(error);
  }
});

require("./routes/auth.routes")(app);
require("./routes/customer.routes")(app);
require("./routes/broker_charting_key.routes")(app);

var CronJob = require("cron").CronJob;
var job = new CronJob(
  "00 00 00 * * *",
  async function () {
    try {
      await db.customer.update(
        {
          token: null,
          is_live_trade: false,
          broker_portal_login: 0,
        },
        { where: {} }
      );
      await db.customer.update(
        {
          plan_status: 2,
        },
        {
          where: {
            plan_end_date: {
              [Op.lte]: new Date(
                moment().subtract(1, "d").format("YYYY-MM-DD")
              ),
            },
            plan_status: 1,
          },
        }
      );
      await db.customer.update(
        {
          plan_status: 3,
        },
        {
          where: {
            plan_end_date: {
              [Op.lte]: new Date(
                moment().subtract(1, "d").format("YYYY-MM-DD")
              ),
            },
            plan_status: 4,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  },
  null,
  true,
  "Asia/Kolkata"
);

var plJob = new CronJob(
  "00 30 23 * * *",
  async function () {
    try {
      const users = await db.customer.findAll({
        where: {
          is_deleted: false,
        },
      });
      let results = await Promise.all(
        users
          ?.filter((item) => item?.dataValues?.token)
          ?.map(async (user) => {
            try {
              return await axios.get(
                `https://ant.aliceblueonline.com/api/v1/positions?type=historical&client_id=${user?.broker_client_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${user?.dataValues?.token}`,
                  },
                }
              );
            } catch (er) {}
          })
      );
      results = results
        ?.filter((item) => item && item?.data && item?.data?.data?.length > 0)
        ?.map((item) => item?.data?.data);
      let finalRes = [];
      results = results?.forEach((item) => {
        item?.forEach((obj) => {
          finalRes.push(obj);
        });
      });
      await Promise.all(
        finalRes?.map((order) => {
          let plObj = {
            client_name: users?.find(
              (user) => user?.broker_client_id === order?.client_id
            )?.name,
            client_id: order?.client_id,
            exchange: order?.exchange,
            symbol_name: order?.trading_symbol,
            product: order?.product,
            buy_qty: order?.buy_quantity,
            sell_qty: order?.sell_quantity,
            p_and_l: order?.realized_mtm,
          };
          try {
            return db.brokerPLReport.create(plObj);
          } catch (err) {
            return null;
          }
        })
      );
    } catch (error) {
      console.log(error);
    }
  },
  null,
  true,
  "Asia/Kolkata"
);

job.start();
plJob.start();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
