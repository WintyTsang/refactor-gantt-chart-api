import { FastifyRequest, FastifyReply } from "fastify";
import { getGroundTimes, getTrips } from "../services/charts.services";
// import { ChartService } from "../services/charts.services";

interface GetPlaneTripsQuery {
  planeIds: string[] | string;
  origin: string;
  destination: string;
}

interface GetGroundTimesQuery {
  planeIds: string[] | string;
  groundTime: string;
  destination: string | string[];
  planeTripIds: string[] | string;
}

export const getPlaneTrips = async (
  request: FastifyRequest<{ Querystring: GetPlaneTripsQuery }>,
  reply: FastifyReply
) => {
  try {
    const { planeIds, origin, destination } = request.query;
    const results = await getTrips({
      planeIds,
      origin,
      destination,
      prisma: request.server.prisma,
    });
    return reply.status(200).send({ results });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

//getGroundTime
export const getGroundTime = async (
  request: FastifyRequest<{ Querystring: GetGroundTimesQuery }>,
  reply: FastifyReply
) => {
  try {
    const { planeIds, groundTime, destination, planeTripIds } = request.query;
    const results = await getGroundTimes({
      planeIds,
      groundTime,
      destination,
      planeTripIds,
      prisma: request.server.prisma,
    });
    return reply.status(200).send({ results });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};
