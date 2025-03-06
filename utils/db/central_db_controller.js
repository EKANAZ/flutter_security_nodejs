const mongoose = require('mongoose');

const getCentralDB = async ({ query }) => {
  const { collection, where } = query;
  const Model = mongoose.model(collection);
  return await Model.find(where);
};

module.exports = { getCentralDB };  