// colors: https://github.com/wilzbach/msa-colorschemes/tree/master/src
export const CLUSTAL2_COLOR = {
    A: "#80a0f0",
    R: "#f01505",
    N: "#00ff00",
    D: "#c048c0",
    C: "#f08080",
    Q: "#00ff00",
    E: "#c048c0",
    G: "#f09048",
    H: "#15a4a4",
    I: "#80a0f0",
    L: "#80a0f0",
    K: "#f01505",
    M: "#80a0f0",
    F: "#80a0f0",
    P: "#ffff00",
    S: "#00ff00",
    T: "#00ff00",
    W: "#80a0f0",
    Y: "#15a4a4",
    V: "#80a0f0",
    B: "#fff",
    X: "#fff",
    Z: "#fff",
    "-": "rgb(200,200,200)",
    "\\": "rgb(200,200,200)"
}

export const STRAND_COLOR = {
    A: "#5858a7",
    R: "#6b6b94",
    N: "#64649b",
    D: "#2121de",
    C: "#9d9d62",
    Q: "#8c8c73",
    E: "#0000ff",
    G: "#4949b6",
    H: "#60609f",
    I: "#ecec13",
    L: "#b2b24d",
    K: "#4747b8",
    M: "#82827d",
    F: "#c2c23d",
    P: "#2323dc",
    S: "#4949b6",
    T: "#9d9d62",
    W: "#c0c03f",
    Y: "#d3d32c",
    V: "#ffff00",
    B: "#4343bc",
    X: "#797986",
    Z: "#4747b8",
    "-": "rgb(200,200,200)",
    "\\": "rgb(200,200,200)"
}
export const TAYLOR_COLOR = {
    A: "#ccff00",
    R: "#0000ff",
    N: "#cc00ff",
    D: "#ff0000",
    C: "#ffff00",
    Q: "#ff00cc",
    E: "#ff0066",
    G: "#ff9900",
    H: "#0066ff",
    I: "#66ff00",
    L: "#33ff00",
    K: "#6600ff",
    M: "#00ff00",
    F: "#00ff66",
    P: "#ffcc00",
    S: "#ff3300",
    T: "#ff6600",
    W: "#00ccff",
    Y: "#00ffcc",
    V: "#99ff00",
    B: "#fff",
    X: "#fff",
    Z: "#fff",
    "-": "rgb(200,200,200)",
    "\\": "rgb(200,200,200)"
}

const hsvToRgb = (H, S, V) => {
    // https://qiita.com/hachisukansw/items/633d1bf6baf008e82847
    var C = V * S;
    var Hp = H / 60;
    var X = C * (1 - Math.abs(Hp % 2 - 1));

    var R, G, B;
    if (0 <= Hp && Hp < 1) {
        [R, G, B] = [C, X, 0]
    } else if (1 <= Hp && Hp < 2) {
        [R, G, B] = [X, C, 0]
    } else if (2 <= Hp && Hp < 3) {
        [R, G, B] = [0, C, X]
    } else if (3 <= Hp && Hp < 4) {
        [R, G, B] = [0, X, C]
    } else if (4 <= Hp && Hp < 5) {
        [R, G, B] = [X, 0, C]
    } else if (5 <= Hp && Hp < 6) {
        [R, G, B] = [C, 0, X]
    }

    var m = V - C;
    [R, G, B] = [R + m, G + m, B + m];

    R = Math.floor(R * 255);
    G = Math.floor(G * 255);
    B = Math.floor(B * 255);
    return [R, G, B];
}

const COLER_ARR = []
for (let k = 1; k >= 0.5; k -= 0.1) {
    for (let j = 1; j >= 0.5; j -= 0.25) {
        for (let i = 0; i < 360; i++) {
            COLER_ARR.push("rgb(" + hsvToRgb(i, j, k).join(",") + ")");
        }
    }
}

const getColorPallet = (i) => {
    return COLER_ARR[i * 12]
}

export const getColors = (i, stepSize) => {
    return COLER_ARR[i * stepSize]
}

const PROTEIN_COL_V1 = {}

PROTEIN_COL_V1["A"] = getColorPallet(0);
PROTEIN_COL_V1["B"] = getColorPallet(1);
PROTEIN_COL_V1["C"] = getColorPallet(2);
PROTEIN_COL_V1["D"] = getColorPallet(3);
PROTEIN_COL_V1["E"] = getColorPallet(4);
PROTEIN_COL_V1["F"] = getColorPallet(5);
PROTEIN_COL_V1["G"] = getColorPallet(6);
PROTEIN_COL_V1["H"] = getColorPallet(7);
PROTEIN_COL_V1["I"] = getColorPallet(8);
PROTEIN_COL_V1["J"] = getColorPallet(9);
PROTEIN_COL_V1["K"] = getColorPallet(10);
PROTEIN_COL_V1["L"] = getColorPallet(11);
PROTEIN_COL_V1["M"] = getColorPallet(12);
PROTEIN_COL_V1["N"] = getColorPallet(13);
PROTEIN_COL_V1["O"] = getColorPallet(14);
PROTEIN_COL_V1["P"] = getColorPallet(15);
PROTEIN_COL_V1["Q"] = getColorPallet(16);
PROTEIN_COL_V1["R"] = getColorPallet(17);
PROTEIN_COL_V1["S"] = getColorPallet(18);
PROTEIN_COL_V1["T"] = getColorPallet(19);
PROTEIN_COL_V1["U"] = getColorPallet(20);
PROTEIN_COL_V1["V"] = getColorPallet(21);
PROTEIN_COL_V1["W"] = getColorPallet(22);
PROTEIN_COL_V1["X"] = getColorPallet(23);
PROTEIN_COL_V1["Y"] = getColorPallet(24);
PROTEIN_COL_V1["Z"] = getColorPallet(25);
PROTEIN_COL_V1["-"] = "rgb(200,200,200)";

export {
    PROTEIN_COL_V1,
    COLER_ARR
}