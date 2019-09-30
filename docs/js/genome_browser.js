let genome_browser_container = d3.select("#genome-browser-container")
let genome_width = 1;
let geneBoxHeight = 5;
let lgWidth = genome_browser_container.node().getBoundingClientRect().width;
let lg_yCdsSize = 60;
let lg_yGenomeSize = 20;
let lg_yMargin = 30;
let lg_genome_name_fontSize = 20;
let lg_zoom_changeYRad = 0.02;
let lg_zoom_changeXRad = 0.02;
let lg_aligned_diff = [];
let lg_aligned_consensus_diff = [];
let locusTagObj = {}
let consensusObj = {}


let isGeneSeparationColor = false;

/*
let genome_browser_canvas = genome_browser_container
    .append("canvas")
    .attr("id", "lg_ctx")
    .attr("width", lgWidth)
    .attr("height", height);
let genome_browser_ctx = genome_browser_canvas.node().getContext("2d");
*/


let genenome_svg = genome_browser_container.append("svg")
    .attr("id", "svg_container")
    .attr("width", lgWidth - 4)
    .attr("height", height);
let tooltip = genome_browser_container.append("div").attr("class", "linear-genome-tooltip");



isReady = false;
initialize();

function initialize() {
    fileName1 = "locusTag_test5sp.json";
    fileName2 = "consensusId_test5sp.json";
    d3.json(fileName1).then(function (root) {
        locusTagObj = root;
        console.log("read " + fileName1);
        d3.json(fileName2).then(function (r) {
            consensusObj = r;
            console.log("read " + fileName2);
            isReady = true;
        });
    });
}

function drawLinearGenomeBrowser() {
    if (isReady) {
        refreshAlignment()
        refreshLinearGenome();
        drawLinearGenome();
    }
}

function redrawLinearGenomeBrowser() {
    refreshLinearGenome();
    drawLinearGenome();
}


function drawLinearGenome() {
    // genome_width = importedJs.consensus_genome_size / (lgWidth - 210);
    let zoomStart = parseInt(importedJs.consensus_genome_size * (zoom_start + Math.PI / 2) / (2 * Math.PI));
    let zoomEnd = parseInt(importedJs.consensus_genome_size * (zoom_end + Math.PI / 2) / (2 * Math.PI));
    genome_width = (zoomEnd - zoomStart) / (lgWidth - 210);
    for (let loop = 0; loop < numGenomes; loop++) {
        let g = importedJs.each_genome_info[loop];
        drawGenomeSequence(g, zoomStart, zoomEnd, lg_aligned_diff[loop]);
        addGenomeNames(g.order, g.strain);
        for (let i = 0; i < g.genes.length; i++) {
            drawLineSVG(
                zoomStart,
                zoomEnd,
                g,
                g.genes[i],
                g.genome_size,
                lg_aligned_diff[loop]);
        }
    }
}

