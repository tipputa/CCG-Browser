    let fileName = "testRestext.json";
    let numGenomes = 0;

    let importedJs = {};
    initial();
    setSortable("list01");

    /** initial  **/
    function initial() {
        d3.json(fileName).then(function (root) {
            importedJs = root;
            numGenomes = importedJs.each_genome_info.length;
            let genomeOrder = getGenomeList(importedJs.each_genome_info);
            d3.select('#list01').selectAll("li")
                .data(genomeOrder).enter().append("li").attr("class", "list-group-item").attr("data-id", function (d) {
                    return d.name;
                }).html(function (d) {
                    return d.content;
                });
            drawDataIni();
        });
    }

    function setSortable(id) {
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
            onEnd: function (evt) {
                evt.newIndex;
                genomeOrder = sortable.toArray();
                importedJs.each_genome_info.forEach(function (e) {
                    e.order = genomeOrder.indexOf(e.genome_name)
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
                "name": e.genome_name,
                "content": "<div class=\"row\">" + getColNames(e.genome_name) + getColNames(e.acc) + getColNames(e.distance_from_consensus) + "</div>"
            });
        });
        return res;
    }

    function getColNames(txt) {
        return "<div class=\"col\">" + txt + "</div>";
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

    let canvas = d3.select("#canvas-container")
        .append("canvas")
        .call(d3.zoom().scaleExtent([1, 10]).on("zoom", zoom))
        .attr("id", "mainCanvas")
        .attr("width", width)
        .attr("height", height);

    let ctx = canvas.node().getContext("2d");

    // https://www.peko-step.com/html/hsl.html
    let colArray = []
    for (let i = 1; i < 361; i++) {
        if (i <= 60) {
            colArray.push("rgb(255," + (i / 60 * 255) + ",0)");
        } else if (i <= 120) {
            colArray.push("rgb(" + (255 - (i - 60) / 60 * 255) + ", 255, 0)");
        } else if (i <= 180) {
            colArray.push("rgb(0, 255, " + ((i - 120) / 60 * 255) + ")");
        } else if (i <= 240) {
            colArray.push("rgb(0, " + (255 - (i - 180) / 60 * 255) + ", 255)");
        } else if (i <= 300) {
            colArray.push("rgb(" + ((i - 240) / 60 * 255) + ", 0, 255)");
        } else if (i <= 360) {
            colArray.push("rgb(255, 0, " + (255 - (i - 300) / 60 * 255) + ")");
        }
    }

    function zoom() {
        let transform = d3.event.transform;
        ctx.save();
        ctx.clearRect(0, 0, width, height);
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);
        drawData(ctx);
        ctx.restore();
    }

    function refresh() {
        ctx.save();
        ctx.clearRect(0, 0, width, height);
        drawDataIni();
        ctx.restore();
    }
    /*
    d3.select('canvas').on('mousemove', function () {
        let mouseX = d3.event.layerX || d3.event.offsetX;
        let mouseY = d3.event.layerY || d3.event.offsety;

        let col = ctx.getImageData(mouseX, mouseY, 10, 10).data;
        console.log(col);
    });
    */
    let ringMargin = 3;
    let ringSize = 10;

    function drawDataIniOri() {
        ringSize = ((outerRadius - Math.max(20, ((numGenomes - 1) * ringMargin + 50))) / numGenomes);
        if (ringSize < 0) {
            ringMargin = 1;
            ringSize = ((outerRadius - Math.max(20, ((numGenomes - 1) * ringMargin + 50))) / numGenomes);
        }
        if (ringSize < 0) {
            ringMargin = 0;
            ringSize = ((outerRadius - Math.max(20, ((numGenomes - 1) * ringMargin + 50))) / numGenomes);
        }

        maxR = outerRadius + 5 + ringSize / 2;
        let p = Math.PI * 2;

        let sum = function (arr) {
            return arr.reduce(function (prev, current, i, arr) {
                return prev + current;
            });
        }
        let rate = p / importedJs.consensus_genome_size
        for (let loop = 0; loop < numGenomes; loop++) {
            for (let i = 0; i < importedJs.each_genome_info[loop].genes.length; i++) {
                importedJs.each_genome_info[loop].genes[i]["start_rotated_rad"] = importedJs.each_genome_info[loop].genes[i].start_rotated * rate;
                importedJs.each_genome_info[loop].genes[i]["end_rotated_rad"] = importedJs.each_genome_info[loop].genes[i].end_rotated * rate;
                importedJs.each_genome_info[loop].genes[i]["r"] = outerRadius - importedJs.each_genome_info[loop].order * (ringSize + ringMargin)
            }
        }
        drawData(ctx);
    }

    function drawDataIni() {
        numGenomes = 100;
        ringMargin = 1;
        ringSize = ((outerRadius - Math.max(20, ((numGenomes - 1) * ringMargin + 50))) / numGenomes);
        drawData(ctx)
    }

    function drawDataOriginal(ctx) {
        drawKaryotype(ctx);
        for (let loop = 0; loop < numGenomes; loop++) {
            for (let i = 0; i < importedJs.each_genome_info[loop].genes.length; i++) {
                draw(ctx, importedJs.each_genome_info[loop].genes[i]["r"], importedJs.each_genome_info[loop].genes[i]["start_rotated_rad"], importedJs.each_genome_info[loop].genes[i]["end_rotated_rad"], ringSize, importedJs.each_genome_info[loop].genes[i].angle);
            }
        }
    }

    function drawData(ctx) {
        ctx.beginPath();
        ctx.lineWidth = ringSize;
        ctx.strokeStyle = colArray[0];;
        for (let l = 0; l < numGenomes; l++) {
            for (let i = 0; i < 1000; i++) {
                draw(ctx, outerRadius - l * (ringSize + ringMargin), i * 2 * Math.PI / 1001, i * 2 * Math.PI / 1001 + ((i + 1) * 2 * Math.PI / 1001 - i * 2 * Math.PI / 1001) * 0.5)
                moveNext(ctx, (i + 1) * 2 * Math.PI / 1001, outerRadius - l * (ringSize + ringMargin))
            }
        }
        ctx.stroke();
    }

    function moveNext(ctx, deg, r) {
        let cos = Math.cos(Math.PI - deg);
        let sin = Math.sin(Math.PI - deg);
        let x = sin * r;
        let y = cos * r;
        ctx.moveTo(x + halfX, y + halfY);
    }

    function draw(ctx, r, start, stop) {
        ctx.arc(halfX, halfY, r, start - deg90, stop - deg90);
    }

    function drawOriginal(ctx, r, start, stop, lineWidth, angle) {
        let val = angle < 0 ? "rgba(255,255,255)" : colArray[angle];
        ctx.beginPath();
        ctx.arc(halfX, halfY, r, start - deg90, stop - deg90);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = val;
        ctx.stroke();
    }

    function drawKaryotype(ctx) {
        for (let i = 0; i < 360; i++) {
            draw(ctx, maxR, convertDeg2Rad(i), convertDeg2Rad(i + 1), 5, i);
        }
    }

    function convertRad2Deg(radian) {
        return parseInt(radian / (2 * Math.PI) * 360);
    }

    function convertDeg2Rad(deg) {
        return 2 * Math.PI * deg / 360;
    }

    function saveCanvasAsSvg() {
        var mockCtx = new C2S(1500, 1500);
        drawData(mockCtx);
        var mySerializedSVG = mockCtx.getSerializedSvg(); //true here, if you need to convert named to numbered entities.
        console.log(mySerializedSVG)
    }

    /* save canvas */
    // canvas上のイメージを保存
    function saveCanvas(saveType) {
        var imageType = "image/png";
        var fileName = "sample.png";
        if (saveType === "jpeg") {
            imageType = "image/jpeg";
            fileName = "sample.jpg";
        }
        var canvas = document.getElementById("mainCanvas");
        // base64エンコードされたデータを取得 「data:image/png;base64,iVBORw0k～」
        var base64 = canvas.toDataURL(imageType);
        // base64データをblobに変換
        var blob = Base64toBlob(base64);
        // blobデータをa要素を使ってダウンロード
        saveBlob(blob, fileName);
    }

    // Base64データをBlobデータに変換
    function Base64toBlob(base64) {
        // カンマで分割して以下のようにデータを分ける
        // tmp[0] : データ形式（data:image/png;base64）
        // tmp[1] : base64データ（iVBORw0k～）
        var tmp = base64.split(',');
        // base64データの文字列をデコード
        var data = atob(tmp[1]);
        // tmp[0]の文字列（data:image/png;base64）からコンテンツタイプ（image/png）部分を取得
        var mime = tmp[0].split(':')[1].split(';')[0];
        //  1文字ごとにUTF-16コードを表す 0から65535 の整数を取得
        var buf = new Uint8Array(data.length);
        for (var i = 0; i < data.length; i++) {
            buf[i] = data.charCodeAt(i);
        }
        // blobデータを作成
        var blob = new Blob([buf], {
            type: mime
        });
        return blob;
    }

    // 画像のダウンロード
    function saveBlob(blob, fileName) {
        var url = (window.URL || window.webkitURL);
        // ダウンロード用のURL作成
        var dataUrl = url.createObjectURL(blob);
        // イベント作成
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        // a要素を作成
        var a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
        // ダウンロード用のURLセット
        a.href = dataUrl;
        // ファイル名セット
        a.download = fileName;
        // イベントの発火
        a.dispatchEvent(event);
    }