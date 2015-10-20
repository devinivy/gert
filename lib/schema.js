var Joi = require('joi');

exports.names = Joi.alternatives().try(Joi.string(), Joi.number());

exports.namesArray = Joi.alternatives().try([
    exports.names,
    Joi.array().items(exports.names)
]);

exports.pair = Joi.array().length(2).items(exports.names);

exports.definition = Joi.object({
    digraph: Joi.boolean(),
    vertices: [
        Joi.array().items(exports.names),
        Joi.object().pattern(/^/, [
            exports.namesArray,
            {
                to: exports.namesArray,
                from: exports.namesArray,
                neighbors: exports.namesArray,
                labels: exports.namesArray,
                data: Joi.any()
            }
        ])
    ],
    edges: Joi.array().items([
        exports.pair,
        Joi.object({
            pair: exports.pair.required(),
            labels: exports.namesArray,
            weight: Joi.number()
        })
    ])
});