function drawLineSVG(zoomStart, zoomEnd, genome, gene, genomeSize, alignedSize) {
    start = gene["start_rotated"] + alignedSize
    end = gene["end_rotated"] + alignedSize
    let s = 0;
    let e = 0;
    if (zoomStart < start && zoomEnd > end) {
        start = start - zoomStart;
        end = end - zoomStart;
        s = convertGeneticPositionToXPixcel(start) + 200;
        e = convertGeneticPositionToXPixcel(end) + 200;
    } else if (zoomStart > start && zoomStart < end) {
        s = 200;
        end = end - zoomStart;
        e = convertGeneticPositionToXPixcel(end) + 200;
        if (zoomEnd < end) {
            e = lgWidth - 10;
        }
    } else if (zoomEnd < end && zoomEnd > start) {
        start = start - zoomStart;
        s = convertGeneticPositionToXPixcel(start) + 200;
        e = lgWidth - 10;
    } else if (zoomStart < 0) {
        newStart = genomeSize + zoomStart;
        if (start > newStart) {
            s = convertGeneticPositionToXPixcel(start - newStart) + 200;
            e = convertGeneticPositionToXPixcel(end - newStart) + 200;
        } else {
            return;
        }
    } else if (zoomEnd > genomeSize) {
        newStart = zoomStart - genomeSize;
        newEnd = zoomEnd - genomeSize;
        drawLineSVG(newStart, newEnd, genome, gene, genomeSize, alignedSize)
        return;
    } else {
        return;
    }

    let y = 20 + (lg_yGenomeSize + lg_yMargin + lg_yCdsSize) * (genome.order + 1) + lg_yGenomeSize;
    if (gene.strand < 0) {
        y = y + lg_yCdsSize / 2;
    }
    let col = gene.angle < 0 ? "rgba(200,200,200)" : AngleColer[gene.angle];
    if (!isGeneSeparationColor) {
        if (gene.angle < 0) {
            if (gene.feature != "CDS") {
                col = "rgba(100,100,100)"
            }
        }
    } else {
        if (gene.consensusId != -1) {
            col = AngleColer[parseInt(gene.consensusId.replace("ID", "")) * 4];
        } else if (gene.feature != "CDS") {
            col = "rgba(100,100,100)"

        } else {
            col = "rgba(200,200,200)";
        }
    }

    let w = e - s;
    if (w < 0) w = 0;
    if (w > lgWidth - 210) w = lgWidth - 210;
    let id = y + "_" + s;
    genenome_svg.append("rect")
        .attr("id", id)
        .attr("x", s)
        .attr("y", y)
        .attr("width", w)
        .attr("height", lg_yCdsSize / 2)
        .attr("fill", col)
        .on("mouseover", function () {
            tooltip
                .style("visibility", "visible")
                .html("<p>name : " + gene.locusTag + "</p><p>id : " + gene.consensusId + "</p>");
        })
        .on("mousemove", function () {
            tooltip
                .style("top", (y - lg_yCdsSize * 2) + "px")
                .style("left", s + "px");
        })
        .on("mouseout", function () {
            tooltip
                .style("visibility", "hidden")

        })
        .on("click", function () {
            if (gene.consensusId != "-1") {
                align_genome(gene["start_rotated"] + alignedSize, gene.sameGroup, genome.genome_size)
            }
        });
    if (gene.gene != "None" && w > 50) {
        genenome_svg.append("text")
            .attr("x", s + w / 2)
            .attr("y", y + 16)
            .attr("width", w)
            .attr("height", lg_yCdsSize / 2)
            .style("text-anchor", "middle")
            .style("cursor", "default")
            .text(gene.gene)
            .on("mouseover", function () {
                tooltip
                    .style("visibility", "visible")
                    .html("<p>name : " + gene.locusTag + "</p><p>id : " + gene.consensusId + "</p>");
            })
            .on("mousemove", function () {
                tooltip
                    .style("top", (y - lg_yCdsSize * 2) + "px")
                    .style("left", s + "px");
            })
            .on("mouseout", function () {
                tooltip
                    .style("visibility", "hidden")

            })
            .on("click", function () {
                if (gene.consensusId != "-1") {
                    align_genome(gene["start_rotated"] + alignedSize, gene.sameGroup, genome.genome_size)
                }
            });
    }
}

function align_genome(basePosition, arr, baseGenomeSize) {
    isArcZoomRangeActive = false;
    baseDiff = basePosition / baseGenomeSize * importedJs.consensus_genome_size;
    for (let j = 0; j < importedJs.each_genome_info.length; j++) {
        for (let i = 0; i < arr.length; i++) {
            if (importedJs.each_genome_info[j].acc == locusTagObj[arr[i]].acc) {
                let step = importedJs.consensus_genome_size / importedJs.each_genome_info[j].genome_size;
                lg_aligned_consensus_diff[j] = baseDiff - locusTagObj[arr[i]].start_rotated * step;
                lg_aligned_diff[j] = basePosition - locusTagObj[arr[i]].start_rotated;
                break;
            }
        }
    }
    isArcZoomRangeActive = false;
    showArc();
    redrawLinearGenomeBrowser()
}

let baseColor = {};
baseColor["A"] = "red";
baseColor["T"] = "blue";
baseColor["C"] = "green";
baseColor["G"] = "yellow";

