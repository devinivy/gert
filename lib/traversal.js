var Hoek = require('hoek');
var Formatting = require('./formatting');

var internals = {};

exports = module.exports = internals.Traversal = function (graph) {

    this.graph = graph;
    this.sequence = [];
    this.distance = 0;

    this._records = [];
    this._currentVertex = null;
    this._visited = {};
    this._edges = {};
};

internals.Traversal.prototype.hop = function (v) {

    Hoek.assert(this.graph.vertexExists(v), 'Vertex [', v, '] does not exist.');

    this._records.push({ act: 'hop', args: [v] });
    this._visit(v);

    return this;
};

internals.Traversal.prototype.walk = function (v) {

    Hoek.assert(this._currentVertex !== null, 'Not currently on a vertex.');

    var edge = this.graph.getEdge(this._currentVertex, v);
    Hoek.assert(edge, 'Edge [', this._currentVertex, ']-->[', v, '] does not exist.');

    this.distance += edge.weight;
    this._records.push({ act: 'walk', args: [v] });
    this._rememberEdge(this._currentVertex, v);
    this._visit(v);

    return this;
};

internals.Traversal.prototype.currentVertex = function () {

    if (this._currentVertex === null) {
        return null;
    }

    return this.graph.getVertex(this._currentVertex);
};

internals.Traversal.prototype.visits = function (v) {

    Hoek.assert(this.graph.vertexExists(v), 'Vertex [', v, '] does not exist.');

    return (this._visited[v] || 0);
};

internals.Traversal.prototype.subgraph = function () {

    var subset = {
        vertices: Object.keys(this._visited),
        edges: Formatting.pairsObjToArray(this._edges)
    };

    return this.graph.subgraph(subset);
};

internals.Traversal.prototype.play = function (graph) {

    graph = graph || this.graph;

    var traversal = new internals.Traversal(graph);

    var record;
    for (var i = 0; i < this._records.length; i++) {
        record = this._records[i];
        traversal[record.act].apply(traversal, record.args);
    }

    return traversal;
};

internals.Traversal.prototype._visit = function (v) {

    this.sequence.push(v);
    this._currentVertex = v;
    this._visited[v] = (this._visited[v] || 0) + 1;
};

internals.Traversal.prototype._rememberEdge = function (u, v) {

    var a;
    var b;

    if (!this.graph.directed && !this._edges[u]) {
        a = v;
        b = u;
    } else {
        a = u;
        b = v;
    }

    this._edges[a] = this._edges[a] || {};
    this._edges[a][b] = true;
};
