// { a: { b: true, c: true } } -> [ [a, b], [a, c] ]
exports.pairsObjToArray = function (obj) {

    var pairs = [];

    var u;
    var us = Object.keys(obj);
    for (var i = 0; i < us.length; i++) {

        u = us[i];

        var v;
        var vs = Object.keys(obj[u]);
        for (var j = 0; j < vs.length; j++) {
            v = vs[j];
            pairs.push([u, v]);
        }
    }

    return pairs;
};

// { a: { b: true }, b: { a: true } } -> { a: { b: true } }
exports.halvePairsObj = function (obj) {

    var halved = {};

    var u;
    var us = Object.keys(obj);
    for (var i = 0; i < us.length; i++) {

        u = us[i];

        var v;
        var vs = Object.keys(obj[u]);
        for (var j = 0; j < vs.length; j++) {
            v = vs[j];
            if (!halved[v] || !halved[v][u]) {
                halved[u] = halved[u] || {};
                halved[u][v] = obj[u][v];
            }
        }
    }

    return halved;
};
