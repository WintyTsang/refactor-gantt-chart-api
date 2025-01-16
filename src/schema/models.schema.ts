/*
 * Some global schemas, representing our stuff from the Database.
 * These will be used mostly when serializing data in our responses.
 *
 * See More: https://www.fastify.io/docs/latest/Reference/Validation-and-Serialization/
 */
export const planeTripSchema = {
  $id: "planeTripSchema",
  type: "object",
  properties: {
    id: { type: "string" },
    origin: { type: "string" },
    destination: { type: "string" },
    departureTime: { type: "string" },
    flightTime: { type: "number" },
    createdAt: { type: "string" },
    deletedAt: { type: ["string", "null"] },
    planeId: { type: "string" },
    arrivalTime: { type: "string" },
  },
};

export const planeTripsSchema = {
  $id: "planeTripsSchema",
  type: "object",
  additionalProperties: {
    type: "array",
    items: { $ref: "planeTripSchema#" },
  },
};

export const groundTimeSchema = {
  $id: "groundTimeSchema",
  type: "object",
  properties: {
    id: { type: "string" },
    groundTime: { type: "string" },
    destination: { type: "string" },
    planeId: { type: "string" },
    flightTime: { type: "number" },
    createdAt: { type: "string" },
    deletedAt: { type: ["string", "null"] },
    planeTripId: { type: "string" },
    duration: { type: "number" },
  },
};

export const groundTimesSchema = {
  $id: "groundTimesSchema",
  type: "object",
  additionalProperties: {
    type: "array",
    items: { $ref: "groundTimeSchema#" },
  },
};
