import {
    options
} from "./option"
import {
    SeqContainer
} from "./sequenceModel"
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
const consensusIDPositionAPI = "http://127.0.0.1:8000/hp72/api/consensus/id/"
const getGenomeRangeAPI = "http://127.0.0.1:8000/hp72/api/genome/multiple"


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
        this.start = 2600;
        this.end = 2700;
        this.seqWidthRatio = 1;
        this.alignedSizeList = [];
        this.genomeSizeRate = [];
        this.baseGenomeSize = 0;
        this.isDragging = false;
        var seqContainer = new SeqContainer();
    }

    setRange(start, end) {
        this.resetAlignment();
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
        this.resetAlignment();
    }

    resetAlignment() {
        this.baseGenomeSize = this.inputJson["consensus_genome_size"];
        this.alignedSizeList = new Array(this.numGenomes);
        this.alignedSizeList.fill(0)
        this.genomeSizeRate = [];
        utils.each(this.inputJson["genomes"], (genome) => {
            this.genomeSizeRate.push(genome["genome_size"] / this.inputJson["consensus_genome_size"]);
        });
    }

    render() {
        this._DOMcreate();
        this._initSvg();
        this.drawLinearGenomes();
    }

    drawLinearGenomes() {
        this._clear();
        this._drawLabels();
        this._drawCDSBlocks();
        this._drawGenomicSequences();
    }

    redrawCDSs() {
        this._clear();
        this._drawCDSBlocks();
        this._drawGenomicSequences();
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
        this.mainSvg
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
    _clear() {
        utils.selectAll(`#${this.options.elementId}_canvasContainer> canvas`).remove();
        this.mainSvgGroup.remove();
        this.mainSvgGroup = this.mainSvg.create("g").setID(`${this.options.elementId}_svg_group`)
    }

    _drawLabels() {
        const ordered_label = new Array(this.inputJson["genomes"].length);
        utils.each(this.inputJson["genomes"], (genome) => {
            ordered_label[genome.order] = genome;
        })
        utils.each(ordered_label, (genome) => {
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
        this.seqWidthRatio = (this.svgWidth) / (this.end - this.start)
        //console.log('this.seqWidthRatio:', this.seqWidthRatio);
        //console.log("width: " + (this.end - this.start));
        utils.each(this.inputJson["genomes"], (genome, i) => {
            //console.log('genome["genome_ID"]:', genome["id"]);
            const rangeStart = parseInt(this.start * this.genomeSizeRate[i]);
            const rangeEnd = parseInt(rangeStart + (this.end - this.start));
            // if (rangeStart < 0) console.log('genome["genome_size"]:', genome["genome_size"]);
            const y = (this.options.seqHeight + this.options.margin) * (genome.order) + this.options.sequence.genomeHeight + this.options.sequence.marginY;
            //console.log('this.alignedSizeList[i]:', this.alignedSizeList[i]);
            utils.each(genome["genes"], (gene, counter) => {
                //if (counter < 100000)
                //   this._confirmRotations(gene, genome["flipped"], genome["genome_size"], genome["rotated_length"]);
                this._drawCDSBlock(gene, rangeStart, rangeEnd, y, this.alignedSizeList[i], genome["genome_size"])
            })
        });
    }

    _drawCDSBlock(gene, rangeStart, rangeEnd, y, alignedSize, genome_size) {
        let geneStart = gene["start_rotated"] + alignedSize;
        let geneEnd = gene["end_rotated"] + alignedSize;

        if (geneStart >= genome_size) geneStart -= genome_size
        if (geneStart < 0) geneStart += genome_size
        if (geneEnd >= genome_size) geneEnd -= genome_size
        if (geneEnd < 0) geneEnd += genome_size

        let startPoint = 0
        let endPoint = 0
        // TODO fix
        if (geneStart > geneEnd || geneEnd - geneStart > 100000) {
            //console.log('large');
            return;
        }
        // normal
        if (geneStart > rangeStart && geneEnd < rangeEnd) {
            startPoint = this._convertGpositionToPixel(geneStart - rangeStart);
            endPoint = this._convertGpositionToPixel(geneEnd - rangeStart);
        }
        // left edge
        else if (geneStart < rangeStart && geneEnd > rangeStart) {
            startPoint = 0;
            endPoint = this._convertGpositionToPixel(geneEnd - rangeStart);
        }
        // right edge
        else if (geneStart < rangeEnd && geneEnd > rangeEnd) {
            startPoint = this._convertGpositionToPixel(geneStart - rangeStart);
            endPoint = this.width - this.options.sequence.right
        } else {
            return;
        }
        let w = endPoint - startPoint;
        if (w < 0) w = 10;
        if (gene.strand === -1) y += this.options.sequence.cdsHeight;
        this._drawSvg(startPoint, y, w, this.options.sequence.cdsHeight, gene, genome_size, alignedSize);
    }
    _convertGpositionToPixel(gposition) {
        return gposition * this.seqWidthRatio;
    }

    _drawSvg(x, y, w, h, gene, genome_size, aligned_size) {
        const col = utils.COLER_ARR[gene.angle];
        const rect = this.mainSvgGroup.create("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", w)
            .attr("height", h)
            .attr("fill", col)

        rect
            .on("mouseover", () => {
                this.tooltip
                    .style("visibility", "visible")
                    .style("top", (y - this.options.tooltip.height) + "px")
                    .style("left", this.options.label.width + this.options.label.left + x + "px")
                    .innerHTML("<p>name : " + gene.locusTag + "</p><p>id : " + gene.consensusId + "</p>");

            })
            .on("mousemove", () => {
                this.tooltip
                    .style("top", (y - this.options.tooltip.height) + "px")
                    .style("left", this.mainSvg.mouse[0] + this.options.label.width + this.options.label.left + "px")

            })
            .on("mouseout", () => {
                this.tooltip
                    .style("visibility", "hidden")
            })
            .on("mousedown", () => {
                if (gene.consensusId != "-1") {
                    this._setBaseGenomeSizeRate(genome_size);
                    utils.json(consensusIDPositionAPI + gene.consensusId).then((res) => {
                        utils.each(this.inputJson["genomes"], (genome, i) => {
                            if (genome.id in res) {
                                this.alignedSizeList[i] = (gene["start_rotated"] + aligned_size) - this._getRotateGenomicStartPosition(genome, res[genome.id]);
                            }
                        })
                        this.redrawCDSs();
                    });
                }
            });
    }

    _setBaseGenomeSizeRate(genomeSize) {
        if (this.baseGenomeSize === this.inputJson["consensus_genome_size"]) {
            this.baseGenomeSize = genomeSize;
            this.genomeSizeRate = [];
            for (let i = 0; i < this.numGenomes; i++) {
                this.genomeSizeRate.push(genomeSize / this.inputJson["consensus_genome_size"]);
            }
        }
    }

    _getRotateGenomicStartPosition(genome, gene) {
        const flipped = genome["flipped"];
        const rotated_length = genome["rotated_length"];
        const genome_size = genome["genome_size"];
        if (flipped === 0) {
            let rotated = gene["start"] + rotated_length
            if (rotated >= genome_size) {
                rotated -= genome_size
            }
            return rotated;
        } else if (flipped === 1) {
            let rotated = genome_size - gene["end"] + rotated_length
            if (rotated < 0) {
                rotated += genome_size
            }
            if (rotated >= genome_size) {
                rotated -= genome_size
            }
            return rotated;
        }
    }

    _getOriginalGenomicStartPosition(genome, targetRegion) {
        const flipped = genome["flipped"];
        const rotated_length = genome["rotated_length"];
        const genome_size = genome["genome_size"];
        if (flipped === 0) {
            let rotated = targetRegion["start"] - rotated_length;
            if (rotated >= genome_size) {
                rotated -= genome_size
            }
            if (rotated < 0) {
                rotated += genome_size
            }
            return rotated;
        } else if (flipped === 1) {
            let rotated = genome_size - targetRegion["end"] + rotated_length;
            if (rotated < 0) {
                rotated += genome_size
            }
            if (rotated >= genome_size) {
                rotated -= genome_size
            }
            return rotated;
        }
        return 0;
    }

    _drawGenomicSequences() {
        const regionSize = (this.end - this.start);
        console.log('regionSize:', regionSize);
        if (this.seqWidthRatio > 1) {
            const postData = {
                seqs: []
            };
            utils.each(this.inputJson["genomes"], (genome, i) => {
                const targetRegion = {
                    start: parseInt((this.start) * this.genomeSizeRate[i] - this.alignedSizeList[i]),
                    end: parseInt((this.start) * this.genomeSizeRate[i] + regionSize - this.alignedSizeList[i])
                };
                const start = this._getOriginalGenomicStartPosition(genome, targetRegion);
                // console.log('start:', start);
                postData["seqs"].push({
                    genome_ID: genome.id,
                    start: start,
                    end: start + regionSize,
                })
            });
            console.log('postData["seqs"]:', postData["seqs"]);
            utils.json(getGenomeRangeAPI, param(postData)).then((res) => {
                utils.each(this.inputJson["genomes"], (genome, i) => {
                    //                    if (genome["flipped"] === 0) {
                    // if (genome["rotated_length"] == 0) {
                    const diff = postData["seqs"][i].start - res[genome.id].start;
                    let seq = res[genome.id].seq.substr(diff, regionSize);
                    if (genome["flipped"] == 1) {
                        seq = this._reverseComplement(seq);
                    }
                    if (genome.name == "BM012B") {
                        console.log('res:', res);
                        console.log(diff);
                        console.log(postData["seqs"][i].start + " " + res[genome.id].start);
                        console.log(genome.name + " " + postData["seqs"][i].start + "-" + postData["seqs"][i].end);
                        console.log(genome.rotated_length)
                        console.log(genome.genome_size - postData["seqs"][i].start - genome.rotated_length)
                        console.log("start: " + (this.start * this.genomeSizeRate[i] - this.alignedSizeList[i]));
                        console.log(res[genome.id].start);

                    }
                    this._drawGenomicSequence(genome, i, seq);
                    //}
                    //                  }
                });
            });
        } else {
            utils.each(this.inputJson["genomes"], (genome, i) => {
                this._drawGenomicSequence(genome, i);
            });
        }
    }

    _reverseComplement(seq) {
        let seq2 = seq.replace(/A/g, "Z").replace(/T/g, "A").replace(/Z/g, "T").replace(/C/g, "Z").replace(/G/g, "C").replace(/Z/g, "G");
        return seq2.split("").reverse();
    }

    _drawGenomicSequence(genome, i, genomicSeq) {
        const y = (this.options.seqHeight + this.options.margin) * (genome.order) + this.options.sequence.top;
        let genenome_canvas = this.canvasContainer.create("canvas")
            .setID(`${this.options.elementId}_canvas_${i}`)
            .style("position", "absolute")
            .style("left", (this.options.label.width + this.options.label.left) + "px")
            .style("top", y + "px")
            .attr("height", this.options.sequence.genomeHeight)
            .attr("width", this.svgWidth);

        let genome_browser_ctx = genenome_canvas.elements[0].getContext("2d");
        let yStart = this.options.sequence.genomeHeight / 2;

        if (this.seqWidthRatio > 1) {
            //console.log(this.seqWidthRatio)
            if (this.seqWidthRatio > 10) {
                for (let i = 0; i < genomicSeq.length; i++) {
                    let col = utils.NUCLEOTIDE_COLOR[genomicSeq[i]];
                    genome_browser_ctx.beginPath();
                    genome_browser_ctx.font = this.options.sequence.fontSize + "px Arial serif";
                    genome_browser_ctx.moveTo(i * this.seqWidthRatio, yStart);
                    genome_browser_ctx.lineTo((i + 1) * this.seqWidthRatio, yStart);
                    genome_browser_ctx.lineWidth = this.options.sequence.genomeHeight;
                    genome_browser_ctx.strokeStyle = col;
                    genome_browser_ctx.fillStyle = "black";
                    genome_browser_ctx.textAlign = "center";
                    genome_browser_ctx.stroke();
                    genome_browser_ctx.fillText(genomicSeq[i], (i * this.seqWidthRatio) + this.seqWidthRatio / 2, yStart + 5);
                }
            } else {
                for (let i = 0; i < genomicSeq.length; i++) {
                    let col = utils.NUCLEOTIDE_COLOR[genomicSeq[i]];
                    genome_browser_ctx.beginPath();
                    genome_browser_ctx.font = this.options.sequence.fontSize + "px Arial serif";
                    genome_browser_ctx.moveTo(i * this.seqWidthRatio, yStart);
                    genome_browser_ctx.lineTo((i + 1) * this.seqWidthRatio, yStart);
                    genome_browser_ctx.lineWidth = this.options.sequence.genomeHeight;
                    genome_browser_ctx.strokeStyle = col;
                    genome_browser_ctx.fillStyle = "black"
                    genome_browser_ctx.stroke();
                }
            }
        } else {
            genome_browser_ctx.beginPath();
            genome_browser_ctx.font = this.options.sequence.fontSize + "px Arial serif";
            genome_browser_ctx.moveTo(0, yStart);
            genome_browser_ctx.lineTo(this.svgWidth, yStart);
            genome_browser_ctx.lineWidth = this.options.sequence.genomeHeight;
            genome_browser_ctx.strokeStyle = "rgb(150, 150, 150)";
            genome_browser_ctx.fillStyle = "black"
            genome_browser_ctx.stroke();
            genome_browser_ctx.textAlign = "center";
            genome_browser_ctx.fillText("Genome Sequence", this.svgWidth / 2, yStart + 5);
        }
    }

    _getZoomSize() {
        if (this.seqWidthRatio < 0.1) {
            return this.options.zoom.xl;
        }
        if (this.seqWidthRatio < 0.5) {
            return this.options.zoom.lg;
        }
        if (this.seqWidthRatio < 1) {
            return this.options.zoom.md;
        }
        if (this.seqWidthRatio < 5) {
            return this.options.zoom.sm;
        }
        return this.options.zoom.xs;
    }

    // zoom functions
    _zoomIn() {
        let zoomSize = this._getZoomSize();
        if (this.end - this.start > 100) {
            this.start += zoomSize;
            this.end -= zoomSize;
            this.redrawCDSs();
        } else if (this.end - this.start > 10) {
            this.start += 2;
            this.end -= 2;
            this.redrawCDSs();
            /*        } else if (this.end - this.start > 2) {
                        this.start += 1;
                        this.end -= 1;
                        this.redrawCDSs();
            */
        }
    }

    _zoomOut() {
        if (this.end - this.start < 30) {
            this.start -= 2;
            this.end += 2;

        } else {
            let zoomSize = this._getZoomSize();
            this.start -= zoomSize;
            this.end += zoomSize;
        }
        this.redrawCDSs();
    }

    _move(x) {
        if (x === 0) return;
        let moveSize = x / (this.seqWidthRatio);
        this.start -= moveSize;
        this.end -= moveSize;
        if (parseInt(this.start + 0.5) !== parseInt(this.preStart + 0.5) ||
            parseInt(this.end - this.start + 0.5) !== parseInt(this.preEnd - this.preStart + 0.5)) {
            this.preStart = this.start;
            this.preEnd = this.end;

            this.redrawCDSs();
        }
    }

    _resetZoom() {
        this.preStart = this.start;
        this.preEnd = this.end;
        this.start = 0;
        this.end = this.size;
        this.redrawCDSs();
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