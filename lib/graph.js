var Hoek = require('hoek');
var Traversal = require('./traversal');

var internals = {};

internals.schema = {

}

exports = module.exports = internals.Graph = function (definition) {

    definition = internals.normalizeDefinition(definition);

    this.digraph = definition.digraph;

    this._vertices = {};
    this._vertexLabels = {};
    this._edges = {};
    this._edgeLabels = {};

    var vertexDefn;
    var vid;
    var vids = Object.keys(definition.vertices);
    for (var i = 0; i < vids.length; i++) {

        vid = vids[i];
        vertexDefn = definition.vertices[vid];

        this._setVertex(vid, {
            labels: vertexDefn.labels,
            data: vertexDefn.data
        });

        var toVid;
        for (var j = 0; j < vertexDefn.to.length; j++) {

            toVid = vertexDefn.to[j];

            if (!this._vertices[toVid]) {
                this.addVertex(toVid);
            }

            this.addEdge(vid, toVid);
        }

        var fromVid;
        for (var k = 0; k < vertexDefn.from.length; k++) {

            fromVid = vertexDefn.from[k];

            if (!this._vertices[fromVid]) {
                this.addVertex(fromVid);
            }

            this.addEdge(fromVid, vid);
        }

    }

    var from;
    var to;
    var edgeDefn;
    for (var l = 0; l < definition.edges.length; l++) {

        edgeDefn = definition.edges[l];

        from = edgeDefn.edge[0];
        to = edgeDefn.edge[1];

        if (!this._vertices[from]) {
            this.addVertex(from);
        }

        if (!this._vertices[to]) {
            this.addVertex(to);
        }

        this.addEdge(from, to, {
            labels: edgeDefn.labels,
            weight: edgeDefn.weight
        });

    }

};

internals.Graph.prototype.getVertex = function (v) {

    return this._vertices[v] || null;
};

internals.Graph.prototype.getVertices = function (labels) {

    labels = [].concat(labels);

    var accumulated = {};

    for (var i = 0; i < labels.length; i++) {
        Hoek.merge(accumulated, this._vertexLabels[label[i]] || {});
    }

    return Object.keys(accumulated);
};

internals.Graph.prototype.addVertex = function (v, info) {

    Hoek.assert(!this._vertices[v], 'Vertex [', v, '] already exists.');

    info = info || {};

    this._setVertex(v, {
        labels: [].concat(info.labels || []),
        data: info.data
    });

    return this;
};

internals.Graph.prototype.removeVertex = function (v) {

    Hoek.assert(this._vertices[v], 'Vertex [', v, '] does not exist.');

    var vertex = this._vertices[v];

    var toEdges = Object.keys(vertex.to);
    for (var i = 0; i < toEdges.length; i++) {
        this.removeEdge(v, toEdges[i]);
    }

    if (this.digraph) {
        var fromEdges = Object.keys(vertex.from);
        for (var j = 0; j < fromEdges.length; j++) {
            this.removeEdge(fromEdges[j], v);
        }
    }

    this._unlabelVertex(v, vertex.labels);

    delete this._vertices[v];
    delete this._edges[v];

    return this;
};

internals.Graph.prototype.removeVertices = function (vertices /* or a label */) {

    if (!Array.isArray(vertices)) {
        vertices = Object.keys(this._vertexLabels[vertices] || {});
    }

    for (var i = 0; i < vertices.length; i++) {
        this.removeVertex(vertices[i]);
    }

    return this;
};

internals.Graph.prototype.getEdge = function (u, v) {

    return (this._edges[u] && this._edges[u][v]) || null;
};

internals.Graph.prototype.addEdge = function (u, v, info) {

    Hoek.assert(this._vertices[u], 'Vertex [', u, '] doesn\'t exist.');
    Hoek.assert(this._vertices[v], 'Vertex [', v, '] doesn\'t exist.');
    Hoek.assert(!this._edges[u] || !this._edges[u][v], 'Edge [', u, ']->[', v, '] already exists.');

    info = info || {};

    info = {
        labels: [].concat(info.labels || []),
        weight: (info.weight || info.weight === 0) ? info.weight : 1
    };

    this._setEdge(u, v, info);

    if (!this.digraph) {
        this._setEdge(v, u, info);
    }

    return this;
};

internals.Graph.prototype.removeEdge = function (u, v) {

    Hoek.assert(this._edges[u] && this._edges[u][v], 'Edge [', u, ']-->[', v, '] does not exist.');

    this._unsetEdge(u, v);

    if (!this.digraph) {
        this._unsetEdge(v, u);
    }

    return this;
};

internals.Graph.prototype.removeEdges = function (label) {

};

internals.Graph.prototype.distance = function (u, v) {

};

internals.Graph.prototype.snapshot = function () {

};

internals.Graph.prototype.equals = function (graph) {

};

internals.Graph.prototype.subgraph = function (subset) {

    var definition = {};

    /* ... */

    return new internals.Graph(definition);
};

internals.Graph.prototype.complement = function (subgraph) {

};

internals.Graph.prototype.transpose = function () {

};

internals.Graph.prototype.union = function (graph) {

};

internals.Graph.prototype.intersection = function (graph) {

};

internals.Graph.prototype.join = function (graph) {

};

internals.Graph.prototype.traverse = function (starting) {

    var traversal = new Traversal(this);

    if (starting) {
      traversal.hop(starting);
    }

    return traversal;
};

internals.Graph.prototype._labelVertex = function (v, labels) {

    var label;
    for (var i = 0; i < labels.length; i++) {
        label = labels[i];
        this._vertexLabels[label] = this._vertexLabels[label] || {};
        this._vertexLabels[label][v] = true;
    }
};

