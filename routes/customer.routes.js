module.exports = (app) => {
  const customers = require("../controllers/customer.controller");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/", customers.create);

  router.post("/add_user", customers.addCustomer);

  router.post("/edit_user", customers.editCustomer);

  router.post("/users", customers.getUsers);

  router.post("/delete_user", customers.deleteUser);

  router.post("/all_user_login", customers.getAllUserLogin);

  router.post("/single_user_login", customers.getSingleUserLogin);

  router.post("/toggle_user_status", customers.toggleUserStatus);

  router.get("/get_symbols", customers.getSymbols);

  router.get("/place_order", customers.placeOrder);

  router.post("/place_order", customers.placeOrder);

  router.post("/get_order_history", customers.getOrdersHistory);

  router.post("/get_positions", customers.getPositions);

  router.post("/square_off_order", customers.squareOffOrder);

  router.post("/set_payment_data", customers.setPaymentData);

  router.post("/get_pl_report", customers.getPLReport);

  app.use("/api/customer", router);
};
