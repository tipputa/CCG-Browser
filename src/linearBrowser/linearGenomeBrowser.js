import {
    options
} from "./option"
import * as drawer from "../utils/canvas"
import * as utils from "../utils/index";

const param = (data) => {
    return {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(data), // 本文のデータ型は "Content-Type" ヘッダーと一致する必要があります
    }
}

const locusTagPositionAPI = "http://127.0.0.1:8000/hp72/api/genbank/position/locusTag/"

const getPositionFromLocusTag = (input, init) => {
    return fetch(input, init).then((response) => {
        if (!response.ok) throw new Error(response.status + " " + response.statusText);
        return response.json();
    });
}


const test = (input, init) => {
    return fetch(input, init).then((response) => {
        if (!response.ok) throw new Error(response.status + " " + response.statusText);
        return response.json();
    });
}

export class LinearGenomeBrowser {
    constructor(opt) {
        this.options = {
            ...options,
            ...opt,
        }
        this.start = 120000;
        this.end = 130000;
        this.seqWidthRatio = 1;
    }

    setRange(start, end) {
        console.log("working set range");
        this.start = (start + Math.PI / 2) / (Math.PI * 2) * this.inputJson.consensus_genome_size;
        this.end = (end + Math.PI / 2) / (Math.PI * 2) * this.inputJson.consensus_genome_size;
        this.redrawCDSs();
    }

    setContainer(elementID) {
        console.log("load element: " + elementID);
        this.container = utils.selectID(elementID);
        this.container.html("");
        this.options.elementId = elementID;
        if (!this.options.setSize) {
            this.width = this.container.elements[0].clientWidth;
            this.height = this.container.elements[0].clientHeight;
            this.svgWidth = this.width - this.options.label.width - this.options.label.left - this.options.sequence.left - this.options.sequence.right;
            console.log(this.width + " " + this.svgWidth);
        } else {
            this.height = this.options.height;
            this.width = this.options.width;
            this.svgWidth = this.width - this.options.label.width - this.options.label.left - this.options.sequence.left - this.options.sequence.right;
        }
    }

    setJson(json) {
        this.inputJson = json;
        this.numGenomes = json["genomes"].length;
        this.svgHeight = (this.options.seqHeight + this.options.margin) * this.numGenomes;
    }

    render() {
        this._DOMcreate();
        this.drawLinearGenomes();
    }

    drawLinearGenomes() {
        this._clear();
        this._drawLabels();
        this._drawCDSBlocks();
    }

    redrawCDSs() {
        this._clear();
        this._drawCDSBlocks();
    }

    _DOMcreate() {
        this.headerContainer = this.container.create("div")
            .setID(`${this.options.elementId}_header`)
        //    .html("Alignment Viewer Header");

        this.bodyContainer = this.container.create("div")
            .setID(`${this.options.elementId}_body`)
            .style("position", "relative")
            .setClass("d-flex flex-row")

        this.canvasContainer = this.bodyContainer.create("div")
            .setID(`${this.options.elementId}_canvasContainer`)
            .style("position", "relative")
            .style("height", `${this.svgHeight}px`);

        this.labelContainer = this.bodyContainer.create("div")
            .setID(`${this.options.elementId}_label`)
            //.style("position", "absolute")
            //.style("height", `${this.svgHeight}px`)
            //.style("width", `${this.options.label.width}px`)
            .style("margin-left", `${this.options.label.left}px`)
            .style("margin-top", `${this.options.label.top}px`)

        this.mainSvg = this.canvasContainer.create("svg")
            .setID(`${this.options.elementId}_svg`)
            .style("position", "absolute")
            .style("left", (this.options.label.width + this.options.label.left) + "px")
            .style("top", this.options.sequence.top + "px")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth)

        this.mainSvgGroup = this.mainSvg.create("g")
            .setID(`${this.options.elementId}_svg_group`)

