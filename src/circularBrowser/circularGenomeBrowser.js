import {
    options
} from "./option"
import * as drawer from "../utils/canvas"
import * as utils from "../utils/index";



export class CircularGenomeBrowser {
    constructor(opt) {
        this.options = {
            ...options,
            ...opt,
        }

        this.container = null;
        this.width = 0;
        this.height = 0;
        this.halfX = 0;
        this.halfY = 0;

        this.inputJson = null;
        this.numGenomes = null;

        this.maxRadius = 0
        this.ringSize = 0

        this.highlightCanvas = null;
        this.highlighter = null;
    }

    setContainer(elementID) {
        console.log("load element: " + elementID);
        this.container = utils.selectID(elementID);
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
    setJson(json) {
        this.inputJson = json;
        this.numGenomes = json["genomes"].length;
    }

    render() {
        this._DOMcreate();
        this.ctx = this.mainCanvas.elements[0].getContext("2d");
        if (this.options.highlighterEnable) {
            this.highlighter = new Highlighter(this.highlightCanvas, this.width, this.canvasHeight, this.inputJson);
        }
        this.drawCircularGenomes();
    }

    _DOMcreate() {
        this.bodyContainer = this.container.create("div")
            .setID(`${this.options.elementId}_body`)
            .style("position", "relative")
            .setClass("d-flex flex-row")

        this.canvasContainer = this.bodyContainer.create("div")
            .setID(`${this.options.elementId}_canvasContainer`)
            .style("height", `${this.canvasHeight}px`);

        this.mainCanvas = this.canvasContainer.create("canvas")
            .style("position", "absolute")
            .style("top", "0")
            .setID(`${this.options.elementId}_canvas`)
            .attr("height", this.canvasHeight)
            .attr("width", this.width)
            .style("left", "0");

        this.highlightCanvas = this.canvasContainer.create("canvas")
            .setID(`${this.options.elementId}_highlight_canvas`)
            .attr("height", this.canvasHeight)
            .attr("width", this.width)
            .style("position", "absolute")
            .style("top", "0")
            .style("left", "0");
    }

    redrawCircularGenomes() {
        this._drawKaryotype();
        drawer.clear(this.ctx, this.width, this.canvasHeight);
        this._drawCircularGenomes()
    }

    drawCircularGenomes() {
        this._init_radius();
        drawer.clear(this.ctx, this.width, this.canvasHeight);
        this._drawKaryotype();
        this._drawCircularGenomes()
    }

    _init_radius() {
        this.ringSize = ((this.options.outerRadius - (this.numGenomes - 1) * this.options.ringMargin - this.options.innnerRadius) / this.numGenomes);
        if (this.ringSize < 0) {
            this.options.ringMargin = 1;
            this.ringSize = ((this.options.outerRadius - (this.numGenomes - 1) * this.options.ringMargin - this.options.innnerRadius) / this.numGenomes);
        }
        if (this.ringSize < 0) {
            this.options.ringMargin = 0;
            this.ringSize = ((this.options.outerRadius - this.options.innnerRadius) / this.numGenomes);
        }

        console.log("Ring size: " + this.ringSize);
        this.maxRadius = this.options.outerRadius + this.ringSize / 2;
        if (this.highlighter) this.highlighter.maxRadius = this.maxRadius + 10;
        for (let i = 0; i < this.numGenomes; i++) {
            this.inputJson.genomes[i]["r"] = this.options.outerRadius - this.inputJson.genomes[i].order * (this.ringSize + this.options.ringMargin)
        }
    }

    _drawCircularGenomes() {
        drawer.setLineWidth(this.ctx, this.ringSize);
        for (let i = 0; i < this.numGenomes; i++) {
            for (let l = 0; l < this.inputJson.genomes[i].genes.length; l++) {
                drawer.drawArc(this.ctx, this.halfX, this.halfY, this.inputJson.genomes[i]["r"], this.inputJson.genomes[i].genes[l]["start_rotated_rad"], this.inputJson.genomes[i].genes[l]["end_rotated_rad"], this.inputJson.genomes[i].genes[l].angle);
            }
        }
    }

    _drawKaryotype() {
        drawer.setLineWidth(this.ctx, 5);
        for (let i = 0; i < 360; i++) {
            drawer.drawArc(this.ctx, this.halfX, this.halfY, this.maxRadius, this.convertDeg2Rad(i), this.convertDeg2Rad(i + 1), i);
        }
    }

    convertDeg2Rad(deg) {
        return 2 * Math.PI * deg / 360;
    }
}

class Highlighter {
    constructor(canvas, width, height, json) {
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
    clear() {
        drawer.clear(this.ctx, this.width, this.height);
    }
    showArc(start, end) {
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
    showArcRegions(r, ringSize, start, end) {
        this.ctx.beginPath();
        this.ctx.arc(this.halfX, this.halfY, r + ringSize / 2, start, end);
        this.ctx.lineTo(this.halfX + (r - ringSize / 2) * Math.cos(end), this.halfY + (r - ringSize / 2) * Math.sin(end));
        this.ctx.arc(this.halfX, this.halfY, r - ringSize / 2, end, start, true);
        this.ctx.lineTo(this.halfX + (r + ringSize / 2) * Math.cos(start), this.halfY + (r + ringSize / 2) * Math.sin(start));
        this.ctx.stroke();
        this.ctx.fill();
    }
    setLineWidth(x) {
        drawer.setLineWidth(this.ctx, x);
    }

    setUpdateFunction(func) {
        this.updateFunction = func;
    }

    _init() {
        this.canvas
            .on("mousemove", () => {
                if (!this.isHighlightLock) {
                    const xy = this.canvas.mouse;
                    const angle = this._getAngleFromMousePosition(xy);
                    this.zoomStart = angle - this.zoomSize;
                    this.zoomEnd = angle + this.zoomSize;
                    this.showArc(this.zoomStart, this.zoomEnd);
                }
            })
            .on("mouseleave", () => {
                if (!this.isHighlightLock) {
                    this.clear();
                }
            })

            .on("click", () => {
                if (!this.isHighlightLock) {
                    this.isHighlightLock = true;
                    if (this.updateFunction) {
                        this.updateFunction(this.zoomStart, this.zoomEnd);
                    }
                } else {
                    this.isHighlightLock = false;
                }
            });
    }
    _getAngleFromMousePosition(xy) {
        let x = xy[0] - this.halfX;
        let y = xy[1] - this.halfX;
        let tan = y / x;
        let angle = Math.atan(tan);
        if (x < 0) {
            return angle + Math.PI;
        } else {
            return angle;
        }
    }

}