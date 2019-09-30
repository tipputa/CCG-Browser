// color
let AngleColer = []
for (let k = 1; k >= 0.5; k -= 0.1) {
    for (let j = 1; j >= 0.5; j -= 0.25) {
        for (let i = 0; i < 360; i++) {
            AngleColer.push("rgb(" + hsvToRgb(i, j, k).join(",") + ")");
        }
    }
}
console.log(AngleColer)

function getColorPallet(i) {
    return AngleColer[i * 12]
}

function hsvToRgb(H, S, V) {
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