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
            var expectedEgdes = [
                { pair: ['a', 'b'], labels: [], weight: 1 },
                { pair: ['a', 'c'], labels: [], weight: 1 },
                { pair: ['b', 'c'], labels: [], weight: 1 },
                { pair: ['c', 'b'], labels: [], weight: 1 },
                { pair: ['c', 'a'], labels: [], weight: 1 },
                { pair: ['c', 'd'], labels: [], weight: 1 }
            ];

            expect(edgeFormat(actualEdges)).to.deep.equal(edgeFormat(expectedEgdes))

            done();
        });

        /*it('builds a graph from a graph definition.', function (done) {

            var definition = {
                digraph: true,
                vertices: {
                    a: {
                        labels: 'odd',
                        to: 'b'
                    },
                    c: {
                        labels: ['odd', 'sea'],
                        to: ['b', 'd'],
                        from: 'e'
                    },
                    b: {
                        labels: ['even', 'bee'],
                        from: ['d', 'e']
                    }
                },
                edges: [
                    ['d', 'a'],
                    { pair: ['b', 'a'], weight: 2, labels: 'even-odd' },
                    { pair: ['a', 'c'], labels: ['odd-odd'] }
                ]
            };

            var graph = new Graph(definition);

            expect(graph._vertices).to.deep.equal({
                a: {
                    id: 'a',
                    to: { b: true, c: true },
                    from: { b: true, d: true },
                    labels: ['odd'],
                    outdegree: 2,
                    indegree: 2,
                    data: undefined
                },
                b: {
                    id: 'b',
                    to: { a: true },
                    from: { a: true, c: true, d: true, e: true },
                    labels: ['even', 'bee'],
                    outdegree: 1,
                    indegree: 4,
                    data: undefined
                },
                c: {
                    id: 'c',
                    to: { b: true, d: true },
                    from: { a: true, e: true },
                    labels: ['odd', 'sea'],
                    outdegree: 2,
                    indegree: 2,
                    data: undefined
                },
                d: {
                    id: 'd',
                    to: { a: true, b: true },
                    from: { c: true },
                    labels: [],
                    outdegree: 2,
                    indegree: 1,
                    data: undefined
                },
                e: {
                    id: 'e',
                    to: { c: true, b: true },
                    from: {},
                    labels: [],
                    outdegree: 2,
                    indegree: 0,
                    data: undefined
                }
            });*

            done();
        });*/
    });

    describe('Traversal', function () {

        /*it('', function (done) {

            done();
        });*/
    });

});
