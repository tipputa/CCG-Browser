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


console.log(lgWidth + " " + height);


function drawLinearGenomeBrowser() {
    refreshLinearGenome();
    drawLinearGenome();
}

function drawLinearGenome() {
    // genome_width = importedJs.consensus_genome_size / (lgWidth - 210);
    let zoomStart = importedJs.consensus_genome_size * (zoom_start + Math.PI / 2) / (2 * Math.PI);
    let zoomEnd = importedJs.consensus_genome_size * (zoom_end + Math.PI / 2) / (2 * Math.PI);
    genome_width = (zoomEnd - zoomStart) / (lgWidth - 210);
    for (let loop = 0; loop < numGenomes; loop++) {
        let g = importedJs.each_genome_info[loop];
        drawGenomeSequence(g, zoomStart, zoomEnd);

        addGenomeNames(g.order, g.genome_name);
        for (let i = 0; i < g.genes.length; i++) {
            if (g.genes[i]["start_rotated"] < zoomStart) {
                if (g.genes[i]["end_rotated"] > zoomStart) {
                    drawLineSVG(g.genes[i]["start_rotated"] - zoomStart,
                        g.genes[i]["end_rotated"] - zoomStart,
                        g.genes[i].angle,
                        g.genes[i].strand,
                        g.strand,
                        g.order,
                        g.genes[i].locusTag,
                        g.genes[i].consensusId,
                        1
                    );
                }
                continue;
            } else if (g.genes[i]["end_rotated"] > zoomEnd) {
                if (g.genes[i]["start_rotated"] < zoomEnd) {
                    drawLineSVG(g.genes[i]["start_rotated"] - zoomStart,
                        g.genes[i]["end_rotated"] - zoomStart,
                        g.genes[i].angle,
                        g.genes[i].strand,
                        g.strand,
                        g.order,
                        g.genes[i].locusTag,
                        g.genes[i].consensusId,
                        2
                    );
                }
                continue;
            }
            drawLineSVG(g.genes[i]["start_rotated"] - zoomStart,
                g.genes[i]["end_rotated"] - zoomStart,
                g.genes[i].angle,
                g.genes[i].strand,
                g.strand,
                g.order,
                g.genes[i].locusTag,
                g.genes[i].consensusId);
        }
    }
}

let baseColor = {};
baseColor["A"] = "red";
baseColor["T"] = "blue";
baseColor["C"] = "green";
baseColor["G"] = "yellow";

function drawGenomeSequence(g, start, end) {
    let s = parseInt(start / importedJs.consensus_genome_size * g.genome_size);
    let e = parseInt(end / importedJs.consensus_genome_size * g.genome_size);
    let y = 20 + (lg_yMargin + lg_yCdsSize + lg_yGenomeSize) * (g.order + 1);
    let genome = importedGenome[g.acc].substr(s, parseInt(end - start)).split("");
    if (genome_width < 1) {

        for (let i = 0; i < genome.length; i++) {
            let col = baseColor[genome[i]];
            genenome_svg.append("rect")
                .attr("x", 200 + i / genome_width)
                .attr("y", y)
                .attr("width", 1 / genome_width)
                .attr("height", lg_yGenomeSize - 2)
                .attr("fill", col);
        }
    } else {
        genenome_svg.append("rect")
            .attr("x", 200)
            .attr("y", y)
            .attr("width", lgWidth - 210)
            .attr("height", lg_yGenomeSize - 2)
            .attr("fill", "rgb(150, 150, 150)")
            .attr("text-anchor", "middle")
            .text("Genome Sequence");
        genenome_svg.append("text")
            .attr("x", lgWidth / 2 + 105)
            .attr("y", y + 14)
            .attr("fill", "rgb(255, 255, 255)")
            .style("text-anchor", "middle")
            .text("Genome Sequence");

    }
}

function refreshLinearGenome() {
    //genome_browser_ctx.clearRect(0, 0, lgWidth, height);
    genenome_svg.remove();
    genome_browser_container.selectAll("div").remove();

    genenome_svg = genome_browser_container.append("svg")
        .attr("id", "svg_container")
        .attr("width", lgWidth)
        .attr("height", height)
        .call(d3.zoom().scaleExtent([0.5, 2]).on("zoom", lgZoom));

    tooltip = genome_browser_container.append("div").attr("class", "linear-genome-tooltip");

}

function addGenomeNames(order, genome_name) {
    let y = 20 + (lg_yCdsSize + lg_yMargin + lg_yGenomeSize) * (order + 1) + lg_yGenomeSize + lg_yCdsSize / 2 - lg_genome_name_fontSize;
    genome_browser_container.append("div").attr("class", "lg_genome_name")
        .style("left", "10px")
        .style("top", y + "px")
        .style("font-size", lg_genome_name_fontSize + "px")
        .html(genome_name)
}

function drawLineSVG(start, end, angle, strand, reverse,
    order, gene_name, consensusId, is_edge) {
    let y = 20 + (lg_yGenomeSize + lg_yMargin + lg_yCdsSize) * (order + 1) + lg_yGenomeSize;
    if (reverse == 0 && strand < 0) {
        y = y + lg_yCdsSize / 2;
    }
    if (reverse == 1 && strand > 0) {
        y = y + lg_yCdsSize / 2;
    }
    let col = angle < 0 ? "rgba(150,150,150)" : colArray[angle];
    let s = convertGeneticPositionToXPixcel(start) + 200;
    let e = convertGeneticPositionToXPixcel(end) + 200;
    if (is_edge == 1) {
        s = 200;
    } else if (is_edge == 2) {
        e = lgWidth - 10;
    }
    let w = e - s;
    if (w < 0) w = 0;
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
                .html("<p>name : " + gene_name + "</p><p>id : " + consensusId + "</p>");
        })
        .on("mousemove", function () {
            tooltip
                .style("top", (y - lg_yCdsSize * 2) + "px")
                .style("left", s + "px");
        })
        .on("mouseout", function () {
            tooltip
                .style("visibility", "hidden")

        });

}

function drawLine(start, end, angle, order) {
    let y = 50 + 100 * (order + 1);
    let val = angle < 0 ? "rgba(150,150,150)" : colArray[angle];
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

function lgZoom() {
    let transform = d3.event.transform;
    let s = 0;
    let e = 0;
    let w = 0;
    if (transform.k != 1) {
        if (transform.k > 1) {
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
                    }
                }
            }
        } else {
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
    } else if (transform.x != 0) {
        w = zoom_end - zoom_start;
        if (transform.x - lgZoom_preX > 0) {
            zoom_start = zoom_start - w * lg_zoom_changeXRad;
            zoom_end = zoom_end - w * lg_zoom_changeXRad;
        } else {
            zoom_start = zoom_start + w * lg_zoom_changeXRad;
            zoom_end = zoom_end + w * lg_zoom_changeXRad;
        }
        lgZoom_preX = transform.x;
        showArc(zoom_start, zoom_end);
        drawLinearGenomeBrowser();
    }
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
    drawLinearGenomeBrowser();

}