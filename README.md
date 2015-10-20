# gert

A graph library intended to delight you, Gert, and Arthur.

[![Build Status](https://travis-ci.org/devinivy/gert.svg?branch=master)](https://travis-ci.org/devinivy/gert) [![Coverage Status](https://coveralls.io/repos/devinivy/gert/badge.svg?branch=master&service=github)](https://coveralls.io/github/devinivy/gert?branch=master)

## Usage

## API

### `Gert.Graph`

#### `new Graph(definition)`

#### `graph.digraph`
#### `graph.getVertex(v)`
#### `graph.getVertices(vertexIdsOrLabel)`
#### `graph.addVertex(v, info)`
#### `graph.removeVertex(v)`
#### `graph.removeVertices(vertexIdsOrLabel)`
#### `graph.getEdge(u, v)`
#### `graph.getEdges(edgePairsOrLabel)`
#### `graph.addEdge(u, v, info)`
#### `graph.removeEdge(u, v)`
#### `graph.removeEdges(edgePairsOrLabel)`
#### `graph.snapshot()`
#### `graph.equals(anotherGraph, matchWeights)`
#### `graph.subgraph(subset)`
#### `graph.complement()`
#### `graph.transpose()`
#### `graph.union(anotherGraph)`
#### `graph.intersection(anotherGraph)`
#### `graph.join(anotherGraph, bothWays)`
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
