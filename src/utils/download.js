// download https://jsgao0.wordpress.com/2016/06/01/export-svg-file-using-xmlserializer/
export const generateLink = (fileName, dataPath) => {
    var link = document.createElement('a'); // Create a element.
    link.download = fileName; // Set value as the file name of download file.
    link.href = dataPath; // Set value as the file content of download file.
    return link;
}

export const exportSVG = (svgElement, fileName) => {
    var svg = svgElement;
    var svgString;
    if (window.ActiveXObject) {
        svgString = svg.xml;
    } else {
        var oSerializer = new XMLSerializer();
        svgString = oSerializer.serializeToString(svg);
    }
    generateLink(fileName + '.svg', 'data:image/svg+xml;utf8,' + svgString).click();
}

export const exportText = (textString, fileName) => {
    const blob = new Blob(
        [textString], {
            type: "type/plain"
        }
    );
    const url = window.URL.createObjectURL(blob);
    generateLink(fileName, url).click();
}

// replacer:  https://qiita.com/qoAop/items/57d35a41ef9629351c3c
export const exportJson = (json, fileName, replacer = null, indent = 4) => {
    const blob = new Blob(
        [JSON.stringify(json, replacer, indent)], {
            type: "application/json"
        }
    );
    const url = window.URL.createObjectURL(blob);
    generateLink(fileName, url).click();
}