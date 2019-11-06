import * as color from "./color"

const deg90 = Math.PI / 2

export const setLineWidth = (ctx, lineWidth) => {
    ctx.lineWidth = lineWidth
}

export const setTextAlign = (ctx, align) => {
    ctx.textAlign = align; // center
}

export const setFillStyle = (ctx, fStyle) => {
    ctx.fillStyle = fStyle;
}

export const setStrokeStyle = (ctx, sStyle) => {
    ctx.strokeStyle = sStyle;
}

export const drawLine = (ctx, startX, endX, startY, endY, strokeStyle) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
}

export const drawRect = (ctx, x, y, width, height, strokeStyle, lineWidth) => {
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, width, height);
}

export const drawArc = (ctx, x, y, r, startRad, endRad, angle) => {
    let val = angle < 0 ? "rgba(200,200,200)" : color.COLER_ARR[angle];
    ctx.beginPath();
    ctx.arc(x, y, r, startRad - deg90, endRad - deg90);
    ctx.strokeStyle = val;
    ctx.stroke();
}

export const drawTxt = (ctx, text, x, y, font) => {
    ctx.font = font
    ctx.fillText(text, x, y);
}

export const clear = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
}