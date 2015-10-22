# gert

A graph library intended to delight you, Gert, and Arthur.

[![Build Status](https://travis-ci.org/devinivy/gert.svg?branch=master)](https://travis-ci.org/devinivy/gert) [![Coverage Status](https://coveralls.io/repos/devinivy/gert/badge.svg?branch=master&service=github)](https://coveralls.io/github/devinivy/gert?branch=master)

## Usage

## API

### `Gert.Graph`
The `Gert.Graph` object is the container for a graph consisting of vertices and edges, both of which can be tagged using a labeling system.  The edges may be directed or undirected, weighted or unweighted.

#### `new Graph(definition)`
Creates a new `Graph` object. Creates a null, directed graph when `definition` is not specified.  The `definition` is an object used to initialize the graph and contains the following information,
 - `digraph` - if `false` indicates that the graph's edges are undirected rather than directed.  Defaults to `true`.
 - `vertices` - specifies the graph's vertices in one of two formats,
  - an array of vertex ids (string or numeric) or,
  - an object whose keys are vertex ids and whose values are objects of the form,
    - `labels` - a label (string or numeric) or array of labels to place on this vertex.
    - `data` - free-form data associated with this vertex.
    - `to` - a vertex id or array of vertex ids to which edges should be created from this vertex.
    - `from` - a vertex id or array of vertex ids from which edges should be created to this vertex.
    - `neighbors` - a vertex id or array of vertex ids that should neighbor this vertex (it cannot include the id of this vertex).  Edges will be created between this vertex and the vertices specified.  Only for use in non-directed graphs (`definition.digraph = false`).

- `edges` - an array of edge definitions, each edge specified in one of two formats,
  - an edge-pair formed as an array of two vertex ids or,
  - an object of the form,
    - `pair` - an edge-pair formed as an array of two vertex ids (required).
    - `labels` - a label (string or numeric) or array of labels to place on the edge.
    - `weight` - a numeric weight to place on the edge.  Can be positive, negative, or zero.  Defaults to `1`.

Any vertex ids that are only specified only in `to`, `from`, `neighbors` fields, or an edge `pair` will cause those vertices to be created in the graph without any `labels` or `data`.  The same edge may not be specified in a graph definition twice.  For example, the following definition is invalid because the edge between `a` and `b` is specified twice,
```js
// Invalid
var graph = new Graph({
  vertices: {
    a: { to: ['b'] },
    b: { from: ['a'] }
  }
});
```

#### `graph.digraph`
Indicates if the graph's edges are directed.  Should be considered read-only.

#### `graph.vertexExists(v)`
Returns `true` if a vertex with id `v` exists in the graph, and `false` otherwise.

#### `graph.getVertex(v)`
Returns vertex `v` in an object of the following format,
 - `id` - the vertex's id.
 - `labels` - an array of labels associated with the vertex.
 - `data` - any free-form data associated with the vertex.
 - `to` - an array of vertex ids to which there are outgoing edges from the vertex.
 - `from` - an array of vertex ids from which there are incoming edges to the vertex.
 - `neighbors` - an array of vertex ids of neighboring vertices.  This vertex property only appears in undirected graphs.
 - `outdegree` - the number of outgoing edges from the vertex.  This vertex property only appears in directed graphs.
 - `indegree` - the number of incoming edges to the vertex.  This vertex property only appears in directed graphs.
 - `degree` - the number of edges incident to the vertex, with self-loops counted twice.  This vertex property only appears in undirected graphs.

 If no such vertex is found, returns `null`.

#### `graph.getVertices(vertexIdsOrLabel)`
Returns an object whose keys are vertex ids and whose values are vertices of the format specified in [`graph.getVertex()`](#graphgetvertexv).  If `vertexIdsOrLabel` is an array of vertex ids, the returned object will contain entries for every such vertex that is found in the graph.  If `vertexIdsOrLabel` is a label, the returned object will contain entries for all vertices that have that label.

#### `graph.addVertex(v, info)`
Adds a new vertex into the graph where,
 - `v` - the vertex's id.
 - `info` - an object containing vertex info of the format,
   - `labels` - a label (string or numeric) or array of labels to place on this vertex.
   - `data` - free-form data associated with this vertex.

#### `graph.removeVertex(v)`
Removes vertex with id `v` from the graph, including any incident edges.

#### `graph.removeVertices(vertexIdsOrLabel)`
Removes a collection of vertices and their incident edges from the graph.  If `vertexIdsOrLabel` is an array of vertex ids, those vertices will be removed.  If `vertexIdsOrLabel` is a label, all vertices with that label will be removed.

#### `graph.edgeExists(u, v)`
Returns `true` if an edge from `u` to `v` exists in the graph, and `false` otherwise.  This method also accepts a single array argument containing the edge-pair (e.g. `[u, v]`).

#### `graph.getEdge(u, v)`
Returns the edge from vertex `u` to vertex `v` in an object of the following format,
 - `pair` - an array of two vertex ids representing the edge-pair.
 - `labels` - an array of labels associated with the edge.
 - `weight` - the edge's weight.

If no such edge is found, returns `null`.  This method also accepts a single array argument containing the edge-pair (e.g. `[u, v]`).  Note that if the graph is undirected, this returns the edge between vertex `u` and vertex `v` irrespective of their order.

#### `graph.getEdges(edgePairsOrLabel)`
Returns an array of edges in the format specified in [`graph.getEdge()`](#graphgetedgeu-v).  If `edgePairsOrLabel` is an array of edge-pairs (each edge-pair an array of two vertex ids), there will be an entry for each such edge-pair that exists in the graph.  If `edgePairsOrLabel` is a label, there will be an entry for each edge that has the specified label.

#### `graph.addEdge(u, v, [info])`
Adds an edge into the graph from vertex `u` to vertex `v` with `info` an optional object of the format,
 - `labels` - a label (string or numeric) or array of labels to place on the edge.
 - `weight` - a numeric weight to place on the edge.  Can be positive, negative, or zero.  Defaults to `1`.

This method also accepts a single array argument containing the edge-pair (e.g. `[u, v]`) in lieu of the first two vertex arguments.

#### `graph.removeEdge(u, v)`
Removes the edge that runs from vertex `u` to vertex `v`.  If the graph is undirected, this simply removes the edge that runs between vertices `u` and `v`.  This method also accepts a single array argument containing the edge-pair (e.g. `[u, v]`).

#### `graph.removeEdges(edgePairsOrLabel)`
Removes a collection of edges from the graph.  If `edgePairsOrLabel` is an array of edge-pairs (each edge-pair an array of two vertex ids), those edges will be removed.  If `edgePairsOrLabel` is a label, all edges with that label will be removed.

#### `graph.snapshot()`
#### `graph.equals(anotherGraph, matchWeights)`
#### `graph.subgraph(subset)`
#### `graph.complement()`
#### `graph.transpose()`
#### `graph.union(anotherGraph)`
#### `graph.intersection(anotherGraph)`
#### `graph.join(anotherGraph, weight, oneWay)`
#### `graph.traverse(startingVertex)`
#### `graph.adjacencyMatrix(weighted)`

### `Gert.Traversal`

#### `new Traversal(graph)`

#### `traversal.graph`
#### `traversal.sequence`
#### `traversal.distance`
#### `traversal.hop(v)`
#### `traversal.walk(v)`
#### `traversal.currentVertex()`
#### `traversal.visits(v)`
#### `traversal.subgraph()`
#### `traversal.play(graph)`
