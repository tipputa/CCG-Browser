import {
    options
} from "./option"
import * as drawer from "../utils/canvas"
import * as utils from "../utils/index";



export class LinearGenomeBrowser {
    constructor(opt) {
        this.options = {
            ...options,
            ...opt,
        }
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
        //        this.drawCircularGenomes();
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

}