/**
 * Some utilities for testing
 */

const crypto = require('crypto');
const R = require('ramda');

// define helper functions for comparing files
const getHashByAlgorithm = R.curry((algorithm, hashType, data) =>
  crypto.createHash(algorithm).update(data).digest(hashType)
);
const md5 = getHashByAlgorithm('md5', 'hex');
const sha256 = getHashByAlgorithm('sha256', 'hex');

module.exports = {
  sha256: sha256,
  md5: md5
};
