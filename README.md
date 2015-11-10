# gert

A graph library intended to delight you, Gert, and Arthur.

[![Build Status](https://travis-ci.org/devinivy/gert.svg?branch=master)](https://travis-ci.org/devinivy/gert) [![Coverage Status](https://coveralls.io/repos/devinivy/gert/badge.svg?branch=master&service=github)](https://coveralls.io/github/devinivy/gert?branch=master)

## Usage
Gert is here to help you create and traverse graphs of all shapes and sizes: directed, undirected, simple, self-looping, weighted, negative-weighted, unweighted, labeled, null, large, small, and the like.  For now it just has to be finite, but we're working on that.

Gert's interface aims to be understandable, lean, readable, and useful.  And the terminology used in Gert is consistent with "the literature", so if you're not familiar with what something means, combing the web or a relevant book should be sufficient to elucidate.

A key feature of the library is that edges and vertices may be arbitrarily tagged and retrieved with an efficient labeling system.  If you dig into the API we think you'll find Gert to be quite the flexible little graph maestro.

```js
var Graph = require('gert').Graph;

// [ a ]--1->[ b ]--8->[ c ]
var graph = new Graph({
    directed: true,
    vertices: {
        a: { labels: ['black'] },
        b: { labels: ['black'] }
    },
    edges: [
        ['a', 'b'],
        { pair: ['b', 'c'], weight: 8 }
    ]
});

// [ a ]<-1--[ b ]<-8--[ c ]
var transposed = graph.transpose();
var traversal = transposed.traverse('a');

traversal.hop('c').walk('b').walk('a');

traversal.sequence; // ['a', 'c', 'b', 'a']
traversal.distance; // 9 or (8 + 1)

transposed.equals(traversal.subgraph());  // true
transposed.getVertices('black');        // { a: {...}, b: {...} }
```

## API

### `Gert.Graph`
The `Gert.Graph` object is the container for a graph consisting of vertices and edges, both of which can be tagged using a labeling system.  The edges may be directed or undirected, weighted or unweighted.

#### `new Graph(definition)`
Creates a new `Graph` object. Creates a null, directed graph when `definition` is not specified.  The `definition` is an object used to initialize the graph and contains the following information,
 - `directed` - if `false` indicates that the graph's edges are undirected rather than directed.  Defaults to `true`.
 - `vertices` - specifies the graph's vertices in one of two formats,
  - an array of vertex ids (string or numeric) or,
  - an object whose keys are vertex ids and whose values are objects of the form,
    - `labels` - a label (string or numeric) or array of labels to place on this vertex.
    - `data` - free-form data associated with this vertex.
    - `to` - a vertex id or array of vertex ids to which edges should be created from this vertex.
    - `from` - a vertex id or array of vertex ids from which edges should be created to this vertex.
    - `neighbors` - a vertex id or array of vertex ids that should neighbor this vertex (it cannot include the id of this vertex).  Edges will be created between this vertex and the vertices specified.  Only for use in undirected graphs (`definition.directed = false`).

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

#### `graph.directed`
Indicates whether the graph's edges are directed.  Should be considered read-only.

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

#### `graph.getVertices(vertexIdsOrLabel, [onlyIds])`
Returns an object whose keys are vertex ids and whose values are vertices of the format specified in [`graph.getVertex()`](#graphgetvertexv).  If `onlyIds` is specified as `true`, an array of unique vertex ids is returned instead.  When `vertexIdsOrLabel` is an array of vertex ids, the returned object/array will contain entries for every such vertex that is found in the graph.  If `vertexIdsOrLabel` is a label, the returned object/array will contain entries for all vertices that have that label.

#### `graph.addVertex(v, [info])`
Adds a new vertex into the graph where,
 - `v` - the vertex's id.
 - `info` - an object containing vertex info of the format,
   - `labels` - a label (string or numeric) or array of labels to place on the vertex.
   - `data` - free-form data associated with the vertex.

#### `graph.updateVertex(v, info)`
Updates a vertex's labels and/or data where,
 - `v` - the vertex's id.
 - `info` - an object containing vertex info to be updated of the format,
   - `labels` - a label (string or numeric) or array of labels to set on the vertex, removing all existing labels, or an object of the format,
     - `add` - a label or array of labels to add to the vertex.
     - `remove` - a label or array of labels to remove from the vertex.
   - `data` - free-form data associated with this vertex.

Note that label removals happen before label additions.

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

#### `graph.getEdges(edgePairsOrLabel, [onlyPairs])`
Returns an array of edges in the format specified in [`graph.getEdge()`](#graphgetedgeu-v).  If `onlyPairs` is specified as `true`, each entry is an edge-pair (an array of two vertex ids) rather than a complete edge object.  When `edgePairsOrLabel` is an array of edge-pairs, there will be an entry for each such edge-pair that exists in the graph.  If `edgePairsOrLabel` is a label, there will be an entry for each edge that has the specified label.  The result contains a unique entry per edges; e.g. `graph.getEdges([['a', 'b'], ['a', 'b']])` will contain just one entry for the edge between `a` and `b` if such an edge exists.

#### `graph.addEdge(u, v, [info])`
Adds an edge into the graph from vertex `u` to vertex `v` with `info` an optional object of the format,
 - `labels` - a label (string or numeric) or array of labels to place on the edge.
 - `weight` - a numeric weight to place on the edge.  Can be positive, negative, or zero.  Defaults to `1`.

This method also accepts a single array argument containing the edge-pair (e.g. `[u, v]`) in lieu of the first two vertex arguments.

#### `graph.updateEdge(u, v, info)`
Updates labels and/or weight of the edge from vertex `u` to vertex `v` where `info` is an object of the format,
   - `labels` - a label (string or numeric) or array of labels to set on the edge, removing all existing labels, or an object of the format,
     - `add` - a label or array of labels to add to the edge.
     - `remove` - a label or array of labels to remove from the edge.
   - `weight` - a numeric weight to set on the edge.

This method also accepts a single array argument containing the edge-pair (e.g. `[u, v]`) in lieu of the first two vertex arguments.  Note that label removals happen before label additions.

#### `graph.removeEdge(u, v)`
Removes the edge that runs from vertex `u` to vertex `v`.  If the graph is undirected, this simply removes the edge that runs between vertices `u` and `v`.  This method also accepts a single array argument containing the edge-pair (e.g. `[u, v]`).

#### `graph.removeEdges(edgePairsOrLabel)`
Removes a collection of edges from the graph.  If `edgePairsOrLabel` is an array of edge-pairs (each edge-pair an array of two vertex ids), those edges will be removed.  If `edgePairsOrLabel` is a label, all edges with that label will be removed.

#### `graph.size()`
Returns the number of edges in the graph.

#### `graph.equals(anotherGraph, [matchWeights])`
Returns `true` when `anotherGraph` has the same graph structure and vertex ids, and returns `false` otherwise.  This ignores all labels and vertex data, but takes into account if the graphs are directed or not.  When `matchWeights` is `true`, it will require that edge weights also correspond for the two graphs to be considered equal.

Note that this does not detect graph _isomorphism_ in general– matching vertex ids are used to compare the two graphs (e.g. if the two graphs are equal, vertex `u` in `graph` will necessarily map to vertex `u` in `anotherGraph`).

#### `graph.snapshot()`
Returns a new `Graph` representing a perfect copy `graph`, maintaining labels, edge weights, and data associated with vertices.  Vertex data is copied directly rather than being cloned.

#### `graph.subgraph(subset)`
Returns a new `Graph` representing a subgraph of `graph`, where `subset` is an object of the format,
 - `vertices` - an array of vertex ids to be included in the returned subgraph.
 - `edges` - an array of edge-pairs (each edge-pair an array of two vertex ids) to be included in the returned subgraph.

Labels, data, and edge weights are all preserved in the subgraph.  The subgraph is directed if and only if `graph` is directed.

#### `graph.complement()`
Returns a new `Graph` representing the graph complement of `graph`.  All edges are unlabeled with weight `1`, and all vertices maintain their original labels and data.  Self-loops are preserved.

#### `graph.transpose()`
Returns a new `Graph` representing the graph transpose of `graph`.  Only for use with directed graphs.  All vertices maintain their original labels and data, and each edge inherits the labels and weight of its respective transposed edge from `graph`.

#### `graph.union(anotherGraph)`
Returns a new `Graph` representing the graph union of `graph` and `anotherGraph`.  Vertices with the same id merge into a single vertex with combined labels and copied, deeply merged vertex data.  Similarly, common edges merge into a single edge with combined labels, but weight inherited from the edge in `graph`.  Otherwise, vertex and edge information is inherited from its origin graph.  Both graphs must mutually directed or undirected.

#### `graph.intersection(anotherGraph)`
Returns a new `Graph` representing the graph intersection of `graph` and `anotherGraph`.  Vertex data and edge weight are inherited from `graph`, while labels from the two graphs are intersected per vertex and per edge.  Both graphs must mutually directed or undirected.

#### `graph.join(anotherGraph, [weight], [oneWay])`
Returns a new `Graph` representing the graph join of `graph` and `anotherGraph`.  When `weight` is specified, the edges constructed between the two graphs will be given that weight; otherwise they are given the default weight of `1`.  When the graphs are directed and `oneWay` is `true`, the edges constructed between the two graphs will only go from vertices in `graph` to vertices in `anotherGraph` but not vice-versa; by default edges are constructed in both directions.  The two graphs must be mutually directed or undirected and not share any common vertex ids.

#### `graph.traverse([startingVertex], [record])`
Returns a new `Traversal` of `graph`.  Optionally `startingVertex` may specify a vertex id within `graph` from which to begin the traversal.  In that case, `startingVertex` specifies the first visited vertex.  If `record` is `true`, traversal recording will be active (see [`traversal.record()`](#traversalrecord)).

#### `graph.adjacencyMatrix([weighted])`
Returns the graph's adjacency matrix as object of the format,
 - `vertices` - an array (ordering) of the vertex ids in `graph`.
 - `matrix` - an array of arrays, each representing a row in the adjacency matrix.  The vertex-order of the rows and columns corresponds to the order of the returned `vertices` property.  When `weighted` is `true`, the non-zero entries in the adjacency matrix contain the corresponding edge weight rather than `1`.

### `Gert.Traversal`
The `Gert.Traversal` object is the container for traversing the vertices and edges of a graph.  It records the traversal so that it can be replayed over another graph.  It also keeps some information about the trip, such as the total distance traveled.

#### `new Traversal(graph)`
Creates a new `Traversal` object.  The `graph` specified is the `Graph` that will be traversed.

#### `traversal.graph`
A reference the the `Graph` object being traversed.  The reference should not be reassigned, though the graph may be altered.

#### `traversal.sequence`
An array of visited vertex ids in the order that they were visited.  Should be considered read-only.

#### `traversal.distance`
The sum of the edge weights of the edges traversed using [`traversal.walk()`](#traversalwalkv).  Should be considered read-only.

#### `traversal.recording`
A boolean indicating if recording is currently active, per [`traversal.record()`](#traversalrecord) and [`traversal.stop()`](#traversalstop).  Should be considered read-only.

#### `traversal.hop(v)`
Visits vertex with id `v` without traversing any edges.  A new traversal might begin by calling `traversal.hop()` to visit the first vertex.  Returns `traversal`.

#### `traversal.walk(v)`
Traverses the edge from the current vertex to vertex with id `v`, visiting `v`.  Returns `traversal`.

#### `traversal.currentVertex()`
Returns vertex info (see [`graph.getVertex()`](#graphgetvertexv) for the format) of the currently visited vertex, or `null` if no vertex has been visited.

#### `traversal.while(step)`
The function `step(vertex)` is called with `vertex` the current vertex of the traversal until `step` returns a falsey value.  Inside the `step` function `this` refers to `traversal`.  If there is no current vertex when the process begins then no action is taken.  Returns `traversal`.

#### `traversal.visits(v)`
Returns the number of times the traversal has visited the vertex with id `v`.

#### `traversal.subgraph()`
Returns a `Graph` representing the subgraph of visited nodes and traversed edges.

#### `traversal.record()`
Start recording traversal.

#### `traversal.stop()`
Stop recording traversal.

#### `traversal.play([graph])`
Returns a new `Traversal` of the recorded traversal steps played over `graph`.  It calls [`traversal.hop()`](#traversalhopv) and [`traversal.walk()`](#traversalwalkv) in the order they were called on `traversal` while recording was active.  If `graph` isn't specified, the traversal steps will be replayed over [`traversal.graph`](#traversalgraph).
