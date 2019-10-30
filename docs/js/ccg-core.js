let numGenomes = 0;
let ringMargin = 1;
let ringSize = 10;
let genome_list = [];
let importedJs = {};
let importedGenome = {};
let ccgContainre = d3.select("#ccg-container")

let ccgWidth = ccgContainre.node().getBoundingClientRect().width,
    height = ccgWidth,
    outerRadius = Math.min(ccgWidth, height) * .5 - 100,
    innerRadius = outerRadius * .995;

let deg90 = Math.PI / 2;
let halfX = ccgWidth / 2;
let halfY = height / 2;

let maxR = outerRadius + 20;

let is_ccg_zoomable = true;
let is_zoom_lock = false;
let zoom_start = 0;
let zoom_end = 0;
let zoom_size = 0.1; // 0.261799

let canvas = ccgContainre
    .append("canvas")
    .call(d3.zoom().scaleExtent([1, 10]).on("zoom", ccgZoom))
    .attr("id", "ctx")
    .attr("width", ccgWidth - 4)
    .attr("height", height);

let canvas_zoomRange = ccgContainre
    .append("canvas")
    .attr("id", "ctx_zoom")
    .attr("width", ccgWidth - 4)
    .attr("height", height);

let ctx = canvas.node().getContext("2d");
let ctx_zoomRange = canvas_zoomRange.node().getContext("2d");
canvas_zoomRange.on("mousemove", function () {
    if (!is_zoom_lock) {
        let xy = d3.mouse(this);
        let angle = getAngleFromMousePosition(xy);
        zoom_start = angle - zoom_size;
        zoom_end = angle + zoom_size;
        isArcZoomRangeActive = true;
        showArc(zoom_start, zoom_end);
    }
});
canvas_zoomRange.on("mouseleave", function () {
    if (!is_zoom_lock) {
        ctx_zoomRange.clearRect(0, 0, ccgWidth, height);
    }
});

canvas_zoomRange.on("click", function () {
    if (!is_zoom_lock) {
        is_zoom_lock = true;
        drawLinearGenomeBrowser();

    } else {
        is_zoom_lock = false;
    }
});


function processStart(fileName, id_name) {
    console.log(fileName);
    console.log(id_name);
    setSortable(id_name);

    d3.json(fileName).then(function (root) {
        importedJs = root;
        numGenomes = importedJs.each_genome_info.length;
        genome_list = getGenomeList(importedJs.each_genome_info);
        d3.select("#" + id_name).selectAll("li")
            .data(genome_list)
            .enter()
            .append("li")
            .attr("class", "list-group-item")
            .attr("data-id", function (d) {
                return d.name;
            }).html(function (d) {
                return d.content;
            });
        drawDataIni();
        for (let i = 0; i < numGenomes; i++) {
            readGenome("./genome/" + importedJs.each_genome_info[i].acc + ".fa", importedJs.each_genome_info[i].acc);
        }
        console.log(importedGenome);

    });
}

function readGenome(fileName, acc) {
    console.log(fileName);
    d3.text(fileName).then(function (root) {
        importedGenome[acc] = root;
    });
}

function setSortable(id) {
    /* sortable.js https://github.com/SortableJS/Sortable#cdn*/
    var el = document.getElementById(id);
    var sortable = Sortable.create(el, {
        group: "localStorage-example",
        onChoose: function ( /**Event*/ evt) {
            /* https://qiita.com/nobuyuki-ishii/items/44d324735ed3b10349df */
            let selection = document.getElementById("id_" + evt.item.__data__.name);
            selection.classList.add("show");
        },
        onUnchoose: function ( /**Event*/ evt) {
            let selection = document.getElementById("id_" + evt.item.__data__.name);
            selection.classList.remove("show");
        },

        onEnd: function ( /**Event*/ evt) {
            evt.newIndex
            genome_list = sortable.toArray();
            importedJs.each_genome_info.forEach(function (e) {
                e.order = genome_list.indexOf(e.acc)
            });
            refresh();
        },

    });
}

function getProps(arr, propName) {
    let res = [];
    arr.forEach(function (e) {
        res.push(e[propName]);
    });
    return res;
}

