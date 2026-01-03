/**
 * Moderation Service
 * Exports moderation functions
 */

const { moderateComment } = require('./aiModeration');

module.exports = {
  moderateComment,
};

