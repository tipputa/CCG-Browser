import {
    Viewer
} from "../common/viewer";
import {
    options
} from "./option";
import * as utils from "../utils/index";

class AlignmentPosition {
    constructor(size) {
        this.start = 0;
        this.end = size;
        this.size = size;
    }
}

const getGroup = (dicArr) => {
    const _group = {};
    let counter = 0;
    utils.each(dicArr, (val, i, arr) => {
        if (val["group"] in _group) {
            _group[val["group"]].count++;
            _group[val["group"]].names.push(val["name"])
        } else {
            _group[val["group"]] = {
                count: 1,
                col: utils.getColors(counter++, 45),
                names: [val["name"]]
            }
        }
    });
    return _group;
}

const drawCtx = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(200, 50);
    ctx.lineTo(250, 200);
    ctx.lineWidth = 100;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black"
    ctx.stroke();
}

const initCtx = (ctx, lineWidth) => {
    ctx.lineWidth = lineWidth
}

const drawLine = (ctx, startX, endX, startY, endY, strokeStyle) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
}

const refreshCtx = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
}

export class Alignment extends Viewer {
    constructor() {
        super();
        this.container = null;
        this.inputJson = null;
        this.options = {
            ...options,
        }

        this.numSeq = 0;
        this.group = null;

        this.canvasHeight = 0;
        this.headerContainer = null;
        this.bodyContainer = null;
        this.labelContainer = null;
        this.canvasContainer = null;
        this.ctx = null;
        this.alignmentPosition = null;
        this.baseWidth = 0;
    }

    /**
     * 
     * @param {string} elementID without # 
     */
    setContainer(elementID) {
        this.container = utils.selectID(elementID);
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
    setJson(json) {
        this.inputJson = json;
        this.numSeq = json["sequences"].length;
        this.canvasHeight = this.numSeq * this.options.seqHeight + 50;
        this.alignmentPosition = new AlignmentPosition(json["sequences"][0]["seq"].length);
    }

    render() {
        if (this.options.isGrouping) {
            this.group = getGroup(this.inputJson["sequences"]);
            let counter = 0;
            for (const key in this.group) {
                const name = key;
                utils.each(this.inputJson["sequences"], (val) => {
                    if (val.group === key) {
                        val.order = counter++;
                    }
                });
            }
        }
        this._DOMcreate();
        this._drawSequences();
    }

    _DOMcreate() {
        this.options.sequence.width = this.width - this.options.label.width - this.options.label.left - this.options.sequence.left - this.options.sequence.right;

        this.headerContainer = this.container.create("div")
            .setID(`${this.options.id}_header`)
        /*   .style("height", this.options.header.height + "px")
           .style("background-color", "green")
           .html("Alignment Viewer Header");
           */
        this.bodyContainer = this.container.create("div")
            .setID(`${this.options.id}_body`)
            .style("position", "relative")
        /*
                this.labelContainer = this.bodyContainer.create("div")
                    .setID(`${this.options.id}_label`)
                    .style("position", "absolute")
                    .style("height", `${this.canvasHeight}px`)
                    .style("width", `${this.options.label.width}px`)
                    .style("margin-left", `${this.options.label.left}px`)
                    .style("margin-top", `${this.options.label.top}px`);
          */
        this.canvasContainer = this.bodyContainer.create("div")
            .setID(`${this.options.id}_canvasContainer`)
            .style("position", "relative")
            .style("height", `${this.canvasHeight}px`);

        this.mainCanvas = this.canvasContainer.create("canvas")
            .setID(`${this.options.id}_canvas`)
            .style("position", "absolute")
            .style("left", (this.options.label.width + this.options.label.left + this.options.sequence.left) + "px")
            .style("top", this.options.sequence.top + "px")
            .attr("height", this.canvasHeight)
            .attr("width", this.options.sequence.width);
        this.mainCanvas
            .on("mousemove", () => {
                event.preventDefault();
                if (this.isDragging) {
                    this._move(event.movementX);
                }
            })
            .on("mousewheel", () => {
                event.preventDefault();
                if (event.deltaY > 0) {
                    this._zoomOut();
                } else if (event.deltaY < 0) {
                    this._zoomIn();
                }
            })
            .on("mousedown", () => {
                event.preventDefault();
                // 0: left button, 1: wheel, 2: right
                if (event.button == 0) {
                    this.isDragging = true;
                }
            })
            .on("mouseup", () => {
                event.preventDefault();
                // 0: left button, 1: wheel, 2: right
                if (event.button == 0) {
                    this.isDragging = false;
                }
            })
            .on("mouseout", () => {
                this.isDragging = false;
            })
            .on("dblclick", () => {
                this._zoomIn();
            });

        this.ctx = this.mainCanvas.elements[0].getContext("2d");
        utils.each(this.inputJson["sequences"], (val) => {
            this._drawSequenceLabel(val);
        });
    }

    _drawSequences() {
        refreshCtx(this.ctx, this.options.sequence.width, this.canvasHeight);
        const seqWidth = this.options.seqHeight - this.options.sequence.topMargin - this.options.sequence.bottomMargin;
        initCtx(this.ctx, seqWidth);
        utils.each(this.inputJson["sequences"], (val, i) => {
            this._drawSequence(val, i);
        });
    }

    _drawSequence(alignment) {
        const y = this.options.seqHeight * (alignment["order"] + 1) + this.options.sequence.topMargin;
        const seq = alignment["seq"].substr(this.alignmentPosition.start, parseInt(this.alignmentPosition.end - this.alignmentPosition.start)).split("");
        this.baseWidth = (this.options.sequence.width) / seq.length
        if (this.baseWidth < 10) {
            utils.each(seq, (val, i) => {
                drawLine(this.ctx, i * this.baseWidth, (i + 1) * this.baseWidth, y, y, utils.PROTEIN_COL_V1[val]);
            });
        } else {
            utils.each(seq, (val, i) => {
                this.ctx.beginPath();
                this.ctx.font = this.options.sequence.fontSize + "px Arial serif";
                this.ctx.moveTo(i * this.baseWidth, y);
                this.ctx.lineTo((i + 1) * this.baseWidth, y);
                this.ctx.strokeStyle = utils.PROTEIN_COL_V1[val];
                this.ctx.fillStyle = "black";
                this.ctx.textAlign = "center";
                this.ctx.stroke();
                this.ctx.fillText(val, (i * this.baseWidth) + this.baseWidth / 2, y + this.options.sequence.fontSize * 0.33);

            });
        }
    }

    _drawSequenceLabel(alignment) {
        const y = this.options.seqHeight * (alignment.order + 1) - this.options.label.fontSize / 2;
        this.bodyContainer.create("div")
            .style("position", "absolute")
            .style("top", y + "px")
            .style("font-size", this.options.label.fontSize + "px")
            .style("color", this.group[alignment["group"]].col)
            .html(alignment.name + "_" + alignment["group"]);
    }

    _zoomIn() {
        let zoomSize = 5;
        if (this.alignmentPosition.end - this.alignmentPosition.start > 30) {
            this.alignmentPosition.start += zoomSize;
            this.alignmentPosition.end -= zoomSize;
        }
        this._drawSequences();
    }

    _zoomOut() {
        let zoomSize = 5;
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

    _move(x) {
        let moveSize = 10;
        if (x > 10) {
            moveSize = 10;
        } else {
            moveSize = 5;
        }
        if (x < 0) {
            this.alignmentPosition.start += moveSize;
            this.alignmentPosition.end += moveSize;
            if (this.alignmentPosition.end > this.alignmentPosition.size) {
                let diff = this.alignmentPosition.end - this.alignmentPosition.size
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

}