import * as col from "../utils/color"
const size = {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
}

const font = {
    fontSize: 13
}

export const options = {
    id: "def",
    setSize: false,
    height: 600,
    width: 600,
    seqHeight: 25,
    isGrouping: true,
    colorScheme: col.TAYLOR_COLOR,
    header: {
        ...size,
        ...font,
        height: 100,
        top: 10,
        enable: true,
    },
    seqLogo: {
        enable: true,
    },
    nonGapRate: {
        enable: true,
        left: 10,
        top: 10,
        bottom: 0,
        baseColor: "rgb(120,120,120)",
        highColor: "rgb(30, 30, 250)",
        th: 1,
    },
    label: {
        ...size,
        ...font,
        fontSize: 13,
        left: 10,
        top: 0,
        width: 300
    },
    sequence: {
        ...size,
        ...font,
        fontSize: 12,
        left: 10,
        right: 10,
        top: 0,
        width: 480,
        topMargin: 0,
        bottomMargin: 0
    },
    scaleBar: {
        ...font,
        fontSize: 13,
        height: 40,
        enable: true,
    }
}