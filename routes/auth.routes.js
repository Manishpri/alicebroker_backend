module.exports = (app) => {
  const auth = require("../controllers/auth.controller");

  var router = require("express").Router();

  // Create a new Tutorial
  router.get("/login", (req,res) => {
	  res.send("hello world")
  });
  router.post("/login", auth.login);

  app.use("/api/auth", router);
};
