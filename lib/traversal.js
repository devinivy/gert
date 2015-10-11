var Hoek = require('hoek');

var internals = {};

exports = module.exports = internals.Traversal = function (graph) {

    this.graph = graph;
    this.sequence = [];
    this.distance = 0;

    this._records = [];
    this._currentVertex = null;
    this._visited = {};
    this._edges = [];
};

internals.Traversal.prototype.hop = function (u) {

    Hoek.assert(this.graph.getVertex(u), 'Vertex', u, 'does not exist.');

    this._records.push({ act: 'hop', args: [u] });
    this._visit(u);
};

internals.Traversal.prototype.walk = function (u) {

    Hoek.assert(this._currentVertex !== null, 'Not currently on a vertex.');

    var edge = this.graph.hasEdge(this._currentVertex, u);
    Hoek.assert(edge, 'Edge', this._currentVertex, 'to', u, 'does not exist.');

    this.distance += edge.weight;
    this._records.push({ act: 'walk', args: [u] });
    this._edges.push([this._currentVertex, u]);
    this._visit(u);
};

internals.Traversal.prototype.currentVertex = function () {

    if (this._currentVertex === null) {
        return null;
    }

    return this.graph.getVertex(this._currentVertex);
};

internals.Traversal.prototype.visits = function (u) {

    Hoek.assert(this.graph.getVertex(u), 'Vertex', u, 'does not exist.');

    return (this._visited[u] || 0);
};

internals.Traversal.prototype.subgraph = function () {

    var subset = {
        vertices: Object.keys(this._visited),
        edges: this._edges
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

internals.Traversal.prototype._visit = function (u) {

    this.sequence.push(u);
    this._currentVertex = u;
    this._visited[u] = (this._visited[u] || 0) + 1;
};
