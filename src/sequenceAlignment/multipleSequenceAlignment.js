import {
    Viewer
} from "../common/viewer";
import {
    options
} from "./option";
import * as drawer from "../utils/canvas"

import * as utils from "../utils/index";

class AlignmentPosition {
    constructor(size) {
        this.start = 0;
        this.end = size;
        this.size = size;
        this.preStart = -1;
        this.preEnd = -1;
    }
    update(size) {
        this.start = 0;
        this.end = size;
        this.size = size;
        this.preStart = -1;
        this.preEnd = -1;
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



export class Alignment extends Viewer {
    constructor(id, opt) {
        super();
        this.id = id;
        this.container = null;
        this.inputJson = null;
        this.options = {
            ...options,
            ...opt,
        }

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
        this.seqLength = 0;

        // sortable and highlight
        this.orderedAlignments = null;
        this.highlightedIndicies = null;

        // conserved region mode
        this.isConservedRegionMode = false;
        this.conservedRegionBooleanArr = null;
        this.conservedRegionLength = 0;


        // seqLog & 1 - gapRate
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
    setContainer(elementID) {
        this.container = utils.selectID(elementID);
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
    setJson(json) {
        this.inputJson = json;
        this.numSeq = json["sequences"].length;
        this.canvasHeight = this.numSeq * this.options.seqHeight + 50;
        this.seqLength = this.inputJson["sequences"][0]["seq"].length;
        this.alignmentPosition = new AlignmentPosition(this.seqLength);
        this.seqStat = utils.seqStat(this.inputJson["sequences"]);
        this.conservedRegionBooleanArr = utils.isConservedRegoin(this.seqStat);
        this.conservedRegionLength = utils.conservedRegionLength(this.seqStat);
        this.gapRate = utils.calcGapRate(this.seqStat, this.numSeq);
        this.shannonEntropyArr = utils.calcShannonEntropy(this.seqStat, this.numSeq);

        // grouping
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
        this.orderedAlignments = new Array(this.inputJson["sequences"].length);
        utils.each(this.inputJson["sequences"], (alignment) => {
            this.orderedAlignments[alignment.order] = alignment;
        })
    }

    render() {
        this._DOMcreate();
        this.ctx = this.mainCanvas.elements[0].getContext("2d");

        this._initHeader();
        this._drawSequenceLabel();
        this.drawSequences();
    }

    zoomInShowSequence() {
        if (this.alignmentPosition.end - this.alignmentPosition.start < 20) return;
        this.alignmentPosition.preStart = this.alignmentPosition.start;
        this.alignmentPosition.preEnd = this.alignmentPosition.end;
        this.alignmentPosition.start = 0;
        this.alignmentPosition.end = 30;
        this.drawSequences();
    }

    change2conservedRegion() {
        this.isConservedRegionMode = true;
        this.alignmentPosition.update(this.conservedRegionLength);
        this.drawSequences();
    }

    change2allRegion() {
        this.isConservedRegionMode = false;
        this.alignmentPosition.update(this.seqLength);
        this.drawSequences();
    }

    saveRawJson() {
        utils.exportJson(this.inputJson, `all_rawJson_${this.id}.json`);
    }

    saveAllSequence() {
        utils.exportText(utils.getAllSequenceAsFasta(this.inputJson["sequences"]), `all_alignments_${this.id}.fas`);
    }

    saveConservedRegion() {
        utils.exportText(utils.getConservedRegionAsFasta(this.inputJson["sequences"], this.conservedRegionBooleanArr), `conservedRegion_alignments_${this.id}.fas`);
    }

    saveVisualizedRegion() {
        if (this.isConservedRegionMode) {
            const seqs = []
            utils.each(this.inputJson["sequences"], (val) => {
                const conservedSeq = utils.getTrueArr(val.seq.split(""), this.conservedRegionBooleanArr);
                const targetSeq = conservedSeq.slice(parseInt(this.alignmentPosition.start + 0.5), parseInt(this.alignmentPosition.end + 0.5)).join("");
                seqs.push({
                    name: val.name,
                    seq: targetSeq
                });
            });
            utils.exportText(utils.getAllSequenceAsFasta(seqs), `visualizedRegion_conserved_${this.id}.fas`);

        } else {
            const seqs = [];
            utils.each(this.inputJson["sequences"], (val) => {
                const targetSeq = val.seq.substr(parseInt(this.alignmentPosition.start + 0.5), parseInt(this.alignmentPosition.end + 0.5) - parseInt(this.alignmentPosition.start + 0.5));
                seqs.push({
                    name: val.name,
                    seq: targetSeq
                });
            });
            utils.exportText(utils.getAllSequenceAsFasta(seqs), `visualizedRegion_${this.id}.fas`);
        }
    }


    _DOMcreate() {
        this.options.sequence.width = this.width - this.options.label.width - this.options.label.left - this.options.sequence.left - this.options.sequence.right;

        this.headerContainer = this.container.create("div")
            .setID(`${this.options.id}_header`)
        //    .html("Alignment Viewer Header");

        this.bodyContainer = this.container.create("div")
            .setID(`${this.options.id}_body`)
            .style("position", "relative")
            .setClass("d-flex flex-row")

        this.canvasContainer = this.bodyContainer.create("div")
            .setID(`${this.options.id}_canvasContainer`)
            .style("position", "relative")
            .style("height", `${this.canvasHeight}px`);

        this.labelContainer = this.bodyContainer.create("div")
            .setID(`${this.options.id}_label`)
            //.style("position", "absolute")
            //.style("height", `${this.canvasHeight}px`)
            //.style("width", `${this.options.label.width}px`)
            .style("margin-left", `${this.options.label.left}px`)
            .style("margin-top", (this.options.label.top + this.options.scaleBar.height) + "px")

        this.mainCanvas = this.canvasContainer.create("canvas")
            .setID(`${this.options.id}_canvas`)
            .style("position", "absolute")
            .style("left", (this.options.label.width + this.options.label.left) + "px")
            .style("top", this.options.sequence.top + "px")
            .attr("height", this.canvasHeight)
            .attr("width", this.width - this.options.label.width - this.options.label.left);

        this.mainCanvas
            .on("mousemove", () => {
                event.preventDefault();
                if (this.isDragging) {
                    this._move(event.movementX / window.devicePixelRatio);
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
                this._resetZoom();
            });
    }

    /*    _sortAlignments(newIndex, oldIndex) {
            const target = this.orderedAlignments[oldIndex]
            this.orderedAlignments.splice(oldIndex, 1);
            this.orderedAlignments.splice(newIndex, 0, target);
            this._drawSequences();
        }
    */

    _initHeader() {
        if (this.options.header.enable) {
            this.headerCanvas = this.headerContainer
                .style("position", "relative")
                .style("height", this.options.header.height + 2 + "px")
                .create("canvas")
                .attr("height", this.options.header.height + 2 + "px")
                .attr("width", this.width)
                .style("position", "absolute");
            this.headerCtx = this.headerCanvas.elements[0].getContext("2d");
            this.options.header.left = this.options.sequence.left + this.options.label.width + this.options.label.left + this.options.label.right;
        }
    }


    _updateSortInfo(sortable) {
        const sortArr = sortable.toArray();
        utils.each(this.inputJson["sequences"], (val) => {
            val.order = sortArr.indexOf(val.name)
        });
        this.drawSequences();
    }

    drawSequences() {
        drawer.clear(this.ctx, this.width, this.canvasHeight);
        const seqWidth = this.options.seqHeight - this.options.sequence.topMargin - this.options.sequence.bottomMargin;
        drawer.setLineWidth(this.ctx, seqWidth);
        drawer.setTextAlign(this.ctx, "center");

        utils.each(this.inputJson["sequences"], (val) => {
            this._drawSequence(val);
        });

        this._drawHighlightRect();
        this._drawScaleBar();
        this._drawHeader();

    }

    _drawSequence(alignment) {
        const seqWidth = this.options.seqHeight - this.options.sequence.topMargin - this.options.sequence.bottomMargin;
        const y = this.options.scaleBar.height + this.options.seqHeight * (alignment.order + 1) + this.options.sequence.topMargin - seqWidth / 2;
        let seq = [];
        if (this.isConservedRegionMode) {
            const conservedSeq = utils.getTrueArr(alignment["seq"].split(""), this.conservedRegionBooleanArr);
            seq = conservedSeq.slice(parseInt(this.alignmentPosition.start + 0.5), parseInt(this.alignmentPosition.end + 0.5));
        } else {
            seq = alignment["seq"].substr(parseInt(this.alignmentPosition.start + 0.5), parseInt(this.alignmentPosition.end + 0.5) - parseInt(this.alignmentPosition.start + 0.5)).split("");
        }
        if (seq.length == 0) return;
        let seqLength = seq.length;
        //        if (seq.length < 10) seqLength = 10;
        this.baseWidth = (this.options.sequence.width) / seqLength;

        drawer.setFillStyle(this.ctx, "black");
        this.ctx.font = this.options.sequence.fontSize + "px Arial serif";

        if (this.baseWidth < 10) {
            utils.each(seq, (val, i) => {
                drawer.drawLine(this.ctx, this.options.sequence.left + i * this.baseWidth, this.options.sequence.left + (i + 1) * this.baseWidth, y, y, this.options.colorScheme[val]);
            });
        } else {
            utils.each(seq, (val, i) => {
                drawer.drawLine(this.ctx, this.options.sequence.left + i * this.baseWidth, this.options.sequence.left + (i + 1) * this.baseWidth, y, y, this.options.colorScheme[val]);
                this.ctx.fillText(val, this.options.sequence.left + (i * this.baseWidth) + this.baseWidth / 2, y + this.options.sequence.fontSize * 0.33);
            });
        }
    }



    _drawSequenceLabel() {
        utils.each(this.orderedAlignments, (alignment, i) => {
            const y = this.options.seqHeight * (i + 1);
            this.labelDiv = this.labelContainer.create("div")
                //.style("position", "absolute")
                //.style("top", y + "px")
                .attr("data-id", alignment.name)
                .style("font-size", this.options.label.fontSize + "px")
                .style("color", this.group[alignment["group"]].col)
                .style("height", this.options.seqHeight + "px")

            const label_p = this.labelDiv.create("p").style("margin", "0")
                .style("height", this.options.seqHeight + "px");
            label_p.create("span")
                .setClass("handle fas fa-expand-arrows-alt")
                .html(" ")

            label_p.elements[0].innerHTML += (alignment.name + "_" + alignment["group"]);
        });
    }

    _drawHighlightRect() {
        utils.each(this.highlightedIndicies, (val) => {
            const i = val.index;
            const y = this.options.scaleBar.height + this.options.seqHeight * (i) + this.options.sequence.topMargin;
            drawer.drawRect(this.ctx, this.options.sequence.left, y, this.options.sequence.width, this.options.seqHeight, "red", 3);
        });
    }

    _drawScaleBar() {
        if (this.options.scaleBar.enable) {
            drawer.setLineWidth(this.ctx, 1.5);

            const s = this.alignmentPosition.start
            const e = this.alignmentPosition.end
            const size = e - s;

            let numBreaks = this.options.sequence.width > 500 ? 10 : 5;
            let stepSize = parseInt(size / numBreaks);
            numBreaks = parseInt(size / stepSize);

            if (size < 30 && this.baseWidth > 20) {
                numBreaks = size;
                stepSize = 1;
            }
            let startX = this.options.sequence.left;
            let startY = this.options.scaleBar.height - this.options.scaleBar.fontSize / 2;

            for (let i = 0; i < numBreaks; i++) {
                startX = this.options.sequence.left + i * stepSize * this.baseWidth + this.baseWidth / 2;
                drawer.drawTxt(this.ctx, parseInt(s + i * stepSize + 0.5 + 1), startX, startY, this.options.scaleBar.fontSize + "px Arial serif");
                drawer.drawLine(this.ctx, startX, startX, this.options.scaleBar.height, startY + 1, "grey");
            }
            if (stepSize !== 1) {
                startX = this.options.sequence.left + parseInt(size + 0.5) * this.baseWidth - this.baseWidth / 2;
                drawer.drawTxt(this.ctx, parseInt(e), startX, startY, this.options.scaleBar.fontSize + "px Arial serif");
                drawer.drawLine(this.ctx, startX, startX, this.options.scaleBar.height, startY + 1, "grey");
            }
        }
    }

    _drawHeader() {
        if (this.options.header.enable) {
            const leftMergin = 10;
            drawer.clear(this.headerCtx, this.width, this.options.header.height);
            this._drawNonGrapRate();
            this._drawSeqLogo();

            drawer.setLineWidth(this.headerCtx, 1);
            drawer.setStrokeStyle(this.headerCtx, "black");
            const startX = this.options.header.left;
            const startY = this.options.header.top;
            drawer.drawLine(this.headerCtx, startX - leftMergin, startX - leftMergin, this.options.header.height + 1, startY);
            drawer.drawLine(this.headerCtx, this.width - 1, this.width - 1, this.options.header.height + 1, startY);
            drawer.drawLine(this.headerCtx, startX - leftMergin, this.width, startY, startY);
            drawer.drawLine(this.headerCtx, startX - leftMergin, this.width, this.options.header.height + 1, this.options.header.height + 1);
        }
    }

    _drawSeqLogo() {
        if (this.options.seqLogo.enable && this.baseWidth > 10) {
            // draw Y axis
            drawer.setTextAlign(this.headerCtx, "center");
            drawer.setFillStyle(this.headerCtx, "black");

            this.headerCtx.rotate(Math.PI * 3 / 2);
            drawer.drawTxt(this.headerCtx, "bits", -(this.options.header.height / 2), this.options.header.left - 35, "14px sans-serif")
            this.headerCtx.rotate(Math.PI * 1 / 2);
            drawer.setTextAlign(this.headerCtx, "right");
            drawer.drawTxt(this.headerCtx, "0", this.options.header.left - 14, this.options.header.height, "12px sans-serif")
            drawer.drawTxt(this.headerCtx, "4.5", this.options.header.left - 14, this.options.header.top + 6, "12px sans-serif")

            drawer.setLineWidth(this.headerCtx, 1);
            drawer.setTextAlign(this.headerCtx, "center");

            this.headerCtx.font = '900 ' + 30 * (this.options.header.height - this.options.header.top) / 100 + 'px "Arial Black", Arial, Gadget, sans-serif';
            const maxVal = Math.log2(22);
            const logoHeight = this.options.header.height - this.options.header.top - 1;
            const baseHeight = logoHeight / maxVal;

            const startX = this.options.header.left;
            const startY = this.options.header.top + 1;

            const wSize = this.baseWidth;

            let entropies = [];
            if (this.isConservedRegionMode) {
                entropies = utils.getTrueArr(this.shannonEntropyArr, this.conservedRegionBooleanArr);
            } else {
                entropies = this.shannonEntropyArr;
            }

            utils.each(entropies, (site, i) => {
                if (i >= parseInt(this.alignmentPosition.start + 0.5) && i <= parseInt(this.alignmentPosition.end + 0.5 - 1)) {
                    const buf = utils.filterAndSortEntroy(site);
                    let preHeight = logoHeight * (1 - buf["sum"] / maxVal);

                    utils.each(buf["res"], (val) => {
                        const text = val.name.replace("-", "\\");

                        let height = (logoHeight) * val.value / maxVal;
                        let hRate = height / baseHeight;

                        this.headerCtx.transform(1, 0, 0, hRate, startX + wSize / 2 + wSize * (i - parseInt(this.alignmentPosition.start + 0.5)), startY + height + preHeight);
                        this.headerCtx.fillStyle = utils.TAYLOR_COLOR[text];
                        this.headerCtx.fillText(text, 0, 0, wSize);
                        this.headerCtx.setTransform(1, 0, 0, 1, 0, 0);
                        preHeight = height + preHeight;
                    });
                }
            });
        }
    }

    /**
     *  draw 1 - gap rate
     */
    _drawNonGrapRate() {
        if (this.options.nonGapRate.enable && this.baseWidth <= 10 && !this.isConservedRegionMode) {
            drawer.setTextAlign(this.headerCtx, "center");
            drawer.setFillStyle(this.headerCtx, "black");

            // draw Y axis
            this.headerCtx.rotate(Math.PI * 3 / 2);
            drawer.drawTxt(this.headerCtx, "1 - gap rate", -(this.options.header.height / 2), this.options.header.left - 35, "14px sans-serif")
            this.headerCtx.rotate(Math.PI * 1 / 2);
            drawer.setTextAlign(this.headerCtx, "right");
            drawer.drawTxt(this.headerCtx, "0", this.options.header.left - 14, this.options.header.height, "12px sans-serif")
            drawer.drawTxt(this.headerCtx, "1", this.options.header.left - 14, this.options.header.top + 6, "12px sans-serif")

            drawer.setTextAlign(this.headerCtx, "center");
            drawer.setLineWidth(this.headerCtx, this.baseWidth);

            const bottomLineY = this.options.header.height;
            const maxVal = this.options.header.height - this.options.header.top - 1;
            utils.each(this.gapRate, (val, i) => {
                if (i >= parseInt(this.alignmentPosition.start + 0.5) && i <= parseInt(this.alignmentPosition.end + 0.5 - 1)) {
                    const x = this.options.header.left + (i - parseInt(this.alignmentPosition.start + 0.5)) * this.baseWidth + this.baseWidth * 0.5;
                    drawer.drawLine(this.headerCtx, x, x, bottomLineY, bottomLineY - maxVal * (1 - val), (1 - val >= this.options.nonGapRate.th) ? this.options.nonGapRate.highColor : this.options.nonGapRate.baseColor);
                }
            });
        }
    }


    // zoom functions
    _zoomIn() {
        let zoomSize = this.baseWidth < 5 ? 20 : (this.baseWidth < 10 ? 10 : 5);
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

    _zoomOut() {
        if (this.alignmentPosition.end - this.alignmentPosition.start < 30) {
            this.alignmentPosition.start -= 2;
            this.alignmentPosition.end += 2;

        } else {
            let zoomSize = this.baseWidth < 5 ? 20 : (this.baseWidth < 10 ? 10 : 5);
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

    _move(x) {
        if (x === 0) return;
        let moveSize = x / (this.baseWidth);
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
        if (parseInt(this.alignmentPosition.start + 0.5) !== parseInt(this.alignmentPosition.preStart + 0.5) ||
            parseInt(this.alignmentPosition.end - this.alignmentPosition.start + 0.5) !== parseInt(this.alignmentPosition.preEnd - this.alignmentPosition.preStart + 0.5)) {
            this.alignmentPosition.preStart = this.alignmentPosition.start;
            this.alignmentPosition.preEnd = this.alignmentPosition.end;

            this.drawSequences();
        }
    }

    _resetZoom() {
        this.alignmentPosition.preStart = this.alignmentPosition.start;
        this.alignmentPosition.preEnd = this.alignmentPosition.end;
        this.alignmentPosition.start = 0;
        this.alignmentPosition.end = this.alignmentPosition.size;
        this.drawSequences();
    }
}