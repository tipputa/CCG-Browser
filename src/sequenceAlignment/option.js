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
    seqHeight: 12,
    isGrouping: true,
    header: {
        ...size,
        ...font,
        height: 50
    },
    label: {
        ...size,
        ...font,
        fontSize: 9,
        left: 10,
        top: 0,
        width: 200
    },
    sequence: {
        ...size,
        ...font,
        fontSize: 9,
        left: 10,
        top: 3,
        width: 480,
        topMargin: 0,
        bottomMargin: 0
    }
}