var Joi = require('joi');

exports.names = Joi.alternatives().try(Joi.string(), Joi.number());

exports.namesArray = Joi.alternatives().try([
    exports.names,
    Joi.array().items(exports.names)
]);

exports.vertexDef = Joi.object({
    to: exports.namesArray,
    from: exports.namesArray,
    labels: exports.namesArray,
    data: Joi.any()
});

exports.pair = Joi.array().length(2).items(exports.names);

exports.definition = Joi.object({
    digraph: Joi.boolean().default(true),
    // Rigmarole to forbid neighbors on digraphs
    vertices: Joi.alternatives().when('digraph', {
        is: true,
        then: [
            Joi.array().items(exports.names),
            Joi.object().pattern(/^/, [
                exports.namesArray,
                exports.vertexDef.keys({
                    neighbors: Joi.any().forbidden()
                })
            ])
        ],
        otherwise: [
            Joi.array().items(exports.names),
            Joi.object().pattern(/^/, [
                exports.namesArray,
                exports.vertexDef.keys({
                    neighbors: exports.namesArray
                })
            ])
        ]
    }),
    edges: Joi.array().items([
        exports.pair,
        Joi.object({
            pair: exports.pair.required(),
            labels: exports.namesArray,
            weight: Joi.number()
        })
    ])
});
