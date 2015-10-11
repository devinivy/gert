var Hoek = require('hoek');
var Traversal = require('./traversal');

var internals = {};

exports = module.exports = internals.Graph = function (definition) {

    this.digraph = !!definition.digraph;
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
        to: [{ vertex: 'b', labels: 'red' }, 'c', 'd'],
        from: ['d', 'e', 'f']
      }
    },
    edges: [
      ['a', 'b'],
      { labels: 'blue', weight: 1, edge: ['b', 'c'] }
    ]
  }
}
*/
