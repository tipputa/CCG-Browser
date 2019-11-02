import {
    each
} from "./myUnderscore"

const seqGroup = function (behavior, numSeq) {
    return function (obj, iteratee, context) {
        var result = partition ? [
            [],
            []
        ] : {};
        iteratee = optimizeCb(iteratee, context);
        each(obj, function (value, index) {
            var key = iteratee(value, index, obj);
            behavior(result, value, key);
        });
        return result;
    };
}


export const seqStat = (seqs) => {
    const results = [];
    const init = (len) => {
        for (let i = 0; i < len; i++) {
            results.push({});
        }
    }
    const others = (seq) => {
        const seqArr = seq.split("");
        each(seqArr, (val, i) => {
            if (val in results[i]) results[i][val]++;
            else results[i][val] = 1;
        });
    }

    init(seqs[0].seq.length);
    each(seqs, (val) => {
        others(val.seq);
    });

    return results
}

export const isConservedRegoin = (seqArr) => {
    const conserved = []
    each(seqArr, (val) => {
        if (val.hasOwnProperty("-")) {
            conserved.push(false);
        } else {
            conserved.push(true);
        }
    });
    return conserved;
}

export const conservedRegionLength = (seqArr) => {
    let counter = 0;
    each(seqArr, (val) => {
        if (!val.hasOwnProperty("-")) {
            counter++;
        }
    });
    return counter;
}

export const calcGapRate = (seqArr, numSeq) => {
    let res = [];
    each(seqArr, (val) => {
        if (val.hasOwnProperty("-")) {
            res.push(val["-"] / numSeq);
        } else res.push(0);
    });
    return res;
}

export const calcShannonEntropy = (seqArr, numSeq) => {
    const results = [];
    each(seqArr, (seqs) => {
        const res = {}
        let s = 0;
        each(seqs, (val, key) => {
            const v = -1 * val / numSeq * Math.log2(val / numSeq);
            res[key] = v;
            s += v;
        })
        res["Entropy"] = Math.log2(22) - s;
        each(res, (val, key) => {
            if (key !== "Entropy") {
                res[key] = res["Entropy"] * seqs[key] / numSeq;
            }
        });
        results.push(res);
    });
    return results;
}
/**
 * return {sum: totalHeight, res: {name: letter, value: letterHeight}}
 * @param {*} entropyArr 
 */
export const filterAndSortEntroy = (entropyArr) => {
    const res = [];
    const buf = {}
    let s = 0;
    each(entropyArr, (val, key) => {
        if (val > 0.1 && key !== "Entropy") {
            res.push({
                name: key,
                value: val
            });
            s += val;
        }
    });
    res.sort((a, b) => {
        return b.value - a.value;
    })
    buf["sum"] = s;
    buf["res"] = res;
    return buf;
}

export const getTrueArr = (resourceArr, booleanArr) => {
    const res = [];
    if (resourceArr.length !== booleanArr.length) {
        console.log("not match: " + resourceArr.length + " " + booleanArr.length);
        return res;
    }
    each(resourceArr, (val, i) => {
        if (booleanArr[i]) res.push(val);
    });
    return res;
}

export const getAllSequenceAsFasta = (sequenceObj) => {
    const ret = [];
    each(sequenceObj, (val) => {
        ret.push(">" + val.name);
        ret.push(val.seq);
    })
    const result = ret.join("\n");
    return result;
}

export const getConservedRegionAsFasta = (sequenceObj, booleanArr) => {
    const ret = [];
    each(sequenceObj, (val) => {
        const seqArr = getTrueArr(val.seq.split(""), booleanArr);
        ret.push(">" + val.name);
        ret.push(seqArr.join(""));
    })
    const result = ret.join("\n");
    return result;
}