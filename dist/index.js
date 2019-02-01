'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _web = require('./web');

var _web2 = _interopRequireDefault(_web);

var _ipfs = require('./ipfs');

var _ipfs2 = _interopRequireDefault(_ipfs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Fetch = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(thing) {
    var prot;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            prot = new URL(thing).protocol;

            if (prot) {
              _context.next = 3;
              break;
            }

            return _context.abrupt('return');

          case 3:
            if (!prot.includes('http')) {
              _context.next = 7;
              break;
            }

            return _context.abrupt('return', _web2.default.fetcher(thing));

          case 7:
            if (!prot.includes('ipfs')) {
              _context.next = 11;
              break;
            }

            return _context.abrupt('return', _ipfs2.default.fetcher(thing));

          case 11:
            // unsupported protocol
            console.log('Unknown protocol:', prot);

          case 12:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function Fetch(_x) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = { Fetch: Fetch, Web: _web2.default, IPFS: _ipfs2.default };