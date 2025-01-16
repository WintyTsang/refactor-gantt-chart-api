/*
 * Schemas used for Validation and Validation and Serialization of our routes/endpoints
 *
 * These are used to:
 *  - Validate incoming requests (URL params, body, headers, query string)
 *  - Automatically serialize the response objects
 *  - Also, Swagger uses these schemas to generate the documentation!
 *
 * See More: https://www.fastify.io/docs/latest/Reference/Validation-and-Serialization/
 */

// GET '/'
export const getPlaneTripSchema = {
    querystring: { $ref: "planeTripQuerySchema#" },
    tags: ["plane"],
    description: "List all plane trips.",
    response: {
      200: {
        type: "object",
        properties: {
          results: { $ref: "planeTripsSchema#" },
        },
      },
      404: { $ref: "messageResponseSchema#" },
    },
  };
  
  export const getGroundTimeSchema = {
      querystring: { $ref: "groundTimeQuerySchema#" },
      tags: ["groundTime"],
      description: "List all plane ground time.",
      response: {
        200: {
          type: "object",
          properties: {
            results: { $ref: "groundTimesSchema#" },
          },
        },
        404: { $ref: "messageResponseSchema#" },
      },
    };