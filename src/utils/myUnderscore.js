// almost same functions as underscore.js
// ref: https: //underscorejs.org/docs/underscore.html

const ObjProto = Object.prototype,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

const has = function (obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
}


const nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeCreate = Object.create;

const shallowProperty = function (key) {
    return function (obj) {
        return obj == null ? void 0 : obj[key];
    };
};

const MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
const getLength = shallowProperty('length');
const isArrayLike = function (collection) {
    const length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
};

const optimizeCb = function (func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
        case 1:
            return function (value) {
                return func.call(context, value);
            };
        case 3:
            return function (value, index, collection) {
                console.log(context);
                return func.call(context, value, index, collection);
            };
        case 4:
            return function (accumulator, value, index, collection) {
                return func.call(context, accumulator, value, index, collection);
            };
    }
    return function () {
        return func.apply(context, arguments);
    };
};

const isObject = function (obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

const getKeys = function (obj) {
    if (!isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj)
        if (has(obj, key)) keys.push(key);

    return keys;
};


export const each = function (obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
        for (i = 0, length = obj.length; i < length; i++) {
            iteratee(obj[i], i, obj);
        }
    } else {
        const keys = getKeys(obj);
        for (i = 0, length = keys.length; i < length; i++) {
            iteratee(obj[keys[i]], keys[i], obj);
        }
    }
    return obj;
};

const group = function (behavior, partition) {
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
};

export const groupBy = group(function (result, value, key) {
    if (has(result, key)) result[key].push(value);
    else result[key] = [value];

});

export const countBy = group(function (result, value, key) {
    if (has(result, key)) result[key]++;
    else result[key] = 1;
});

export const indexBy = group(function (result, value, key) {
    result[key] = value;
});