function drawGenomeSequence(g, start, end, aligned_diff) {
    let s = parseInt(start - aligned_diff); //parseInt(start / importedJs.consensus_genome_size * g.genome_size);
    let e = parseInt(end - aligned_diff); //parseInt(end / importedJs.consensus_genome_size * g.genome_size);
    let y = (lg_yMargin + lg_yCdsSize + lg_yGenomeSize) * (g.order + 1);
    let fontSize = 16;
    let genenome_canvas = genome_browser_container.append("canvas")
        .attr("id", g.order + "_genome")
        .style("left", 200 + "px")
        .style("top", y + "px")
        .style("color", "black")
        .attr("width", lgWidth - 210)
        .attr("height", lg_yGenomeSize + 20)
        .on("mousemove", function () {

            event.preventDefault();
            if (lg_clicked) {
                //console.log(event.movementX);
                lgMove(event.movementX);
            }
        })
        .on("mousewheel", function () {
            event.preventDefault();
            if (event.deltaY > 0) {
                //  console.log("wheel pan")
                lgZoomOut();
            } else if (event.deltaY < 0) {
                // console.log("wheel zoom")
                lgZoomIn();
            }

        })
        .on("mousedown", function () {
            event.preventDefault();
            // 0: left button, 1: wheel, 2: right
            if (event.button == 0) {
                lg_clicked = true;
                // console.log("leftdown")
            }
        })
        .on("mouseup", function () {
            event.preventDefault();
            // 0: left button, 1: wheel, 2: right
            if (event.button == 0) {
                lg_clicked = false;
                // console.log("up")
            }
        })
        .on("dblclick", function () {
            lgZoomIn();
            // console.log("dbclick")
        })

    if (genome_width < 1) {
        let genome = importedGenome[g.acc].substr(s, parseInt(e - s)).split("");
        if (s < 0) {
            let g1 = importedGenome[g.acc].substr(0, parseInt(e)).split("");
            let g2 = importedGenome[g.acc].substr(s - 2).split("");
            g2.pop();
            g2.pop();
            // to reomve space and \n as last letter;
            genome = g2.concat(g1);
            console.log(genome);
        }
        baseWidth = (lgWidth - 210) / genome.length

        let genome_browser_ctx = genenome_canvas.node().getContext("2d");
        let yStart = (lg_yGenomeSize - 2) / 2 + 18;
        if (baseWidth > 10) {
            for (let i = 0; i < genome.length; i++) {
                let col = baseColor[genome[i]];
                genome_browser_ctx.beginPath();
                genome_browser_ctx.font = "16px Arial serif";
                genome_browser_ctx.moveTo(i * baseWidth, yStart);
                genome_browser_ctx.lineTo((i + 1) * baseWidth, yStart);
                genome_browser_ctx.lineWidth = lg_yGenomeSize - 2;
                genome_browser_ctx.strokeStyle = col;
                genome_browser_ctx.fillStyle = "black";
                genome_browser_ctx.textAlign = "center";
                genome_browser_ctx.stroke();
                genome_browser_ctx.fillText(genome[i], (i * baseWidth) + baseWidth / 2, yStart + 5);
            }
        } else {
            for (let i = 0; i < genome.length; i++) {
                let col = baseColor[genome[i]];
                genome_browser_ctx.beginPath();
                genome_browser_ctx.font = "16px Arial serif";
                genome_browser_ctx.moveTo(i * baseWidth, yStart);
                genome_browser_ctx.lineTo((i + 1) * baseWidth, yStart);
                genome_browser_ctx.lineWidth = lg_yGenomeSize - 2;
                genome_browser_ctx.strokeStyle = col;
                genome_browser_ctx.fillStyle = "black"
                genome_browser_ctx.stroke();
            }
        }
    } else {


        let genome_browser_ctx = genenome_canvas.node().getContext("2d");
        let yStart = (lg_yGenomeSize - 2) / 2 + 18;
        genome_browser_ctx.beginPath();
        genome_browser_ctx.font = "16px Arial serif";
        genome_browser_ctx.moveTo(0, yStart);
        genome_browser_ctx.lineTo(lgWidth, yStart);
        genome_browser_ctx.lineWidth = lg_yGenomeSize - 2;
        genome_browser_ctx.strokeStyle = "rgb(150, 150, 150)";
        genome_browser_ctx.fillStyle = "black"
        genome_browser_ctx.stroke();
        genome_browser_ctx.textAlign = "center";

        genome_browser_ctx.fillText("Genome Sequence", lgWidth / 2, yStart + 5);
    }
    drawGenomeScale(genenome_canvas, g, s, e);

}

