/*
 * Simple global schemas that are going to be used across all of our app.
 *
 * See More: https://www.fastify.io/docs/latest/Reference/Validation-and-Serialization/
 */

// Cursor Pagination: take and from values.
// - from must match the MongoDB document id pattern
export const planeTripQuerySchema = {
  $id: "planeTripQuerySchema",
  type: "object",
  properties: {
    planIds: {
      type: ["string", "array"],
      items: { type: "string" },
      nullable: true,
    },
    origin: {
      type: ["string", "array"],
      items: { type: "string" },
      nullable: true,
    },
    destination: {
      type: ["string", "array"],
      items: { type: "string" },
      nullable: true,
    },
    departureTime: {
      type: "string",
    },
  },
};

export const groundTimeQuerySchema = {
  $id: "groundTimeQuerySchema",
  type: "object",
  properties: {
    planeTripIds: {
      type: ["string", "array"],
      items: { type: "string" },
      nullable: true,
    },
    destination: {
      type: ["string", "array"],
      items: { type: "string" },
      nullable: true,
    },
    groundTime: {
      type: "string",
    },
    planeIds: {
      type: ["string", "array"],
      items: { type: "string" },
      nullable: true,
    },
  },
};

export const messageSchema = {
  $id: 'messageResponseSchema',
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
};
