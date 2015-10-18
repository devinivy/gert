var Hoek = require('hoek');
var Traversal = require('./traversal');
var Formatting = require('./formatting');

var internals = {};

internals.schema = {

};

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

        if (!this.digraph) {
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
        var vertexSet = vertices ? (this._vertexLabels[vertices] || {}) : this._vertices;
        vertices = Object.keys(vertexSet);
    }

    for (var i = 0; i < vertices.length; i++) {
        this.removeVertex(vertices[i]);
    }

    return this;
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

    this._newEdge(u, v, info);

    if (!this.digraph && u !== v) {
        this._newEdge(v, u, info);
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

    if (!this.digraph && u !== v) {
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

internals.Graph.prototype.distance = function (u, v) {

};

internals.Graph.prototype.equals = function (graph, matchWeights) {

    if (this.digraph !== graph.digraph) {
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

    definition.digraph = this.digraph;
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

    if (!this.digraph) {
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
        digraph: this.digraph
    };

    var vertices = {};

    var vertexList = Object.keys(this._vertices);
    var vertex;
    for (var i = 0; i < vertexList.length; i++) {
        vertex = this._vertices[vertexList[i]];
        vertices[vertex.id] = {
            labels: vertex.labels,
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

    if (!this.digraph) {
        edges = Formatting.halvePairsObj(edges);
    }

    edges = Formatting.pairsObjToArray(edges);

    definition.vertices = vertices;
    definition.edges = edges;

    return new internals.Graph(definition);
};

internals.Graph.prototype.transpose = function () {

    Hoek.assert(this.digraph, 'Transpose only operates on directed graphs.');

    var definition = {
        digraph: true
    };

    var vertices = {};

    var vertexList = Object.keys(this._vertices);
    var vertex;
    for (var i = 0; i < vertexList.length; i++) {
        vertex = this._vertices[vertexList[i]];
        vertices[vertex.id] = {
            labels: vertex.labels,
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
                    labels: edge.labels
                });
            }
        }
    }

    definition.vertices = vertices;
    definition.edges = edges;

    return new internals.Graph(definition);
};

/*internals.Graph.prototype.union = function (graph) {

    Hoek.assert(this.digraph === graph.digraph, 'Graphs must be both directed or both undirected.')

    var definition = {
        digraph: this.digraph
    };

    var vertices = {};

    var theirVertexList = Object.keys(graph._vertices);
    var vertex;
    for (var i = 0; i < theirVertexList.length; i++) {

        vertex = graph._vertices[theirVertexList[i]];

        vertices[vertex.id] = {
            labels: Hoek.clone(vertex.labels),
            data: vertex.data
        };
    }

    var ourVertexList = Object.keys(this._vertices);
    var ourInfo;
    for (var j = 0; j < ourVertexList.length; j++) {

        vertex = this._vertices[ourVertexList[j]];

        ourInfo = {
            labels: vertex.labels,
            data: vertex.data
        };

        // Our graph wins in conflict over their graph
        if (vertices[vertex.id]) {
            Hoek.merge(vertices[vertex.id], ourInfo, false);
        } else {
            vertices[vertex.id] = newInfo;
        }
    }
};*/

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
    }

    var oldLabels = this._vertices[v].labels;
    var newLabels = Hoek.unique(info.labels);

    this._vertices[v].id = v;
    this._vertices[v].labels = newLabels;
    this._vertices[v].data = info.data;

    this._unlabelVertex(v, oldLabels);
    this._labelVertex(v, newLabels);
};

internals.Graph.prototype._lookupEdge = function (u, v) {

    return (this._edges[u] && this._edges[u][v]) || null;
};

internals.Graph.prototype._newEdge = function (u, v, info) {

    this._edges[u] = this._edges[u] || {};
    this._edges[u][v] = internals.newEdge();

    var edge = this._edges[u][v];

    var oldLabels = edge.labels;
    var newLabels = info.labels;

    edge.labels = info.labels;
    edge.weight = info.weight;
    edge.pair = [u, v];

    this._unlabelEdge(u, v, oldLabels);
    this._labelEdge(u, v, newLabels);

    this._vertices[u].to[v] = true;
    this._vertices[v].from[u] = true;

    this._vertices[u].outdegree++;
    this._vertices[v].indegree++;
};

internals.Graph.prototype._unsetEdge  = function (u, v) {

    this._unlabelEdge(u, v, this._edges[u][v].labels);

    delete this._edges[u][v];

    delete this._vertices[u].to[v];
    delete this._vertices[v].from[u];

    this._vertices[u].outdegree--;
    this._vertices[v].indegree--;
};

internals.Graph.prototype._getEdgePairsByLabel = function (label) {

    var pairsObj = label ? (this._edgeLabels[label] || {}) : this._edges;

    if (!this.digraph) {
        pairsObj = Formatting.halvePairsObj(pairsObj);
    }

    return Formatting.pairsObjToArray(pairsObj);
};

internals.Graph.prototype._publicizeVertex  = function (vertex) {

    if (!vertex) {
        return null;
    }

    var publicVertex = Hoek.cloneWithShallow(vertex, ['data', 'from', 'to']);
    publicVertex.from = Object.keys(vertex.from);
    publicVertex.to = Object.keys(vertex.to);

    if (!this.digraph) {

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

    var publicEdge = Hoek.clone(edge);

    return publicEdge;
};

internals.normalizeDefinition = function (definition) {

    definition = definition || {};

    var normalized = {};
    normalized.digraph = definition.hasOwnProperty('digraph') ? !!definition.digraph : true;
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
        labels: [],
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
        labels: [],
        weight: undefined
    };
};