function drawGenomeScale(genenome_canvas, genome, start, end) {
    let w = end - start;
    let step = (lgWidth - 210) / w;
    let n_grid = 6;
    let rawInterval = parseInt(w / n_grid);
    let num = String(rawInterval).length - 1;
    let interval = parseInt(rawInterval / (10 ** (num))) * 10 ** (num)
    if (interval < 10) interval = 10;
    let genome_browser_ctx = genenome_canvas.node().getContext("2d");
    genome_browser_ctx.strokeStyle = "black";
    genome_browser_ctx.fillStyle = "black"
    genome_browser_ctx.lineWidth = 1;
    genome_browser_ctx.font = "12px Arial serif";
    let yStart = (lg_yGenomeSize - 2) / 2 + 6;
    let newstart = parseInt(start / (10 ** (num))) * 10 ** (num) + interval;
    let xmargin = (newstart - start) * step;
    if (start < 0) {
        newstart = parseInt(start / (10 ** (num))) * 10 ** (num);
        if (newstart == start) newstart += interval;
        xmargin = Math.abs(newstart - start) * step;
    }
    let tmp = xmargin + n_grid * interval;
    while (w > tmp) {
        tmp += interval;
        n_grid++;
    }
    console.log(newstart + " " + start + " " + w + " " + interval, num);
    label = newstart;
    for (let i = 0; i < n_grid; i++) {
        genome_browser_ctx.beginPath();
        genome_browser_ctx.moveTo(xmargin + i * interval * step, yStart);
        genome_browser_ctx.lineTo(xmargin + i * interval * step, yStart + 6);
        genome_browser_ctx.stroke();
        genome_browser_ctx.textAlign = "center";
        genome_browser_ctx.fillText(label, xmargin + i * interval * step, yStart);
        label += interval

    }

}

function drawScale() {

}

let lg_clicked = false;

function refreshLinearGenome() {
    //genome_browser_ctx.clearRect(0, 0, lgWidth, height);
    genenome_svg.remove();
    genome_browser_container.selectAll("canvas").remove();
    genome_browser_container.selectAll("div").remove();
    genenome_svg = genome_browser_container.append("svg")
        .attr("id", "svg_container")
        .attr("width", lgWidth)
        .attr("height", height)
        .on("mousemove", function () {

            event.preventDefault();
            if (lg_clicked) {
                //console.log(event.movementX);
                lgMove(event.movementX);
            }
        })
        .on("mousewheel", function () {
            event.preventDefault();
            if (event.deltaY > 0) {
                //  console.log("wheel pan")
                lgZoomOut();
            } else if (event.deltaY < 0) {
                // console.log("wheel zoom")
                lgZoomIn();
            }

        })
        .on("mousedown", function () {
            event.preventDefault();
            // 0: left button, 1: wheel, 2: right
            if (event.button == 0) {
                lg_clicked = true;
                // console.log("leftdown")
            }
        })
        .on("mouseup", function () {
            event.preventDefault();
            // 0: left button, 1: wheel, 2: right
            if (event.button == 0) {
                lg_clicked = false;
                // console.log("up")
            }
        })
        .on("dblclick", function () {
            lgZoomIn();
            // console.log("dbclick")
        })
        .on("mouseleave", function () {
            event.preventDefault();
            //console.log("leave");
        });
    tooltip = genome_browser_container.append("div").attr("class", "linear-genome-tooltip");
}

function refreshAlignment() {
    lg_aligned_diff = [];
    lg_aligned_consensus_diff = [];
    for (let loop = 0; loop < numGenomes; loop++) {
        lg_aligned_diff.push(0);
        lg_aligned_consensus_diff.push(0);
    }
}

