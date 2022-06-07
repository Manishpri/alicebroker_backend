const db = require("../models");
const broker_charting_key = require("../models/broker_charting_key");
const { encrypt, decrypt } = require("../utils/encrypt");
const BrokerChartingKey = db.brokerChartingKey;

exports.generateChartingKey = async (req, res) => {
  try {
    const userClientIds = req.body.user_client_ids?.concat(req.body.group_name);
    let originalString = userClientIds.join(";");
    let encryptedKey = encrypt(originalString);

    const isNameExist = await BrokerChartingKey.findOne({
      where: { group_name: req.body.group_name },
    });

    if (isNameExist) {
      return res.status(400).send({
        message: "Group already existed with this group name",
        success: false,
      });
    }

    const broker_key_obj = {
      group_name: req.body.group_name,
      charting_key: encryptedKey?.encryptedData,
      dealer_id: req.body.dealer_id,
    };

    BrokerChartingKey.create(broker_key_obj)
      .then((data) => {
        return res.status(201).send({
          charting_key: {
            ...data?.dataValues,
            user_count: userClientIds?.length - 1,
          },
          success: true,
        });
      })
      .catch((err) => {
        return res.status(500).send({
          message:
            err.message ||
            "Some error occurred while creating the charting key.",
        });
      });
  } catch (error) {
    return res.status(500).send({
      message:
        error.message || "Some error occurred while creating the charting key.",
      success: false,
    });
  }
};

exports.getAllChartingKeys = async (req, res) => {
  try {
    const dealerId = req.query.dealer_id;
    const chartingKeys = await BrokerChartingKey.findAll({
      where: {
        dealer_id: dealerId,
        is_deleted: false,
      },
    });
    const OutputChartingKeys = chartingKeys?.map((key) => {
      let decryptedKey = decrypt({
        encryptedData: key?.dataValues?.charting_key,
      });
      return {
        ...key?.dataValues,
        user_count: decryptedKey?.split(";")?.length - 1,
        singleUserId: decryptedKey?.split(";")?.[0],
      };
    });
    return res
      .status(200)
      .send({ charting_keys: OutputChartingKeys, success: true });
  } catch (error) {
    return res.status(500).send({ message: error?.message, success: false });
  }
};

exports.deleteChartingKey = async (req, res) => {
  try {
    const chartingKey = await BrokerChartingKey.findOne({
      where: {
        id: req?.body?.chartingKeyId,
      },
    });
    if (!chartingKey) {
      return res.status(400).send({
        error: "Charting key not found",
        success: false,
      });
    }
    chartingKey
      .update({ is_deleted: true })
      .then((updatedKey) => {
        return res.send({ chartingKey: updatedKey, success: true });
      })
      .catch((err) => {
        return res.status(500).send({
          message:
            err.message ||
            "Some error occurred while deleting the charting key.",
        });
      });
  } catch (error) {}
};

exports.toggleChartingKey = async (req, res) => {
  try {
    const key = await BrokerChartingKey.findOne({
      where: {
        id: req?.body?.chartingKeyId,
      },
    });
    if (!key) {
      return res.status(400).send({
        error: "Key not found...",
        success: false,
      });
    }
    const updatedKey = await key.update({
      is_active: req?.body?.status,
    });
    return res.send({ key: updatedKey, success: true });
  } catch (err) {
    return res.status(500).send({
      message: err.message || "Some error occurred while toggle status",
    });
  }
};