function getGenomeList(arr) {
    let res = [];
    arr.forEach(function (e) {
        res.push({
            "name": e.acc,
            "content": "<div class=\"card\"><div class=\"card-header\" id=\"" + e.acc + "\"> \
                <h3 class=\"mb-0\"> \
                <button class=\"btn btn-link collapsed\" data-toggle=\"collapse\" data-target=\"#id_" + e.acc + "\" aria-expanded=\"false\" aria-controls=\"id_" + e.acc + "\">" + e.strain +
                "</button></h5></div> \
        <div id=\"id_" + e.acc + "\" class=\"collapse\" aria-labelledby=\"" + e.acc + "\" data-parent=\"#accordion\"> \
        <div class=\"card-body\"> <p>Accession: " + e.acc + "</p><p>Genome size: " + e.genome_size + "</p><p>Deviation from consensus: " + e.distance_from_consensus + "</div> </div> </div>"
        });
    });
    return res;
}


function getGenomeList_old(arr) {
    let res = [];
    arr.forEach(function (e) {
        res.push({
            "name": e.acc,
            "content": "<div class=\"row\">" + getColNames(e.genome_name) + getColNames(e.acc) + getColNames(e.label) + "</div>"
        });
    });
    return res;
}

function getColNames(txt) {
    return "<div class=\"col\">" + txt + "</div>";
}



function ccgZoom() {
    if (!is_ccg_zoomable) return;
    let transform = d3.event.transform;
    ctx.save();
    ctx.clearRect(0, 0, ccgWidth, height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);
    drawData();
    ctx.restore();
}

function refresh() {
    ctx.save();
    ctx.clearRect(0, 0, ccgWidth, height);
    drawDataIni();
    ctx.restore();
    if (is_zoom_lock) {
        isArcZoomRangeActive = true;
        showArc(zoom_start, zoom_end);
        drawLinearGenomeBrowser();
    }
}
/*
d3.select('canvas').on('mousemove', function () {
    let mouseX = d3.event.layerX || d3.event.offsetX;
    let mouseY = d3.event.layerY || d3.event.offsety;

    let col = ctx.getImageData(mouseX, mouseY, 10, 10).data;
    console.log(col);
});
*/

function drawDataIni() {
    ringSize = ((outerRadius - Math.max(20, ((numGenomes - 1) * ringMargin + 50))) / numGenomes);
    if (ringSize < 0) {
        ringMargin = 1;
        ringSize = ((outerRadius - Math.max(20, ((numGenomes - 1) * ringMargin + 50))) / numGenomes);
    }
    if (ringSize < 0) {
        ringMargin = 0;
        ringSize = ((outerRadius - Math.max(20, ((numGenomes - 1) * ringMargin + 50))) / numGenomes);
    }

    console.log("Ring size: " + ringSize);
    maxR = outerRadius + 5 + ringSize / 2;
    let p = Math.PI * 2;

    let sum = function (arr) {
        return arr.reduce(function (prev, current, i, arr) {
            return prev + current;
        });
    }
    let rate = p / importedJs.consensus_genome_size
    for (let loop = 0; loop < numGenomes; loop++) {
        importedJs.each_genome_info[loop]["r"] = outerRadius - importedJs.each_genome_info[loop].order * (ringSize + ringMargin)
        //for (let i = 0; i < importedJs.each_genome_info[loop].genes.length; i++) {
        //importedJs.each_genome_info[loop].genes[i]["start_rotated_rad"] = convertDeg2Rad(importedJs.each_genome_info[loop].genes[i]["start_rotated_angle"])
        //importedJs.each_genome_info[loop].genes[i]["end_rotated_rad"] = convertDeg2Rad(importedJs.each_genome_info[loop].genes[i]["end_rotated_angle"]);
        //}
    }
    drawData();
}

