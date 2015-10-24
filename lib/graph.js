var Hoek = require('hoek');
var Joi = require('joi');
var Formatting = require('./formatting');
var Schema = require('./schema');
var Traversal = require('./traversal');

var internals = {};

exports = module.exports = internals.Graph = function (definition) {

    definition = definition || {};

    var validated = Joi.validate(definition, Schema.definition);
    Hoek.assert(!validated.error, validated.error);

    definition = internals.normalizeDefinition(validated.value);

    this.directed = definition.directed;

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

        if (!this.directed) {
            var neighborVid;
            for (var l = 0; l < vertexDefn.neighbors.length; l++) {

                neighborVid = vertexDefn.neighbors[l];

                Hoek.assert(vid !== neighborVid, 'Vertex', vid, 'cannot be its own neighbor.');

                if (!this._vertices[neighborVid]) {
                    this.addVertex(neighborVid);
                }

                this.addEdge(vid, neighborVid);
            }
        }

    }

    var from;
    var to;
    var edgeDefn;
    for (var m = 0; m < definition.edges.length; m++) {

        edgeDefn = definition.edges[m];

        from = edgeDefn.pair[0];
        to = edgeDefn.pair[1];

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

internals.Graph.prototype.vertexExists = function (v) {

    return !!this._vertices[v];
};

internals.Graph.prototype.getVertex = function (v) {

    var vertex = this._vertices[v] || null;

    return this._publicizeVertex(vertex);
};

internals.Graph.prototype.getVertices = function (vertices /* or a label */) {

    if (!Array.isArray(vertices)) {
        var vertexSet = vertices ? (this._vertexLabels[vertices] || {}) : this._vertices;
        vertices = Object.keys(vertexSet);
    }

    var keyedVertices = {};

    var vertex;
    for (var i = 0; i < vertices.length; i++) {
        vertex = this.getVertex(vertices[i]);
        if (vertex !== null) {
            keyedVertices[vertex.id] = vertex;
        }
    }

    return keyedVertices;
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

internals.Graph.prototype.updateVertex = function (v, info) {

    Hoek.assert(this._vertices[v], 'Vertex [', v, '] does not exist.');

    info = Hoek.cloneWithShallow(info, ['data']) || {};
    info = this._normalizeLabelUpdate(info);

    this._setVertex(v, info);

    return this;
};

internals.Graph.prototype.removeVertex = function (v) {

    Hoek.assert(this._vertices[v], 'Vertex [', v, '] does not exist.');

    var vertex = this._vertices[v];

    var toEdges = Object.keys(vertex.to);
    for (var i = 0; i < toEdges.length; i++) {
        this.removeEdge(v, toEdges[i]);
    }

    if (this.directed) {
        var fromEdges = Object.keys(vertex.from);
        for (var j = 0; j < fromEdges.length; j++) {
            this.removeEdge(fromEdges[j], v);
        }
    }

    this._unlabelVertex(v, Object.keys(vertex.labels));

    delete this._vertices[v];
    delete this._edges[v];

    return this;
};

internals.Graph.prototype.removeVertices = function (vertices /* or a label */) {

    if (!Array.isArray(vertices)) {
        var vertexSet = vertices ? (this._vertexLabels[vertices] || {}) : this._vertices;
        vertices = Object.keys(vertexSet);
    }

    for (var i = 0; i < vertices.length; i++) {
        this.removeVertex(vertices[i]);
    }

    return this;
};

internals.Graph.prototype.edgeExists = function (u, v) {

    if (Array.isArray(u)) {

        Hoek.assert(u.length === 2, 'Not a proper edge pair.');

        v = u[1];
        u = u[0];
    }

    return !!this._lookupEdge(u, v);
};

internals.Graph.prototype.getEdge = function (u, v) {

    if (Array.isArray(u)) {

        Hoek.assert(u.length === 2, 'Not a proper edge pair.');

        v = u[1];
        u = u[0];
    }

    var edge = this._lookupEdge(u, v);

    return this._publicizeEdge(edge);
};

internals.Graph.prototype.getEdges = function (pairs /* or a label */) {

    if (!Array.isArray(pairs)) {
        pairs = this._getEdgePairsByLabel(pairs);
    }

    var list = [];

    var edge;
    for (var i = 0; i < pairs.length; i++) {
        edge = this.getEdge(pairs[i]);
        if (edge !== null) {
            list.push(edge);
        }
    }

    return list;
};

internals.Graph.prototype.addEdge = function (u, v, info) {

    if (Array.isArray(u)) {

        Hoek.assert(u.length === 2, 'Not a proper edge pair.');

        info = v;
        v = u[1];
        u = u[0];
    }

    Hoek.assert(this._vertices[u], 'Vertex [', u, '] doesn\'t exist.');
    Hoek.assert(this._vertices[v], 'Vertex [', v, '] doesn\'t exist.');
    Hoek.assert(!this._lookupEdge(u, v), 'Edge [', u, ']-->[', v, '] already exists.');

    info = info || {};

    info = {
        labels: [].concat(info.labels || []),
        weight: (info.weight || info.weight === 0) ? info.weight : 1
    };

    this._setEdge(u, v, info);

    if (!this.directed && u !== v) {
        this._setEdge(v, u, info);
    }

    return this;
};

internals.Graph.prototype.updateEdge = function (u, v, info) {

    if (Array.isArray(u)) {

        Hoek.assert(u.length === 2, 'Not a proper edge pair.');

        info = v;
        v = u[1];
        u = u[0];
    }

    Hoek.assert(this._lookupEdge(u, v), 'Edge [', u, ']-->[', v, '] does not exist.');

    info = Hoek.clone(info) || {};
    info = this._normalizeLabelUpdate(info);

    this._setEdge(u, v, info);

    if (!this.directed && u !== v) {
        this._setEdge(v, u, info);
    }

    return this;
};

internals.Graph.prototype.removeEdge = function (u, v) {

    if (Array.isArray(u)) {

        Hoek.assert(u.length === 2, 'Not a proper edge pair.');

        v = u[1];
        u = u[0];
    }

    Hoek.assert(this._lookupEdge(u, v), 'Edge [', u, ']-->[', v, '] does not exist.');

    this._unsetEdge(u, v);

    if (!this.directed && u !== v) {
        this._unsetEdge(v, u);
    }

    return this;
};

internals.Graph.prototype.removeEdges = function (pairs /* or a label */) {

    if (!Array.isArray(pairs)) {
        pairs = this._getEdgePairsByLabel(pairs);
    }

    for (var i = 0; i < pairs.length; i++) {
        this.removeEdge(pairs[i]);
    }

    return this;
};

internals.Graph.prototype.equals = function (graph, matchWeights) {

    if (this.directed !== graph.directed) {
        return false;
    }

    var ourVertexList = Object.keys(this._vertices);
    var theirVertexList = Object.keys(graph._vertices);

    // Vertex match
    if (!Hoek.contain(ourVertexList, theirVertexList, { only: true })) {
        return false;
    }

    var normalizeEdges = function (edgeObj) {

        var normalized = {};

        var u;
        var us = Object.keys(edgeObj);
        for (var i = 0; i < us.length; i++) {

            u = us[i];

            var v;
            var vs = Object.keys(edgeObj[u]);
            for (var j = 0; j < vs.length; j++) {
                v = vs[j];
                normalized[u] = normalized[u] || {};
                normalized[u][v] = matchWeights ? edgeObj[u][v].weight : true;
            }
        }

        return normalized;
    };

    var ourEdges = normalizeEdges(this._edges);
    var theirEdges = normalizeEdges(graph._edges);

    // Edge match
    if (!Hoek.deepEqual(ourEdges, theirEdges)) {
        return false;
    }

    return true;
};

internals.Graph.prototype.subgraph = function (subset) {

    var self = this;

    var subVertices = subset.vertices || [];
    var subEdges = subset.edges || [];

    var nonVertices = subVertices.filter(function (v) {

        return !self._vertices[v];
    });

    Hoek.assert(!nonVertices.length, 'Vertices not in supergraph:', nonVertices);

    var nonEdges = subEdges.filter(function (pair) {

        return !self._lookupEdge(pair[0], pair[1]);
    });

    Hoek.assert(!nonEdges.length, 'Edges not in supergraph:', nonEdges);

    var definition = {};

    var vertices = this.getVertices(subVertices);
    var edges = this.getEdges(subEdges);

    definition.directed = this.directed;
    definition.vertices = {};

    var vertex;
    var vids = Object.keys(vertices);
    for (var i = 0; i < vids.length; i++) {
        vertex = vertices[vids[i]];
        definition.vertices[vertex.id] = {
            labels: vertex.labels,
            data: vertex.data
        };
    }

    definition.edges = edges;

    return new internals.Graph(definition);
};

internals.Graph.prototype.snapshot = function () {

    var pairsObj = this._edges;

    if (!this.directed) {
        pairsObj = Formatting.halvePairsObj(pairsObj);
    }

    var pairs = Formatting.pairsObjToArray(pairsObj);

    return this.subgraph({
        vertices: Object.keys(this._vertices),
        edges: pairs
    });
};

internals.Graph.prototype.complement = function () {

    var definition = {
        directed: this.directed
    };

    var vertices = {};

    var vertexList = Object.keys(this._vertices);
    var vertex;
    for (var i = 0; i < vertexList.length; i++) {
        vertex = this._vertices[vertexList[i]];
        vertices[vertex.id] = {
            labels: Object.keys(vertex.labels),
            data: vertex.data
        };
    }

    var edges = {};
    var u;
    for (var j = 0; j < vertexList.length; j++) {

        u = vertexList[j];

        var v;
        for (var k = 0; k < vertexList.length; k++) {

            v = vertexList[k];

            var edgeExists = !!this._lookupEdge(u, v);

            if ((u !== v && !edgeExists) || (u === v && edgeExists)) {
                edges[u] = edges[u] || {};
                edges[u][v] = true;
            }
        }
    }

    if (!this.directed) {
        edges = Formatting.halvePairsObj(edges);
    }

    edges = Formatting.pairsObjToArray(edges);

    definition.vertices = vertices;
    definition.edges = edges;

    return new internals.Graph(definition);
};

internals.Graph.prototype.transpose = function () {

    Hoek.assert(this.directed, 'Transpose only operates on directed graphs.');

    var definition = {
        directed: true
    };

    var vertices = {};

    var vertexList = Object.keys(this._vertices);
    var vertex;
    for (var i = 0; i < vertexList.length; i++) {
        vertex = this._vertices[vertexList[i]];
        vertices[vertex.id] = {
            labels: Object.keys(vertex.labels),
            data: vertex.data
        };
    }

    var edges = [];
    var u;
    for (var j = 0; j < vertexList.length; j++) {

        u = vertexList[j];

        var v;
        for (var k = 0; k < vertexList.length; k++) {

            v = vertexList[k];

            var edge = this._lookupEdge(u, v);

            if (edge) {
                edges.push({
                    pair: [v, u],
                    weight: edge.weight,
                    labels: Object.keys(edge.labels)
                });
            }
        }
    }

    definition.vertices = vertices;
    definition.edges = edges;

    return new internals.Graph(definition);
};

internals.Graph.prototype.union = function (graph) {

    Hoek.assert(this.directed === graph.directed, 'Graphs must be both directed or both undirected.');

    var definition = {
        directed: this.directed
    };

    var vertices = Hoek.merge(Hoek.clone(graph._vertices), this._vertices, false);

    var vertexList = Object.keys(vertices);
    var v;
    for (var i = 0; i < vertexList.length; i++) {
        v = vertexList[i];
        vertices[v] = {
            labels: Object.keys(vertices[v].labels),
            data: vertices[v].data
        };
    }

    var edges = [];
    var edgeInfo = Hoek.merge(Hoek.clone(graph._edges), this._edges);

    // For traversing
    var edgeObj = this.directed ? edgeInfo : Formatting.halvePairsObj(edgeInfo);

    var u;
    var us = Object.keys(edgeObj);
    for (var j = 0; j < us.length; j++) {

        u = us[j];

        var w;
        var ws = Object.keys(edgeObj[u]);
        for (var k = 0; k < ws.length; k++) {
            w = ws[k];
            // Fix destruction of pairs from the edge merge
            edgeInfo[u][w].pair = [u, w];
            edgeInfo[u][w].labels = Object.keys(edgeInfo[u][w].labels);
            edges.push(edgeInfo[u][w]);
        }
    }

    definition.vertices = vertices;
    definition.edges = edges;

    return new internals.Graph(definition);
};

internals.Graph.prototype.intersection = function (graph) {

    Hoek.assert(this.directed === graph.directed, 'Graphs must be both directed or both undirected.');

    var definition = {
        directed: this.directed
    };

    var vertices = {};
    var ourVertices = this._vertices;
    var ourVertexList = Object.keys(ourVertices);
    var theirVertices = graph._vertices;
    var theirVertexList = Object.keys(theirVertices);
    var vertexList = Hoek.intersect(ourVertexList, theirVertexList);

    var v;
    for (var i = 0; i < vertexList.length; i++) {
        v = vertexList[i];
        vertices[v] = {
            labels: Hoek.intersect(Object.keys(ourVertices[v].labels), Object.keys(theirVertices[v].labels)),
            data: ourVertices[v].data
        };
    }

    var edges = [];
    var ourEdgeInfo = this._edges;
    var theirEdgeInfo = graph._edges;

    // For traversing
    var edgeObj = this.directed ? ourEdgeInfo : Formatting.halvePairsObj(ourEdgeInfo);

    var u;
    var us = Object.keys(edgeObj);
    for (var j = 0; j < us.length; j++) {

        u = us[j];

        var w;
        var ws = Object.keys(edgeObj[u]);
        for (var k = 0; k < ws.length; k++) {
            w = ws[k];
            if (graph._lookupEdge(u, w)) {
                edges.push({
                    pair: [u, w],
                    labels: Hoek.intersect(Object.keys(ourEdgeInfo[u][w].labels), Object.keys(theirEdgeInfo[u][w].labels)),
                    weight: ourEdgeInfo[u][w].weight
                });
            }
        }
    }

    definition.vertices = vertices;
    definition.edges = edges;

    return new internals.Graph(definition);
};

internals.Graph.prototype.join = function (graph, weight, oneWay) {

    if (!weight && weight !== 0) {
        weight = 1;
    }

    Hoek.assert(this.directed === graph.directed, 'Graphs must be both directed or both undirected.');

    var ourVertexList = Object.keys(this._vertices);
    var theirVertexList = Object.keys(graph._vertices);

    Hoek.assert(Hoek.intersect(ourVertexList, theirVertexList).length === 0, 'Graphs in join may not have any common vertex ids.');

    var join = this.union(graph);

    // Add join edges
    var u;
    for (var i = 0; i < ourVertexList.length; i++) {

        u = ourVertexList[i];

        // Restore our data
        join._vertices[u].data = this._vertices[u].data;

        var v;
        for (var j = 0; j < theirVertexList.length; j++) {

            v = theirVertexList[j];

            join.addEdge(u, v, {
                labels: ['join-edge'],
                weight: weight
            });

            if (this.directed && !oneWay) {
                join.addEdge(v, u, {
                    labels: ['join-edge'],
                    weight: weight
                });
            }

        }
    }

    var w;
    for (var k = 0; k < theirVertexList.length; k++) {

        w = theirVertexList[k];

        // Restore their data
        join._vertices[w].data = graph._vertices[w].data;
    }

    return join;
};

internals.Graph.prototype.traverse = function (starting) {

    var traversal = new Traversal(this);

    if (starting) {
        traversal.hop(starting);
    }

    return traversal;
};

internals.Graph.prototype.adjacencyMatrix = function (weighted) {

    var matrix = [];
    var vertexList = Object.keys(this._vertices);

    var row;
    var u;
    for (var i = 0; i < vertexList.length; i++) {

        u = vertexList[i];
        row = [];

        var edge;
        var v;
        for (var j = 0; j < vertexList.length; j++) {

            v = vertexList[j];
            edge = this._lookupEdge(u, v);

            if (edge) {
                row.push(weighted ? edge.weight : 1);
            } else {
                row.push(0);
            }
        }

        matrix.push(row);
    }

    return {
        vertices: vertexList,
        matrix: matrix
    };
};

internals.Graph.prototype._normalizeLabelUpdate = function (info) {

    if (!info.labels) {
        return info;
    }

    if (Array.isArray(info.labels)) {
        info.labels = [].concat(info.labels);
    } else {
        info.labels.add = [].concat(info.labels.add || []);
        info.labels.remove = [].concat(info.labels.remove || []);
    }

    return info;
};

internals.Graph.prototype._labelVertex = function (v, labels) {

    var label;
    for (var i = 0; i < labels.length; i++) {
        label = labels[i];
        this._vertexLabels[label] = this._vertexLabels[label] || {};
        this._vertexLabels[label][v] = true;
        this._vertices[v].labels[label] = true;
    }
};

internals.Graph.prototype._unlabelVertex = function (v, labels) {

    var label;
    for (var i = 0; i < labels.length; i++) {
        label = labels[i];
        if (this._vertexLabels[label]) {
            delete this._vertexLabels[label][v];
            delete this._vertices[v].labels[label];
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
        this._edges[u][v].labels[label] = true;
    }
};

internals.Graph.prototype._unlabelEdge = function (u, v, labels) {

    var label;
    for (var i = 0; i < labels.length; i++) {
        label = labels[i];
        if (this._edgeLabels[label] && this._edgeLabels[label][u]) {
            delete this._edgeLabels[label][u][v];
            delete this._edges[u][v].labels[label];
        }
    }
};

internals.Graph.prototype._setVertex = function (v, info) {

    if (!this._vertices[v]) {
        this._vertices[v] = internals.newVertex();
        this._vertices[v].id = v;
    }

    if (info.labels) {
        if (Array.isArray(info.labels)) {
            var oldLabels = Object.keys(this._vertices[v].labels);
            var newLabels = info.labels;
            this._unlabelVertex(v, oldLabels);
            this._labelVertex(v, newLabels);
        } else {
            this._unlabelVertex(v, info.labels.remove);
            this._labelVertex(v, info.labels.add);
        }
    }

    if (info.hasOwnProperty('data')) {
        this._vertices[v].data = info.data;
    }

};

internals.Graph.prototype._lookupEdge = function (u, v) {

    return (this._edges[u] && this._edges[u][v]) || null;
};

internals.Graph.prototype._setEdge = function (u, v, info) {

    if (!this._lookupEdge(u, v)) {

        this._edges[u] = this._edges[u] || {};
        this._edges[u][v] = internals.newEdge();
        this._edges[u][v].pair = [u, v];

        this._vertices[u].to[v] = true;
        this._vertices[v].from[u] = true;
        this._vertices[u].outdegree++;
        this._vertices[v].indegree++;
    }

    var edge = this._edges[u][v];

    if (info.labels) {
        if (Array.isArray(info.labels)) {
            var oldLabels = Object.keys(edge.labels);
            var newLabels = info.labels;
            this._unlabelEdge(u, v, oldLabels);
            this._labelEdge(u, v, newLabels);
        } else {
            this._unlabelEdge(u, v, info.labels.remove);
            this._labelEdge(u, v, info.labels.add);
        }
    }

    if (info.hasOwnProperty('weight')) {
        edge.weight = info.weight;
    }
};

internals.Graph.prototype._unsetEdge  = function (u, v) {

    this._unlabelEdge(u, v, Object.keys(this._edges[u][v].labels));

    delete this._edges[u][v];

    delete this._vertices[u].to[v];
    delete this._vertices[v].from[u];

    this._vertices[u].outdegree--;
    this._vertices[v].indegree--;
};

internals.Graph.prototype._getEdgePairsByLabel = function (label) {

    var pairsObj = label ? (this._edgeLabels[label] || {}) : this._edges;

    if (!this.directed) {
        pairsObj = Formatting.halvePairsObj(pairsObj);
    }

    return Formatting.pairsObjToArray(pairsObj);
};

internals.Graph.prototype._publicizeVertex  = function (vertex) {

    if (!vertex) {
        return null;
    }

    var publicVertex = Hoek.cloneWithShallow(vertex, ['data', 'labels', 'from', 'to']);
    publicVertex.labels = Object.keys(vertex.labels);
    publicVertex.from = Object.keys(vertex.from);
    publicVertex.to = Object.keys(vertex.to);

    if (!this.directed) {

        var selfLooping = false;

        publicVertex.neighbors = publicVertex.to.filter(function (v) {

            var isLoop = (v === publicVertex.id);

            if (isLoop) {
                selfLooping = true;
            }

            return !isLoop;
        });

        publicVertex.degree = publicVertex.outdegree + (selfLooping ? 1 : 0);
        delete publicVertex.indegree;
        delete publicVertex.outdegree;
    }

    return publicVertex;
};

internals.Graph.prototype._publicizeEdge  = function (edge) {

    if (!edge) {
        return null;
    }

    var publicEdge = Hoek.cloneWithShallow(edge, ['labels']);
    publicEdge.labels = Object.keys(publicEdge.labels);

    return publicEdge;
};

internals.normalizeDefinition = function (definition) {

    var normalized = {};
    normalized.directed = definition.directed;
    normalized.vertices = definition.vertices || {};
    normalized.edges = definition.edges || [];

    // ['a', 'b'] -> { a: {}, b: {} }

    if (Array.isArray(normalized.vertices)) {
        normalized.vertices = normalized.vertices.reduce(function (reduced, value) {

            reduced[value] = {};
            return reduced;
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
        newVertex.neighbors = [].concat(vertex.neighbors || []);
        newVertex.data = vertex.data;

        normalized.vertices[vid] = newVertex;
    }

    // ['a', 'b'] -> { pair: ['a', 'b'] }

    var newEdge;
    var edge;
    for (var j = 0; j < normalized.edges.length; j++) {

        edge = normalized.edges[j];

        if (Array.isArray(edge)) {
            edge = { pair: edge };
        }

        newEdge = {};

        newEdge.pair = [].concat(edge.pair);
        newEdge.labels = [].concat(edge.labels || []);
        newEdge.weight = edge.weight;

        normalized.edges[j] = newEdge;
    }

    return normalized;
};

internals.newVertex = function () {

    return {
        id: undefined,
        labels: {},
        to: {},
        from: {},
        data: undefined,
        indegree: 0,
        outdegree: 0
    };
};

internals.newEdge = function () {

    return {
        pair: undefined,
        labels: {},
        weight: undefined
    };
};
