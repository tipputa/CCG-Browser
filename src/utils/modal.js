import * as utils from "./index"

export class Modal {
    constructor() {
        this.x = 100;
        this.y = 100;
        this.layerX = 0;
        this.layerY = 0;
        this.width = 100;
        this.height = 200;
        this.modal_class = "def-modal-class"
    }
    makeModal() {
        const body = utils.select("body")
            .on("dragover", () => {
                event.preventDefault();
                console.log(event);
            });

        const box = body.create("div")
            .style("position", "absolute")
            .style("left", this.x + "px")
            .style("top", this.y + "px")
            .style("height", this.height + "px")
            .style("width", this.width + "px")
            .style("z-index", 10)
            .style("background-color", "rgb(255,0,0)");

        const boxHeader = box.create("div")
            .attr("draggable", "true")
            .style("position", "relative")
            .style("height", "30px")
            .style("width", this.width + "px")
            .setClass(this.modal_class)
            .style("background-color", "rgb(200,200,200)")
            .on("dragend", () => {
                box
                    .style("left", event.pageX - this.layerX + "px")
                    .style("top", event.pageY - this.layerY + "px")
            })
            .on("dragstart", () => {
                this.layerX = event.layerX;
                this.layerY = event.layerY;
                console.log(event);
                event.dataTransfer.setDragImage(this.box, 0, 0);
            })
        box.create("div")
            .style("position", "relative")
            .style("background-color", "rgb(20,0,0)")
            .style("width", this.width)
            .style("height", "200px")

        /*
                box.on("mousedown", () => {
                    this.dragging = true;
                })
                box.on("mouseup", () => {
                    this.dragging = false;
                })
                box.on("mouseleave", () => {
                    this.dragging = false;
                })
                box.on("mousemove", () => {
                    if (this.dragging) {
                        this.x += event.movementX;
                        this.y += event.movementY;
                        box
                            .style("left", this.x + "px")
                            .style("top", this.y + "px")
                    }
                })

            */
    }
}