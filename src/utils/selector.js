import * as _ from "./myUnderscore.js";

/**
 * faster than select;
 * @param {string} elements id
 */
class Selector {
    constructor(elements, isSvgChild = false) {
        this.elements = elements;
        this.mouse = null;
        this.isSvgChild = isSvgChild
    }

    on(eventType, callback, context, capture = false) {
        _.each(this.elements, (el) => {
            el.addEventListener(eventType, () => {
                const rect = el.getBoundingClientRect();
                this.mouse = [event.clientX - rect.left - el.clientLeft, event.clientY - rect.top - el.clientTop];
                callback.call(context);
                this.mouse = null;
            }, capture);
        });
        return this;
    }

    create(elementName) {
        const elements = [];
        _.each(this.elements, (el) => {
            if (elementName == "svg" || this.isSvgChild) {
                const newEle = document.createElementNS("http://www.w3.org/2000/svg", elementName);
                el.appendChild(newEle);
                elements.push(newEle);
                this.isSvgChild = true;
            } else {
                const newEle = document.createElement(elementName);
                el.appendChild(newEle);
                elements.push(newEle);
            }
        });
        return new Selector(elements, this.isSvgChild);
    }



    remove() {
        _.each(this.elements, (el) => {
            el.parentNode.removeChild(el);
        })
    }

    style(stylName, styleValue) {
        _.each(this.elements, (el) => {
            el.style.setProperty(stylName, styleValue);
        });
        return this;
    }

    attr(attrName, attrValue) {
        _.each(this.elements, (el) => {
            el.setAttribute(attrName, attrValue);
        });
        return this;
    }

    setClass(className) {
        return this.attr("class", className);
    }

    setID(idName) {
        return this.attr("id", idName);
    }

    html(text) {
        if (arguments.length == 1) {
            if (text) {
                _.each(this.elements, (el) => {
                    el.textContent = text;
                });
            } else {
                _.each(this.elements, (el) => {
                    el.textContent = text;
                });
                return this;
            }
        } else {
            const res = []
            _.each(this.elements, (el) => {
                res.push(el.textContent);
            });
            if (res.length === 1) return res[0];
            return res;
        }
    }

    innerHTML(text) {
        if (arguments.length == 1) {
            if (text) {
                _.each(this.elements, (el) => {
                    el.innerHTML = text;
                });
            } else {
                _.each(this.elements, (el) => {
                    el.innerHTML = text;
                });
                return this;
            }
        } else {
            const res = []
            _.each(this.elements, (el) => {
                res.push(el.innerHTML);
            });
            if (res.length === 1) return res[0];
            return res;
        }
    }

}

/**
 * faster than select;
 * @param {string} idName ID name
 */
export const selectID = (idName) => {
    return new Selector([document.getElementById(idName)]);
}

/**
 * faster than select;
 * @param {string} className class name
 */
export const selectClass = (className) => {
    return new Selector([document.getElementsByClassName(className)]);
}

/**
 * selectID or selectClass is much fast;
 * @param {string} name css name
 */
export const select = (name) => {
    return new Selector(
        [document.querySelector(name)]
    );
}

/**
 * selectID or selectClass is much fast;
 * @param {string} name css name
 */
export const selectAll = (name) => {
    return new Selector(document.querySelectorAll(name));
}