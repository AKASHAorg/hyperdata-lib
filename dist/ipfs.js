'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IPFS = require('ipfs');

var node = void 0;

var init = function init() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return new Promise(function (resolve) {
    node = new IPFS(config);
    node.on('ready', function () {
      // done
      console.log('IPFS node initialized');
      resolve();
    });
  });
};

var fetcher = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(url) {
    var parsed, CID, data;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (!(node === undefined)) {
              _context.next = 4;
              break;
            }

            _context.next = 4;
            return init();

          case 4:
            // get the CID from the url
            parsed = new URL(url);
            CID = parsed.pathname.substring(2, parsed.pathname.length);
            // fetch the data as string

            _context.next = 8;
            return node.cat(CID);

          case 8:
            data = _context.sent;
            return _context.abrupt('return', JSON.parse(data.toString('utf8')));

          case 12:
            _context.prev = 12;
            _context.t0 = _context['catch'](0);

            console.log('ipfs cat error', _context.t0);

          case 15:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 12]]);
  }));

  return function fetcher(_x2) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = { fetcher: fetcher, init: init };