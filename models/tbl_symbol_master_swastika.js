module.exports = (sequelize, Sequelize) => {
  const tblSymbolMasterSwastika = sequelize.define(
    "tbl_symbol_master",
    {
      exchange: {
        type: Sequelize.STRING,
      },
      symbol_name: {
        type: Sequelize.STRING,
      },
      actual_symbol_name: {
        type: Sequelize.STRING,
      },
      expiry_date: {
        type: Sequelize.DATE,
      },
      // segment: {
      //   type: Sequelize.STRING,
      // },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    { timestamps: false, freezeTableName: true }
  );

  return tblSymbolMasterSwastika;
};
