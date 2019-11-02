const tmp = new bio.GraphicBase();
tmp.echo("text echo");
tmp.echoName();


const app_elem = bio.selectID("app");
app_elem.html("test")
app_elem
    .on("click", () => {
        app_elem.html(test);

        console.log(app_elem.html());
    })
    .on("mousemove", () => {})
    .on("mouseleave", () => {})
    .on("mouseout", () => {})
    .on("mousedown", () => {})
    .style("background-color", "blue")
    .setClass("mt-5");

const test = null;

app_elem.create("div")
    .style("background-color", "red")
    .style("width", "100px")
    .style("height", "100px")
    .setClass("child")
    .create("svg");
app_elem.create("div")
    .create("canvas")
    .attr("width", 100)
    .attr("height", 200);


bio.each(["1", "2"], (val, id, arr) => {
    console.log(`${val} of ${id} in ${arr}`);
});


new Sortable(bio.selectID("list").elements[0]);