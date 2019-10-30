const alignmentBrowser = new bio.Alignment();
alignmentBrowser.setContainer("app");

const treeSelect = d3.select("#tree_display")
const treeHeight = 1000;
const setFileName = (json_path, nwk_path) => {
    bio.json(json_path).then(function (root) {
        alignmentBrowser.setJson(root);
        alignmentBrowser.render();
        loadTreeFromURL(nwk_path);
    })
}

let tree_container = d3.select("#tree-container")
let tree_alignment = d3.select("#tree-alignment-container")
let treeAlignment_canvas = null;
let treeAlignment_ctx = null;

let treeWidth = tree_container.node().getBoundingClientRect().width * 0.95 * 2 / 3;
let alignmentWidth = window.innerWidth * 0.95 * 1 / 3;
let isSvgAlignShow = false;

function drawATree(newick) {
    var tree = d3.layout.phylotree()
        // create a tree layout object
        .options({
            'selectable': false,
            'left-offset': 10,
            // 'top-bottom-spacing': 'fit-to-size',
            // 'left-right-spacing': 'fit-to-size',
        })
        // .size([treeHeight, treeWidth])
        .svg(treeSelect)
        .node_circle_size(0.1);
    //.align_tips(true);
    console.log(treeHeight);
    tree(d3.layout.newick_parser(newick));



    treeAlignment_canvas = tree_alignment.append("canvas")
        .attr("class", "pos_absolute")
        .attr("id", "tree-alignment-canvas")
        .style("left", treeWidth + 6 + "px")
        .style("top", "0 px")
        .style("color", "black")
        .attr("width", alignmentWidth)
        .attr("height", treeHeight)
    treeAlignment_ctx = treeAlignment_canvas.node().getContext("2d");

    /*
    to get space for alignemnt spot
          tree.branch_name(function (node) {
            return standard_label(node) + " ".repeat(120);
          });
    */

    /* the next call creates the tree object, and tree nodes */
    tree(d3.layout.newick_parser(newick));

    // parse bootstrap support from internal node names
    _.each(tree.get_nodes(), function (node) {
        if (node.children) {
            if (parseFloat(node.name) > 0.1) {
                node.bootstrap = parseInt(parseFloat(node.name) * 100 + 0.5);
            }
        }
    });

    maximum_length = 5;
    var tree_attributes = {};
    tree.traverse_and_compute(function (node) {
        if (d3.layout.phylotree.is_leafnode(node)) {
            maximum_length = maximum_length < node.name.length ? node.name.length : maximum_length;
        }
    });

    /*
        tree.user_update_func(function () {
            console.log("working");
            refreshCtx(treeAlignment_ctx, alignmentWidth, treeHeight);
            let offset = [6, 37]
            let visible_leaf_nodes = tree.get_visible_leaf();
            console.log(visible_leaf_nodes.length)
            _.each(visible_leaf_nodes, function (d) {
                treeAlignment_ctx.beginPath();
                treeAlignment_ctx.moveTo(0, d.x + offset[1]);
                treeAlignment_ctx.lineTo(1000, d.x + offset[1]);
                treeAlignment_ctx.lineWidth = 12;
                treeAlignment_ctx.strokeStyle = "black";
                treeAlignment_ctx.stroke();
            });
        });
    */
    var bootstrap_scale = d3.scale.linear().domain([0, 0.5, 0.7, 0.9, 0.95, 1]).range([0.5, 1, 1.5, 2, 2.5, 3]).interpolate(d3.interpolateRound);

    tree.style_edges(function (dom_element, edge_object) {
        dom_element.style("stroke", "#999");
        dom_element.style("stroke-width", "2px");
        dom_element.style("stroke", edge_object.target.cluster ? edge_object.target.cluster : "#999");
        dom_element.attr("fill", "none");
    });

    // coloring
    const clustering = alignmentBrowser.group;
    const tag = {}
    _.each(alignmentBrowser.inputJson["sequences"], (val) => {
        tag[val.name] = val.group
    });

    tree.traverse_and_compute(function (node) {
        if (node.name in tag) {
            node.cluster = clustering[tag[node.name]].col;
            node.name = node.name + "_" + tag[node.name];

        } else {
            delete node.cluster;
            var children_clusters = _.keys(_.countBy(node.children, function (d) {
                return d.cluster;
            }));
            console.log(children_clusters.length + "_" + children_clusters[0]);
            if (children_clusters.length == 1 && children_clusters[0]) {
                node.cluster = children_clusters[0];
            }
        }
    }, "leaf-order");

    tree.style_nodes(function (element, node_data) {
        if (!node_data.children) {
            element.style("fill", node_data.cluster);
        }

        if ("bootstrap" in node_data && node_data.bootstrap) {
            var label = element.selectAll(".bootstrap");
            if (label.empty()) {
                element.append("text").classed("bootstrap", true).text(node_data.bootstrap).attr("dy", "-6px").attr("dx", "-4px").attr("text-anchor", "end").attr("alignment-baseline", "middle");
            } else {
                if (tree.radial()) { // do not show internal node labels in radial mode
                    label.remove();
                }
            }
        }

        if (isSvgAlignShow) {
            if (node_data.name in alignment_dic) { // see if the node has attributes
                var node_label = element.select("text");
                var font_size = parseFloat(node_label.style("font-size"));
                if (alignment_dic[node_data.name]) {
                    var x_size = alignmentWidth / alignment_dic[node_data.name].length;

                    var annotation = element.selectAll("rect").data(alignment_dic[node_data.name]);
                    annotation.enter().append("rect");
                    annotation.attr("width", x_size)
                        .attr("height", font_size)
                        .attr("y", -font_size / 2)
                        .style("stroke-width", "0px")
                        .style("fill", function (d) {
                            return d;
                        }).on("click", function (x) {
                            move();
                        }).on("wheel", function () {
                            event.preventDefault();
                            if (event.deltaY > 0) {
                                // console.log("wheel pan")
                                lgZoomOut();
                            } else if (event.deltaY < 0) {
                                lgZoomIn();
                            }
                        });

                    var move_past_label = maximum_length * 0.75 * font_size;

                    var x_shift = tree.shift_tip(node_data)[0] + move_past_label + 10;
                    annotation.attr("transform", null).attr("x", function (d, i) {
                        return x_shift + x_size * i;
                    });
                }
            }
        }
    });
    //tree.spacing_y(60);
    //tree.spacing_x(9);
    resize(tree);
    tree.placenodes().layout();
    d3.select(".canvas-container").style("height", treeSelect.node().clientHeight + "px");

    /*
          if ($("#layout").prop("checked")) {
            tree.radial(true);
          }
    */

    /*
          // UI handlers
          $("#layout").on("click", function (e) {
            tree.radial($(this).prop("checked")).placenodes().update();
          });
    */
}

