// Load modules

var Lab = require('lab');
var Code = require('code');

var Gert = require('..');
var Graph = Gert.Graph;
var Traversal = Gert.Traversal;

// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


describe('Gert', function () {

    describe('Graph', function () {

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

            var objify = function(arr) {

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

        it('no definition defaults to an empty directed graph.', function (done) {

            var graph = new Graph();

            expect(graph.digraph).to.equal(true);
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

            expect(graph.digraph).to.equal(true);

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

            expect(graph.digraph).to.equal(true);

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
                    { pair: ['b', 'c' ], labels: 'strong', weight: 2 },
                    { pair: ['c', 'd' ], labels: ['weak', 'strange'], weight: -1 }
                ]
            });

            expect(graph.digraph).to.equal(true);

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

            expect(graph.digraph).to.equal(true);

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
                { pair: ['b', 'c'], labels: [], weight: 1 },
            ];

            expect(edgeFormat(actualEdges)).to.deep.equal(edgeFormat(expectedEdges));

            done();
        });

        it('definition can create an undirected graph.', function (done) {

            var graph = new Graph({
                digraph: false,
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

            expect(graph.digraph).to.equal(false);

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

            expect(graph.digraph).to.equal(true);

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

            expect(graph.digraph).to.equal(true);

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
                digraph: false,
                vertices: {
                    a: {}
                }
            });

            var divertex = {
                a: digraph.getVertex('a'),
                b: digraph.getVertex('b'),
                c: digraph.getVertex('c'),
                d: digraph.getVertex('d'),
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

        it('getVertices() returns all vertices.', function (done) {

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

            done();
        });

        it('getVertices(array) returns specified vertices.', function (done) {

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

            done();
        });

        it('getVertices(label) returns vertices by label.', function (done) {

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
            var vowels = graph.getVertices('vowel');
            var abs = graph.getVertices('ab');
            var seas = graph.getVertices('sea');
            var none = graph.getVertices('none');

            expect(consonants).to.deep.equal({ b: expected.b, c: expected.c });
            expect(vowels).to.deep.equal({ a: expected.a });
            expect(abs).to.deep.equal({ a: expected.a, b: expected.b });
            expect(seas).to.deep.equal({ c: expected.c });
            expect(none).to.deep.equal({});

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

        it('removeVertex(v) removes vertex and related edges from digraph.', function (done) {

            var graph = new Graph({
                digraph: true,
                vertices: {
                    a: ['b'],
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
                digraph: false,
                vertices: {
                    a: ['b'],
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
                digraph: false,
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

        it('getEdges() without arguments returns all edges.', function (done) {

            var graph = new Graph({
                edges: [
                    ['a', 'b'],
                    ['b', 'c'],
                    ['c', 'a'],
                    ['b', 'a']
                ]
            });

            var edges = graph.getEdges();

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 1, labels: [] },
                { pair: ['b', 'c'], weight: 1, labels: [] },
                { pair: ['c', 'a'], weight: 1, labels: [] },
                { pair: ['b', 'a'], weight: 1, labels: [] }
            ]));

            done();
        });

        it('getEdges(array) returns specified edges, ignores non-edges.', function (done) {

            var graph = new Graph({
                edges: [
                    ['a', 'b'],
                    ['b', 'c'],
                    ['c', 'a'],
                    ['b', 'a']
                ]
            });

            var edges = graph.getEdges([['a', 'b'], ['c', 'a'], ['c', 'b']]);

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 1, labels: [] },
                { pair: ['c', 'a'], weight: 1, labels: [] }
            ]));

            done();
        });

        it('getEdges(label) returns edges by label.', function (done) {

            var graph = new Graph({
                edges: [
                    { pair: ['a', 'b'], labels: ['tall'] },
                    { pair: ['b', 'c'], labels: ['tall', 'cold'] },
                    { pair: ['c', 'a'], labels: ['short'] },
                    { pair: ['b', 'a'], labels: ['short'] }
                ]
            });

            var tall = graph.getEdges('tall');
            var cold = graph.getEdges('cold');
            var short = graph.getEdges('short');
            var non = graph.getEdges('non');

            expect(edgeFormat(tall)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 1, labels: ['tall'] },
                { pair: ['b', 'c'], weight: 1, labels: ['tall', 'cold'] }
            ]));

            expect(edgeFormat(cold)).to.deep.equal(edgeFormat([
                { pair: ['b', 'c'], weight: 1, labels: ['tall', 'cold'] }
            ]));

            expect(edgeFormat(short)).to.deep.equal(edgeFormat([
                { pair: ['c', 'a'], weight: 1, labels: ['short'] },
                { pair: ['b', 'a'], weight: 1, labels: ['short'] }
            ]));

            expect(non).to.deep.equal([]);

            done();
        });

        it('getEdges() is orderless in non-digraphs.', function (done) {

            var graph = new Graph({
                digraph: false,
                edges: [
                    ['a', 'b'],
                    ['b', 'c']
                ]
            });

            var edges = graph.getEdges();

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 1, labels: [] },
                { pair: ['b', 'c'], weight: 1, labels: [] }
            ]));

            done();
        });

        it('addEdge(u, v, info) adds an edge to a digraph.', function (done) {

            var graph = new Graph({
                digraph: true,
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
                digraph: false,
                vertices: ['a', 'b']
            });

            graph.addEdge('a', 'b', {
                weight: 2,
                labels: ['ab']
            });

            var edges = graph.getEdges();

            expect(edgeFormat(edges)).to.deep.equal(edgeFormat([
                { pair: ['a', 'b'], weight: 2, labels: ['ab'] },
            ]));

            var edgeBA = graph.getEdge('b', 'a')

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

        it('removeEdge(a, b) removes an edge from a digraph.', function (done) {

            var graph = new Graph({
                digraph: true,
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
                digraph: false,
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
                digraph: true,
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
                digraph: false,
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

            expect(traversal).to.be.instanceof(Traversal);
            expect(traversal.graph).to.equal(graph);
            expect(traversal.currentVertex().id).to.equal('a');
            expect(traversal.distance).to.equal(0);

            done();
        });

        it('adjacencyMatrix() returns a proper unweighted adjacency matrix and vertex list for digraphs.', function (done) {

            var graph = new Graph({
                digraph: true,
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
                digraph: false,
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
                digraph: false,
                edges: [
                    { pair: ['a', 'b'], weight: 2 },
                    { pair: ['b', 'c'], weight: -1 },
                ]
            });

            var adjacency = graph.adjacencyMatrix(true);

            expect(adjacency.vertices).to.deep.equal(['a', 'b', 'c']);
            expect(adjacency.matrix).to.deep.equal([[0, 2, 0], [2, 0, -1], [0, -1, 0]]);

            done();
        });

    });

    describe('Traversal', function () {

        /*it('', function (done) {

            done();
        });*/
    });

});
