'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IPFS = require('ipfs');

var node = void 0;

var init = function init() {
  return new Promise(function (resolve) {
    node = new IPFS();
    node.on('ready', function () {
      // nothing
      console.log('IPFS node ready');
      resolve();
    });
  });
};

var fetcher = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(hash) {
    var data;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            console.log('hash:', hash);
            _context.next = 4;
            return node.cat(hash);

          case 4:
            data = _context.sent;
            return _context.abrupt('return', data.toString('utf8'));

          case 8:
            _context.prev = 8;
            _context.t0 = _context['catch'](0);

            console.log('ipfs cat error', _context.t0);

          case 11:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 8]]);
  }));

  return function fetcher(_x) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = { init: init, fetcher: fetcher };