function resize(tree) {
    y_space = 20;
    tree.spacing_x(20);
    setBestSize(true);

    function setBestSize(searchBest) {
        let s = tree.size();
        tree.spacing_y(y_space++);
        if (y_space == 100) return;
        if (s[1] < treeWidth) {
            setBestSize(true);
        }
    }
}

function refreshCtx(ctx, x, y) {
    ctx.clearRect(0, 0, x, y);
}

// load tree
function loadTreeFromURL(url) {
    d3.text(url, function (error, newick) {
        drawATree(newick);
    });
}

// download https://jsgao0.wordpress.com/2016/06/01/export-svg-file-using-xmlserializer/
function generateLink(fileName, data) {
    var link = document.createElement('a'); // Create a element.
    link.download = fileName; // Set value as the file name of download file.
    link.href = data; // Set value as the file content of download file.
    return link;
}

function exportSVG(element, fileName) {
    var svg = element;
    var svgString;
    if (window.ActiveXObject) {
        svgString = svg.xml;
    } else {
        var oSerializer = new XMLSerializer();
        svgString = oSerializer.serializeToString(svg);
    }
    generateLink(fileName + '.svg', 'data:image/svg+xml;utf8,' + svgString).click();
}

document.getElementById('downloadBtn').onclick = function () {
    var element = document.getElementById('tree_display');
    exportSVG(element, 'SVG-01');
}