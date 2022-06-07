const db = require("../models");
const Customer = db.customer;

exports.login = async (req, res) => {
  if (!req.body.mobile_number || !req.body.otp) {
    res
      .status(400)
      .send({ error: "Enter valid login details", success: false });
  }
  console.log("mobile number", req.body);
  const user = await Customer.findOne({
    where: { mobile_no: req.body.mobile_number },
  });
  console.log("USER", user);
  if (!user) {
    return res.send({ success: false, error: "User not found" });
  }
 
  return res.send({ user, success: true });
};
                        