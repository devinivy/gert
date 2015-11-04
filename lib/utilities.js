exports.traversePairsObj = function (pairsObj, step) {

    var u;
    var us = Object.keys(pairsObj);
    for (var i = 0; i < us.length; i++) {

        u = us[i];

        var v;
        var vs = Object.keys(pairsObj[u]);
        for (var j = 0; j < vs.length; j++) {
            v = vs[j];
            step(u, v);
        }
    }
};

// { a: { b: true, c: true } } -> [ [a, b], [a, c] ]
exports.pairsObjToArray = function (obj) {

    var pairs = [];

    exports.traversePairsObj(obj, function (u, v) {

        pairs.push([u, v]);
    });

    return pairs;
};

// { a: { b: true }, b: { a: true } } -> { a: { b: true } }
exports.halvePairsObj = function (obj) {

    var halved = {};

    exports.traversePairsObj(obj, function (u, v) {

        if (!halved[v] || !halved[v][u]) {
            halved[u] = halved[u] || {};
            halved[u][v] = obj[u][v];
        }
    });

    return halved;
};
