# gert

A graph library intended to delight you, Gert, and Arthur.

[![Build Status](https://travis-ci.org/devinivy/gert.svg?branch=master)](https://travis-ci.org/devinivy/gert)

## Usage

## API

### `Graph`

#### `new Graph(definition)`

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
#### `graph.distance(u, v)`
#### `graph.snapshot()`
#### `graph.equals(anotherGraph)`
#### `graph.subgraph(subset)`
#### `graph.complement()`
#### `graph.transpose()`
#### `graph.union(anotherGraph)`
#### `graph.intersection(anotherGraph)`
#### `graph.join(anotherGraph)`
#### `graph.traverse(startingVertex)`

### `Traversal`

#### `new Traversal(graph)`

#### `traversal.hop(u)`
#### `traversal.walk(u)`
#### `traversal.currentVertex()`
#### `traversal.visits(u)`
#### `traversal.subgraph()`
#### `traversal.play(graph)`
