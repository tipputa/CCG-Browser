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

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  /**
   * Test functio nto print text message
   * @param {*} txt input text message
   */
  function message(txt) {
    console.log(txt);
    console.log(this.v);
  }

  var BaseClass =
  /*#__PURE__*/
  function () {
    function BaseClass() {
      _classCallCheck(this, BaseClass);

      this.name = "my name";
    }

    _createClass(BaseClass, [{
      key: "echoName",
      value: function echoName() {
        console.log(this.name);
      }
    }]);

    return BaseClass;
  }();

  var GraphicBase =
  /*#__PURE__*/
  function (_BaseClass) {
    _inherits(GraphicBase, _BaseClass);

    function GraphicBase() {
      var _this;

      _classCallCheck(this, GraphicBase);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(GraphicBase).call(this));
      _this.v = "a";
      _this.name = "new name";
      _this.echo = message;
      return _this;
    }

    _createClass(GraphicBase, [{
      key: "get",
      value: function get() {
        return this.v;
      }
    }]);

    return GraphicBase;
  }(BaseClass);

  var getFunc = function getFunc(data) {
    return function (txt) {
      console.log(txt);
    };
  };

  var func = getFunc();

  // almost same functions as underscore.js
  // ref: https: //underscorejs.org/docs/underscore.html
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

  var each = function each(obj, iteratee, context) {
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

        each(this.elements, function (el) {
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

        each(this.elements, function (el) {
          var newEle = document.createElement(elementName);
          el.appendChild(newEle);
          elements.push(el.lastElementChild);
        });

        return new Selector(elements);
      }
    }, {
      key: "style",
      value: function style(stylName, styleValue) {
        each(this.elements, function (el) {
          el.style.setProperty(stylName, styleValue);
        });

        return this;
      }
    }, {
      key: "attr",
      value: function attr(attrName, attrValue) {
        each(this.elements, function (el) {
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
            each(this.elements, function (el) {
              el.textContent = text;
            });
          } else {
            each(this.elements, function (el) {
              el.textContent = text;
            });

            return this;
          }
        } else {
          var res = [];

          each(this.elements, function (el) {
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

  var Viewer = function Viewer() {
    _classCallCheck(this, Viewer);

    this.height = 500;
    this.width = 500;
    this.mainCanvas = null;
    this.isDragging = false;
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
    seqHeight: 12,
    isGrouping: true,
    header: _objectSpread2({}, size, {}, font, {
      height: 50
    }),
    label: _objectSpread2({}, size, {}, font, {
      fontSize: 9,
      left: 10,
      top: 0,
      width: 200
    }),
    sequence: _objectSpread2({}, size, {}, font, {
      fontSize: 9,
      left: 10,
      top: 3,
      width: 480,
      topMargin: 0,
      bottomMargin: 0
    })
  };

  var AlignmentPosition = function AlignmentPosition(size) {
    _classCallCheck(this, AlignmentPosition);

    this.start = 0;
    this.end = size;
    this.size = size;
  };

  var getGroup = function getGroup(dicArr) {
    var _group = {};
    var counter = 0;
    each(dicArr, function (val, i, arr) {
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

  var initCtx = function initCtx(ctx, lineWidth) {
    ctx.lineWidth = lineWidth;
  };

  var drawLine = function drawLine(ctx, startX, endX, startY, endY, strokeStyle) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  };

  var refreshCtx = function refreshCtx(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
  };

  var Alignment =
  /*#__PURE__*/
  function (_Viewer) {
    _inherits(Alignment, _Viewer);

    function Alignment() {
      var _this;

      _classCallCheck(this, Alignment);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Alignment).call(this));
      _this.container = null;
      _this.inputJson = null;
      _this.options = _objectSpread2({}, options);
      _this.numSeq = 0;
      _this.group = null;
      _this.canvasHeight = 0;
      _this.headerContainer = null;
      _this.bodyContainer = null;
      _this.labelContainer = null;
      _this.canvasContainer = null;
      _this.ctx = null;
      _this.alignmentPosition = null;
      _this.baseWidth = 0;
      return _this;
    }
    /**
     * 
     * @param {string} elementID without # 
     */


    _createClass(Alignment, [{
      key: "setContainer",
      value: function setContainer(elementID) {
        this.container = selectID(elementID);
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
        this.inputJson = json;
        this.numSeq = json["sequences"].length;
        this.canvasHeight = this.numSeq * this.options.seqHeight + 50;
        this.alignmentPosition = new AlignmentPosition(json["sequences"][0]["seq"].length);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        if (this.options.isGrouping) {
          (function () {
            _this2.group = getGroup(_this2.inputJson["sequences"]);
            var counter = 0;

            var _loop = function _loop(key) {
              each(_this2.inputJson["sequences"], function (val) {
                if (val.group === key) {
                  val.order = counter++;
                }
              });
            };

            for (var key in _this2.group) {
              _loop(key);
            }
          })();
        }

        this._DOMcreate();

        this._drawSequences();
      }
    }, {
      key: "_DOMcreate",
      value: function _DOMcreate() {
        var _this3 = this;

        this.options.sequence.width = this.width - this.options.label.width - this.options.label.left - this.options.sequence.left - this.options.sequence.right;
        this.headerContainer = this.container.create("div").setID("".concat(this.options.id, "_header"));
        /*   .style("height", this.options.header.height + "px")
           .style("background-color", "green")
           .html("Alignment Viewer Header");
           */

        this.bodyContainer = this.container.create("div").setID("".concat(this.options.id, "_body")).style("position", "relative");
        /*
                this.labelContainer = this.bodyContainer.create("div")
                    .setID(`${this.options.id}_label`)
                    .style("position", "absolute")
                    .style("height", `${this.canvasHeight}px`)
                    .style("width", `${this.options.label.width}px`)
                    .style("margin-left", `${this.options.label.left}px`)
                    .style("margin-top", `${this.options.label.top}px`);
          */

        this.canvasContainer = this.bodyContainer.create("div").setID("".concat(this.options.id, "_canvasContainer")).style("position", "relative").style("height", "".concat(this.canvasHeight, "px"));
        this.mainCanvas = this.canvasContainer.create("canvas").setID("".concat(this.options.id, "_canvas")).style("position", "absolute").style("left", this.options.label.width + this.options.label.left + this.options.sequence.left + "px").style("top", this.options.sequence.top + "px").attr("height", this.canvasHeight).attr("width", this.options.sequence.width);
        this.mainCanvas.on("mousemove", function () {
          event.preventDefault();

          if (_this3.isDragging) {
            _this3._move(event.movementX);
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
          _this3._zoomIn();
        });
        this.ctx = this.mainCanvas.elements[0].getContext("2d");
        each(this.inputJson["sequences"], function (val) {
          _this3._drawSequenceLabel(val);
        });
      }
    }, {
      key: "_drawSequences",
      value: function _drawSequences() {
        var _this4 = this;

        refreshCtx(this.ctx, this.options.sequence.width, this.canvasHeight);
        var seqWidth = this.options.seqHeight - this.options.sequence.topMargin - this.options.sequence.bottomMargin;
        initCtx(this.ctx, seqWidth);
        each(this.inputJson["sequences"], function (val, i) {
          _this4._drawSequence(val, i);
        });
      }
    }, {
      key: "_drawSequence",
      value: function _drawSequence(alignment) {
        var _this5 = this;

        var y = this.options.seqHeight * (alignment["order"] + 1) + this.options.sequence.topMargin;
        var seq = alignment["seq"].substr(this.alignmentPosition.start, parseInt(this.alignmentPosition.end - this.alignmentPosition.start)).split("");
        this.baseWidth = this.options.sequence.width / seq.length;

        if (this.baseWidth < 10) {
          each(seq, function (val, i) {
            drawLine(_this5.ctx, i * _this5.baseWidth, (i + 1) * _this5.baseWidth, y, y, PROTEIN_COL_V1[val]);
          });
        } else {
          each(seq, function (val, i) {
            _this5.ctx.beginPath();

            _this5.ctx.font = _this5.options.sequence.fontSize + "px Arial serif";

            _this5.ctx.moveTo(i * _this5.baseWidth, y);

            _this5.ctx.lineTo((i + 1) * _this5.baseWidth, y);

            _this5.ctx.strokeStyle = PROTEIN_COL_V1[val];
            _this5.ctx.fillStyle = "black";
            _this5.ctx.textAlign = "center";

            _this5.ctx.stroke();

            _this5.ctx.fillText(val, i * _this5.baseWidth + _this5.baseWidth / 2, y + _this5.options.sequence.fontSize * 0.33);
          });
        }
      }
    }, {
      key: "_drawSequenceLabel",
      value: function _drawSequenceLabel(alignment) {
        var y = this.options.seqHeight * (alignment.order + 1) - this.options.label.fontSize / 2;
        this.bodyContainer.create("div").style("position", "absolute").style("top", y + "px").style("font-size", this.options.label.fontSize + "px").style("color", this.group[alignment["group"]].col).html(alignment.name + "_" + alignment["group"]);
      }
    }, {
      key: "_zoomIn",
      value: function _zoomIn() {
        var zoomSize = 5;

        if (this.alignmentPosition.end - this.alignmentPosition.start > 30) {
          this.alignmentPosition.start += zoomSize;
          this.alignmentPosition.end -= zoomSize;
        }

        this._drawSequences();
      }
    }, {
      key: "_zoomOut",
      value: function _zoomOut() {
        var zoomSize = 5;
        if (this.alignmentPosition.start == 0 && this.alignmentPosition.end == this.alignmentPosition.size) return;
        this.alignmentPosition.start -= zoomSize;
        this.alignmentPosition.end += zoomSize;

        if (this.alignmentPosition.start < 0) {
          this.alignmentPosition.start = 0;
        }

        if (this.alignmentPosition.end > this.alignmentPosition.size) {
          this.alignmentPosition.end = this.alignmentPosition.size;
        }

        this._drawSequences();
      }
    }, {
      key: "_move",
      value: function _move(x) {
        var moveSize = 10;

        if (x > 10) {
          moveSize = 10;
        } else {
          moveSize = 5;
        }

        if (x < 0) {
          this.alignmentPosition.start += moveSize;
          this.alignmentPosition.end += moveSize;

          if (this.alignmentPosition.end > this.alignmentPosition.size) {
            var diff = this.alignmentPosition.end - this.alignmentPosition.size;
            this.alignmentPosition.start -= diff;
            this.alignmentPosition.end -= diff;
          }
        } else {
          this.alignmentPosition.start -= moveSize;
          this.alignmentPosition.end -= moveSize;

          if (this.alignmentPosition.start < 0) {
            this.alignmentPosition.start = 0;
            this.alignmentPosition.end += moveSize;
          }
        }

        this._drawSequences();
      }
    }]);

    return Alignment;
  }(Viewer);

  exports.Alignment = Alignment;
  exports.COLER_ARR = COLER_ARR;
  exports.GraphicBase = GraphicBase;
  exports.PROTEIN_COL_V1 = PROTEIN_COL_V1;
  exports.each = each;
  exports.func = func;
  exports.getColors = getColors;
  exports.json = json;
  exports.select = select;
  exports.selectAll = selectAll;
  exports.selectClass = selectClass;
  exports.selectID = selectID;
  exports.text = text;

  return exports;

}({}));
//# sourceMappingURL=bundle.js.map
