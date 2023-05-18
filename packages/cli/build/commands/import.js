// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../src/config.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadData = loadData;
exports.loadDatabase = loadDatabase;
var _core = require("@fireproof/core");
var _fs = require("fs");
var _path = require("path");
var _core2 = require("@jsonlines/core");
const config = {
  dataDir: '~/.fireproof'
};
function loadDatabase(database) {
  const clock = loadClock(database);
  if (clock) {
    throw new Error(`Database ${database} already exists`);
  } else {
    return _core.Fireproof.storage(database);
  }
}
function loadClock(database) {
  const clockFile = (0, _path.join)(config.dataDir, database, 'clock.json');
  let clock;
  try {
    clock = JSON.parse((0, _fs.readFileSync)(clockFile, 'utf8'));
  } catch (err) {
    clock = null;
  }
  return clock;
}
function loadData(database, filename) {
  const fullFilePath = (0, _path.join)(process.cwd(), filename);
  const readableStream = (0, _fs.createReadStream)(fullFilePath);
  const parseStream = (0, _core2.parse)();
  readableStream.pipe(parseStream);
  parseStream.on('data', async data => {
    const ok = await database.put(data);
    console.log('put', ok);
  });
}
},{}],"import.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _ink = require("ink");
var _config = require("../src/config.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/// Import data into a database
const Import = ({
  database,
  filename
}) => {
  const [stage, setStage] = (0, _react.useState)('initializing');
  const [db, setDb] = (0, _react.useState)(null);
  const loadFile = (0, _react.useCallback)(() => {
    setStage('importing');
    (0, _config.loadData)(database, filename);
  }, [filename]);
  const initDatabase = (0, _react.useCallback)(() => {
    // use the database name to see if there is a directory in the root directory with that name
    // if not, create it
    setStage('loading');
    setDb((0, _config.loadDatabase)(database));
  }, [database]);
  (0, _react.useEffect)(() => {
    if (db) {
      loadFile();
    }
  }, [db]);
  (0, _react.useEffect)(() => {
    initDatabase();
  }, []);
  return /*#__PURE__*/_react.default.createElement(_ink.Text, null, "Importing ", filename, " to ", database, ". Stage: ", stage);
};
Import.propTypes = {
  /// Name of the database to use, will create if necessary
  database: _propTypes.default.string.isRequired,
  /// Path to a JSON file to import
  filename: _propTypes.default.string.isRequired
};
Import.positionalArgs = ['database', 'filename'];
var _default = Import;
exports.default = _default;
},{"../src/config.js":"../src/config.js"}]},{},["import.js"], null)
//# sourceMappingURL=/import.js.map