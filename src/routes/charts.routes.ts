import { FastifyInstance } from "fastify";

import { getPlaneTripSchema, getGroundTimeSchema } from "../schema/charts.schema";
import { getPlaneTrips, getGroundTime } from "../controllers/charts.controller";

export default async function (fastify: FastifyInstance) {
  fastify.get("/plane/trips", { schema: getPlaneTripSchema }, getPlaneTrips);
  fastify.get("/plane/ground-times", { schema: getGroundTimeSchema }, getGroundTime);
}
