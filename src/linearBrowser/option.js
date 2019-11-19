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
    elementId: "def",
    setSize: false,
    height: 600,
    width: 600,
    seqHeight: 32, // cdsHeight * 2 + genomeHeight + marginY
    margin: 4,
    label: {
        top: 10,
        left: 20,
        width: 200,
    },
    sequence: {
        top: 10,
        left: 20,
        right: 20,
        marginY: 2,
        cdsHeight: 10,
        genomeHeight: 10
    },
    tooltip: {
        height: 75,
    }
}

const color = {
    colorScheme: col.TAYLOR_COLOR,
}