function drawData() {
    drawKaryotype();
    console.log("Num: " + numGenomes);
    for (let loop = 0; loop < numGenomes; loop++) {
        console.log("r: " + importedJs.each_genome_info[loop]["r"]);
        for (let i = 0; i < importedJs.each_genome_info[loop].genes.length; i++) {
            drawCCG(importedJs.each_genome_info[loop]["r"], importedJs.each_genome_info[loop].genes[i]["start_rotated_rad"], importedJs.each_genome_info[loop].genes[i]["end_rotated_rad"], ringSize, importedJs.each_genome_info[loop].genes[i].angle, importedJs.each_genome_info[loop].genes[i].feature);
        }
    }
}

function showZoomRange() {}

let isArcZoomRangeActive = true;

function clearArc() {
    ctx_zoomRange.clearRect(0, 0, ccgWidth, height);
}

function showArc(start, end) {
    clearArc();
    if (isArcZoomRangeActive) {
        ctx_zoomRange.beginPath();
        ctx_zoomRange.moveTo(halfX, halfY);
        ctx_zoomRange.arc(halfX, halfY, maxR + 10, start, end);
        ctx_zoomRange.fillStyle = "rgba(50,50,50,0.5)";
        ctx_zoomRange.strokeStyle = "rgba(50,50,50, 0.7)";
        ctx_zoomRange.lineWidth = 5;
        ctx_zoomRange.closePath();
        ctx_zoomRange.fill();
        ctx_zoomRange.stroke();
        ctx_zoomRange.restore();
    } else {
        showAlignedGenomeRange();
    }
}

function showAlignedGenomeRange() {
    for (let loop = 0; loop < numGenomes; loop++) {
        let r = importedJs.each_genome_info[loop]["r"];
        start = zoom_start - lg_aligned_consensus_diff[loop] / importedJs.consensus_genome_size * 2 * Math.PI;
        end = zoom_end - lg_aligned_consensus_diff[loop] / importedJs.consensus_genome_size * 2 * Math.PI;
        ctx_zoomRange.beginPath();
        ctx_zoomRange.arc(halfX, halfY, r + ringSize / 2, start, end);
        ctx_zoomRange.lineTo(halfX + (r - ringSize / 2) * Math.cos(end), halfY + (r - ringSize / 2) * Math.sin(end));
        ctx_zoomRange.arc(halfX, halfY, r - ringSize / 2, end, start, true);
        ctx_zoomRange.lineTo(halfX + (r + ringSize / 2) * Math.cos(start), halfY + (r + ringSize / 2) * Math.sin(start));
        ctx_zoomRange.lineWidth = 3;
        ctx_zoomRange.stroke();
        ctx_zoomRange.fill();
    }
}

function getAngleFromMousePosition(xy) {
    let x = xy[0] - halfX;
    let y = xy[1] - halfX;
    let tan = y / x;
    let angle = Math.atan(tan);
    if (x < 0) {
        return angle + Math.PI;
    } else {
        return angle;
    }
}

function drawCCG(r, start, stop, lineWidth, angle, feature) {
    let val = angle < 0 ? "rgba(200,200,200)" : AngleColer[angle];
    if (angle < 0) {
        if (feature != "CDS") {
            val = "rgba(100,100,100)"
        }
    }
    ctx.beginPath();
    ctx.arc(halfX, halfY, r, start - deg90, stop - deg90);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = val;
    ctx.stroke();
}

function drawKaryotype() {
    for (let i = 0; i < 360; i++) {
        drawCCG(maxR, convertDeg2Rad(i), convertDeg2Rad(i + 1), 5, i);
    }
}

function convertRad2Deg(radian) {
    return parseInt(radian / (2 * Math.PI) * 360);
}

function convertDeg2Rad(deg) {
    return 2 * Math.PI * deg / 360;
}

/* utilities */

function isZoomable_click() {
    if (is_ccg_zoomable) {
        d3.select(".is_zoomable").html("Locked");
        is_ccg_zoomable = false;
    } else {
        d3.select(".is_zoomable").html("Zoomable");
        is_ccg_zoomable = true;
    }
}

function changeColorCode_click() {
    if (isGeneSeparationColor) {
        d3.select(".is_colorCode").html("Consensus Color");
        isGeneSeparationColor = false;
        redrawLinearGenomeBrowser();
    } else {
        d3.select(".is_colorCode").html("Gene Color");
        isGeneSeparationColor = true;
        redrawLinearGenomeBrowser();
    }
}