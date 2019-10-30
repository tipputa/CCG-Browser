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