internals.Graph.prototype._unlabelVertex = function (v, labels) {

    var label;
    for (var i = 0; i < labels.length; i++) {
        label = labels[i];
        if (this._vertexLabels[label]) {
            delete this._vertexLabels[label][v];
        }
    }
};

internals.Graph.prototype._labelEdge = function (u, v, labels) {

    var label;
    for (var i = 0; i < labels.length; i++) {
        label = labels[i];
        this._edgeLabels[label] = this._edgeLabels[label] || {};
        this._edgeLabels[label][u] = this._edgeLabels[label][u] || {};
        this._edgeLabels[label][u][v] = true;
    }
};

internals.Graph.prototype._unlabelEdge = function (u, v, labels) {

    var label;
    for (var i = 0; i < labels.length; i++) {
        label = labels[i];
        if (this._edgeLabels[label] && this._edgeLabels[label][u]) {
            delete this._edgeLabels[label][u][v];
        }
    }
};

internals.Graph.prototype._setVertex = function (v, info) {

    if (!this._vertices[v]) {

        this._vertices[v] = internals.newVertex();

        if (this.digraph) {
            this._vertices[v].indegree = 0;
            this._vertices[v].outdegree = 0;
            delete this._vertices[v].degree;
        } else {
            this._vertices[v].degree = 0;
            delete this._vertices[v].indegree;
            delete this._vertices[v].outdegree;
        }
    }

    var oldLabels = this._vertices[v].labels;
    var newLabels = info.labels;

    this._vertices[v].labels = info.labels;
    this._vertices[v].data = info.data;

    this._unlabelVertex(v, oldLabels);
    this._labelVertex(v, newLabels);
};

internals.Graph.prototype._setEdge = function(u, v, info) {

    if (!this._edges[u] || !this._edges[u][v]) {
        this._edges[u] = this._edges[u] || {};
        this._edges[u][v] = internals.newEdge();
    }

    var edge = this._edges[u][v];

    var oldLabels = edge.labels;
    var newLabels = info.labels;

    edge.labels = info.labels;
    edge.weight = info.weight;

    this._unlabelEdge(u, v, oldLabels);
    this._labelEdge(u, v, newLabels);

    this._vertices[u].to[v] = true;
    this._vertices[v].from[u] = true;

    if (this.digraph) {
        this._vertices[u].outdegree++;
        this._vertices[v].indegree++;
    } else {
        this._vertices[u].degree++;
    }
};

internals.Graph.prototype._unsetEdge  = function (u, v) {

    this._unlabelEdge(u, v, this._edges[u][v].labels);

    delete this._edges[u][v];

    delete this._vertices[u].to[v]
    delete this._vertices[v].from[u]

    if (this.digraph) {
        this._vertices[u].outdegree--;
        this._vertices[v].indegree--;
    } else {
        this._vertices[u].degree--;
    }
};

internals.normalizeDefinition = function (definition) {

    definition = definition || {};

    var normalized = {};
    normalized.digraph = !!definition.digraph;
    normalized.vertices = definition.vertices || {};
    normalized.edges = definition.edges || [];

    // ['a', 'b'] -> { a: {}, b: {} }

    if (Array.isArray(normalized.vertices)) {
        normalized.vertices = normalized.vertices.reduce(function (reduced, value) {

            reduced[value] = {};
        }, {});
    }

    // { a: ['b', 'c'] } -> { a: { to: ['b', 'c'] } }

    var newVertex;
    var vertex;
    var vid;
    var vids = Object.keys(normalized.vertices);
    for (var i = 0; i < vids.length; i++) {

        vid = vids[i];
        vertex = normalized.vertices[vid];

        if (Array.isArray(vertex)) {
            vertex = { to: vertex };
        }

        newVertex = {};

        newVertex.labels = [].concat(vertex.labels || []);
        newVertex.to = [].concat(vertex.to || []);
        newVertex.from = [].concat(vertex.from || []);
        newVertex.data = vertex.data;

        normalized.vertices[vid] = newVertex;
    }

    // ['a', 'b'] -> { edge: ['a', 'b'] }

    var newEdge;
    var edge;
    for (var j = 0; j < normalized.edges.length; j++) {

        edge = normalized.edges[j];

        if (Array.isArray(edge)) {
            edge = { edge: edge };
        }

        newEdge = {};

        newEdge.labels = [].concat(edge.labels || []);
        newEdge.weight = edge.weight;
        newEdge.edge = [].concat(edge.edge);

        normalized.edges[j] = newEdge;
    }

    return normalized;
};

internals.newVertex = function () {

  return {
      labels: [],
      to: {},
      from: {},
      data: undefined,
      degree: undefined,    // non-digraph
      indegree: undefined,  // digraph
      outdegree: undefined  // digraph
  };
};

internals.newEdge = function () {

  return {
      labels: [],
      weight: undefined,
      edge: undefined
  };
};

/* Subgraph definition

  // Either an array of vertices, all edges among them will be included
  ['a', 'c']

  // Or vertices and edges specified– labels will carry-over
  {
    vertices: ['a', 'c', 'd'],
    edges: [['a', 'c'], ['d', 'a']]
  }

*/

/* Graph definition
    {
      digraph: false,
      vertices: {
        a: {
              labels: ['subgroup'],
              to: ['b', 'c'],
              from: ['d', 'e'],
              data: {}
        },
        b: {
            labels: 'red'
        },
        g: {}
      },
      edges: [
            ['a', 'f'],
            { labels: 'blue', weight: 2, edge: ['b', 'c'] }
      ]
    }
*/
