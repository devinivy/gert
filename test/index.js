// Load modules

var Lab = require('lab');
var Code = require('code');
var EventEmitter = require('events').EventEmitter;

var Gert = require('..');
var Graph = Gert.Graph;
var Traversal = Gert.Traversal;

// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


describe('Gert', function () {

    var edgeFormat = function (edges) {

        var obj = {};
        var edge;
        for (var i = 0; i < edges.length; i++) {
            edge = edges[i];
            obj[edge.pair[0]] = obj[edge.pair[0]] || {};
            obj[edge.pair[0]][edge.pair[1]] = edge;
        }

        return obj;
    };

    var vertexFormat = function (vertices) {

        var objify = function (arr) {

            var obj = {};
            for (var i = 0; i < arr.length; i++) {
                obj[arr[i]] = true;
            }

            return obj;
        };

        var vertex;
        var vertexList = Object.keys(vertices);
        for (var i = 0; i < vertexList.length; i++) {
            vertex = vertices[vertexList[i]];
            vertex.to = objify(vertex.to);
            vertex.from = objify(vertex.from);
            if (vertex.neighbors) {
                vertex.neighbors = objify(vertex.neighbors);
            }
        }

        return vertices;
    };

    describe('Graph', function () {

        it('with no definition defaults to an empty directed graph.', function (done) {

            var graph = new Graph();

            expect(graph.directed).to.equal(true);
            expect(graph.getVertices()).to.deep.equal({});
            expect(graph.getEdges()).to.deep.equal([]);
            done();
        });

        it('definition can specify initial vertices with data and labels.', function (done) {

            var data = {
                a: {},
                b: []
            };

            var graph = new Graph({
                vertices: {
                    a: {
                        data: data.a,
                        labels: ['ay', 'eh']
                    },
                    b: {
                        data: data.b,
                        labels: 'bee'
                    },
                    c: {}
                }
            });

            expect(graph.directed).to.equal(true);

            var vertices = graph.getVertices();

            expect(vertices).to.deep.equal({
                a: {
                    id: 'a',
                    to: [],
                    from: [],
                    labels: ['ay', 'eh'],
                    outdegree: 0,
                    indegree: 0,
                    data: data.a
                },
                b: {
                    id: 'b',
                    to: [],
                    from: [],
                    labels: ['bee'],
                    outdegree: 0,
                    indegree: 0,
                    data: data.b
                },
                c: {
                    id: 'c',
                    to: [],
                    from: [],
                    labels: [],
                    outdegree: 0,
                    indegree: 0,
                    data: undefined
                }
            });

            expect(vertices.a.data).to.equal(data.a);
            expect(vertices.b.data).to.equal(data.b);

            expect(graph.getEdges()).to.deep.equal([]);
            done();
        });

        it('definition can specify edges among vertices.', function (done) {

            var graph = new Graph({
                vertices: {
                    a: {
                        labels: 'eh',
                        to: 'b'
                    },
                    b: {
                        labels: 'bee',
                        from: 'c'
                    },
                    c: {
                        labels: 'sea',
                        to: ['a', 'd'],
                        from: ['a', 'b']
                    }
                }
            });

            expect(graph.directed).to.equal(true);

            var vertices = graph.getVertices();

            expect(vertices).to.deep.equal({
                a: {
                    id: 'a',
                    labels: ['eh'],
                    to: ['b', 'c'],
                    from: ['c'],
                    data: undefined,
                    indegree: 1,
                    outdegree: 2
                },
                b: {
                    id: 'b',
                    labels: ['bee'],
                    to: ['c'],
                    from: ['a', 'c'],
                    data: undefined,
                    indegree: 2,
                    outdegree: 1
                },
                c: {
                    id: 'c',
                    labels: ['sea'],
                    to: ['b', 'a', 'd'],
                    from: ['a', 'b'],
                    data: undefined,
                    indegree: 2,
                    outdegree: 3
                },
                d: {
                    id: 'd',
                    labels: [],
                    to: [],
                    from: ['c'],
                    data: undefined,
                    indegree: 1,
                    outdegree: 0
                }
            });

            var actualEdges = graph.getEdges();
            var expectedEdges = [
                { pair: ['a', 'b'], labels: [], weight: 1 },
                { pair: ['a', 'c'], labels: [], weight: 1 },
                { pair: ['b', 'c'], labels: [], weight: 1 },
                { pair: ['c', 'b'], labels: [], weight: 1 },
                { pair: ['c', 'a'], labels: [], weight: 1 },
                { pair: ['c', 'd'], labels: [], weight: 1 }
            ];

            expect(edgeFormat(actualEdges)).to.deep.equal(edgeFormat(expectedEdges));

            done();
        });

        it('definition can create edges with weights and labels.', function (done) {

            var graph = new Graph({
                vertices: {
                    a: {},
                    b: {},
                    c: {},
                    d: {}
                },
                edges: [
                    ['a', 'b'],
                    { pair: ['b', 'c'], labels: 'strong', weight: 2 },
                    { pair: ['c', 'd'], labels: ['weak', 'strange'], weight: -1 }
                ]
            });

            expect(graph.directed).to.equal(true);

            var vertices = graph.getVertices();

            expect(vertices).to.deep.equal({
                a: {
                    id: 'a',
                    labels: [],
                    to: ['b'],
                    from: [],
                    data: undefined,
                    indegree: 0,
                    outdegree: 1
                },
                b: {
                    id: 'b',
                    labels: [],
                    to: ['c'],
                    from: ['a'],
                    data: undefined,
                    indegree: 1,
                    outdegree: 1
                },
                c: {
                    id: 'c',
                    labels: [],
                    to: ['d'],
                    from: ['b'],
                    data: undefined,
                    indegree: 1,
                    outdegree: 1
                },
                d: {
                    id: 'd',
                    labels: [],
                    to: [],
                    from: ['c'],
                    data: undefined,
                    indegree: 1,
                    outdegree: 0
                }
            });

            var actualEdges = graph.getEdges();
            var expectedEdges = [
                { pair: ['a', 'b'], labels: [], weight: 1 },
                { pair: ['b', 'c'], labels: ['strong'], weight: 2 },
                { pair: ['c', 'd'], labels: ['weak', 'strange'], weight: -1 }
            ];

            expect(edgeFormat(actualEdges)).to.deep.equal(edgeFormat(expectedEdges));

            done();
        });

        it('definition will create new vertices from edge specification.', function (done) {

            var graph = new Graph({
                edges: [
                    ['a', 'b'],
                    ['b', 'c']
                ]
            });

            expect(graph.directed).to.equal(true);

            var vertices = graph.getVertices();

            expect(vertices).to.deep.equal({
                a: {
                    id: 'a',
                    labels: [],
                    to: ['b'],
                    from: [],
                    data: undefined,
                    indegree: 0,
                    outdegree: 1
                },
                b: {
                    id: 'b',
                    labels: [],
                    to: ['c'],
                    from: ['a'],
                    data: undefined,
                    indegree: 1,
                    outdegree: 1
                },
                c: {
                    id: 'c',
                    labels: [],
                    to: [],
                    from: ['b'],
                    data: undefined,
                    indegree: 1,
                    outdegree: 0
                }
            });

            var actualEdges = graph.getEdges();
            var expectedEdges = [
                { pair: ['a', 'b'], labels: [], weight: 1 },
                { pair: ['b', 'c'], labels: [], weight: 1 }
            ];

            expect(edgeFormat(actualEdges)).to.deep.equal(edgeFormat(expectedEdges));

            done();
        });

        it('definition can create an undirected graph.', function (done) {

            var graph = new Graph({
                directed: false,
                vertices: {
                    a: {
                        to: 'b'
                    },
                    b: {
                        from: 'd'
                    },
                    c: {
                        neighbors: ['a', 'b', 'e']
                    }
                },
                edges: [
                    ['d', 'c']
                ]
            });

            expect(graph.directed).to.equal(false);

            var vertices = graph.getVertices();

            expect(vertices).to.deep.equal({
                a: {
                    id: 'a',
                    labels: [],
                    to: ['b', 'c'],
                    from: ['b', 'c'],
                    neighbors: ['b', 'c'],
                    data: undefined,
                    degree: 2
                },
                b: {
                    id: 'b',
                    labels: [],
                    to: ['a', 'd', 'c'],
                    from: ['a', 'd', 'c'],
                    neighbors: ['a', 'd', 'c'],
                    data: undefined,
                    degree: 3
                },
                d: {
                    id: 'd',
                    labels: [],
                    to: ['b', 'c'],
                    from: ['b', 'c'],
                    neighbors: ['b', 'c'],
                    data: undefined,
                    degree: 2
                },
                c: {
                    id: 'c',
                    labels: [],
                    to: ['a', 'b', 'e', 'd'],
                    from: ['a', 'b', 'e', 'd'],
                    neighbors: ['a', 'b', 'e', 'd'],
                    data: undefined,
                    degree: 4
                },
                e: {
                    id: 'e',
                    labels: [],
                    to: ['c'],
                    from: ['c'],
                    neighbors: ['c'],
                    data: undefined,
                    degree: 1
                }
            });

            var actualEdges = graph.getEdges();

            var expectedEdges = [
                { pair: ['a', 'b'], labels: [], weight: 1 },
                { pair: ['a', 'c'], labels: [], weight: 1 },
                { pair: ['b', 'd'], labels: [], weight: 1 },
                { pair: ['b', 'c'], labels: [], weight: 1 },
                { pair: ['c', 'e'], labels: [], weight: 1 },
                { pair: ['d', 'c'], labels: [], weight: 1 }
            ];

            expect(edgeFormat(actualEdges)).to.deep.equal(edgeFormat(expectedEdges));

            done();
        });

        it('definition can create vertices in array format.', function (done) {

            var graph = new Graph({
                vertices: ['a', 'b'],
                edges: [['a', 'b']]
            });

            expect(graph.directed).to.equal(true);

            var vertices = graph.getVertices();

            expect(vertices).to.deep.equal({
                a: {
                    id: 'a',
                    labels: [],
                    to: ['b'],
                    from: [],
                    data: undefined,
                    indegree: 0,
                    outdegree: 1
                },
                b: {
                    id: 'b',
                    labels: [],
                    to: [],
                    from: ['a'],
                    data: undefined,
                    indegree: 1,
                    outdegree: 0
                }
            });

            var actualEdges = graph.getEdges();

            var expectedEdges = [
                { pair: ['a', 'b'], labels: [], weight: 1 }
            ];

            expect(edgeFormat(actualEdges)).to.deep.equal(edgeFormat(expectedEdges));

            done();
        });

        it('definition can create vertex edges in array format.', function (done) {

            var graph = new Graph({
                vertices: {
                    a: ['b']
                }
            });

            expect(graph.directed).to.equal(true);

            var vertices = graph.getVertices();

            expect(vertices).to.deep.equal({
                a: {
                    id: 'a',
                    labels: [],
                    to: ['b'],
                    from: [],
                    data: undefined,
                    indegree: 0,
                    outdegree: 1
                },
                b: {
                    id: 'b',
                    labels: [],
                    to: [],
                    from: ['a'],
                    data: undefined,
                    indegree: 1,
                    outdegree: 0
                }
            });

            var actualEdges = graph.getEdges();

            var expectedEdges = [
                { pair: ['a', 'b'], labels: [], weight: 1 }
            ];

            expect(edgeFormat(actualEdges)).to.deep.equal(edgeFormat(expectedEdges));

            done();
        });

        it('vertexExists(v) indicates whether a vertex exists in a graph.', function (done) {

            var graph = new Graph({ vertices: [1, 'a', 2.2] });

            expect(graph.vertexExists(1)).to.equal(true);
            expect(graph.vertexExists('a')).to.equal(true);
            expect(graph.vertexExists(2.2)).to.equal(true);

            expect(graph.vertexExists('non')).to.equal(false);

            done();
        });

        it('getVertex(v) returns empty and non-empty vertex information.', function (done) {

            var data = {
                b: {},
                c: []
            };

            var digraph = new Graph({
                vertices: {
                    a: {
                        labels: 'eh'
                    },
                    b: {
                        data: data.b
                    },
                    c: {
                        labels: 'sea',
                        data: data.c
                    }
                }
            });

            var nondigraph = new Graph({
                directed: false,
                vertices: {
                    a: {}
                }
            });

            var divertex = {
                a: digraph.getVertex('a'),
                b: digraph.getVertex('b'),
                c: digraph.getVertex('c'),
                d: digraph.getVertex('d')
            };

            expect(divertex.a).to.deep.equal({
                id: 'a',
                labels: ['eh'],
                to: [],
                from: [],
                data: undefined,
                indegree: 0,
                outdegree: 0
            });

            expect(divertex.b).to.deep.equal({
                id: 'b',
                labels: [],
                to: [],
                from: [],
                data: data.b,
                indegree: 0,
                outdegree: 0
            });

            expect(divertex.b.data).to.equal(data.b);

            expect(divertex.c).to.deep.equal({
                id: 'c',
                labels: ['sea'],
                to: [],
                from: [],
                data: data.c,
                indegree: 0,
                outdegree: 0
            });

            expect(divertex.c.data).to.equal(data.c);

            expect(divertex.d).to.equal(null);

            var nondivertex = {
                a: nondigraph.getVertex('a')
            };

            expect(nondivertex.a).to.deep.equal({
                id: 'a',
                labels: [],
                to: [],
                from: [],
                neighbors: [],
                data: undefined,
                degree: 0
            });

            done();
        });

        it('getVertices(null, [onlyIds]) returns all vertices.', function (done) {

            var data = {
                b: {},
                c: []
            };

            var graph = new Graph({
                vertices: {
                    a: {
                        labels: 'eh'
                    },
                    b: {
                        data: data.b
                    },
                    c: {
                        labels: 'sea',
                        data: data.c
                    }
                }
            });

            var vertices = graph.getVertices();
            var vertexIds = graph.getVertices(null, true);

            expect(vertices).to.deep.equal({
                a: {
                    id: 'a',
                    labels: ['eh'],
                    to: [],
                    from: [],
                    data: undefined,
                    indegree: 0,
                    outdegree: 0
                },
                b: {
                    id: 'b',
                    labels: [],
                    to: [],
                    from: [],
                    data: data.b,
                    indegree: 0,
                    outdegree: 0
                },
                c: {
                    id: 'c',
                    labels: ['sea'],
                    to: [],
                    from: [],
                    data: data.c,
                    indegree: 0,
                    outdegree: 0
                }
            });

            expect(vertexIds).to.only.include(['a', 'b', 'c']);

            done();
        });

        it('getVertices(array, [onlyIds]) returns specified vertices.', function (done) {

            var data = {
                b: {},
                c: []
            };

            var graph = new Graph({
                vertices: {
                    a: {
                        labels: 'eh'
                    },
                    b: {
                        data: data.b
                    },
                    c: {
                        labels: 'sea',
                        data: data.c
                    }
                }
            });

            var vertices = graph.getVertices(['a', 'c', 'not']);
            var vertexIds = graph.getVertices(['a', 'c', 'not'], true);

            expect(vertices).to.deep.equal({
                a: {
                    id: 'a',
                    labels: ['eh'],
                    to: [],
                    from: [],
                    data: undefined,
                    indegree: 0,
                    outdegree: 0
                },
                c: {
                    id: 'c',
                    labels: ['sea'],
                    to: [],
                    from: [],
                    data: data.c,
                    indegree: 0,
                    outdegree: 0
                }
            });

            expect(vertexIds).to.only.include(['a', 'c']);

            done();
        });

        it('getVertices(label, [onlyIds]) returns vertices by label.', function (done) {

            var graph = new Graph({
                vertices: {
                    a: {
                        labels: ['ab', 'vowel']
                    },
                    b: {
                        labels: ['ab', 'consonant']
                    },
                    c: {
                        labels: ['sea', 'consonant']
                    }
                }
            });

            var expected = {
                a: {
                    id: 'a',
                    labels: ['ab', 'vowel'],
                    to: [],
                    from: [],
                    data: undefined,
                    indegree: 0,
                    outdegree: 0
                },
                b: {
                    id: 'b',
                    labels: ['ab', 'consonant'],
                    to: [],
                    from: [],
                    data: undefined,
                    indegree: 0,
                    outdegree: 0
                },
                c: {
                    id: 'c',
                    labels: ['sea', 'consonant'],
                    to: [],
                    from: [],
                    data: undefined,
                    indegree: 0,
                    outdegree: 0
                }
            };

            var consonants = graph.getVertices('consonant');
            var consonantIds = graph.getVertices('consonant', true);

            var vowels = graph.getVertices('vowel');
            var vowelIds = graph.getVertices('vowel', true);

            var abs = graph.getVertices('ab');
            var abIds = graph.getVertices('ab', true);

            var seas = graph.getVertices('sea');
            var seaIds = graph.getVertices('sea', true);

            var none = graph.getVertices('none');
            var noneIds = graph.getVertices('none', true);

            expect(consonants).to.deep.equal({ b: expected.b, c: expected.c });
            expect(consonantIds).to.only.include(['b', 'c']);
            expect(vowels).to.deep.equal({ a: expected.a });
            expect(vowelIds).to.only.include(['a']);
            expect(abs).to.deep.equal({ a: expected.a, b: expected.b });
            expect(abIds).to.only.include(['a', 'b']);
            expect(seas).to.deep.equal({ c: expected.c });
            expect(seaIds).to.only.include(['c']);
            expect(none).to.deep.equal({});
            expect(noneIds).to.deep.equal([]);

            done();
        });

        it('addVertex(v, info) adds a vertex with or without info.', function (done) {

            var data = {
                b: {}
            };

            var graph = new Graph();

            graph.addVertex('a');
            graph.addVertex('b', {
                labels: ['bee'],
                data: data.b
            });

            var a = graph.getVertex('a');

            expect(a).to.deep.equal({
                id: 'a',
                labels: [],
                to: [],
                from: [],
                data: undefined,
                indegree: 0,
                outdegree: 0
            });

            var b = graph.getVertex('b');

            expect(b).to.deep.equal({
                id: 'b',
                labels: ['bee'],
                to: [],
                from: [],
                data: data.b,
                indegree: 0,
                outdegree: 0
            });

            expect(b.data).to.equal(data.b);

            done();
        });

        it('addVertex(v, info) de-dupes labels.', function (done) {

            var graph = new Graph();

            graph.addVertex('a', {
                labels: ['bee', 'bee']
            });

            var a = graph.getVertex('a');

            expect(a).to.deep.equal({
                id: 'a',
                labels: ['bee'],
                to: [],
                from: [],
                data: undefined,
                indegree: 0,
                outdegree: 0
            });

            done();
        });

        it('updateVertex(v, info) updates data and labels.', function (done) {

            var graph = new Graph({
                vertices: {
                    a: {
                        labels: ['eh', 'ay'],
                        data: 1
                    }
                }
            });

            var a = graph.getVertex('a');
            expect(a.labels).to.only.contain(['ay', 'eh']);
            expect(a.data).to.equal(1);

            graph.updateVertex('a', {
                data: 2
            });

            a = graph.getVertex('a');
            expect(a.labels).to.only.contain(['ay', 'eh']);
            expect(a.data).to.equal(2);

            graph.updateVertex('a', {
                labels: ['ahh']
            });

            a = graph.getVertex('a');
            expect(a.labels).to.only.contain(['ahh']);
            expect(a.data).to.equal(2);
            expect(Object.keys(graph.getVertices('ay'))).to.deep.equal([]);
            expect(Object.keys(graph.getVertices('eh'))).to.deep.equal([]);
            expect(Object.keys(graph.getVertices('ahh'))).to.only.contain(['a']);

            graph.updateVertex('a', {
                labels: {
                    remove: ['ahh'],
                    add: ['ayy']
                }
            });

            a = graph.getVertex('a');
            expect(a.labels).to.only.contain(['ayy']);
            expect(Object.keys(graph.getVertices('ahh'))).to.deep.equal([]);
            expect(Object.keys(graph.getVertices('ayy'))).to.only.contain(['a']);

            graph.updateVertex('a', { labels: {} });

            a = graph.getVertex('a');
            expect(a.labels).to.only.contain(['ayy']);
            expect(Object.keys(graph.getVertices('ahh'))).to.deep.equal([]);
            expect(Object.keys(graph.getVertices('ayy'))).to.only.contain(['a']);

            graph.updateVertex('a', null);

            a = graph.getVertex('a');
            expect(a.labels).to.only.contain(['ayy']);
            expect(a.data).to.equal(2);
            expect(Object.keys(graph.getVertices('ahh'))).to.deep.equal([]);
            expect(Object.keys(graph.getVertices('ayy'))).to.only.contain(['a']);

            graph.updateVertex('a', {
                labels: {
                    add: ['add-last'],
                    remove: ['add-last']
                }
            });

            a = graph.getVertex('a');
            expect(a.labels).to.only.contain(['ayy', 'add-last']);

            done();
        });

        it('removeVertex(v) removes vertex and related edges from digraph.', function (done) {

            var graph = new Graph({
                directed: true,
                vertices: {
                    a: ['b', 'a'],
                    b: ['a', 'c']
                }
            });

            graph.removeVertex('a');

            var vertices = graph.getVertices();
            expect(Object.keys(vertices)).to.only.include(['b', 'c']);

            expect(vertices.b.from).to.deep.equal([]);
            expect(vertices.b.to).to.deep.equal(['c']);
            expect(vertices.c.from).to.deep.equal(['b']);
            expect(vertices.c.to).to.deep.equal([]);

            var edges = graph.getEdges();

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['b', 'c'], weight: 1, labels: [] }
            ]));

            done();
        });

        it('removeVertex(v) removes vertex and related edges from non-digraph.', function (done) {

            var graph = new Graph({
                directed: false,
                vertices: {
                    a: ['b', 'a'],
                    b: ['c']
                }
            });

            graph.removeVertex('a');

            var vertices = graph.getVertices();
            expect(Object.keys(vertices)).to.only.include(['b', 'c']);

            expect(vertices.b.from).to.deep.equal(['c']);
            expect(vertices.b.to).to.deep.equal(['c']);
            expect(vertices.c.from).to.deep.equal(['b']);
            expect(vertices.c.to).to.deep.equal(['b']);

            var edges = graph.getEdges();

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['b', 'c'], weight: 1, labels: [] }
            ]));

            done();
        });

        it('removeVertex(v) removes vertex from label lookup.', function (done) {

            var graph = new Graph({
                vertices: {
                    a: {
                        labels: ['eh']
                    }
                }
            });

            // Spoof a bad edge unlabeling to show it's a no-op
            graph._unlabelVertex('a', 'non');
            expect(graph.getVertices('eh')).to.only.include('a');

            graph.removeVertex('a');

            expect(graph.getVertices('eh')).to.deep.equal({});

            done();
        });

        it('removeVertices() without arguments removes all vertices.', function (done) {

            var graph = new Graph({
                vertices: {
                    a: ['b', 'c'],
                    b: ['c']
                }
            });

            graph.removeVertices();

            expect(graph.getVertices()).to.deep.equal({});
            expect(graph.getEdges()).to.deep.equal([]);

            done();
        });

        it('removeVertices(array) removes specified vertices.', function (done) {

            var graph = new Graph({
                vertices: {
                    a: ['b', 'c'],
                    b: ['c']
                }
            });

            graph.removeVertices(['a', 'b']);

            var vertices = graph.getVertices();

            expect(Object.keys(vertices)).to.deep.equal(['c']);
            expect(graph.getEdges()).to.deep.equal([]);

            done();
        });

        it('removeVertices(label) removes vertices by label.', function (done) {

            var graph = new Graph({
                vertices: {
                    a: {
                        labels: 'ab',
                        to: ['b', 'c']
                    },
                    b: {
                        labels: 'ab',
                        to: ['c']
                    }
                }
            });

            graph.removeVertices('none');

            var vertices = graph.getVertices();

            expect(Object.keys(vertices)).to.only.contain(['a', 'b', 'c']);

            graph.removeVertices('ab');

            vertices = graph.getVertices();

            expect(Object.keys(vertices)).to.only.contain(['c']);
            expect(graph.getEdges()).to.deep.equal([]);

            done();
        });

        it('edgeExists(u, v) and edgeExists([u, v]) indicate whether an edge exists in a graph.', function (done) {

            var digraph = new Graph({
                directed: true,
                edges: [
                    ['a', 'b'],
                    ['b', 'a'],
                    ['b', 'c'],
                    ['b', 'b']
                ]
            });

            var nondigraph = new Graph({
                directed: false,
                edges: [
                    ['a', 'b'],
                    ['b', 'b']
                ]
            });

            expect(digraph.edgeExists('a', 'b')).to.equal(true);
            expect(digraph.edgeExists('b', 'a')).to.equal(true);
            expect(digraph.edgeExists('b', 'c')).to.equal(true);
            expect(digraph.edgeExists('b', 'b')).to.equal(true);
            expect(digraph.edgeExists('c', 'b')).to.equal(false);

            expect(digraph.edgeExists(['a', 'b'])).to.equal(true);
            expect(digraph.edgeExists(['c', 'b'])).to.equal(false);

            expect(nondigraph.edgeExists('a', 'b')).to.equal(true);
            expect(nondigraph.edgeExists('b', 'a')).to.equal(true);
            expect(nondigraph.edgeExists('b', 'b')).to.equal(true);

            done();
        });

        it('getEdge(u, v) and getEdge([u, v]) returns the specified edge or null if no match.', function (done) {

            var graph = new Graph({
                edges: [
                    { pair: ['a', 'b'], weight: 2, labels: ['ab'] }
                ]
            });

            var edgeByList = graph.getEdge('a', 'b');
            var edgeByArr = graph.getEdge(['a', 'b']);
            var expected = { pair: ['a', 'b'], weight: 2, labels: ['ab'] };

            expect(edgeByList).to.deep.equal(expected);
            expect(edgeByArr).to.deep.equal(expected);

            var nonEdgeOne = graph.getEdge('a', 'c');
            var nonEdgeTwo = graph.getEdge('b', 'a');

            expect(nonEdgeOne).to.equal(null);
            expect(nonEdgeTwo).to.equal(null);

            done();
        });

        it('getEdge() is orderless in non-digraphs.', function (done) {

            var graph = new Graph({
                directed: false,
                edges: [
                    { pair: ['a', 'b'], weight: 2, labels: ['ab'] }
                ]
            });

            var edgeAB = graph.getEdge('a', 'b');
            var edgeBA = graph.getEdge('b', 'a');
            var expectedAB = { pair: ['a', 'b'], weight: 2, labels: ['ab'] };
            var expectedBA = { pair: ['b', 'a'], weight: 2, labels: ['ab'] };

            expect(edgeAB).to.deep.equal(expectedAB);
            expect(edgeBA).to.deep.equal(expectedBA);

            done();
        });

        it('getEdges(null, [onlyPairs]) returns all edges.', function (done) {

            var graph = new Graph({
                edges: [
                    ['a', 'b'],
                    ['b', 'c'],
                    ['c', 'a'],
                    ['b', 'a']
                ]
            });

            var edges = graph.getEdges();
            var edgePairs = graph.getEdges(null, true);

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 1, labels: [] },
                { pair: ['b', 'c'], weight: 1, labels: [] },
                { pair: ['c', 'a'], weight: 1, labels: [] },
                { pair: ['b', 'a'], weight: 1, labels: [] }
            ]));

            expect(edgePairs).to.deep.equal([
                ['a', 'b'],
                ['b', 'c'],
                ['b', 'a'],
                ['c', 'a']
            ]);

            done();
        });

        it('getEdges(array, [onlyPairs]) returns specified edges, ignores non-edges.', function (done) {

            var graph = new Graph({
                edges: [
                    ['a', 'b'],
                    ['b', 'c'],
                    ['c', 'a'],
                    ['b', 'a']
                ]
            });

            var edges = graph.getEdges([['a', 'b'], ['c', 'a'], ['c', 'b']]);
            var edgePairs = graph.getEdges([['a', 'b'], ['c', 'a'], ['c', 'b']], true);

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 1, labels: [] },
                { pair: ['c', 'a'], weight: 1, labels: [] }
            ]));

            expect(edgePairs).to.deep.equal([
                ['a', 'b'],
                ['c', 'a']
            ]);

            done();
        });

        it('getEdges(label, [onlyPairs]) returns edges by label.', function (done) {

            var graph = new Graph({
                edges: [
                    { pair: ['a', 'b'], labels: ['tall'] },
                    { pair: ['b', 'c'], labels: ['tall', 'cold'] },
                    { pair: ['c', 'a'], labels: ['short'] },
                    { pair: ['b', 'a'], labels: ['short'] }
                ]
            });

            var tall = graph.getEdges('tall');
            var tallPairs = graph.getEdges('tall', true);

            var cold = graph.getEdges('cold');
            var coldPairs = graph.getEdges('cold', true);

            var short = graph.getEdges('short');
            var shortPairs = graph.getEdges('short', true);

            var non = graph.getEdges('non');
            var nonPairs = graph.getEdges('non', true);

            expect(edgeFormat(tall)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 1, labels: ['tall'] },
                { pair: ['b', 'c'], weight: 1, labels: ['tall', 'cold'] }
            ]));
            expect(tallPairs).to.deep.equal([
                ['a', 'b'],
                ['b', 'c']
            ]);

            expect(edgeFormat(cold)).to.deep.equal(edgeFormat([
                { pair: ['b', 'c'], weight: 1, labels: ['tall', 'cold'] }
            ]));
            expect(coldPairs).to.deep.equal([
                ['b', 'c']
            ]);

            expect(edgeFormat(short)).to.deep.equal(edgeFormat([
                { pair: ['c', 'a'], weight: 1, labels: ['short'] },
                { pair: ['b', 'a'], weight: 1, labels: ['short'] }
            ]));
            expect(shortPairs).to.deep.equal([
                ['c', 'a'],
                ['b', 'a']
            ]);

            expect(non).to.deep.equal([]);
            expect(nonPairs).to.deep.equal([]);

            done();
        });

        it('getEdges() is orderless in non-digraphs.', function (done) {

            var graph = new Graph({
                directed: false,
                edges: [
                    ['a', 'b'],
                    ['b', 'c']
                ]
            });

            var edges = graph.getEdges();
            var edgePairs = graph.getEdges(null, true);

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 1, labels: [] },
                { pair: ['b', 'c'], weight: 1, labels: [] }
            ]));

            expect(edgePairs).to.deep.equal([
                ['a', 'b'],
                ['b', 'c']
            ]);

            done();
        });

        it('getEdges() returns unique, existing edges in non-digraphs.', function (done) {

            var graph = new Graph({
                directed: false,
                edges: [
                    ['a', 'b'],
                    ['b', 'c']
                ]
            });

            var query = [['b', 'a'], ['b', 'a'], ['b', 'd'], ['a', 'b']];

            var edges = graph.getEdges(query);
            var edgePairs = graph.getEdges(query, true);

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['b', 'a'], weight: 1, labels: [] }
            ]));

            expect(edgePairs).to.deep.equal([
                ['b', 'a']
            ]);

            done();
        });

        it('getEdges() returns unique, existing edges in digraphs.', function (done) {

            var graph = new Graph({
                directed: true,
                edges: [
                    ['a', 'b'],
                    ['b', 'c']
                ]
            });

            var query = [['a', 'b'], ['b', 'd'], ['a', 'b']];

            var edges = graph.getEdges(query);
            var edgePairs = graph.getEdges(query, true);

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 1, labels: [] }
            ]));

            expect(edgePairs).to.deep.equal([
                ['a', 'b']
            ]);

            done();
        });

        it('addEdge(u, v, info) adds an edge to a digraph.', function (done) {

            var graph = new Graph({
                directed: true,
                vertices: ['a', 'b']
            });

            graph.addEdge('a', 'b', {
                weight: 2,
                labels: ['ab']
            });

            graph.addEdge('b', 'a', {
                weight: -1,
                labels: ['ba']
            });

            var edges = graph.getEdges();

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 2, labels: ['ab'] },
                { pair: ['b', 'a'], weight: -1, labels: ['ba'] }
            ]));

            done();
        });

        it('addEdge(u, v, info) adds an edge to a non-digraph.', function (done) {

            var graph = new Graph({
                directed: false,
                vertices: ['a', 'b']
            });

            graph.addEdge('a', 'b', {
                weight: 2,
                labels: ['ab']
            });

            var edges = graph.getEdges();

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 2, labels: ['ab'] }
            ]));

            var edgeBA = graph.getEdge('b', 'a');

            expect(edgeFormat([edgeBA])).to.deep.equal(edgeFormat([
                { pair: ['b', 'a'], weight: 2, labels: ['ab'] }
            ]));

            done();
        });

        it('addEdge(pair, info) adds an edge to a graph.', function (done) {

            var graph = new Graph({
                vertices: ['a', 'b']
            });

            graph.addEdge(['a', 'b'], {
                weight: 2,
                labels: ['ab']
            });

            graph.addEdge(['b', 'a'], {
                weight: -1,
                labels: ['ba']
            });

            var edges = graph.getEdges();

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 2, labels: ['ab'] },
                { pair: ['b', 'a'], weight: -1, labels: ['ba'] }
            ]));

            done();
        });

        it('addEdge() de-dupes labels.', function (done) {

            var graph = new Graph({ vertices: ['a', 'b'] });

            graph.addEdge('a', 'b', { labels: ['dupe', 'dupe'] });

            var edge = graph.getEdge('a', 'b');

            expect(edge).to.deep.equal({
                pair: ['a', 'b'],
                weight: 1,
                labels: ['dupe']
            });

            done();
        });

        it('updateEdge(u, v, info) updates weight and labels on digraphs.', function (done) {

            var graph = new Graph({
                directed: true,
                edges: [
                    { pair: ['a', 'b'], weight: -1, labels: ['ay', 'eh'] }
                ]
            });

            var ab = graph.getEdge('a', 'b');
            expect(ab.labels).to.only.contain(['ay', 'eh']);
            expect(ab.weight).to.equal(-1);

            graph.updateEdge('a', 'b', {
                weight: 2
            });

            ab = graph.getEdge('a', 'b');
            expect(ab.labels).to.only.contain(['ay', 'eh']);
            expect(ab.weight).to.equal(2);

            graph.updateEdge('a', 'b', {
                labels: ['ahh']
            });

            ab = graph.getEdge('a', 'b');
            expect(ab.labels).to.only.contain(['ahh']);
            expect(ab.weight).to.equal(2);
            expect(graph.getEdges('ay')).to.deep.equal([]);
            expect(graph.getEdges('eh')).to.deep.equal([]);
            expect(edgeFormat(graph.getEdges('ahh')).a.b).to.exist();

            graph.updateEdge('a', 'b', {
                labels: {
                    remove: ['ahh'],
                    add: ['ayy']
                }
            });

            ab = graph.getEdge('a', 'b');
            expect(ab.labels).to.only.contain(['ayy']);
            expect(graph.getEdges('ahh')).to.deep.equal([]);
            expect(edgeFormat(graph.getEdges('ayy')).a.b).to.exist();

            graph.updateEdge('a', 'b', { labels: {} });

            ab = graph.getEdge('a', 'b');
            expect(ab.labels).to.only.contain(['ayy']);
            expect(graph.getEdges('ahh')).to.deep.equal([]);
            expect(edgeFormat(graph.getEdges('ayy')).a.b).to.exist();

            graph.updateEdge('a', 'b', null);

            ab = graph.getEdge('a', 'b');
            expect(ab.labels).to.only.contain(['ayy']);
            expect(ab.weight).to.equal(2);
            expect(graph.getEdges('ahh')).to.deep.equal([]);
            expect(edgeFormat(graph.getEdges('ayy')).a.b).to.exist();

            graph.updateEdge('a', 'b', {
                labels: {
                    add: ['add-last'],
                    remove: ['add-last']
                }
            });

            ab = graph.getEdge('a', 'b');
            expect(ab.labels).to.only.contain(['ayy', 'add-last']);
            expect(edgeFormat(graph.getEdges('add-last')).a.b).to.exist();

            var a = graph.getVertex('a');
            var b = graph.getVertex('b');
            expect(a.outdegree).to.equal(1);
            expect(a.indegree).to.equal(0);
            expect(b.outdegree).to.equal(0);
            expect(b.indegree).to.equal(1);

            done();
        });

        it('updateEdge(u, v, info) updates weight and labels on non-digraphs.', function (done) {

            var graph = new Graph({
                directed: false,
                edges: [
                    { pair: ['a', 'b'], weight: -1, labels: ['ay', 'eh'] }
                ]
            });

            var ab = graph.getEdge('a', 'b');
            var ba = graph.getEdge('b', 'a');
            expect(ab.labels).to.only.contain(['ay', 'eh']);
            expect(ab.weight).to.equal(-1);
            expect(ba.labels).to.only.contain(['ay', 'eh']);
            expect(ba.weight).to.equal(-1);

            graph.updateEdge('b', 'a', {
                weight: 2,
                labels: {
                    remove: 'eh',
                    add: 'ah'
                }
            });

            ab = graph.getEdge('a', 'b');
            ba = graph.getEdge('b', 'a');
            expect(ab.labels).to.only.contain(['ay', 'ah']);
            expect(ab.weight).to.equal(2);
            expect(ba.labels).to.only.contain(['ay', 'ah']);
            expect(ba.weight).to.equal(2);

            var a = graph.getVertex('a');
            var b = graph.getVertex('b');
            expect(a.degree).to.equal(1);
            expect(b.degree).to.equal(1);

            done();
        });

        it('updateEdge([u, v], info) updates weight and labels on graphs.', function (done) {

            var graph = new Graph({
                edges: [
                    { pair: ['a', 'b'], weight: -1, labels: ['ay', 'eh'] }
                ]
            });

            var ab = graph.getEdge('a', 'b');
            expect(ab.labels).to.only.contain(['ay', 'eh']);
            expect(ab.weight).to.equal(-1);

            graph.updateEdge(['a', 'b'], {
                weight: 2,
                labels: {
                    remove: 'eh',
                    add: 'ah'
                }
            });

            ab = graph.getEdge('a', 'b');
            expect(ab.labels).to.only.contain(['ay', 'ah']);
            expect(ab.weight).to.equal(2);

            done();
        });

        it('removeEdge(a, b) removes an edge from a digraph.', function (done) {

            var graph = new Graph({
                directed: true,
                edges: [
                    ['a', 'b'],
                    ['b', 'a']
                ]
            });

            graph.removeEdge('a', 'b');

            var edges = graph.getEdges();

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['b', 'a'], weight: 1, labels: [] }
            ]));

            done();
        });

        it('removeEdge(a, b) removes an edge from a non-digraph.', function (done) {

            var graph = new Graph({
                directed: false,
                edges: [
                    ['a', 'b']
                ]
            });

            graph.removeEdge('b', 'a');

            var edges = graph.getEdges();

            expect(edges).to.deep.equal([]);

            done();
        });

        it('removeEdge(pair) removes an edge from a graph.', function (done) {

            var graph = new Graph({
                edges: [
                    ['a', 'b'],
                    ['b', 'a']
                ]
            });

            graph.removeEdge(['a', 'b']);

            var edges = graph.getEdges();

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['b', 'a'], weight: 1, labels: [] }
            ]));

            done();
        });

        it('removeEdge(a, b) removes an edge from label lookup.', function (done) {

            var graph = new Graph({
                edges: [
                    { pair: ['a', 'b'], labels: ['a'] },
                    { pair: ['a', 'c'], labels: ['a'] }
                ]
            });

            graph.removeEdge('a', 'b');

            var a = graph.getEdges('a');

            expect(edgeFormat(a)).to.deep.equal(edgeFormat([
                { pair: ['a', 'c'], weight: 1, labels: ['a'] }
            ]));

            // Spoof a bad edge unlabeling to show it's a no-op
            graph._unlabelEdge('a', 'c', ['b']);
            a = graph.getEdges('a');

            expect(edgeFormat(a)).to.deep.equal(edgeFormat([
                { pair: ['a', 'c'], weight: 1, labels: ['a'] }
            ]));

            done();
        });

        it('removeEdges() without arguments removes all edges.', function (done) {

            var graph = new Graph({
                edges: [
                    ['a', 'b'],
                    ['b', 'a'],
                    ['a', 'c']
                ]
            });

            graph.removeEdges();

            var edges = graph.getEdges();
            expect(edges).to.deep.equal([]);

            var vertexList = Object.keys(graph.getVertices());
            expect(vertexList).to.deep.equal(['a', 'b', 'c']);

            done();
        });

        it('removeEdges(array) removes specified edges.', function (done) {

            var graph = new Graph({
                edges: [
                    ['a', 'b'],
                    ['b', 'a'],
                    ['a', 'c']
                ]
            });

            graph.removeEdges([['a', 'b'], ['a', 'c']]);

            var edges = graph.getEdges();
            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['b', 'a'], weight: 1, labels: [] }
            ]));

            var vertexList = Object.keys(graph.getVertices());
            expect(vertexList).to.deep.equal(['a', 'b', 'c']);

            done();
        });

        it('removeEdges(label) removes edges by label.', function (done) {

            var graph = new Graph({
                edges: [
                    { pair: ['a', 'b'], labels: ['a'] },
                    ['b', 'a'],
                    { pair: ['a', 'c'], labels: ['a'] }
                ]
            });

            graph.removeEdges('a');

            var edges = graph.getEdges();
            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['b', 'a'], weight: 1, labels: [] }
            ]));

            var vertexList = Object.keys(graph.getVertices());
            expect(vertexList).to.deep.equal(['a', 'b', 'c']);

            done();
        });

        it('size() returns the size of a non-digraph or digraph.', function (done) {

            var digraph = new Graph({
                directed: true,
                edges: [
                    ['a', 'b'],
                    ['b', 'a'],
                    ['b', 'c'],
                    ['b', 'b']
                ]
            });

            digraph.addEdge('c', 'a');
            digraph.addEdge('c', 'b');
            digraph.removeEdge('a', 'b');
            digraph.updateEdge('c', 'a', {});

            var nondigraph = new Graph({
                directed: false,
                edges: [
                    ['a', 'b'],
                    ['b', 'c'],
                    ['b', 'b']
                ]
            });

            nondigraph.removeEdge('a', 'b');
            nondigraph.removeEdge('b', 'c');
            nondigraph.addEdge('c', 'a');
            nondigraph.updateEdge('b', 'b', {});

            expect(digraph.size()).to.equal(5);
            expect(nondigraph.size()).to.equal(2);

            done();
        });

        it('order() returns the order of a graph.', function (done) {

            var digraph = new Graph({
                vertices: ['a', 'd']
            });

            digraph.addVertex('c');
            digraph.addVertex('b');
            digraph.removeVertex('a');
            digraph.updateVertex('c', { data: [] });

            expect(digraph.order()).to.equal(3);

            done();
        });

        it('equals(graph) says digraphs and non-digraphs are not equal.', function (done) {

            var graph = new Graph({ directed: false });
            var digraph = new Graph({ directed: true });

            expect(graph.equals(digraph)).to.equal(false);
            expect(digraph.equals(graph)).to.equal(false);

            done();
        });

        it('equals(graph) compares two digraphs, optionally with edge weights.', function (done) {

            var graphAOne = new Graph({
                directed: true,
                edges: [
                    { pair: ['a', 'b'], weight: 2 },
                    { pair: ['b', 'a'], weight: 1 },
                    { pair: ['b', 'c'], weight: -1 }
                ]
            });

            var graphATwo = new Graph({
                directed: true,
                edges: [
                    { pair: ['b', 'c'], weight: -1 },
                    { pair: ['a', 'b'], weight: 2 },
                    { pair: ['b', 'a'], weight: 1 }
                ]
            });

            var graphB = new Graph({
                directed: true,
                edges: [
                    { pair: ['a', 'b'], weight: 2 },
                    { pair: ['b', 'a'], weight: 10 },
                    { pair: ['b', 'c'], weight: -1 }
                ]
            });

            var graphC = new Graph({
                directed: true,
                vertices: ['d'],
                edges: [
                    { pair: ['a', 'b'], weight: 2 },
                    { pair: ['b', 'a'], weight: 1 },
                    { pair: ['b', 'c'], weight: -1 }
                ]
            });

            expect(graphAOne.equals(graphATwo)).to.equal(true);
            expect(graphATwo.equals(graphAOne)).to.equal(true);
            expect(graphAOne.equals(graphATwo, true)).to.equal(true);
            expect(graphATwo.equals(graphAOne, true)).to.equal(true);

            // Ignoring weights
            expect(graphAOne.equals(graphB)).to.equal(true);
            // Bad vertex set
            expect(graphAOne.equals(graphC)).to.equal(false);
            // Bad weight
            expect(graphAOne.equals(graphB, true)).to.equal(false);
            // Still bad vertex set
            expect(graphAOne.equals(graphC, true)).to.equal(false);

            done();
        });

        it('equals(graph) compares two non-digraphs, optionally with edge weights.', function (done) {

            var graphAOne = new Graph({
                directed: false,
                edges: [
                    { pair: ['a', 'b'], weight: 2 },
                    { pair: ['b', 'c'], weight: -1 }
                ]
            });

            var graphATwo = new Graph({
                directed: false,
                edges: [
                    { pair: ['b', 'c'], weight: -1 },
                    { pair: ['a', 'b'], weight: 2 }
                ]
            });

            var graphB = new Graph({
                directed: false,
                edges: [
                    { pair: ['a', 'b'], weight: 2 },
                    { pair: ['b', 'c'], weight: -10 }
                ]
            });

            var graphC = new Graph({
                directed: false,
                vertices: ['d'],
                edges: [
                    { pair: ['a', 'b'], weight: 2 },
                    { pair: ['b', 'c'], weight: -1 }
                ]
            });

            expect(graphAOne.equals(graphATwo)).to.equal(true);
            expect(graphATwo.equals(graphAOne)).to.equal(true);
            expect(graphAOne.equals(graphATwo, true)).to.equal(true);
            expect(graphATwo.equals(graphAOne, true)).to.equal(true);

            // Ignoring weights
            expect(graphAOne.equals(graphB)).to.equal(true);
            // Bad vertex set
            expect(graphAOne.equals(graphC)).to.equal(false);
            // Bad weight
            expect(graphAOne.equals(graphB, true)).to.equal(false);
            // Still bad vertex set
            expect(graphAOne.equals(graphC, true)).to.equal(false);

            done();
        });

        it('subgraph(subset) returns a new graph, a subset of the original.', function (done) {

            var data = {
                a: {},
                b: []
            };

            var graph = new Graph({
                vertices: {
                    a: {
                        to: ['c', 'd'],
                        data: data.a,
                        labels: ['ay', 'eh']
                    },
                    b: {
                        to: ['a'],
                        data: data.b,
                        labels: ['bee']
                    },
                    c: ['a', 'b'],
                    d: []
                },
                edges: [
                    { pair: ['a', 'b'], weight: 2, labels: ['ab'] }
                ]
            });

            var subset = {
                vertices: ['a', 'b', 'c'],
                edges: [['a', 'b'], ['c', 'b']]
            };

            var subgraph = graph.subgraph(subset);

            expect(subgraph).to.not.equal(graph);

            var vertices = subgraph.getVertices();
            var expected = {
                a: {
                    id: 'a',
                    labels: ['ay', 'eh'],
                    to: ['b'],
                    from: [],
                    data: data.a,
                    indegree: 0,
                    outdegree: 1
                },
                b: {
                    id: 'b',
                    labels: ['bee'],
                    to: [],
                    from: ['a', 'c'],
                    data: data.b,
                    indegree: 2,
                    outdegree: 0
                },
                c: {
                    id: 'c',
                    labels: [],
                    to: ['b'],
                    from: [],
                    data: undefined,
                    indegree: 0,
                    outdegree: 1
                }
            };

            expect(vertices).to.deep.equal(expected);
            expect(vertices.a.data).to.equal(data.a);
            expect(vertices.b.data).to.equal(data.b);

            var edges = subgraph.getEdges();

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 2, labels: ['ab'] },
                { pair: ['c', 'b'], weight: 1, labels: [] }
            ]));

            done();
        });

        it('subgraph(subset) with missing vertices assumes none.', function (done) {

            var graph = new Graph({
                edges: [
                    ['a', 'b'],
                    ['b', 'a'],
                    ['a', 'c']
                ]
            });

            var subgraph = graph.subgraph({
                edges: [['a', 'b']]
            });

            var vertices = subgraph.getVertices();
            expect(Object.keys(vertices)).to.deep.equal(['a', 'b']);

            done();
        });

        it('subgraph(subset) with missing edges assumes none.', function (done) {

            var graph = new Graph({
                edges: [
                    ['a', 'b'],
                    ['b', 'a'],
                    ['a', 'c']
                ]
            });

            var subgraph = graph.subgraph({
                vertices: ['a', 'b', 'c']
            });

            var edges = subgraph.getEdges();
            expect(edges).to.deep.equal([]);

            var vertices = subgraph.getVertices();
            expect(Object.keys(vertices)).to.deep.equal(['a', 'b', 'c']);

            done();
        });

        it('snapshot() creates a perfect copy of a digraph.', function (done) {

            var data = {
                a: {},
                b: []
            };

            var graph = new Graph({
                directed: true,
                vertices: {
                    a: {
                        to: ['c', 'd'],
                        data: data.a,
                        labels: ['ay', 'eh']
                    },
                    b: {
                        to: ['a'],
                        data: data.b,
                        labels: ['bee']
                    },
                    c: ['a', 'b'],
                    d: []
                },
                edges: [
                    { pair: ['a', 'b'], weight: 2, labels: ['ab'] }
                ]
            });

            var snapshot = graph.snapshot();

            expect(graph).to.not.equal(snapshot);

            var origVertices = graph.getVertices();
            var origEdges = graph.getEdges();
            var snapVertices = snapshot.getVertices();
            var snapEdges = snapshot.getEdges();

            expect(vertexFormat(origVertices)).to.deep.equal(vertexFormat(snapVertices));
            expect(origVertices.a.data).to.equal(snapVertices.a.data);
            expect(origVertices.b.data).to.equal(snapVertices.b.data);

            expect(edgeFormat(origEdges)).to.deep.equal(edgeFormat(snapEdges));

            done();
        });

        it('snapshot() creates a perfect copy of a non-digraph.', function (done) {

            var data = {
                a: {},
                b: []
            };

            var graph = new Graph({
                directed: false,
                vertices: {
                    a: {
                        to: ['c', 'd'],
                        data: data.a,
                        labels: ['ay', 'eh']
                    },
                    b: {
                        data: data.b,
                        labels: ['bee']
                    },
                    c: ['b'],
                    d: []
                },
                edges: [
                    { pair: ['a', 'b'], weight: 2, labels: ['ab'] }
                ]
            });

            var snapshot = graph.snapshot();

            expect(graph).to.not.equal(snapshot);

            var origVertices = graph.getVertices();
            var origEdges = graph.getEdges();
            var snapVertices = snapshot.getVertices();
            var snapEdges = snapshot.getEdges();

            expect(vertexFormat(origVertices)).to.deep.equal(vertexFormat(snapVertices));
            expect(origVertices.a.data).to.equal(snapVertices.a.data);
            expect(origVertices.b.data).to.equal(snapVertices.b.data);

            expect(edgeFormat(origEdges)).to.deep.equal(edgeFormat(snapEdges));

            done();
        });

        it('complement() constructs a digraph complement, preserving self-loops.', function (done) {

            var data = {
                a: {},
                b: []
            };

            var graph = new Graph({
                directed: true,
                vertices: {
                    a: { to: ['a', 'b', 'c'], labels: ['ay', 'eh'], data: data.a },
                    b: { to: ['c'], labels: ['bee'] , data: data.b },
                    c: ['a', 'b'],
                    d: [],
                    e: []
                }
            });

            var complement = graph.complement();

            expect(complement).to.be.instanceof(Graph);
            expect(complement.directed).to.equal(true);

            var origVertices = graph.getVertices();
            var vertices = complement.getVertices();
            var edges = complement.getEdges();

            expect(Object.keys(vertices)).to.only.include(['a', 'b', 'c', 'd', 'e']);

            expect(vertices.a.labels).to.deep.equal(origVertices.a.labels);
            expect(vertices.a.data).to.equal(origVertices.a.data);
            expect(vertices.b.labels).to.deep.equal(origVertices.b.labels);
            expect(vertices.b.data).to.equal(origVertices.b.data);
            expect(vertices.c.labels).to.deep.equal(origVertices.c.labels);
            expect(vertices.c.data).to.equal(origVertices.c.data);
            expect(vertices.d.labels).to.deep.equal(origVertices.d.labels);
            expect(vertices.d.data).to.equal(origVertices.d.data);
            expect(vertices.e.labels).to.deep.equal(origVertices.e.labels);
            expect(vertices.e.data).to.equal(origVertices.e.data);

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'a'], weight: 1, labels: [] },
                { pair: ['a', 'd'], weight: 1, labels: [] },
                { pair: ['a', 'e'], weight: 1, labels: [] },
                { pair: ['b', 'a'], weight: 1, labels: [] },
                { pair: ['b', 'd'], weight: 1, labels: [] },
                { pair: ['b', 'e'], weight: 1, labels: [] },
                { pair: ['c', 'd'], weight: 1, labels: [] },
                { pair: ['c', 'e'], weight: 1, labels: [] },
                { pair: ['d', 'a'], weight: 1, labels: [] },
                { pair: ['d', 'b'], weight: 1, labels: [] },
                { pair: ['d', 'c'], weight: 1, labels: [] },
                { pair: ['d', 'e'], weight: 1, labels: [] },
                { pair: ['e', 'a'], weight: 1, labels: [] },
                { pair: ['e', 'b'], weight: 1, labels: [] },
                { pair: ['e', 'c'], weight: 1, labels: [] },
                { pair: ['e', 'd'], weight: 1, labels: [] }
            ]));

            done();
        });

        it('complement() constructs a non-digraph complement, preserving self-loops.', function (done) {

            var data = {
                a: {},
                b: []
            };

            var graph = new Graph({
                directed: false,
                vertices: {
                    a: { to: ['a', 'b', 'c'], labels: ['ay', 'eh'], data: data.a },
                    b: { to: ['c'], labels: ['bee'] , data: data.b },
                    c: [],
                    d: [],
                    e: []
                }
            });

            var complement = graph.complement();

            expect(complement).to.be.instanceof(Graph);
            expect(complement.directed).to.equal(false);

            var origVertices = graph.getVertices();
            var vertices = complement.getVertices();
            var edges = complement.getEdges();

            expect(Object.keys(vertices)).to.only.include(['a', 'b', 'c', 'd', 'e']);

            expect(vertices.a.labels).to.deep.equal(origVertices.a.labels);
            expect(vertices.a.data).to.equal(origVertices.a.data);
            expect(vertices.b.labels).to.deep.equal(origVertices.b.labels);
            expect(vertices.b.data).to.equal(origVertices.b.data);
            expect(vertices.c.labels).to.deep.equal(origVertices.c.labels);
            expect(vertices.c.data).to.equal(origVertices.c.data);
            expect(vertices.d.labels).to.deep.equal(origVertices.d.labels);
            expect(vertices.d.data).to.equal(origVertices.d.data);
            expect(vertices.e.labels).to.deep.equal(origVertices.e.labels);
            expect(vertices.e.data).to.equal(origVertices.e.data);

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'a'], labels: [], weight: 1 },
                { pair: ['a', 'd'], labels: [], weight: 1 },
                { pair: ['a', 'e'], labels: [], weight: 1 },
                { pair: ['d', 'b'], labels: [], weight: 1 },
                { pair: ['d', 'c'], labels: [], weight: 1 },
                { pair: ['d', 'e'], labels: [], weight: 1 },
                { pair: ['e', 'b'], labels: [], weight: 1 },
                { pair: ['e', 'c'], labels: [], weight: 1 }
            ]));

            done();
        });

        it('transpose() constructs a digraph transpose.', function (done) {

            var data = {
                a: {},
                b: []
            };

            var graph = new Graph({
                directed: true,
                vertices: {
                    a: {
                        labels: ['eh', 'ay'],
                        data: data.a
                    },
                    b: {
                        labels: ['bee'],
                        data: data.b
                    },
                    c: {},
                    d: {}
                },
                edges: [
                    { pair: ['a', 'a'], weight: 1, labels: [] },
                    { pair: ['a', 'b'], weight: 2, labels: ['hasA', 'first'] },
                    { pair: ['b', 'c'], weight: -1, labels: [] },
                    { pair: ['c', 'a'], weight: 1, labels: ['hasA'] }
                ]
            });

            var transpose = graph.transpose();

            var origVertices = graph.getVertices();
            var vertices = transpose.getVertices();
            var edges = transpose.getEdges();

            expect(Object.keys(vertices)).to.only.include(['a', 'b', 'c', 'd']);

            expect(vertices.a.labels).to.deep.equal(origVertices.a.labels);
            expect(vertices.a.data).to.equal(origVertices.a.data);
            expect(vertices.b.labels).to.deep.equal(origVertices.b.labels);
            expect(vertices.b.data).to.equal(origVertices.b.data);
            expect(vertices.c.labels).to.deep.equal(origVertices.c.labels);
            expect(vertices.c.data).to.equal(origVertices.c.data);
            expect(vertices.d.labels).to.deep.equal(origVertices.d.labels);
            expect(vertices.d.data).to.equal(origVertices.d.data);

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'a'], weight: 1, labels: [] },
                { pair: ['b', 'a'], weight: 2, labels: ['hasA', 'first'] },
                { pair: ['c', 'b'], weight: -1, labels: [] },
                { pair: ['a', 'c'], weight: 1, labels: ['hasA'] }
            ]));

            done();
        });

        it('union(graph) constructs a digraph union.', function (done) {

            var graphA = new Graph({
                directed: true,
                vertices: {
                    a: {
                        labels: ['ay'],
                        data: { A: true }
                    },
                    b: {
                        data: ['A']
                    },
                    d: {
                        data: 0
                    }
                },
                edges: [
                    { pair: ['a', 'b'], weight: 2, labels: ['ab1'] },
                    ['b', 'd'],
                    ['a', 'a']
                ]
            });

            var graphB = new Graph({
                directed: true,
                vertices: {
                    a: {
                        labels: ['eh'],
                        data: { B: true }
                    },
                    b: {
                        data: ['B']
                    },
                    c: {
                        data: 1
                    }
                },
                edges: [
                    { pair: ['a', 'b'], weight: 3, labels: ['ab2'] },
                    ['b', 'a']
                ]
            });

            var unionA = graphA.union(graphB);
            var unionB = graphB.union(graphA);

            var verticesA = unionA.getVertices();
            var edgesA = unionA.getEdges();
            var edgesB = unionB.getEdges();

            expect(unionA.equals(unionB)).to.equal(true);

            expect(verticesA).to.deep.equal({
                a: {
                    id: 'a',
                    labels: ['eh', 'ay'],
                    to: ['b', 'a'],
                    from: ['a', 'b'],
                    data: { A: true, B: true },
                    indegree: 2,
                    outdegree: 2
                },
                b: {
                    id: 'b',
                    labels: [],
                    to: ['a', 'd'],
                    from: ['a'],
                    data: ['B', 'A'],
                    indegree: 1,
                    outdegree: 2
                },
                c: {
                    id: 'c',
                    labels: [],
                    to: [],
                    from: [],
                    data: 1,
                    indegree: 0,
                    outdegree: 0
                },
                d: {
                    id: 'd',
                    labels: [],
                    to: [],
                    from: ['b'],
                    data: 0,
                    indegree: 1,
                    outdegree: 0
                }
            });

            expect(edgeFormat(edgesA)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], labels: ['ab2', 'ab1'], weight: 2 },
                { pair: ['b', 'a'], labels: [], weight: 1 },
                { pair: ['b', 'd'], labels: [], weight: 1 },
                { pair: ['a', 'a'], labels: [], weight: 1 }
            ]));

            expect(edgeFormat(edgesB)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], labels: ['ab1', 'ab2'], weight: 3 },
                { pair: ['b', 'a'], labels: [], weight: 1 },
                { pair: ['b', 'd'], labels: [], weight: 1 },
                { pair: ['a', 'a'], labels: [], weight: 1 }
            ]));

            done();
        });

        it('union(graph) constructs a non-digraph union.', function (done) {

            var graphA = new Graph({
                directed: false,
                vertices: {
                    a: {
                        labels: ['ay'],
                        data: { A: true }
                    },
                    b: {
                        data: ['A']
                    },
                    d: {
                        data: 0
                    }
                },
                edges: [
                    { pair: ['a', 'b'], weight: 2, labels: ['ab1'] },
                    ['b', 'd'],
                    ['a', 'a']
                ]
            });

            var graphB = new Graph({
                directed: false,
                vertices: {
                    a: {
                        labels: ['eh'],
                        data: { B: true }
                    },
                    b: {
                        data: ['B']
                    },
                    c: {
                        data: 1
                    }
                },
                edges: [
                    { pair: ['a', 'b'], weight: 3, labels: ['ab2'] }
                ]
            });

            var unionA = graphA.union(graphB);
            var unionB = graphB.union(graphA);

            var verticesA = unionA.getVertices();
            var edgesA = unionA.getEdges();
            var edgesB = unionB.getEdges();

            expect(unionA.equals(unionB)).to.equal(true);

            expect(verticesA).to.deep.equal({
                a: {
                    id: 'a',
                    labels: ['eh', 'ay'],
                    to: ['b', 'a'],
                    from: ['b', 'a'],
                    data: { B: true, A: true },
                    neighbors: ['b'],
                    degree: 3
                },
                b: {
                    id: 'b',
                    labels: [],
                    to: ['a', 'd'],
                    from: ['a', 'd'],
                    data: ['B', 'A'],
                    neighbors: ['a', 'd'],
                    degree: 2
                },
                c: {
                    id: 'c',
                    labels: [],
                    to: [],
                    from: [],
                    data: 1,
                    neighbors: [],
                    degree: 0
                },
                d: {
                    id: 'd',
                    labels: [],
                    to: ['b'],
                    from: ['b'],
                    data: 0,
                    neighbors: ['b'],
                    degree: 1
                }
            });

            expect(edgeFormat(edgesA)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], labels: ['ab2', 'ab1'], weight: 2 },
                { pair: ['b', 'd'], labels: [], weight: 1 },
                { pair: ['a', 'a'], labels: [], weight: 1 }
            ]));

            expect(edgeFormat(edgesB)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], labels: ['ab1', 'ab2'], weight: 3 },
                { pair: ['b', 'd'], labels: [], weight: 1 },
                { pair: ['a', 'a'], labels: [], weight: 1 }
            ]));

            done();
        });

        it('intersection(graph) constructs a digraph intersection.', function (done) {

            var data = {
                A: {
                    a: { A: true }
                },
                B: {
                    a: { B: true }
                }
            };

            var graphA = new Graph({
                directed: true,
                vertices: {
                    a: {
                        labels: ['ay', 'eh', 'ah'],
                        data: data.A.a
                    },
                    b: {},
                    c: {},
                    d: {}
                },
                edges: [
                    { pair: ['a', 'b'], weight: 2, labels: ['ab1', 'ab2'] },
                    ['b', 'c'],
                    ['c', 'a'],
                    ['d', 'a']
                ]
            });

            var graphB = new Graph({
                directed: true,
                vertices: {
                    a: {
                        labels: ['ay', 'eh', 'meh'],
                        data: data.B.a
                    },
                    b: {},
                    c: {},
                    e: {}
                },
                edges: [
                    { pair: ['a', 'b'], weight: -1, labels: ['ab1', 'ab3'] },
                    ['b', 'c'],
                    ['a', 'c'],
                    ['e', 'b']
                ]
            });

            var intersectionA = graphA.intersection(graphB);
            var intersectionB = graphB.intersection(graphA);

            var verticesA = intersectionA.getVertices();
            var verticesB = intersectionB.getVertices();
            var edgesA = intersectionA.getEdges();
            var edgesB = intersectionB.getEdges();

            expect(intersectionA.directed).to.equal(true);
            expect(intersectionA.equals(intersectionB)).to.equal(true);
            expect(Object.keys(verticesA)).to.only.include(['a', 'b', 'c']);
            expect(verticesA.a.data).to.equal(data.A.a);
            expect(verticesA.a.labels).to.only.include(['ay', 'eh']);
            expect(verticesA.b.data).to.be.undefined();
            expect(verticesA.b.labels).to.deep.equal([]);
            expect(verticesA.c.data).to.be.undefined();
            expect(verticesA.c.labels).to.deep.equal([]);

            expect(verticesB.a.data).to.equal(data.B.a);
            expect(verticesB.a.labels).to.only.include(['ay', 'eh']);

            expect(edgeFormat(edgesA)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 2, labels: ['ab1'] },
                { pair: ['b', 'c'], weight: 1, labels: [] }
            ]));

            expect(edgeFormat(edgesB)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: -1, labels: ['ab1'] },
                { pair: ['b', 'c'], weight: 1, labels: [] }
            ]));

            done();
        });

        it('intersection(graph) constructs a non-digraph union.', function (done) {

            var data = {
                A: {
                    a: { A: true }
                },
                B: {
                    a: { B: true }
                }
            };

            var graphA = new Graph({
                directed: false,
                vertices: {
                    a: {
                        labels: ['ay', 'eh', 'ah'],
                        data: data.A.a
                    },
                    b: {},
                    c: {},
                    d: {}
                },
                edges: [
                    { pair: ['a', 'b'], weight: 2, labels: ['ab1', 'ab2'] },
                    ['b', 'c'],
                    ['c', 'a'],
                    ['d', 'a']
                ]
            });

            var graphB = new Graph({
                directed: false,
                vertices: {
                    a: {
                        labels: ['ay', 'eh', 'meh'],
                        data: data.B.a
                    },
                    b: {},
                    c: {},
                    e: {}
                },
                edges: [
                    { pair: ['a', 'b'], weight: -1, labels: ['ab1', 'ab3'] },
                    ['b', 'c'],
                    ['a', 'c'],
                    ['e', 'b']
                ]
            });

            var intersectionA = graphA.intersection(graphB);
            var intersectionB = graphB.intersection(graphA);

            var verticesA = intersectionA.getVertices();
            var verticesB = intersectionB.getVertices();
            var edgesA = intersectionA.getEdges();
            var edgesB = intersectionB.getEdges();

            expect(intersectionA.directed).to.equal(false);
            expect(intersectionA.equals(intersectionB)).to.equal(true);
            expect(Object.keys(verticesA)).to.only.include(['a', 'b', 'c']);
            expect(verticesA.a.data).to.equal(data.A.a);
            expect(verticesA.a.labels).to.only.include(['ay', 'eh']);
            expect(verticesA.b.data).to.be.undefined();
            expect(verticesA.b.labels).to.deep.equal([]);
            expect(verticesA.c.data).to.be.undefined();
            expect(verticesA.c.labels).to.deep.equal([]);

            expect(verticesB.a.data).to.equal(data.B.a);
            expect(verticesB.a.labels).to.only.include(['ay', 'eh']);

            expect(edgeFormat(edgesA)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 2, labels: ['ab1'] },
                { pair: ['b', 'c'], weight: 1, labels: [] },
                { pair: ['a', 'c'], weight: 1, labels: [] }
            ]));

            expect(edgeFormat(edgesB)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: -1, labels: ['ab1'] },
                { pair: ['b', 'c'], weight: 1, labels: [] },
                { pair: ['a', 'c'], weight: 1, labels: [] }
            ]));

            done();
        });

        it('join(graph, weight, oneWay) joins two digraphs.', function (done) {

            var data = {
                a: {},
                b: []
            };

            var graphA = new Graph({
                directed: true,
                vertices: {
                    a: {
                        labels: ['ay', 'eh'],
                        data: data.a
                    }
                },
                edges: [
                    { pair: ['a', 'c'], weight: -1, labels: ['ac'] }
                ]
            });

            var graphB = new Graph({
                directed: true,
                vertices: {
                    b: {
                        labels: ['bee'],
                        data: data.b
                    }
                },
                edges: [
                    { pair: ['b', 'd'], weight: 10, labels: ['bd'] }
                ]
            });

            var joinPlain = graphA.join(graphB);
            var joinZero = graphA.join(graphB, 0);
            var joinWeight = graphA.join(graphB, 2);
            var joinOneWay = graphA.join(graphB, 1, true);

            var plainVertices = joinPlain.getVertices();
            var plainEdges = joinPlain.getEdges();

            expect(Object.keys(plainVertices)).to.only.include(['a', 'b', 'c', 'd']);
            expect(plainVertices.a.labels).to.only.include(['ay', 'eh']);
            expect(plainVertices.a.data).to.equal(data.a);
            expect(plainVertices.b.labels).to.only.include(['bee']);
            expect(plainVertices.b.data).to.equal(data.b);
            expect(plainVertices.c.labels).to.deep.equal([]);
            expect(plainVertices.c.data).to.be.undefined();
            expect(plainVertices.d.labels).to.deep.equal([]);
            expect(plainVertices.d.data).to.be.undefined();

            expect(edgeFormat(plainEdges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'c'], weight: -1, labels: ['ac'] },
                { pair: ['b', 'd'], weight: 10, labels: ['bd'] },
                { pair: ['a', 'b'], weight: 1, labels: ['join-edge'] },
                { pair: ['a', 'd'], weight: 1, labels: ['join-edge'] },
                { pair: ['c', 'b'], weight: 1, labels: ['join-edge'] },
                { pair: ['c', 'd'], weight: 1, labels: ['join-edge'] },
                { pair: ['b', 'a'], weight: 1, labels: ['join-edge'] },
                { pair: ['b', 'c'], weight: 1, labels: ['join-edge'] },
                { pair: ['d', 'a'], weight: 1, labels: ['join-edge'] },
                { pair: ['d', 'c'], weight: 1, labels: ['join-edge'] }
            ]));

            var zeroEdges = joinZero.getEdges();

            expect(edgeFormat(zeroEdges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'c'], weight: -1, labels: ['ac'] },
                { pair: ['b', 'd'], weight: 10, labels: ['bd'] },
                { pair: ['a', 'b'], weight: 0, labels: ['join-edge'] },
                { pair: ['a', 'd'], weight: 0, labels: ['join-edge'] },
                { pair: ['c', 'b'], weight: 0, labels: ['join-edge'] },
                { pair: ['c', 'd'], weight: 0, labels: ['join-edge'] },
                { pair: ['b', 'a'], weight: 0, labels: ['join-edge'] },
                { pair: ['b', 'c'], weight: 0, labels: ['join-edge'] },
                { pair: ['d', 'a'], weight: 0, labels: ['join-edge'] },
                { pair: ['d', 'c'], weight: 0, labels: ['join-edge'] }
            ]));

            var weightEdges = joinWeight.getEdges();

            expect(edgeFormat(weightEdges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'c'], weight: -1, labels: ['ac'] },
                { pair: ['b', 'd'], weight: 10, labels: ['bd'] },
                { pair: ['a', 'b'], weight: 2, labels: ['join-edge'] },
                { pair: ['a', 'd'], weight: 2, labels: ['join-edge'] },
                { pair: ['c', 'b'], weight: 2, labels: ['join-edge'] },
                { pair: ['c', 'd'], weight: 2, labels: ['join-edge'] },
                { pair: ['b', 'a'], weight: 2, labels: ['join-edge'] },
                { pair: ['b', 'c'], weight: 2, labels: ['join-edge'] },
                { pair: ['d', 'a'], weight: 2, labels: ['join-edge'] },
                { pair: ['d', 'c'], weight: 2, labels: ['join-edge'] }
            ]));

            var oneWayEdges = joinOneWay.getEdges();

            expect(edgeFormat(oneWayEdges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'c'], weight: -1, labels: ['ac'] },
                { pair: ['b', 'd'], weight: 10, labels: ['bd'] },
                { pair: ['a', 'b'], weight: 1, labels: ['join-edge'] },
                { pair: ['a', 'd'], weight: 1, labels: ['join-edge'] },
                { pair: ['c', 'b'], weight: 1, labels: ['join-edge'] },
                { pair: ['c', 'd'], weight: 1, labels: ['join-edge'] }
            ]));

            done();
        });

        it('join(graph, weight, oneWay) joins two non-digraphs.', function (done) {

            var data = {
                a: {},
                b: []
            };

            var graphA = new Graph({
                directed: false,
                vertices: {
                    a: {
                        labels: ['ay', 'eh'],
                        data: data.a
                    }
                },
                edges: [
                    { pair: ['a', 'c'], weight: -1, labels: ['ac'] }
                ]
            });

            var graphB = new Graph({
                directed: false,
                vertices: {
                    b: {
                        labels: ['bee'],
                        data: data.b
                    }
                },
                edges: [
                    { pair: ['b', 'd'], weight: 10, labels: ['bd'] }
                ]
            });

            var join = graphA.join(graphB);

            var vertices = join.getVertices();
            var edges = join.getEdges();

            expect(Object.keys(vertices)).to.only.include(['a', 'b', 'c', 'd']);
            expect(vertices.a.labels).to.only.include(['ay', 'eh']);
            expect(vertices.a.data).to.equal(data.a);
            expect(vertices.b.labels).to.only.include(['bee']);
            expect(vertices.b.data).to.equal(data.b);
            expect(vertices.c.labels).to.deep.equal([]);
            expect(vertices.c.data).to.be.undefined();
            expect(vertices.d.labels).to.deep.equal([]);
            expect(vertices.d.data).to.be.undefined();

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'c'], weight: -1, labels: ['ac'] },
                { pair: ['b', 'd'], weight: 10, labels: ['bd'] },
                { pair: ['b', 'a'], weight: 1, labels: ['join-edge'] },
                { pair: ['d', 'a'], weight: 1, labels: ['join-edge'] },
                { pair: ['b', 'c'], weight: 1, labels: ['join-edge'] },
                { pair: ['d', 'c'], weight: 1, labels: ['join-edge'] }
            ]));

            done();
        });

        it('traverse() creates a new traversal for the graph.', function (done) {

            var graph = new Graph({
                vertices: ['a']
            });

            var traversal = graph.traverse();

            expect(traversal).to.be.instanceof(Traversal);
            expect(traversal.graph).to.equal(graph);
            expect(traversal.currentVertex()).to.equal(null);
            expect(traversal.sequence).to.deep.equal([]);
            expect(traversal.distance).to.equal(0);

            done();
        });

        it('traverse(starting) creates a new traversal for the graph at a particular vertex.', function (done) {

            var graph = new Graph({
                vertices: ['a']
            });

            var traversal = graph.traverse('a');
            var traversalPlayed = traversal.play();

            expect(traversal).to.be.instanceof(Traversal);
            expect(traversal.graph).to.equal(graph);
            expect(traversal.currentVertex().id).to.equal('a');
            expect(traversal.distance).to.equal(0);

            expect(traversal.recording).to.equal(false);
            expect(traversalPlayed.currentVertex()).to.equal(null);

            done();
        });

        it('traverse(starting, true) creates a recording traversal.', function (done) {

            var graph = new Graph({
                vertices: ['a']
            });

            var traversal = graph.traverse('a', true);
            var traversalPlayed = traversal.play();

            expect(traversal.recording).to.equal(true);
            expect(traversalPlayed.currentVertex().id).to.equal('a');

            done();
        });

        it('adjacencyMatrix() returns a proper unweighted adjacency matrix and vertex list for digraphs.', function (done) {

            var graph = new Graph({
                directed: true,
                vertices: ['d'],
                edges: [
                    { pair: ['a', 'b'], weight: 2 },
                    ['b', 'c'],
                    ['c', 'a']
                ]
            });

            var adjacency = graph.adjacencyMatrix();

            expect(adjacency.vertices).to.deep.equal(['d', 'a', 'b', 'c']);
            expect(adjacency.matrix).to.deep.equal([[0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1], [0, 1, 0, 0]]);

            done();
        });

        it('adjacencyMatrix() returns a proper unweighted adjacency matrix and vertex list for non-digraphs.', function (done) {

            var graph = new Graph({
                directed: false,
                edges: [
                    { pair: ['a', 'b'], weight: 2 },
                    ['b', 'c']
                ]
            });

            var adjacency = graph.adjacencyMatrix();

            expect(adjacency.vertices).to.deep.equal(['a', 'b', 'c']);
            expect(adjacency.matrix).to.deep.equal([[0, 1, 0], [1, 0, 1], [0, 1, 0]]);

            done();
        });

        it('adjacencyMatrix(true) returns a proper weighted adjacency matrix and vertex list.', function (done) {

            var graph = new Graph({
                directed: false,
                edges: [
                    { pair: ['a', 'b'], weight: 2 },
                    { pair: ['b', 'c'], weight: -1 }
                ]
            });

            var adjacency = graph.adjacencyMatrix(true);

            expect(adjacency.vertices).to.deep.equal(['a', 'b', 'c']);
            expect(adjacency.matrix).to.deep.equal([[0, 2, 0], [2, 0, -1], [0, -1, 0]]);

            done();
        });

        it('can handle self-loops in non-digraphs.', function (done) {

            var graph = new Graph({
                directed: false,
                vertices: {
                    a: ['a']
                }
            });

            var vertices = graph.getVertices();
            var edges = graph.getEdges();

            expect(vertices).to.deep.equal({
                a: {
                    id: 'a',
                    labels: [],
                    to: ['a'],
                    from: ['a'],
                    neighbors: [],
                    data: undefined,
                    degree: 2
                }
            });

            expect(edges).to.deep.equal([
                { pair: ['a', 'a'], weight: 1, labels:[] }
            ]);

            graph.removeEdge('a', 'a');

            vertices = graph.getVertices();
            edges = graph.getEdges();

            expect(vertices).to.deep.equal({
                a: {
                    id: 'a',
                    labels: [],
                    to: [],
                    from: [],
                    neighbors: [],
                    data: undefined,
                    degree: 0
                }
            });
            expect(edges).to.deep.equal([]);

            done();
        });

        it('can handle self-loops in digraphs.', function (done) {

            var graph = new Graph({
                directed: true,
                vertices: {
                    a: ['a']
                }
            });

            var vertices = graph.getVertices();
            var edges = graph.getEdges();

            expect(vertices).to.deep.equal({
                a: {
                    id: 'a',
                    labels: [],
                    to: ['a'],
                    from: ['a'],
                    data: undefined,
                    indegree: 1,
                    outdegree: 1
                }
            });

            expect(edges).to.deep.equal([
                { pair: ['a', 'a'], weight: 1, labels:[] }
            ]);

            graph.removeEdge('a', 'a');

            vertices = graph.getVertices();
            edges = graph.getEdges();

            expect(vertices).to.deep.equal({
                a: {
                    id: 'a',
                    labels: [],
                    to: [],
                    from: [],
                    data: undefined,
                    indegree: 0,
                    outdegree: 0
                }
            });
            expect(edges).to.deep.equal([]);

            done();
        });

    });

    describe('Traversal', function () {

        it('creates a traversal for a particular graph.', function (done) {

            var graph = new Graph({
                vertices: ['a']
            });

            var traversal = new Traversal(graph);
            expect(traversal.graph).to.equal(graph);
            expect(traversal.currentVertex()).to.equal(null);
            expect(traversal.sequence).to.deep.equal([]);
            expect(traversal.distance).to.equal(0);
            expect(traversal.recording).to.equal(false);

            done();
        });

        it('hop(v) visits vertices without following any edges.', function (done) {

            var graph = new Graph({
                vertices: ['a', 'b', 'c']
            });

            var traversal = new Traversal(graph);

            traversal.hop('a');

            expect(traversal.currentVertex().id).to.equal('a');
            expect(traversal.sequence).to.deep.equal(['a']);
            expect(traversal.distance).to.equal(0);

            traversal.hop('b').hop('c').hop('a').hop('b');

            expect(traversal.currentVertex().id).to.equal('b');
            expect(traversal.sequence).to.deep.equal(['a', 'b', 'c', 'a', 'b']);
            expect(traversal.distance).to.equal(0);

            done();
        });

        it('walk(v) walks along an edge to the specified vertex from the current vertex.', function (done) {

            var graph = new Graph({
                edges: [
                    { pair: ['a', 'b'], weight: 1 },
                    { pair: ['b', 'c'], weight: 3 },
                    { pair: ['c', 'a'], weight: 5 }
                ]
            });

            var traversal = new Traversal(graph);

            traversal.hop('a').walk('b');

            expect(traversal.currentVertex().id).to.equal('b');
            expect(traversal.sequence).to.deep.equal(['a', 'b']);
            expect(traversal.distance).to.equal(1);

            traversal.walk('c');

            expect(traversal.currentVertex().id).to.equal('c');
            expect(traversal.sequence).to.deep.equal(['a', 'b', 'c']);
            expect(traversal.distance).to.equal(4);

            traversal.walk('a');

            expect(traversal.currentVertex().id).to.equal('a');
            expect(traversal.sequence).to.deep.equal(['a', 'b', 'c', 'a']);
            expect(traversal.distance).to.equal(9);

            done();
        });

        it('currentVertex() returns the current position of the traversal, or null otherwise.', function (done) {

            var data = {};

            var graph = new Graph({
                vertices: {
                    a: { to: ['b'], labels: ['ay', 'eh'], data: data }
                }
            });

            var traversal = new Traversal(graph);

            expect(traversal.currentVertex()).to.equal(null);

            traversal.hop('a');

            var current = traversal.currentVertex();

            expect(current).to.deep.equal({
                id: 'a',
                labels: ['ay', 'eh'],
                to: ['b'],
                from: [],
                data: data,
                indegree: 0,
                outdegree: 1
            });

            expect(current.data).to.equal(data);

            done();
        });

        it('vists(v) returns the number of times the specified vertex has been visited.', function (done) {

            var graph = new Graph({
                vertices: {
                    a: ['b', 'c'],
                    b: ['c'],
                    c: ['a'],
                    d: []
                }
            });

            var traversal = new Traversal(graph);

            traversal.hop('a')
            .walk('b').hop('a')
            .walk('c').walk('a')
            .walk('b').hop('a')
            .hop('c').walk('a')
            .walk('c');

            expect(traversal.visits('a')).to.equal(5);
            expect(traversal.visits('b')).to.equal(2);
            expect(traversal.visits('c')).to.equal(3);
            expect(traversal.visits('d')).to.equal(0);

            done();
        });

        it('vistedVertices() returns an array of visited vertex ids.', function (done) {

            var graph = new Graph({
                vertices: {
                    a: ['b', 'c'],
                    b: ['c'],
                    c: ['a'],
                    d: []
                }
            });

            var traversal = new Traversal(graph);

            traversal.hop('a')
            .walk('b').hop('a')
            .walk('c').walk('a')
            .walk('b').hop('a')
            .hop('c').walk('a')
            .walk('c');

            expect(traversal.visitedVertices()).to.only.include(['a', 'b', 'c']);

            done();
        });

        it('subgraph() returns a directed subgraph of visited vertices and walked edges.', function (done) {

            var graph = new Graph({
                directed: true,
                vertices: {
                    a: ['b', 'c'],
                    b: ['c'],
                    c: ['a', 'b'],
                    d: [],
                    e: []
                }
            });

            var traversal = new Traversal(graph);

            traversal.hop('a').walk('b')
            .walk('c').walk('b')
            .walk('c').walk('b')
            .hop('e');

            var subgraph = traversal.subgraph();

            var vertexList = Object.keys(subgraph.getVertices());
            var edges = subgraph.getEdges();

            expect(vertexList).to.only.include(['a', 'b', 'c', 'e']);
            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 1, labels: [] },
                { pair: ['b', 'c'], weight: 1, labels: [] },
                { pair: ['c', 'b'], weight: 1, labels: [] }
            ]));

            done();
        });

        it('subgraph() returns an undirected subgraph of visited vertices and walked edges.', function (done) {

            var graph = new Graph({
                directed: false,
                vertices: {
                    a: ['b', 'c'],
                    b: [],
                    c: ['b', 'e'],
                    d: [],
                    e: []
                }
            });

            var traversal = new Traversal(graph);

            traversal.hop('a').walk('b')
            .walk('c').walk('b')
            .walk('c').hop('e');

            var subgraph = traversal.subgraph();

            var vertexList = Object.keys(subgraph.getVertices());
            var edges = subgraph.getEdges();

            expect(vertexList).to.only.include(['a', 'b', 'c', 'e']);
            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['b', 'a'], weight: 1, labels: [] },
                { pair: ['b', 'c'], weight: 1, labels: [] }
            ]));

            done();
        });

        it('play() without arguments returns a new traversal played over its own graph.', function (done) {

            var graph = new Graph({
                vertices: {
                    a: ['b', 'c'],
                    b: ['c'],
                    c: ['a', 'b'],
                    d: [],
                    e: []
                }
            });

            var traversal = new Traversal(graph);

            traversal.record()
            .hop('a').walk('b')
            .walk('c').walk('b')
            .walk('c').walk('b')
            .hop('e')
            .stop();

            var replayed = traversal.play();

            expect(replayed).to.be.instanceof(Traversal);
            expect(traversal).to.not.equal(replayed);
            expect(traversal.graph).to.equal(replayed.graph);
            expect(traversal.sequence).to.deep.equal(replayed.sequence);
            expect(traversal.distance).to.equal(replayed.distance);
            expect(traversal.currentVertex().id).to.equal(replayed.currentVertex().id);

            done();
        });

        it('play(graph) returns a new traversal played over the specified graph.', function (done) {

            var graphOne = new Graph({
                vertices: ['a', 'b', 'c', 'd', 'e'],
                edges: [
                    { pair: ['a', 'b'], weight: 1 },
                    { pair: ['a', 'c'], weight: 1 },
                    { pair: ['b', 'c'], weight: 1 },
                    { pair: ['c', 'a'], weight: 1 },
                    { pair: ['c', 'b'], weight: 1 }
                ]
            });

            var graphTwo = new Graph({
                vertices: ['a', 'b', 'c', 'd', 'e'],
                edges: [
                    { pair: ['a', 'b'], weight: 2 },
                    { pair: ['a', 'c'], weight: 2 },
                    { pair: ['b', 'c'], weight: 2 },
                    { pair: ['c', 'a'], weight: 2 },
                    { pair: ['c', 'b'], weight: 2 }
                ]
            });

            var traversal = new Traversal(graphOne);

            traversal.record()
            .hop('a').walk('b')
            .walk('c').walk('b')
            .walk('c').walk('b')
            .hop('e')
            .stop();

            var replayed = traversal.play(graphTwo);

            expect(replayed).to.be.instanceof(Traversal);
            expect(traversal).to.not.equal(replayed);
            expect(replayed.graph).to.equal(graphTwo);
            expect(traversal.sequence).to.deep.equal(replayed.sequence);
            expect(2 * traversal.distance).to.equal(replayed.distance);
            expect(traversal.currentVertex().id).to.equal(replayed.currentVertex().id);

            done();
        });

        it('record() and stop() manage recording state.', function (done) {

            var graph = new Graph({
                vertices: ['a', 'b', 'c', 'd', 'e'],
                edges: [
                    ['d', 'a']
                ]
            });

            var traversal = new Traversal(graph);
            expect(traversal.recording).to.equal(false);

            traversal.hop('a').record();
            expect(traversal.recording).to.equal(true);

            traversal.hop('b').hop('e').hop('d').walk('a');
            traversal.stop();
            expect(traversal.recording).to.equal(false);

            traversal.hop('d').hop('a').hop('d').walk('a');
            expect(traversal.sequence).to.deep.equal(['a', 'b', 'e', 'd', 'a', 'd', 'a', 'd', 'a']);

            var replayed = traversal.play();
            expect(replayed.sequence).to.deep.equal(['b', 'e', 'd', 'a']);

            done();
        });

        describe('events', function () {

            it('hop, walk, and visit occur at the correct time.', function (done) {

                var graph = new Graph({
                    vertices: {
                        a: ['b', 'c'],
                        b: ['c'],
                        c: ['a', 'b'],
                        d: [],
                        e: []
                    }
                });

                var traversal = new Traversal(graph);

                expect(traversal).to.be.instanceof(EventEmitter);

                var actions = [];

                traversal.on('hop', function (u, v) {

                    actions.push('H' + u + (v || 'x'));
                });

                traversal.on('walk', function (u, v) {

                    actions.push('W' + u + v);
                });

                traversal.on('visit', function (v) {

                    actions.push('V' + v);
                });

                traversal.hop('a').walk('b').walk('c').hop('e');

                expect(actions.join(' ')).to.equal('Va Hax Vb Wba Vc Wcb Ve Hec');
                done();
            });

        });

    });

});
