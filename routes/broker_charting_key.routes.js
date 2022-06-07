module.exports = (app) => {
  const broker_charting_key = require("../controllers/broker_charting_key.controller");

  var router = require("express").Router();

  router.post("/generate_key", broker_charting_key.generateChartingKey);

  router.get("/charting_keys", broker_charting_key.getAllChartingKeys);

  router.post("/delete_charting_key", broker_charting_key.deleteChartingKey);

  router.post("/toggle_charting_key", broker_charting_key.toggleChartingKey);

  app.use("/api/broker_charting_key", router);
};
