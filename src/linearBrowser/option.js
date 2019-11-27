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
    seqHeight: 40, // cdsHeight * 2 + genomeHeight + marginY
    margin: 4,
    label: {
        top: 10,
        left: 20,
        width: 200,
    },
    sequence: {
        fontSize: 10,
        top: 10,
        left: 20,
        right: 20,
        marginY: 1,
        cdsHeight: 10,
        genomeHeight: 15
    },
    tooltip: {
        height: 75,
    },
    zoom: {
        xs: 2,
        sm: 10,
        md: 50,
        lg: 500,
        xl: 5000,
    }
}

const color = {
    colorScheme: col.TAYLOR_COLOR,
}