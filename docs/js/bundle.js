var bio = (function (exports) {
  'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(source, true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(source).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  // almost same functions as underscore.js
  // ref: https: //underscorejs.org/docs/underscore.html
  var ObjProto = Object.prototype,
    hasOwnProperty = ObjProto.hasOwnProperty;

  var has = function has(obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
  };

  var nativeKeys = Object.keys;

  var shallowProperty = function shallowProperty(key) {
    return function (obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = shallowProperty('length');

  var isArrayLike = function isArrayLike(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  var optimizeCb = function optimizeCb(func, context, argCount) {
    if (context === void 0) return func;

    switch (argCount == null ? 3 : argCount) {
      case 1:
        return function (value) {
          return func.call(context, value);
        };

      case 3:
        return function (value, index, collection) {
          console.log(context);
          return func.call(context, value, index, collection);
        };

      case 4:
        return function (accumulator, value, index, collection) {
          return func.call(context, accumulator, value, index, collection);
        };
    }

    return function () {
      return func.apply(context, arguments);
    };
  };

  var isObject = function isObject(obj) {
    var type = _typeof(obj);

    return type === 'function' || type === 'object' && !!obj;
  };

  var getKeys = function getKeys(obj) {
    if (!isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];

    for (var key in obj) {
      if (has(obj, key)) keys.push(key);
    }

    return keys;
  };

  var each$1 = function each(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;

    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = getKeys(obj);

      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }

    return obj;
  };

  var group = function group(behavior, partition) {
    return function (obj, iteratee, context) {
      var result = partition ? [
        [],
        []
      ] : {};
      iteratee = optimizeCb(iteratee, context);
      each$1(obj, function (value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  var groupBy = group(function (result, value, key) {
    if (has(result, key)) result[key].push(value);
    else result[key] = [value];
  });
  var countBy = group(function (result, value, key) {
    if (has(result, key)) result[key]++;
    else result[key] = 1;
  });
  var indexBy = group(function (result, value, key) {
    result[key] = value;
  });

  var seqStat = function seqStat(seqs) {
    var results = [];

    var init = function init(len) {
      for (var i = 0; i < len; i++) {
        results.push({});
      }
    };

    var others = function others(seq) {
      var seqArr = seq.split("");
      each$1(seqArr, function (val, i) {
        if (val in results[i]) results[i][val]++;
        else results[i][val] = 1;
      });
    };

    init(seqs[0].seq.length);
    each$1(seqs, function (val) {
      others(val.seq);
    });
    return results;
  };
  var isConservedRegoin = function isConservedRegoin(seqArr) {
    var conserved = [];
    each$1(seqArr, function (val) {
      if (val.hasOwnProperty("-")) {
        conserved.push(false);
      } else {
        conserved.push(true);
      }
    });
    return conserved;
  };
  var conservedRegionLength = function conservedRegionLength(seqArr) {
    var counter = 0;
    each$1(seqArr, function (val) {
      if (!val.hasOwnProperty("-")) {
        counter++;
      }
    });
    return counter;
  };
  var calcGapRate = function calcGapRate(seqArr, numSeq) {
    var res = [];
    each$1(seqArr, function (val) {
      if (val.hasOwnProperty("-")) {
        res.push(val["-"] / numSeq);
      } else res.push(0);
    });
    return res;
  };
  var calcShannonEntropy = function calcShannonEntropy(seqArr, numSeq) {
    var results = [];
    each$1(seqArr, function (seqs) {
      var res = {};
      var s = 0;
      each$1(seqs, function (val, key) {
        var v = -1 * val / numSeq * Math.log2(val / numSeq);
        res[key] = v;
        s += v;
      });
      res["Entropy"] = Math.log2(22) - s;
      each$1(res, function (val, key) {
        if (key !== "Entropy") {
          res[key] = res["Entropy"] * seqs[key] / numSeq;
        }
      });
      results.push(res);
    });
    return results;
  };
  /**
   * return {sum: totalHeight, res: {name: letter, value: letterHeight}}
   * @param {*} entropyArr 
   */

  var filterAndSortEntroy = function filterAndSortEntroy(entropyArr) {
    var res = [];
    var buf = {};
    var s = 0;
    each$1(entropyArr, function (val, key) {
      if (val > 0.1 && key !== "Entropy") {
        res.push({
          name: key,
          value: val
        });
        s += val;
      }
    });
    res.sort(function (a, b) {
      return b.value - a.value;
    });
    buf["sum"] = s;
    buf["res"] = res;
    return buf;
  };
  var getTrueArr = function getTrueArr(resourceArr, booleanArr) {
    var res = [];

    if (resourceArr.length !== booleanArr.length) {
      console.log("not match: " + resourceArr.length + " " + booleanArr.length);
      return res;
    }

    each$1(resourceArr, function (val, i) {
      if (booleanArr[i]) res.push(val);
    });
    return res;
  };
  var getAllSequenceAsFasta = function getAllSequenceAsFasta(sequenceObj) {
    var ret = [];
    each$1(sequenceObj, function (val) {
      ret.push(">" + val.name);
      ret.push(val.seq);
    });
    var result = ret.join("\n");
    return result;
  };
  var getConservedRegionAsFasta = function getConservedRegionAsFasta(sequenceObj, booleanArr) {
    var ret = [];
    each$1(sequenceObj, function (val) {
      var seqArr = getTrueArr(val.seq.split(""), booleanArr);
      ret.push(">" + val.name);
      ret.push(seqArr.join(""));
    });
    var result = ret.join("\n");
    return result;
  };

  /**
   * faster than select;
   * @param {string} elements id
   */

  var Selector =
    /*#__PURE__*/
    function () {
      function Selector(elements) {
        _classCallCheck(this, Selector);

        this.elements = elements;
        this.mouse = null;
      }

      _createClass(Selector, [{
        key: "on",
        value: function on(eventType, callback, context) {
          var _this = this;

          var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

          each$1(this.elements, function (el) {
            el.addEventListener(eventType, function () {
              var rect = el.getBoundingClientRect();
              _this.mouse = [event.clientX - rect.left - el.clientLeft, event.clientY - rect.top - el.clientTop];
              callback.call(context);
              _this.mouse = null;
            }, capture);
          });

          return this;
        }
      }, {
        key: "create",
        value: function create(elementName) {
          var elements = [];

          each$1(this.elements, function (el) {
            var newEle = document.createElement(elementName);
            el.appendChild(newEle);
            elements.push(newEle);
          });

          return new Selector(elements);
        }
      }, {
        key: "style",
        value: function style(stylName, styleValue) {
          each$1(this.elements, function (el) {
            el.style.setProperty(stylName, styleValue);
          });

          return this;
        }
      }, {
        key: "attr",
        value: function attr(attrName, attrValue) {
          each$1(this.elements, function (el) {
            el.setAttribute(attrName, attrValue);
          });

          return this;
        }
      }, {
        key: "setClass",
        value: function setClass(className) {
          return this.attr("class", className);
        }
      }, {
        key: "setID",
        value: function setID(idName) {
          return this.attr("id", idName);
        }
      }, {
        key: "html",
        value: function html(text) {
          if (arguments.length == 1) {
            if (text) {
              each$1(this.elements, function (el) {
                el.textContent = text;
              });
            } else {
              each$1(this.elements, function (el) {
                el.textContent = text;
              });

              return this;
            }
          } else {
            var res = [];

            each$1(this.elements, function (el) {
              res.push(el.textContent);
            });

            if (res.length === 1) return res[0];
            return res;
          }
        }
      }]);

      return Selector;
    }();
  /**
   * faster than select;
   * @param {string} idName ID name
   */


  var selectID = function selectID(idName) {
    return new Selector([document.getElementById(idName)]);
  };
  /**
   * faster than select;
   * @param {string} className class name
   */

  var selectClass = function selectClass(className) {
    return new Selector([document.getElementsByClassName(className)]);
  };
  /**
   * selectID or selectClass is much fast;
   * @param {string} name css name
   */

  var select = function select(name) {
    return new Selector([document.querySelector(name)]);
  };
  /**
   * selectID or selectClass is much fast;
   * @param {string} name css name
   */

  var selectAll = function selectAll(name) {
    return new Selector(document.querySelectorAll(name));
  };

  //
  // my fetch functions
  // ref: https://github.com/d3/d3-fetch
  var text = function text(input, init) {
    return fetch(input, init).then(function (response) {
      if (!response.ok) throw new Error(response.status + " " + response.statusText);
      return response.text();
    });
  };
  var json = function json(input, init) {
    return fetch(input, init).then(function (response) {
      if (!response.ok) throw new Error(response.status + " " + response.statusText);
      return response.json();
    });
  };

  // colors: https://github.com/wilzbach/msa-colorschemes/tree/master/src
  var CLUSTAL2_COLOR = {
    A: "#80a0f0",
    R: "#f01505",
    N: "#00ff00",
    D: "#c048c0",
    C: "#f08080",
    Q: "#00ff00",
    E: "#c048c0",
    G: "#f09048",
    H: "#15a4a4",
    I: "#80a0f0",
    L: "#80a0f0",
    K: "#f01505",
    M: "#80a0f0",
    F: "#80a0f0",
    P: "#ffff00",
    S: "#00ff00",
    T: "#00ff00",
    W: "#80a0f0",
    Y: "#15a4a4",
    V: "#80a0f0",
    B: "#fff",
    X: "#fff",
    Z: "#fff",
    "-": "rgb(200,200,200)",
    "\\": "rgb(200,200,200)"
  };
  var STRAND_COLOR = {
    A: "#5858a7",
    R: "#6b6b94",
    N: "#64649b",
    D: "#2121de",
    C: "#9d9d62",
    Q: "#8c8c73",
    E: "#0000ff",
    G: "#4949b6",
    H: "#60609f",
    I: "#ecec13",
    L: "#b2b24d",
    K: "#4747b8",
    M: "#82827d",
    F: "#c2c23d",
    P: "#2323dc",
    S: "#4949b6",
    T: "#9d9d62",
    W: "#c0c03f",
    Y: "#d3d32c",
    V: "#ffff00",
    B: "#4343bc",
    X: "#797986",
    Z: "#4747b8",
    "-": "rgb(200,200,200)",
    "\\": "rgb(200,200,200)"
  };
  var TAYLOR_COLOR = {
    A: "#ccff00",
    R: "#0000ff",
    N: "#cc00ff",
    D: "#ff0000",
    C: "#ffff00",
    Q: "#ff00cc",
    E: "#ff0066",
    G: "#ff9900",
    H: "#0066ff",
    I: "#66ff00",
    L: "#33ff00",
    K: "#6600ff",
    M: "#00ff00",
    F: "#00ff66",
    P: "#ffcc00",
    S: "#ff3300",
    T: "#ff6600",
    W: "#00ccff",
    Y: "#00ffcc",
    V: "#99ff00",
    B: "#fff",
    X: "#fff",
    Z: "#fff",
    "-": "rgb(200,200,200)",
    "\\": "rgb(200,200,200)"
  };

  var hsvToRgb = function hsvToRgb(H, S, V) {
    // https://qiita.com/hachisukansw/items/633d1bf6baf008e82847
    var C = V * S;
    var Hp = H / 60;
    var X = C * (1 - Math.abs(Hp % 2 - 1));
    var R, G, B;

    if (0 <= Hp && Hp < 1) {
      R = C;
      G = X;
      B = 0;
    } else if (1 <= Hp && Hp < 2) {
      R = X;
      G = C;
      B = 0;
    } else if (2 <= Hp && Hp < 3) {
      R = 0;
      G = C;
      B = X;
    } else if (3 <= Hp && Hp < 4) {
      R = 0;
      G = X;
      B = C;
    } else if (4 <= Hp && Hp < 5) {
      R = X;
      G = 0;
      B = C;
    } else if (5 <= Hp && Hp < 6) {
      R = C;
      G = 0;
      B = X;
    }

    var m = V - C;
    var _ref = [R + m, G + m, B + m];
    R = _ref[0];
    G = _ref[1];
    B = _ref[2];
    R = Math.floor(R * 255);
    G = Math.floor(G * 255);
    B = Math.floor(B * 255);
    return [R, G, B];
  };

  var COLER_ARR = [];

  for (var k = 1; k >= 0.5; k -= 0.1) {
    for (var j = 1; j >= 0.5; j -= 0.25) {
      for (var i = 0; i < 360; i++) {
        COLER_ARR.push("rgb(" + hsvToRgb(i, j, k).join(",") + ")");
      }
    }
  }

  var getColorPallet = function getColorPallet(i) {
    return COLER_ARR[i * 12];
  };

  var getColors = function getColors(i, stepSize) {
    return COLER_ARR[i * stepSize];
  };
  var PROTEIN_COL_V1 = {};
  PROTEIN_COL_V1["A"] = getColorPallet(0);
  PROTEIN_COL_V1["B"] = getColorPallet(1);
  PROTEIN_COL_V1["C"] = getColorPallet(2);
  PROTEIN_COL_V1["D"] = getColorPallet(3);
  PROTEIN_COL_V1["E"] = getColorPallet(4);
  PROTEIN_COL_V1["F"] = getColorPallet(5);
  PROTEIN_COL_V1["G"] = getColorPallet(6);
  PROTEIN_COL_V1["H"] = getColorPallet(7);
  PROTEIN_COL_V1["I"] = getColorPallet(8);
  PROTEIN_COL_V1["J"] = getColorPallet(9);
  PROTEIN_COL_V1["K"] = getColorPallet(10);
  PROTEIN_COL_V1["L"] = getColorPallet(11);
  PROTEIN_COL_V1["M"] = getColorPallet(12);
  PROTEIN_COL_V1["N"] = getColorPallet(13);
  PROTEIN_COL_V1["O"] = getColorPallet(14);
  PROTEIN_COL_V1["P"] = getColorPallet(15);
  PROTEIN_COL_V1["Q"] = getColorPallet(16);
  PROTEIN_COL_V1["R"] = getColorPallet(17);
  PROTEIN_COL_V1["S"] = getColorPallet(18);
  PROTEIN_COL_V1["T"] = getColorPallet(19);
  PROTEIN_COL_V1["U"] = getColorPallet(20);
  PROTEIN_COL_V1["V"] = getColorPallet(21);
  PROTEIN_COL_V1["W"] = getColorPallet(22);
  PROTEIN_COL_V1["X"] = getColorPallet(23);
  PROTEIN_COL_V1["Y"] = getColorPallet(24);
  PROTEIN_COL_V1["Z"] = getColorPallet(25);
  PROTEIN_COL_V1["-"] = "rgb(200,200,200)";

  // download https://jsgao0.wordpress.com/2016/06/01/export-svg-file-using-xmlserializer/
  var generateLink = function generateLink(fileName, dataPath) {
    var link = document.createElement('a'); // Create a element.

    link.download = fileName; // Set value as the file name of download file.

    link.href = dataPath; // Set value as the file content of download file.

    return link;
  };
  var exportSVG = function exportSVG(svgElement, fileName) {
    var svg = svgElement;
    var svgString;

    if (window.ActiveXObject) {
      svgString = svg.xml;
    } else {
      var oSerializer = new XMLSerializer();
      svgString = oSerializer.serializeToString(svg);
    }

    generateLink(fileName + '.svg', 'data:image/svg+xml;utf8,' + svgString).click();
  };
  var exportText = function exportText(textString, fileName) {
    var blob = new Blob([textString], {
      type: "type/plain"
    });
    var url = window.URL.createObjectURL(blob);
    generateLink(fileName, url).click();
  }; // replacer:  https://qiita.com/qoAop/items/57d35a41ef9629351c3c

  var exportJson = function exportJson(json, fileName) {
    var replacer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var indent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 4;
    var blob = new Blob([JSON.stringify(json, replacer, indent)], {
      type: "application/json"
    });
    var url = window.URL.createObjectURL(blob);
    generateLink(fileName, url).click();
  };

  var size = {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  };
  var font = {
    fontSize: 13
  };
  var options = {
    id: "def",
    setSize: false,
    height: 600,
    width: 600,
    seqHeight: 25,
    isGrouping: true,
    colorScheme: TAYLOR_COLOR,
    header: _objectSpread2({}, size, {}, font, {
      height: 100,
      top: 10,
      enable: true
    }),
    seqLogo: {
      enable: true
    },
    nonGapRate: {
      enable: true,
      left: 10,
      top: 10,
      bottom: 0,
      baseColor: "rgb(120,120,120)",
      highColor: "rgb(30, 30, 250)",
      th: 1
    },
    label: _objectSpread2({}, size, {}, font, {
      fontSize: 13,
      left: 10,
      top: 0,
      width: 300
    }),
    sequence: _objectSpread2({}, size, {}, font, {
      fontSize: 12,
      left: 10,
      right: 10,
      top: 0,
      width: 480,
      topMargin: 0,
      bottomMargin: 0
    }),
    scaleBar: _objectSpread2({}, font, {
      fontSize: 13,
      height: 40,
      enable: true
    })
  };

  var deg90 = Math.PI / 2;
  var setLineWidth = function setLineWidth(ctx, lineWidth) {
    ctx.lineWidth = lineWidth;
  };
  var setTextAlign = function setTextAlign(ctx, align) {
    ctx.textAlign = align; // center
  };
  var setFillStyle = function setFillStyle(ctx, fStyle) {
    ctx.fillStyle = fStyle;
  };
  var setStrokeStyle = function setStrokeStyle(ctx, sStyle) {
    ctx.strokeStyle = sStyle;
  };
  var drawLine = function drawLine(ctx, startX, endX, startY, endY, strokeStyle) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  };
  var drawRect = function drawRect(ctx, x, y, width, height, strokeStyle, lineWidth) {
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, width, height);
  };
  var drawArc = function drawArc(ctx, x, y, r, startRad, endRad, angle) {
    var val = angle < 0 ? "rgba(200,200,200)" : COLER_ARR[angle];
    ctx.beginPath();
    ctx.arc(x, y, r, startRad - deg90, endRad - deg90);
    ctx.strokeStyle = val;
    ctx.stroke();
  };
  var drawTxt = function drawTxt(ctx, text, x, y, font) {
    ctx.font = font;
    ctx.fillText(text, x, y);
  };
  var clear = function clear(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
  };

  var AlignmentPosition =
    /*#__PURE__*/
    function () {
      function AlignmentPosition(size) {
        _classCallCheck(this, AlignmentPosition);

        this.start = 0;
        this.end = size;
        this.size = size;
        this.preStart = -1;
        this.preEnd = -1;
      }

      _createClass(AlignmentPosition, [{
        key: "update",
        value: function update(size) {
          this.start = 0;
          this.end = size;
          this.size = size;
          this.preStart = -1;
          this.preEnd = -1;
        }
      }]);

      return AlignmentPosition;
    }();

  var getGroup = function getGroup(dicArr) {
    var _group = {};
    var counter = 0;
    each$1(dicArr, function (val, i, arr) {
      if (val["group"] in _group) {
        _group[val["group"]].count++;

        _group[val["group"]].names.push(val["name"]);
      } else {
        _group[val["group"]] = {
          count: 1,
          col: getColors(counter++, 45),
          names: [val["name"]]
        };
      }
    });
    return _group;
  };

  var Alignment =
    /*#__PURE__*/
    function () {
      function Alignment(id, opt) {
        _classCallCheck(this, Alignment);

        this.height = 500;
        this.width = 500;
        this.mainCanvas = null;
        this.isDragging = false;
        this.id = id;
        this.container = null;
        this.inputJson = null;
        this.options = _objectSpread2({}, options, {}, opt);
        this.numSeq = 0;
        this.group = null;
        this.canvasHeight = 0;
        this.headerContainer = null;
        this.bodyContainer = null;
        this.labelContainer = null;
        this.labelDiv = null;
        this.canvasContainer = null;
        this.ctx = null;
        this.alignmentPosition = null;
        this.baseWidth = 0;
        this.seqLength = 0; // sortable and highlight

        this.orderedAlignments = null;
        this.highlightedIndicies = null; // conserved region mode

        this.isConservedRegionMode = false;
        this.conservedRegionBooleanArr = null;
        this.conservedRegionLength = 0; // seqLog & 1 - gapRate

        this.headerCanvas = null;
        this.headerCtx = null;
        this.seqStat = null;
        this.gapRate = null;
        this.shannonEntropyArr = null;
      }
      /**
       * 
       * @param {string} elementID without # 
       */


      _createClass(Alignment, [{
        key: "setContainer",
        value: function setContainer(elementID) {
          this.container = selectID(elementID);
          this.container.html("");
          this.options.id = elementID;

          if (!this.options.setSize) {
            this.width = this.container.elements[0].clientWidth;
            this.height = this.container.elements[0].clientHeight;
          } else {
            this.height = this.options.height;
            this.width = this.options.width;
          }
        }
        /**
         * @param {json} json 
         */

      }, {
        key: "setJson",
        value: function setJson(json) {
          var _this = this;

          this.inputJson = json;
          this.numSeq = json["sequences"].length;
          this.canvasHeight = this.numSeq * this.options.seqHeight + 50;
          this.seqLength = this.inputJson["sequences"][0]["seq"].length;
          this.alignmentPosition = new AlignmentPosition(this.seqLength);
          this.seqStat = seqStat(this.inputJson["sequences"]);
          this.conservedRegionBooleanArr = isConservedRegoin(this.seqStat);
          this.conservedRegionLength = conservedRegionLength(this.seqStat);
          this.gapRate = calcGapRate(this.seqStat, this.numSeq);
          this.shannonEntropyArr = calcShannonEntropy(this.seqStat, this.numSeq); // grouping

          if (this.options.isGrouping) {
            (function () {
              _this.group = getGroup(_this.inputJson["sequences"]);
              var counter = 0;

              var _loop = function _loop(key) {
                each$1(_this.inputJson["sequences"], function (val) {
                  if (val.group === key) {
                    val.order = counter++;
                  }
                });
              };

              for (var key in _this.group) {
                _loop(key);
              }
            })();
          }

          this.orderedAlignments = new Array(this.inputJson["sequences"].length);
          each$1(this.inputJson["sequences"], function (alignment) {
            _this.orderedAlignments[alignment.order] = alignment;
          });
        }
      }, {
        key: "render",
        value: function render() {
          this._DOMcreate();

          this.ctx = this.mainCanvas.elements[0].getContext("2d");

          this._initHeader();

          this._drawSequenceLabel();

          this.drawSequences();
        }
      }, {
        key: "zoomInShowSequence",
        value: function zoomInShowSequence() {
          if (this.alignmentPosition.end - this.alignmentPosition.start < 20) return;
          this.alignmentPosition.preStart = this.alignmentPosition.start;
          this.alignmentPosition.preEnd = this.alignmentPosition.end;
          this.alignmentPosition.start = 0;
          this.alignmentPosition.end = 30;
          this.drawSequences();
        }
      }, {
        key: "change2conservedRegion",
        value: function change2conservedRegion() {
          this.isConservedRegionMode = true;
          this.alignmentPosition.update(this.conservedRegionLength);
          this.drawSequences();
        }
      }, {
        key: "change2allRegion",
        value: function change2allRegion() {
          this.isConservedRegionMode = false;
          this.alignmentPosition.update(this.seqLength);
          this.drawSequences();
        }
      }, {
        key: "saveRawJson",
        value: function saveRawJson() {
          exportJson(this.inputJson, "all_rawJson_".concat(this.id, ".json"));
        }
      }, {
        key: "saveAllSequence",
        value: function saveAllSequence() {
          exportText(getAllSequenceAsFasta(this.inputJson["sequences"]), "all_alignments_".concat(this.id, ".fas"));
        }
      }, {
        key: "saveConservedRegion",
        value: function saveConservedRegion() {
          exportText(getConservedRegionAsFasta(this.inputJson["sequences"], this.conservedRegionBooleanArr), "conservedRegion_alignments_".concat(this.id, ".fas"));
        }
      }, {
        key: "saveVisualizedRegion",
        value: function saveVisualizedRegion() {
          var _this2 = this;

          if (this.isConservedRegionMode) {
            var seqs = [];
            each$1(this.inputJson["sequences"], function (val) {
              var conservedSeq = getTrueArr(val.seq.split(""), _this2.conservedRegionBooleanArr);
              var targetSeq = conservedSeq.slice(parseInt(_this2.alignmentPosition.start + 0.5), parseInt(_this2.alignmentPosition.end + 0.5)).join("");
              seqs.push({
                name: val.name,
                seq: targetSeq
              });
            });
            exportText(getAllSequenceAsFasta(seqs), "visualizedRegion_conserved_".concat(this.id, ".fas"));
          } else {
            var _seqs = [];
            each$1(this.inputJson["sequences"], function (val) {
              var targetSeq = val.seq.substr(parseInt(_this2.alignmentPosition.start + 0.5), parseInt(_this2.alignmentPosition.end + 0.5) - parseInt(_this2.alignmentPosition.start + 0.5));

              _seqs.push({
                name: val.name,
                seq: targetSeq
              });
            });
            exportText(getAllSequenceAsFasta(_seqs), "visualizedRegion_".concat(this.id, ".fas"));
          }
        }
      }, {
        key: "_DOMcreate",
        value: function _DOMcreate() {
          var _this3 = this;

          this.options.sequence.width = this.width - this.options.label.width - this.options.label.left - this.options.sequence.left - this.options.sequence.right;
          this.headerContainer = this.container.create("div").setID("".concat(this.options.id, "_header")); //    .html("Alignment Viewer Header");

          this.bodyContainer = this.container.create("div").setID("".concat(this.options.id, "_body")).style("position", "relative").setClass("d-flex flex-row");
          this.canvasContainer = this.bodyContainer.create("div").setID("".concat(this.options.id, "_canvasContainer")).style("position", "relative").style("height", "".concat(this.canvasHeight, "px"));
          this.labelContainer = this.bodyContainer.create("div").setID("".concat(this.options.id, "_label")) //.style("position", "absolute")
            //.style("height", `${this.canvasHeight}px`)
            //.style("width", `${this.options.label.width}px`)
            .style("margin-left", "".concat(this.options.label.left, "px")).style("margin-top", this.options.label.top + this.options.scaleBar.height + "px");
          this.mainCanvas = this.canvasContainer.create("canvas").setID("".concat(this.options.id, "_canvas")).style("position", "absolute").style("left", this.options.label.width + this.options.label.left + "px").style("top", this.options.sequence.top + "px").attr("height", this.canvasHeight).attr("width", this.width - this.options.label.width - this.options.label.left);
          this.mainCanvas.on("mousemove", function () {
            event.preventDefault();

            if (_this3.isDragging) {
              _this3._move(event.movementX / window.devicePixelRatio);
            }
          }).on("mousewheel", function () {
            event.preventDefault();

            if (event.deltaY > 0) {
              _this3._zoomOut();
            } else if (event.deltaY < 0) {
              _this3._zoomIn();
            }
          }).on("mousedown", function () {
            event.preventDefault(); // 0: left button, 1: wheel, 2: right

            if (event.button == 0) {
              _this3.isDragging = true;
            }
          }).on("mouseup", function () {
            event.preventDefault(); // 0: left button, 1: wheel, 2: right

            if (event.button == 0) {
              _this3.isDragging = false;
            }
          }).on("mouseout", function () {
            _this3.isDragging = false;
          }).on("dblclick", function () {
            _this3._resetZoom();
          });
        }
        /*    _sortAlignments(newIndex, oldIndex) {
                const target = this.orderedAlignments[oldIndex]
                this.orderedAlignments.splice(oldIndex, 1);
                this.orderedAlignments.splice(newIndex, 0, target);
                this._drawSequences();
            }
        */

      }, {
        key: "_initHeader",
        value: function _initHeader() {
          if (this.options.header.enable) {
            this.headerCanvas = this.headerContainer.style("position", "relative").style("height", this.options.header.height + 2 + "px").create("canvas").attr("height", this.options.header.height + 2 + "px").attr("width", this.width).style("position", "absolute");
            this.headerCtx = this.headerCanvas.elements[0].getContext("2d");
            this.options.header.left = this.options.sequence.left + this.options.label.width + this.options.label.left + this.options.label.right;
          }
        }
      }, {
        key: "_updateSortInfo",
        value: function _updateSortInfo(sortable) {
          var sortArr = sortable.toArray();
          each$1(this.inputJson["sequences"], function (val) {
            val.order = sortArr.indexOf(val.name);
          });
          this.drawSequences();
        }
      }, {
        key: "drawSequences",
        value: function drawSequences() {
          var _this4 = this;

          clear(this.ctx, this.width, this.canvasHeight);
          var seqWidth = this.options.seqHeight - this.options.sequence.topMargin - this.options.sequence.bottomMargin;
          setLineWidth(this.ctx, seqWidth);
          setTextAlign(this.ctx, "center");
          each$1(this.inputJson["sequences"], function (val) {
            _this4._drawSequence(val);
          });

          this._drawHighlightRect();

          this._drawScaleBar();

          this._drawHeader();
        }
      }, {
        key: "_drawSequence",
        value: function _drawSequence(alignment) {
          var _this5 = this;

          var seqWidth = this.options.seqHeight - this.options.sequence.topMargin - this.options.sequence.bottomMargin;
          var y = this.options.scaleBar.height + this.options.seqHeight * (alignment.order + 1) + this.options.sequence.topMargin - seqWidth / 2;
          var seq = [];

          if (this.isConservedRegionMode) {
            var conservedSeq = getTrueArr(alignment["seq"].split(""), this.conservedRegionBooleanArr);
            seq = conservedSeq.slice(parseInt(this.alignmentPosition.start + 0.5), parseInt(this.alignmentPosition.end + 0.5));
          } else {
            seq = alignment["seq"].substr(parseInt(this.alignmentPosition.start + 0.5), parseInt(this.alignmentPosition.end + 0.5) - parseInt(this.alignmentPosition.start + 0.5)).split("");
          }

          if (seq.length == 0) return;
          var seqLength = seq.length; //        if (seq.length < 10) seqLength = 10;

          this.baseWidth = this.options.sequence.width / seqLength;
          setFillStyle(this.ctx, "black");
          this.ctx.font = this.options.sequence.fontSize + "px Arial serif";

          if (this.baseWidth < 10) {
            each$1(seq, function (val, i) {
              drawLine(_this5.ctx, _this5.options.sequence.left + i * _this5.baseWidth, _this5.options.sequence.left + (i + 1) * _this5.baseWidth, y, y, _this5.options.colorScheme[val]);
            });
          } else {
            each$1(seq, function (val, i) {
              drawLine(_this5.ctx, _this5.options.sequence.left + i * _this5.baseWidth, _this5.options.sequence.left + (i + 1) * _this5.baseWidth, y, y, _this5.options.colorScheme[val]);

              _this5.ctx.fillText(val, _this5.options.sequence.left + i * _this5.baseWidth + _this5.baseWidth / 2, y + _this5.options.sequence.fontSize * 0.33);
            });
          }
        }
      }, {
        key: "_drawSequenceLabel",
        value: function _drawSequenceLabel() {
          var _this6 = this;

          each$1(this.orderedAlignments, function (alignment, i) {
            var y = _this6.options.seqHeight * (i + 1);
            _this6.labelDiv = _this6.labelContainer.create("div") //.style("position", "absolute")
              //.style("top", y + "px")
              .attr("data-id", alignment.name).style("font-size", _this6.options.label.fontSize + "px").style("color", _this6.group[alignment["group"]].col).style("height", _this6.options.seqHeight + "px");

            var label_p = _this6.labelDiv.create("p").style("margin", "0").style("height", _this6.options.seqHeight + "px");

            label_p.create("span").setClass("handle fas fa-expand-arrows-alt").html(" ");
            label_p.elements[0].innerHTML += alignment.name + "_" + alignment["group"];
          });
        }
      }, {
        key: "_drawHighlightRect",
        value: function _drawHighlightRect() {
          var _this7 = this;

          each$1(this.highlightedIndicies, function (val) {
            var i = val.index;
            var y = _this7.options.scaleBar.height + _this7.options.seqHeight * i + _this7.options.sequence.topMargin;
            drawRect(_this7.ctx, _this7.options.sequence.left, y, _this7.options.sequence.width, _this7.options.seqHeight, "red", 3);
          });
        }
      }, {
        key: "_drawScaleBar",
        value: function _drawScaleBar() {
          if (this.options.scaleBar.enable) {
            setLineWidth(this.ctx, 1.5);
            var s = this.alignmentPosition.start;
            var e = this.alignmentPosition.end;
            var size = e - s;
            var numBreaks = this.options.sequence.width > 500 ? 10 : 5;
            var stepSize = parseInt(size / numBreaks);
            numBreaks = parseInt(size / stepSize);

            if (size < 30 && this.baseWidth > 20) {
              numBreaks = size;
              stepSize = 1;
            }

            var startX = this.options.sequence.left;
            var startY = this.options.scaleBar.height - this.options.scaleBar.fontSize / 2;

            for (var i = 0; i < numBreaks; i++) {
              startX = this.options.sequence.left + i * stepSize * this.baseWidth + this.baseWidth / 2;
              drawTxt(this.ctx, parseInt(s + i * stepSize + 0.5 + 1), startX, startY, this.options.scaleBar.fontSize + "px Arial serif");
              drawLine(this.ctx, startX, startX, this.options.scaleBar.height, startY + 1, "grey");
            }

            if (stepSize !== 1) {
              startX = this.options.sequence.left + parseInt(size + 0.5) * this.baseWidth - this.baseWidth / 2;
              drawTxt(this.ctx, parseInt(e), startX, startY, this.options.scaleBar.fontSize + "px Arial serif");
              drawLine(this.ctx, startX, startX, this.options.scaleBar.height, startY + 1, "grey");
            }
          }
        }
      }, {
        key: "_drawHeader",
        value: function _drawHeader() {
          if (this.options.header.enable) {
            var leftMergin = 10;
            clear(this.headerCtx, this.width, this.options.header.height);

            this._drawNonGrapRate();

            this._drawSeqLogo();

            setLineWidth(this.headerCtx, 1);
            setStrokeStyle(this.headerCtx, "black");
            var startX = this.options.header.left;
            var startY = this.options.header.top;
            drawLine(this.headerCtx, startX - leftMergin, startX - leftMergin, this.options.header.height + 1, startY);
            drawLine(this.headerCtx, this.width - 1, this.width - 1, this.options.header.height + 1, startY);
            drawLine(this.headerCtx, startX - leftMergin, this.width, startY, startY);
            drawLine(this.headerCtx, startX - leftMergin, this.width, this.options.header.height + 1, this.options.header.height + 1);
          }
        }
      }, {
        key: "_drawSeqLogo",
        value: function _drawSeqLogo() {
          var _this8 = this;

          if (this.options.seqLogo.enable && this.baseWidth > 10) {
            // draw Y axis
            setTextAlign(this.headerCtx, "center");
            setFillStyle(this.headerCtx, "black");
            this.headerCtx.rotate(Math.PI * 3 / 2);
            drawTxt(this.headerCtx, "bits", -(this.options.header.height / 2), this.options.header.left - 35, "14px sans-serif");
            this.headerCtx.rotate(Math.PI * 1 / 2);
            setTextAlign(this.headerCtx, "right");
            drawTxt(this.headerCtx, "0", this.options.header.left - 14, this.options.header.height, "12px sans-serif");
            drawTxt(this.headerCtx, "4.5", this.options.header.left - 14, this.options.header.top + 6, "12px sans-serif");
            setLineWidth(this.headerCtx, 1);
            setTextAlign(this.headerCtx, "center");
            this.headerCtx.font = '900 ' + 30 * (this.options.header.height - this.options.header.top) / 100 + 'px "Arial Black", Arial, Gadget, sans-serif';
            var maxVal = Math.log2(22);
            var logoHeight = this.options.header.height - this.options.header.top - 1;
            var baseHeight = logoHeight / maxVal;
            var startX = this.options.header.left;
            var startY = this.options.header.top + 1;
            var wSize = this.baseWidth;
            var entropies = [];

            if (this.isConservedRegionMode) {
              entropies = getTrueArr(this.shannonEntropyArr, this.conservedRegionBooleanArr);
            } else {
              entropies = this.shannonEntropyArr;
            }

            each$1(entropies, function (site, i) {
              if (i >= parseInt(_this8.alignmentPosition.start + 0.5) && i <= parseInt(_this8.alignmentPosition.end + 0.5 - 1)) {
                var buf = filterAndSortEntroy(site);
                var preHeight = logoHeight * (1 - buf["sum"] / maxVal);
                each$1(buf["res"], function (val) {
                  var text = val.name.replace("-", "\\");
                  var height = logoHeight * val.value / maxVal;
                  var hRate = height / baseHeight;

                  _this8.headerCtx.transform(1, 0, 0, hRate, startX + wSize / 2 + wSize * (i - parseInt(_this8.alignmentPosition.start + 0.5)), startY + height + preHeight);

                  _this8.headerCtx.fillStyle = TAYLOR_COLOR[text];

                  _this8.headerCtx.fillText(text, 0, 0, wSize);

                  _this8.headerCtx.setTransform(1, 0, 0, 1, 0, 0);

                  preHeight = height + preHeight;
                });
              }
            });
          }
        }
        /**
         *  draw 1 - gap rate
         */

      }, {
        key: "_drawNonGrapRate",
        value: function _drawNonGrapRate() {
          var _this9 = this;

          if (this.options.nonGapRate.enable && this.baseWidth <= 10 && !this.isConservedRegionMode) {
            setTextAlign(this.headerCtx, "center");
            setFillStyle(this.headerCtx, "black"); // draw Y axis

            this.headerCtx.rotate(Math.PI * 3 / 2);
            drawTxt(this.headerCtx, "1 - gap rate", -(this.options.header.height / 2), this.options.header.left - 35, "14px sans-serif");
            this.headerCtx.rotate(Math.PI * 1 / 2);
            setTextAlign(this.headerCtx, "right");
            drawTxt(this.headerCtx, "0", this.options.header.left - 14, this.options.header.height, "12px sans-serif");
            drawTxt(this.headerCtx, "1", this.options.header.left - 14, this.options.header.top + 6, "12px sans-serif");
            setTextAlign(this.headerCtx, "center");
            setLineWidth(this.headerCtx, this.baseWidth);
            var bottomLineY = this.options.header.height;
            var maxVal = this.options.header.height - this.options.header.top - 1;
            each$1(this.gapRate, function (val, i) {
              if (i >= parseInt(_this9.alignmentPosition.start + 0.5) && i <= parseInt(_this9.alignmentPosition.end + 0.5 - 1)) {
                var x = _this9.options.header.left + (i - parseInt(_this9.alignmentPosition.start + 0.5)) * _this9.baseWidth + _this9.baseWidth * 0.5;
                drawLine(_this9.headerCtx, x, x, bottomLineY, bottomLineY - maxVal * (1 - val), 1 - val >= _this9.options.nonGapRate.th ? _this9.options.nonGapRate.highColor : _this9.options.nonGapRate.baseColor);
              }
            });
          }
        } // zoom functions

      }, {
        key: "_zoomIn",
        value: function _zoomIn() {
          var zoomSize = this.baseWidth < 5 ? 20 : this.baseWidth < 10 ? 10 : 5;

          if (this.alignmentPosition.end - this.alignmentPosition.start > 30) {
            this.alignmentPosition.start += zoomSize;
            this.alignmentPosition.end -= zoomSize;
            this.drawSequences();
          } else if (this.alignmentPosition.end - this.alignmentPosition.start > 10) {
            this.alignmentPosition.start += 2;
            this.alignmentPosition.end -= 2;
            this.drawSequences();
          } else if (this.alignmentPosition.end - this.alignmentPosition.start > 2) {
            this.alignmentPosition.start += 1;
            this.alignmentPosition.end -= 1;
            this.drawSequences();
          }
        }
      }, {
        key: "_zoomOut",
        value: function _zoomOut() {
          if (this.alignmentPosition.end - this.alignmentPosition.start < 30) {
            this.alignmentPosition.start -= 2;
            this.alignmentPosition.end += 2;
          } else {
            var zoomSize = this.baseWidth < 5 ? 20 : this.baseWidth < 10 ? 10 : 5;
            if (this.alignmentPosition.start == 0 && this.alignmentPosition.end == this.alignmentPosition.size) return;
            this.alignmentPosition.start -= zoomSize;
            this.alignmentPosition.end += zoomSize;

            if (this.alignmentPosition.start < 0) {
              this.alignmentPosition.start = 0;
            }

            if (this.alignmentPosition.end > this.alignmentPosition.size) {
              this.alignmentPosition.end = this.alignmentPosition.size;
            }
          }

          this.drawSequences();
        }
      }, {
        key: "_move",
        value: function _move(x) {
          if (x === 0) return;
          var moveSize = x / this.baseWidth;
          this.alignmentPosition.start -= moveSize;
          this.alignmentPosition.end -= moveSize;

          if (this.alignmentPosition.end > this.alignmentPosition.size) {
            this.alignmentPosition.start += moveSize;
            this.alignmentPosition.end = this.alignmentPosition.size;
          }

          if (this.alignmentPosition.start < 0) {
            this.alignmentPosition.start = 0;
            this.alignmentPosition.end += moveSize;
          }

          if (parseInt(this.alignmentPosition.start + 0.5) !== parseInt(this.alignmentPosition.preStart + 0.5) || parseInt(this.alignmentPosition.end - this.alignmentPosition.start + 0.5) !== parseInt(this.alignmentPosition.preEnd - this.alignmentPosition.preStart + 0.5)) {
            this.alignmentPosition.preStart = this.alignmentPosition.start;
            this.alignmentPosition.preEnd = this.alignmentPosition.end;
            this.drawSequences();
          }
        }
      }, {
        key: "_resetZoom",
        value: function _resetZoom() {
          this.alignmentPosition.preStart = this.alignmentPosition.start;
          this.alignmentPosition.preEnd = this.alignmentPosition.end;
          this.alignmentPosition.start = 0;
          this.alignmentPosition.end = this.alignmentPosition.size;
          this.drawSequences();
        }
      }]);

      return Alignment;
    }();

  var options$1 = {
    elementId: "def",
    setSize: true,
    height: 600,
    width: 600,
    outerRadius: 400,
    innnerRadius: 20,
    ringMargin: 2,
    highlighterEnable: true
  };

  var CircularGenomeBrowser =
    /*#__PURE__*/
    function () {
      function CircularGenomeBrowser(opt) {
        _classCallCheck(this, CircularGenomeBrowser);

        this.options = _objectSpread2({}, options$1, {}, opt);
        this.container = null;
        this.width = 0;
        this.height = 0;
        this.halfX = 0;
        this.halfY = 0;
        this.inputJson = null;
        this.numGenomes = null;
        this.maxRadius = 0;
        this.ringSize = 0;
        this.highlightCanvas = null;
        this.highlighter = null;
      }

      _createClass(CircularGenomeBrowser, [{
        key: "setContainer",
        value: function setContainer(elementID) {
          console.log("load element: " + elementID);
          this.container = selectID(elementID);
          this.container.html("");
          this.options.elementId = elementID;

          if (!this.options.setSize) {
            this.width = this.container.elements[0].clientWidth;
            this.height = this.container.elements[0].clientHeight;
          } else {
            this.height = this.options.height;
            this.width = this.options.width;
          }

          this.canvasHeight = this.width;
          this.halfX = this.width / 2;
          this.halfY = this.canvasHeight / 2;
        }
        /**
         * @param {json} json 
         */

      }, {
        key: "setJson",
        value: function setJson(json) {
          this.inputJson = json;
          this.numGenomes = json["genomes"].length;
        }
      }, {
        key: "render",
        value: function render() {
          this._DOMcreate();

          this.ctx = this.mainCanvas.elements[0].getContext("2d");

          if (this.options.highlighterEnable) {
            this.highlighter = new Highlighter$1(this.highlightCanvas, this.width, this.canvasHeight, this.inputJson);
          }

          this.drawCircularGenomes();
        }
      }, {
        key: "_DOMcreate",
        value: function _DOMcreate() {
          this.bodyContainer = this.container.create("div").setID("".concat(this.options.elementId, "_body")).style("position", "relative").setClass("d-flex flex-row");
          this.canvasContainer = this.bodyContainer.create("div").setID("".concat(this.options.elementId, "_canvasContainer")).style("height", "".concat(this.canvasHeight, "px"));
          this.mainCanvas = this.canvasContainer.create("canvas").style("position", "absolute").style("top", "0").setID("".concat(this.options.elementId, "_canvas")).attr("height", this.canvasHeight).attr("width", this.width).style("left", "0");
          this.highlightCanvas = this.canvasContainer.create("canvas").setID("".concat(this.options.elementId, "_highlight_canvas")).attr("height", this.canvasHeight).attr("width", this.width).style("position", "absolute").style("top", "0").style("left", "0");
        }
      }, {
        key: "redrawCircularGenomes",
        value: function redrawCircularGenomes() {
          this._drawKaryotype();

          clear(this.ctx, this.width, this.canvasHeight);

          this._drawCircularGenomes();
        }
      }, {
        key: "drawCircularGenomes",
        value: function drawCircularGenomes() {
          this._init_radius();

          clear(this.ctx, this.width, this.canvasHeight);

          this._drawKaryotype();

          this._drawCircularGenomes();
        }
      }, {
        key: "_init_radius",
        value: function _init_radius() {
          this.ringSize = (this.options.outerRadius - (this.numGenomes - 1) * this.options.ringMargin - this.options.innnerRadius) / this.numGenomes;

          if (this.ringSize < 0) {
            this.options.ringMargin = 1;
            this.ringSize = (this.options.outerRadius - (this.numGenomes - 1) * this.options.ringMargin - this.options.innnerRadius) / this.numGenomes;
          }

          if (this.ringSize < 0) {
            this.options.ringMargin = 0;
            this.ringSize = (this.options.outerRadius - this.options.innnerRadius) / this.numGenomes;
          }

          console.log("Ring size: " + this.ringSize);
          this.maxRadius = this.options.outerRadius + this.ringSize / 2;
          if (this.highlighter) this.highlighter.maxRadius = this.maxRadius + 10;

          for (var i = 0; i < this.numGenomes; i++) {
            this.inputJson.genomes[i]["r"] = this.options.outerRadius - this.inputJson.genomes[i].order * (this.ringSize + this.options.ringMargin);
          }
        }
      }, {
        key: "_drawCircularGenomes",
        value: function _drawCircularGenomes() {
          setLineWidth(this.ctx, this.ringSize);

          for (var i = 0; i < this.numGenomes; i++) {
            for (var l = 0; l < this.inputJson.genomes[i].genes.length; l++) {
              drawArc(this.ctx, this.halfX, this.halfY, this.inputJson.genomes[i]["r"], this.inputJson.genomes[i].genes[l]["start_rotated_rad"], this.inputJson.genomes[i].genes[l]["end_rotated_rad"], this.inputJson.genomes[i].genes[l].angle);
            }
          }
        }
      }, {
        key: "_drawKaryotype",
        value: function _drawKaryotype() {
          setLineWidth(this.ctx, 5);

          for (var i = 0; i < 360; i++) {
            drawArc(this.ctx, this.halfX, this.halfY, this.maxRadius, this.convertDeg2Rad(i), this.convertDeg2Rad(i + 1), i);
          }
        }
      }, {
        key: "convertDeg2Rad",
        value: function convertDeg2Rad(deg) {
          return 2 * Math.PI * deg / 360;
        }
      }]);

      return CircularGenomeBrowser;
    }();

  var Highlighter$1 =
    /*#__PURE__*/
    function () {
      function Highlighter(canvas, width, height, json) {
        _classCallCheck(this, Highlighter);

        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.halfX = this.width / 2;
        this.halfY = this.height / 2;
        this.maxRadius = 0;
        this.ctx = this.canvas.elements[0].getContext("2d");
        this.inputJson = json;
        this.isHighlightLock = false;
        this.zoomSize = 0.5;
        this.updateFunction = null;
        this.zoomStart = 0;
        this.zoomEnd = 0;

        this._init();
      }

      _createClass(Highlighter, [{
        key: "clear",
        value: function clear$1() {
          clear(this.ctx, this.width, this.height);
        }
      }, {
        key: "showArc",
        value: function showArc(start, end) {
          this.clear();
          this.setLineWidth(5);
          this.ctx.beginPath();
          this.ctx.moveTo(this.halfX, this.halfY);
          this.ctx.arc(this.halfX, this.halfY, this.maxRadius, start, end);
          this.ctx.fillStyle = "rgba(50,50,50,0.5)";
          this.ctx.strokeStyle = "rgba(50,50,50, 0.7)";
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.stroke();
          this.ctx.restore();
        }
      }, {
        key: "showArcRegions",
        value: function showArcRegions(r, ringSize, start, end) {
          this.ctx.beginPath();
          this.ctx.arc(this.halfX, this.halfY, r + ringSize / 2, start, end);
          this.ctx.lineTo(this.halfX + (r - ringSize / 2) * Math.cos(end), this.halfY + (r - ringSize / 2) * Math.sin(end));
          this.ctx.arc(this.halfX, this.halfY, r - ringSize / 2, end, start, true);
          this.ctx.lineTo(this.halfX + (r + ringSize / 2) * Math.cos(start), this.halfY + (r + ringSize / 2) * Math.sin(start));
          this.ctx.stroke();
          this.ctx.fill();
        }
      }, {
        key: "setLineWidth",
        value: function setLineWidth$1(x) {
          setLineWidth(this.ctx, x);
        }
      }, {
        key: "setUpdateFunction",
        value: function setUpdateFunction(func) {
          this.updateFunction = func;
        }
      }, {
        key: "_init",
        value: function _init() {
          var _this = this;

          this.canvas.on("mousemove", function () {
            if (!_this.isHighlightLock) {
              var xy = _this.canvas.mouse;

              var angle = _this._getAngleFromMousePosition(xy);

              _this.zoomStart = angle - _this.zoomSize;
              _this.zoomEnd = angle + _this.zoomSize;

              _this.showArc(_this.zoomStart, _this.zoomEnd);
            }
          }).on("mouseleave", function () {
            if (!_this.isHighlightLock) {
              _this.clear();
            }
          }).on("click", function () {
            if (!_this.isHighlightLock) {
              _this.isHighlightLock = true;

              if (_this.updateFunction) {
                _this.updateFunction(_this.zoomStart, _this.zoomEnd);
              }
            } else {
              _this.isHighlightLock = false;
            }
          });
        }
      }, {
        key: "_getAngleFromMousePosition",
        value: function _getAngleFromMousePosition(xy) {
          var x = xy[0] - this.halfX;
          var y = xy[1] - this.halfX;
          var tan = y / x;
          var angle = Math.atan(tan);

          if (x < 0) {
            return angle + Math.PI;
          } else {
            return angle;
          }
        }
      }]);

      return Highlighter;
    }();

  var options$2 = {
    elementId: "def",
    setSize: false,
    height: 600,
    width: 600,
  };

  var LinearGenomeBrowser =
    /*#__PURE__*/
    function () {
      function LinearGenomeBrowser(opt) {
        _classCallCheck(this, LinearGenomeBrowser);

        this.options = _objectSpread2({}, options$2, {}, opt);
      }

      _createClass(LinearGenomeBrowser, [{
        key: "setContainer",
        value: function setContainer(elementID) {
          console.log("load element: " + elementID);
          this.container = selectID(elementID);
          this.container.html("");
          this.options.elementId = elementID;

          if (!this.options.setSize) {
            this.width = this.container.elements[0].clientWidth;
            this.height = this.container.elements[0].clientHeight;
          } else {
            this.height = this.options.height;
            this.width = this.options.width;
          }

          this.canvasHeight = this.width;
          this.halfX = this.width / 2;
          this.halfY = this.canvasHeight / 2;
        }
      }, {
        key: "setJson",
        value: function setJson(json) {
          this.inputJson = json;
          this.numGenomes = json["genomes"].length;
        }
      }, {
        key: "render",
        value: function render() {
          this._DOMcreate();

          this.ctx = this.mainCanvas.elements[0].getContext("2d");

          if (this.options.highlighterEnable) {
            this.highlighter = new Highlighter(this.highlightCanvas, this.width, this.canvasHeight, this.inputJson);
          } //        this.drawCircularGenomes();

        }
      }, {
        key: "_DOMcreate",
        value: function _DOMcreate() {
          this.bodyContainer = this.container.create("div").setID("".concat(this.options.elementId, "_body")).style("position", "relative").setClass("d-flex flex-row");
          this.canvasContainer = this.bodyContainer.create("div").setID("".concat(this.options.elementId, "_canvasContainer")).style("height", "".concat(this.canvasHeight, "px"));
          this.mainCanvas = this.canvasContainer.create("canvas").style("position", "absolute").style("top", "0").setID("".concat(this.options.elementId, "_canvas")).attr("height", this.canvasHeight).attr("width", this.width).style("left", "0");
          this.highlightCanvas = this.canvasContainer.create("canvas").setID("".concat(this.options.elementId, "_highlight_canvas")).attr("height", this.canvasHeight).attr("width", this.width).style("position", "absolute").style("top", "0").style("left", "0");
        }
      }]);

      return LinearGenomeBrowser;
    }();

  exports.Alignment = Alignment;
  exports.CLUSTAL2_COLOR = CLUSTAL2_COLOR;
  exports.COLER_ARR = COLER_ARR;
  exports.CircularGenomeBrowser = CircularGenomeBrowser;
  exports.LinearGenomeBrowser = LinearGenomeBrowser;
  exports.PROTEIN_COL_V1 = PROTEIN_COL_V1;
  exports.STRAND_COLOR = STRAND_COLOR;
  exports.TAYLOR_COLOR = TAYLOR_COLOR;
  exports.calcGapRate = calcGapRate;
  exports.calcShannonEntropy = calcShannonEntropy;
  exports.conservedRegionLength = conservedRegionLength;
  exports.countBy = countBy;
  exports.each = each$1;
  exports.exportJson = exportJson;
  exports.exportSVG = exportSVG;
  exports.exportText = exportText;
  exports.filterAndSortEntroy = filterAndSortEntroy;
  exports.generateLink = generateLink;
  exports.getAllSequenceAsFasta = getAllSequenceAsFasta;
  exports.getColors = getColors;
  exports.getConservedRegionAsFasta = getConservedRegionAsFasta;
  exports.getTrueArr = getTrueArr;
  exports.groupBy = groupBy;
  exports.indexBy = indexBy;
  exports.isConservedRegoin = isConservedRegoin;
  exports.json = json;
  exports.select = select;
  exports.selectAll = selectAll;
  exports.selectClass = selectClass;
  exports.selectID = selectID;
  exports.seqStat = seqStat;
  exports.text = text;

  return exports;

}({}));
//# sourceMappingURL=bundle.js.map