        this.tooltip = this.bodyContainer.create("div").attr("class", "linear-genome-tooltip");

    }

    _initSvg() {

    }

    _clear() {
        this.mainSvgGroup.remove();
        this.mainSvgGroup = this.mainSvg.create("g").setID(`${this.options.elementId}_svg_group`)
    }

    _drawLabels() {
        utils.each(this.inputJson["genomes"], (genome, i) => {
            this.labelDiv = this.labelContainer.create("div")
                .attr("data-id", genome.name)
                .style("font-size", this.options.label.fontSize + "px")
                .style("height", this.options.seqHeight + "px")

            const label_div = this.labelDiv.create("div")
                .style("margin", this.options.margin + "px 0 0 0")
                .style("height", this.options.seqHeight + "px")
                .setClass("d-flex align-items-center")

            label_div.create("span")
                .setClass("handle fas fa-expand-arrows-alt")

            label_div.elements[0].innerHTML += ("&nbsp;" + genome.name);
        });
    }


    _drawCDSBlocks() {
        this.seqWidthRatio = (this.end - this.start) / (this.svgWidth)
        console.log('this.seqWidthRatio:', this.seqWidthRatio);
        utils.each(this.inputJson["genomes"], (genome, i) => {
            const rangeStart = this.start * genome["genome_size"] / this.inputJson["consensus_genome_size"]
            const rangeEnd = rangeStart + (this.end - this.start);
            if (rangeStart < 0) console.log('genome["genome_size"]:', genome["genome_size"]);
            const y = (this.options.seqHeight + this.options.margin) * (genome.order) + this.options.sequence.genomeHeight + this.options.sequence.marginY;
            utils.each(genome["genes"], (gene) => {
                this._drawCDSBlock(gene, rangeStart, rangeEnd, y, 0)
            })
        });
    }

    _drawCDSBlock(gene, rangeStart, rangeEnd, y, alignedSize) {
        const geneStart = gene["start_rotated"] + alignedSize;
        const geneEnd = gene["end_rotated"] + alignedSize;
        let startPoint = 0
        let endPoint = 0
        if (geneStart > geneEnd || geneEnd - geneStart > 100000) {
            console.log('large');
            return;
        }
        if (geneStart > rangeStart && geneEnd < rangeEnd) {
            startPoint = this._convertGpositionToPixel(geneStart - rangeStart);
            endPoint = this._convertGpositionToPixel(geneEnd - rangeStart);
        } else if (geneStart < rangeStart && geneEnd > rangeStart) {
            startPoint = 0;
            endPoint = this._convertGpositionToPixel(geneEnd - rangeStart);
        } else if (geneStart < rangeEnd && geneEnd > rangeEnd) {
            startPoint = this._convertGpositionToPixel(geneStart - rangeStart);
            endPoint = this.width - this.options.sequence.right
        } else {
            return;
        }
        const w = endPoint - startPoint;
        if (gene.strand === -1) y += this.options.sequence.cdsHeight;
        this._drawSvg(startPoint, y, w, this.options.sequence.cdsHeight, gene);
    }
    _convertGpositionToPixel(gposition) {
        return gposition / this.seqWidthRatio;
    }

    _drawSvg(x, y, w, h, gene) {
        const col = utils.COLER_ARR[gene.angle];
        this.mainSvgGroup.create("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", w)
            .attr("height", h)
            .attr("fill", col)
            .on("mouseover", () => {
                console.log('over');
                this.tooltip
                    .style("visibility", "visible")
                    .style("top", (y - this.options.tooltip.height) + "px")
                    .style("left", this.options.label.width + this.options.label.left + x + "px")
                    .innerHTML("<p>name : " + gene.locusTag + "</p><p>id : " + gene.consensusId + "</p>");

            })
            .on("mousemove", () => {
                this.tooltip
                    .style("top", (y - this.options.tooltip.height) + "px")
                    .style("left", this.options.label.width + this.options.label.left + x + "px")

            })
            .on("mouseout", () => {
                this.tooltip
                    .style("visibility", "hidden")
            })
            .on("mousedown", function () {
                console.log('click');
                getPositionFromLocusTag(locusTagPositionAPI + gene.locusTag).then((x) => {
                    console.log(x);
                })
                /*              if (gene.consensusId != "-1") {
                                  align_genome(gene["start_rotated"] + alignedSize, gene.sameGroup, genome.genome_size)
                              }
                          */
            });
    }



    _test_db_access() {
        const data = {
            seqs: []
        }

        utils.each(this.inputJson["genomes"], (genome, i) => {
            data["seqs"].push({
                genome_ID: genome.id,
                start: 100,
                end: 100
            })
        });
        utils.each(this.inputJson["genomes"], (genome, i) => {
            data["seqs"].push({
                genome_ID: genome.id,
                start: 100,
                end: 100
            })
        });
        utils.each(this.inputJson["genomes"], (genome, i) => {
            data["seqs"].push({
                genome_ID: genome.id,
                start: 100,
                end: 100
            })
        });
        utils.each(this.inputJson["genomes"], (genome, i) => {
            data["seqs"].push({
                genome_ID: genome.id,
                start: 100,
                end: 100
            })
        });
        utils.each(this.inputJson["genomes"], (genome, i) => {
            data["seqs"].push({
                genome_ID: genome.id,
                start: 100,
                end: 100
            })
        });

        const start = performance.now()
        test("http://127.0.0.1:8000/hp72/api/genome/test", param(data)).then((res) => {
            console.log(res)
            console.log("performance: " + (performance.now() - start))
        });
    }

}