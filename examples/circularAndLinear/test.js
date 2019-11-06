const circularBrowser = new bio.CircularGenomeBrowser({
    setSize: false
});

const linearGenomeBrowser = new bio.LinearGenomeBrowser();
circularBrowser.setContainer("app");
linearGenomeBrowser.setContainer("linearBrowser");


json_path = "result_min_Hp72.json";
bio.json(json_path).then(function (root) {
    console.log("reading " + json_path);
    circularBrowser.setJson(root);
    circularBrowser.render();
    circularBrowser.highlighter.setUpdateFunction(console.log);

    linearGenomeBrowser.setJson(root);
    linearGenomeBrowser.render();
});