function addGenomeNames(order, genome_name) {
    let y = 20 + (lg_yCdsSize + lg_yMargin + lg_yGenomeSize) * (order + 1) + lg_yGenomeSize + lg_yCdsSize / 2 - lg_genome_name_fontSize;
    genome_browser_container.append("div").attr("class", "lg_genome_name")
        .style("left", "10px")
        .style("top", y + "px")
        .style("font-size", lg_genome_name_fontSize + "px")
        .html(genome_name)
}

function drawLine(start, end, angle, order) {
    let y = 50 + 100 * (order + 1);
    let val = angle < 0 ? "rgba(150,150,150)" : AngleColer[angle];
    let s = convertGeneticPositionToXPixcel(start) + 200;
    let e = convertGeneticPositionToXPixcel(end) + 200;
    genome_browser_ctx.beginPath();
    genome_browser_ctx.moveTo(s, y);
    genome_browser_ctx.lineTo(e, y);
    genome_browser_ctx.lineWidth = 95;
    genome_browser_ctx.strokeStyle = val;
    genome_browser_ctx.stroke();
}

function convertGeneticPositionToXPixcel(gPosition) {
    return gPosition / genome_width;
}

let lgZoom_preX = 0;

function lgZoomIn() {
    let s = 0;
    let e = 0;
    let w = 0;
    s = zoom_start + lg_zoom_changeYRad;
    e = zoom_end - lg_zoom_changeYRad;
    w = e - s

    if (w > 0.0000001) {
        setZoom(s, e);
    } else {
        s = zoom_start + 0.001;
        e = zoom_end - 0.001;
        w = e - s;
        if (w > 0.0000001) {
            setZoom(s, e, true, 1);
        } else {
            s = zoom_start + 0.0001;
            e = zoom_end - 0.0001;
            w = e - s;
            if (w > 0.0000001) {
                setZoom(s, e, true, 2);
            } else {
                redrawLinearGenomeBrowser();
            }
        }
    }
}

function lgZoomOut() {
    let s = 0;
    let e = 0;
    let w = 0;

    if (zoomArr.length == 0) {
        s = zoom_start - lg_zoom_changeYRad;
        e = zoom_end + lg_zoom_changeYRad;
        w = e - s
        if (w < Math.PI / 2) {
            setZoom(s, e);
        }
    } else {
        let v = zoomArr.pop();
        if (v == 1) {
            s = zoom_start - 0.001;
            e = zoom_end + 0.001;
            setZoom(s, e);
        } else if (v == 2) {
            s = zoom_start - 0.0001;
            e = zoom_end + 0.0001;
            setZoom(s, e);
        }
    }
}

function lgMove(x) {
    let w = 0;

    w = zoom_end - zoom_start;
    if (w > 1000) {
        lg_zoom_changeXRad = 0.02
    } else {
        lg_zoom_changeXRad = 0.02
    }
    if (Math.abs(x) > 10) {
        lg_zoom_changeXRad = 0.1;
    }
    if (x > 0) {
        zoom_start = zoom_start - w * lg_zoom_changeXRad;
        zoom_end = zoom_end - w * lg_zoom_changeXRad;
    } else if (x < 0) {
        zoom_start = zoom_start + w * lg_zoom_changeXRad;
        zoom_end = zoom_end + w * lg_zoom_changeXRad;
    }
    if (zoom_start < -Math.PI / 2 && zoom_end < -Math.PI / 2) {
        zoom_start = zoom_start + Math.PI * 2
        zoom_end = zoom_end + Math.PI * 2
    } else if (zoom_start > Math.PI * 3 / 2 && zoom_end > Math.PI * 3 / 2) {
        zoom_start = zoom_start - Math.PI * 2
        zoom_end = zoom_end - Math.PI * 2
    }
    console.log(zoom_start, zoom_end);
    showArc(zoom_start, zoom_end);
    redrawLinearGenomeBrowser();
}


let zoomArr = [];

function setZoom(s, e, t, v) {
    if (t) {
        zoomArr.push(v);
    }
    let w = e - s;
    zoom_start = s;
    zoom_end = e;
    zoom_size = w / 2;
    showArc(zoom_start, zoom_end);
    redrawLinearGenomeBrowser();
}