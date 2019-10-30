import * as _ from "./myUnderscore.js";

/**
 * faster than select;
 * @param {string} elements id
 */
class Selector {
    constructor(elements) {
        this.elements = elements;
        this.mouse = null;
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
            const newEle = document.createElement(elementName);
            el.appendChild(newEle);
            elements.push(el.lastElementChild);
        });
        return new Selector(elements);
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