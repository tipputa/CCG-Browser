const circularBrowser = new bio.CircularGenomeBrowser();
//const circularBrowserMod = new bio.CircularGenomeBrowser();

const linearGenomeBrowser = new bio.LinearGenomeBrowser();
circularBrowser.setContainer("app");
//circularBrowserMod.setContainer("app2");
linearGenomeBrowser.setContainer("linearBrowser");


const update = (start, end) => {
    linearGenomeBrowser.setRange(start, end)
}

let json_path = "result_min_Hp72.json";
bio.json(json_path).then(function (root) {
    console.log("reading " + json_path);
    circularBrowser.setJson(root);
    circularBrowser.render();

    linearGenomeBrowser.setJson(root);
    linearGenomeBrowser.render();

    circularBrowser.highlighter.setUpdateFunction(update);
});

json_path = "result_min_Hp72_mod.json";
bio.json(json_path).then(function (root) {
    console.log("reading " + json_path);
    circularBrowserMod.setJson(root);
    circularBrowserMod.render();
    circularBrowserMod.highlighter.setUpdateFunction(update);

});

/* create modal
const modal = new bio.Modal();
modal.makeModal("ok");
*/

/* test methods of post
const data = {
    message: "!!ok!!",
    seqs: [{
        start: 10,
        end: 2000,
        genome_ID: "NC_000915.1"
    }, {
        start: 10,
        end: 3000,
        genome_ID: "NC_021882.2"
    }]

}


const param = {
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


bio.json("http://127.0.0.1:8000/hp72/api/genome/multiple", param).then((res) => {
    console.log(res)
});
*/