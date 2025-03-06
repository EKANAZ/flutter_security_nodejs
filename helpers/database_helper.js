const mongoose = require('mongoose');

const get = (collection, { where = {} }) => {
  return { collection, where };
};

module.exports = { get };