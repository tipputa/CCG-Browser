const circularBrowser = new bio.CircularGenomeBrowser({
    setSize: false
});
circularBrowser.setContainer("app");


json_path = "result_min_Hp72.json";
bio.json(json_path).then(function (root) {
    console.log("reading " + json_path);
    circularBrowser.setJson(root);
    circularBrowser.render();
    circularBrowser.highlighter.setUpdateFunction(console.log);
});