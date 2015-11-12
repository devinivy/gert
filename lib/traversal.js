var Hoek = require('hoek');
var EventEmitter = require('events').EventEmitter;
var Utilities = require('./utilities');

var internals = {};

exports = module.exports = internals.Traversal = function (graph) {

    this.graph = graph;
    this.sequence = [];
    this.distance = 0;
    this.recording = false;

    this._records = [];
    this._currentVertex = null;
    this._visited = {};
    this._edges = {};

    EventEmitter.call(this);
};

Hoek.inherits(internals.Traversal, EventEmitter);


internals.Traversal.prototype.hop = function (v) {

    Hoek.assert(this.graph.vertexExists(v), 'Vertex [', v, '] does not exist.');

    if (this.recording) {
        this._records.push({ act: 'hop', args: [v] });
    }

    var prevCurrent = this._currentVertex;
    this._visit(v);
    this.emit('hop', v, prevCurrent);

    return this;
};

internals.Traversal.prototype.walk = function (v) {

    Hoek.assert(this._currentVertex !== null, 'Not currently on a vertex.');

    var edge = this.graph.getEdge(this._currentVertex, v);
    Hoek.assert(edge, 'Edge [', this._currentVertex, ']-->[', v, '] does not exist.');

    this.distance += edge.weight;
    this._rememberEdge(this._currentVertex, v);

    if (this.recording) {
        this._records.push({ act: 'walk', args: [v] });
    }

    var prevCurrent = this._currentVertex;
    this._visit(v);
    this.emit('walk', v, prevCurrent);

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

internals.Traversal.prototype.visitedVertices = function () {

    return Object.keys(this._visited);
};

internals.Traversal.prototype.subgraph = function () {

    var subset = {
        vertices: Object.keys(this._visited),
        edges: Utilities.pairsObjToArray(this._edges)
    };

    return this.graph.subgraph(subset);
};

internals.Traversal.prototype.record = function () {

    this.recording = true;

    return this;
};

internals.Traversal.prototype.stop = function () {

    this.recording = false;

    return this;
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
    this.emit('visit', v);
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
