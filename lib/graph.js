var Hoek = require('hoek');
var Traversal = require('./traversal');

var internals = {};

internals.schema = {

}

exports = module.exports = internals.Graph = function (definition) {

    definition = internals.normalizeDefinition(definition);

    this._vertices = {};
    this._edges = {};
};

internals.Graph.prototype.getVertex = function (u) {

};

internals.Graph.prototype.getVertices = function (labels) {

};

internals.Graph.prototype.addVertex = function (u) {

};

internals.Graph.prototype.removeVertex = function (u) {

};

internals.Graph.prototype.removeVertices = function (labels) {

};

internals.Graph.prototype.getEdge = function (u, v) {

};

internals.Graph.prototype.addEdge = function (u, v, labels) {

};

internals.Graph.prototype.removeEdge = function (u, v) {

};

internals.Graph.prototype.removeEdges = function (labels) {

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

internals.Graph.prototype.traverse = function (starting) {

    var traversal = new Traversal(this);

    if (starting) {
      traversal.hop(starting);
    }

    return traversal;
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

    var vertex;
    var vid;
    var vids = Object.keys(normalized.vertices);
    for (var i = 0; i < vids.length; i++) {

        vid = vids[i];
        vertex = normalized.vertices[vid];

        if (Array.isArray(vertex)) {
            vertex = { to: vertex };
        }

        vertex = {
            labels: [].concat(vertex.labels || []),
            to: [].concat(vertex.to || []),
            from: [].concat(vertex.from || [])
        };

        normalized.vertices[vid] = vertex;
    }

    // ['a', 'b'] -> { edge: ['a', 'b'] }

    var edge;
    for (var j = 0; j < normalized.edges.length; j++) {

        edge = normalized.edges[j];

        if (Array.isArray(edge)) {
            vertex = { edge: edge };
        }

        edge = {
            labels: [].concat(edge.labels || []),
            weight: (edge.weight || edge.weight === 0) ? edge.weight : 1,
            edge: [].concat(edge.edge)
        };

        normalized.edges[j] = edge;
    }

    return normalized;
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
        labels: ['subgroup']
        to: ['b', 'c', 'd'],
        from: ['d', 'e', 'f']
      },
      b: {
        labels: 'red'
      }
    },
    edges: [
      ['a', 'b'],
      { labels: 'blue', weight: 1, edge: ['b', 'c'] }
    ]
  }
}
*/
