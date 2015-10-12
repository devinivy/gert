# gert

A graph library intended to delight you, Gert, and Arthur.

[![Build Status](https://travis-ci.org/devinivy/gert.svg?branch=master)](https://travis-ci.org/devinivy/gert)

## Usage

## API

### `Graph`

#### `new Graph(definition)`

#### `graph.getVertex(u)`
#### `graph.getVertices(labels)`
#### `graph.addVertex(u)`
#### `graph.removeVertex(u)`
#### `graph.removeVertices(labels)`
#### `graph.getEdge(u, v)`
#### `graph.addEdge(u, v, labels)`
#### `graph.removeEdge(u, v)`
#### `graph.removeEdges(labels)`
#### `graph.distance(u, v)`
#### `graph.snapshot()`
#### `graph.equals(anotherGraph)`
#### `graph.subgraph(subset)`
#### `graph.complement(subgraph)`
#### `graph.transpose()`
#### `graph.union(anotherGraph)`
#### `graph.intersection(anotherGraph)`
#### `graph.join(anotherGraph)`
#### `graph.traverse(starting)`

### `Traversal`

#### `new Traversal(graph)`

#### `traversal.hop(u)`
#### `traversal.walk(u)`
#### `traversal.currentVertex()`
#### `traversal.visits(u)`
#### `traversal.subgraph()`
#### `traversal.play(graph)`
