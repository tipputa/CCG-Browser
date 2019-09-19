class CcgCore {
    constructor(fileName, listId) {
        let canvas = d3.select("#canvas-container")
            .append("canvas")
            .call(d3.zoom().scaleExtent([1, 10]).on("zoom", this.zoom))
            .attr("width", width - 4)
            .attr("height", height);

        this.ctx = canvas.node().getContext("2d");

        this.fileName = fileName;
        this.listId = listId;
        this.numGenomes = 0;
        this.importedJs = {};
        this.genomeList = [];
        console.log(fileName);
        this.startProcess();
        this.setSortable(this.listId);
        this.ringMargin = 2;
        this.ringSize = 10;

        // https://www.peko-step.com/html/hsl.html
        this.colArray = []
        for (let i = 1; i < 361; i++) {
            if (i <= 60) {
                this.colArray.push("rgb(255," + (i / 60 * 255) + ",0)");
            } else if (i <= 120) {
                this.colArray.push("rgb(" + (255 - (i - 60) / 60 * 255) + ", 255, 0)");
            } else if (i <= 180) {
                this.colArray.push("rgb(0, 255, " + ((i - 120) / 60 * 255) + ")");
            } else if (i <= 240) {
                this.colArray.push("rgb(0, " + (255 - (i - 180) / 60 * 255) + ", 255)");
            } else if (i <= 300) {
                this.colArray.push("rgb(" + ((i - 240) / 60 * 255) + ", 0, 255)");
            } else if (i <= 360) {
                this.colArray.push("rgb(255, 0, " + (255 - (i - 300) / 60 * 255) + ")");
            }
        }
    }

    async importJs() {
        let res;
        await d3.json(this.fileName).then((root) => {
            res = root;
        });
        this.importedJs = res;
        console.log();
        this.numGenomes = this.importedJs.each_genome_info.length;
        this.genomeList = getGenomeList(this.importedJs.each_genome_info);
        d3.select('#list01').selectAll("li")
            .data(this.genomeList).enter().append("li").attr("class", "list-group-item").attr("data-id", function (d) {
                return d.name;
            }).html(function (d) {
                return d.content;
            });
        this.drawDataIni()

    }

    startProcess() {
        this.importJs();
    }

    httpObjMethod() {
        var httpObj = new XMLHttpRequest();
        httpObj.open("get", this.fileName, false);
        httpObj.onload = () => {
            this.importedJs = JSON.parse(httpObj.responseText);
            this.numGenomes = this.importedJs.each_genome_info.length;
            this.genomeList = getGenomeList(this.importedJs.each_genome_info);
            d3.select('#list01').selectAll("li")
                .data(this.genomeList).enter().append("li").attr("class", "list-group-item").attr("data-id", function (d) {
                    return d.name;
                }).html(function (d) {
                    return d.content;
                });
        }
        httpObj.send(null);
        this.drawDataIni()
    }

    setSortable(id) {
        /* sortable.js https://github.com/SortableJS/Sortable#cdn*/
        var el = document.getElementById(id);
        var sortable = Sortable.create(el, {
            group: "localStorage-example",
            store: {
                /**
                 * Get the order of elements. Called once during initialization.
                 * @param   {Sortable}  sortable
                 * @returns {Array}
                 */
                get: function (sortable) {
                    var order = localStorage.getItem(sortable.options.group.name);
                    return order ? order.split('|') : [];
                },

                /**
                 * Save the order of elements. Called onEnd (when the item is dropped).
                 * @param {Sortable}  sortable
                 */
                set: function (sortable) {
                    var order = sortable.toArray();
                    localStorage.setItem(sortable.options.group.name, order.join('|'));
                }
            },
            onEnd: function ( /**Event*/ evt) {
                evt.newIndex
                this.genomeList = sortable.toArray();
                console.log(this.genomeList);
                this.importedJs.each_genome_info.forEach(function (e) {
                    e.order = this.genomeList.indexOf(e.acc)
                });
                this.refresh();
            },

        })
    }

    drawDataIni() {
        console.log(this.importedJs);
        console.log("ok");
        this.ringSize = ((outerRadius - Math.max(20, ((this.numGenomes - 1) * this.ringMargin + 50))) / this.numGenomes);
        if (this.ringSize < 0) {
            this.ringMargin = 1;
            this.ringSize = ((outerRadius - Math.max(20, ((this.numGenomes - 1) * this.ringMargin + 50))) / this.numGenomes);
        }
        if (this.ringSize < 0) {
            this.ringMargin = 0;
            this.ringSize = ((outerRadius - Math.max(20, ((this.numGenomes - 1) * this.ringMargin + 50))) / this.numGenomes);
        }

        maxR = outerRadius + 5 + this.ringSize / 2;
        let p = Math.PI * 2;

        let sum = function (arr) {
            return arr.reduce(function (prev, current, i, arr) {
                return prev + current;
            });
        }
        let rate = p / this.importedJs.consensus_genome_size
        for (let loop = 0; loop < this.numGenomes; loop++) {
            for (let i = 0; i < this.importedJs.each_genome_info[loop].genes.length; i++) {
                this.importedJs.each_genome_info[loop].genes[i]["start_rotated_rad"] = this.importedJs.each_genome_info[loop].genes[i].start_rotated * rate;
                this.importedJs.each_genome_info[loop].genes[i]["end_rotated_rad"] = this.importedJs.each_genome_info[loop].genes[i].end_rotated * rate;
                this.importedJs.each_genome_info[loop].genes[i]["r"] = outerRadius - this.importedJs.each_genome_info[loop].order * (this.ringSize + this.ringMargin)
            }
        }
        this.drawData();
    }

    drawData() {
        this.drawKaryotype();
        for (let loop = 0; loop < this.numGenomes; loop++) {
            for (let i = 0; i < this.importedJs.each_genome_info[loop].genes.length; i++) {
                this.draw(this.importedJs.each_genome_info[loop].genes[i]["r"], this.importedJs.each_genome_info[loop].genes[i]["start_rotated_rad"], this.importedJs.each_genome_info[loop].genes[i]["end_rotated_rad"], this.ringSize, this.importedJs.each_genome_info[loop].genes[i].angle);
            }
        }
    }

    draw(r, start, stop, lineWidth, angle) {
        let val = angle < 0 ? "rgba(255,255,255)" : this.colArray[angle];
        this.ctx.beginPath();
        this.ctx.arc(halfX, halfY, r, start - deg90, stop - deg90);
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = val;
        this.ctx.stroke();
    }

    drawKaryotype() {
        for (let i = 0; i < 360; i++) {
            this.draw(maxR, convertDeg2Rad(i), convertDeg2Rad(i + 1), 5, i);
        }
    }

    zoom() {
        let transform = d3.event.transform;
        this.ctx.save();
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.translate(transform.x, transform.y);
        this.ctx.scale(transform.k, transform.k);
        this.drawData();
        this.ctx.restore();
    }

    refresh() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, width, height);
        this.drawDataIni();
        this.drawData();
        this.ctx.restore();
    }

}

let width = d3.select("#canvas-container").node().getBoundingClientRect().width,
    height = 1200,
    outerRadius = Math.min(width, height) * .5 - 100,
    innerRadius = outerRadius * .995;

let deg90 = Math.PI / 2;
let halfX = width / 2;
let halfY = height / 2;

let maxR = outerRadius + 20;

let is_zoom = true;





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
            "content": "<div class=\"row\">" + getColNames(e.genome_name) + getColNames(e.acc) + getColNames(e.label) + "</div>"
        });
    });
    return res;
}

function getColNames(txt) {
    return "<div class=\"col\">" + txt + "</div>";
}




/*
d3.select('canvas').on('mousemove', function () {
    let mouseX = d3.event.layerX || d3.event.offsetX;
    let mouseY = d3.event.layerY || d3.event.offsety;

    let col = ctx.getImageData(mouseX, mouseY, 10, 10).data;
    console.log(col);
});
*/

function convertRad2Deg(radian) {
    return parseInt(radian / (2 * Math.PI) * 360);
}

function convertDeg2Rad(deg) {
    return 2 * Math.PI * deg / 360;
}