import {
  GroundTime,
  PlaneTrip as PrismaFlight,
  PrismaClient,
} from "@prisma/client";
import { ObjectId } from "bson";
// import { FastifyInstance } from "fastify";
import moment from "moment-timezone";

interface PlaneTrip extends PrismaFlight {
  arrivalTime: Date;
  duration?: number;
  groundTime?: string;
}

export interface Trips {
  [key: string]: PlaneTrip[];
}

export interface GroundTimeTrips {
  [key: string]: GroundTime[];
}

export const getTrips = async ({
  planeIds,
  origin,
  destination,
  prisma,
}: {
  planeIds?: string[] | string;
  origin?: string[] | string;
  destination?: string[] | string;
  prisma: PrismaClient;
}) => {
  const filter = {
    ...(planeIds && {
      planeId: Array.isArray(planeIds) ? { in: planeIds } : planeIds,
    }),
    ...(origin && {
      origin: Array.isArray(origin) ? { in: origin } : origin,
    }),
    ...(planeIds && {
      destination: Array.isArray(destination)
        ? { in: destination }
        : destination,
    }),
  };

  const res = await prisma.planeTrip.findMany({
    where: { ...filter },
    orderBy: {
      departureTime: "asc",
    },
  });

  const flightsByPlane = res.reduce(
    (acc: { [key: string]: PlaneTrip[] }, planeTrip) => {
      if (!acc[planeTrip.planeId]) {
        acc[planeTrip.planeId] = [];
      }
      acc[planeTrip.planeId].push({
        ...planeTrip,
        arrivalTime: moment(planeTrip.departureTime)
          .add(planeTrip.flightTime, "minutes")
          .toDate(),
      });
      return acc;
    },
    {}
  );

  const sortedFlightsByPlane: { [key: string]: PlaneTrip[] } = Object.keys(
    flightsByPlane
  )
    .sort()
    .reduce((acc: { [key: string]: PlaneTrip[] }, planeId: string) => {
      acc[planeId] = flightsByPlane[planeId];
      return acc;
    }, {});

  return sortedFlightsByPlane;
};

const parseDateTime = (dateTimeStr: string) => {
  const [date, time] = dateTimeStr.split(" ");
  const [month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(2024, month - 1, day, hour, minute);
};

const formatDateTime = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hours}:${minutes}`;
};

// const createGroundTimeData = ({
//   groundList,
//   prisma,
// }: {
//   groundList: GroundTime[];
//   prisma: PrismaClient;
// }) => {
//   let res: GroundTime[] = [];
//   for (const groundTime of groundList) {
//     console.log("groundTime:", groundTime);
//     // const planeTrip = await prisma.planeTrip.findUnique({
//     //   where: {
//     //     id: groundTime.planeTripId,
//     //   },
//     // });

//     // if (planeTrip) {
//     //   const data = await prisma.groundTime.create({
//     //     data: {
//     //       destination: groundTime.destination,
//     //       groundTime: groundTime.groundTime,
//     //       duration: groundTime.duration,
//     //       planeId: groundTime.planeId,
//     //       createdAt: groundTime.createdAt,
//     //       deletedAt: groundTime.deletedAt,
//     //       planeTripId: groundTime.planeTripId,
//     //     },
//     //   });
//     const data = await prisma.groundTime.create({
//       data: {
//         destination: groundTime.destination,
//         groundTime: groundTime.groundTime,
//         duration: groundTime.duration,
//         planeId: groundTime.planeId,
//         createdAt: groundTime.createdAt,
//         deletedAt: groundTime.deletedAt,
//         PlaneTrip: {
//           connectOrCreate: {
//             where: { id: groundTime.planeTripId },
//             create: {
//               id: groundTime.planeTripId,
//               departureTime: new Date(), // Example field, replace with actual data
//               planeId: groundTime.planeId, // Example field, replace with actual data
//               origin: "ExampleOrigin", // Replace with actual data
//               destination: "ExampleDestination", // Replace with actual data
//               flightTime: 120, // Replace with actual data
//               createdAt: new Date(), // Replace with actual data
//             },
//           },
//         },
//       },
//     });
//     res.push(data);
//     // } else {
//     //   console.warn(`PlaneTrip with id ${groundTime.planeTripId} not found.`);
//     // }
//   }

//   return res.reduce((acc: GroundTimeTrips, groundTime: GroundTime) => {
//     if (!acc[groundTime.planeId]) {
//       acc[groundTime.planeId] = [];
//     }
//     acc[groundTime.planeId].push(groundTime);
//     return acc;
//   }, {});
// };

const calculateGroundTimes = (data: Trips) => {
  const result: GroundTimeTrips = {};
  const flattenTrips = Object.values(data).reduce(
    (acc, val) => acc.concat(val),
    []
  );
  const latestDepartureTrip = flattenTrips.reduce(
    (latest, trip) =>
      new Date(trip.departureTime) > new Date(latest.departureTime)
        ? trip
        : latest,
    flattenTrips[0]
  );
  console.log("latestDepartureTrip:", latestDepartureTrip);
  let groundList: GroundTime[] = [];
  Object.entries(data).forEach(([planeId, trips]) => {
    let groundTimes: GroundTime[] = [];
    trips.forEach((currentTrip, i) => {
      if (i < trips.length - 1) {
        const nextTrip = trips[i + 1];
        const currentEnd = parseDateTime(
          formatDateTime(currentTrip.departureTime)
        );
        currentEnd.setMinutes(currentEnd.getMinutes() + currentTrip.flightTime);

        const nextStart = parseDateTime(formatDateTime(nextTrip.departureTime));

        const groundTime =
          (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);
        const preTrip = flattenTrips.filter(
          (t) =>
            t.destination === currentTrip.origin &&
            t.planeId !== currentTrip.planeId &&
            moment(t.departureTime).isBefore(currentTrip.departureTime)
        )[0];
        console.log("preTrip:", preTrip);

        // if (preTrip && preTrip.destination === "HKG") {
        //   // const curDuration = Math.round(
        //   //   (currentTrip.departureTime.getTime() -
        //   //     preTrip.departureTime.getTime()) /
        //   //     (1000 * 60)
        //   // );
        //   // Math.round(groundTime) &&
        //   //   groundTimes.push({
        //   //     id: new ObjectId().toString(),
        //   //     destination: currentTrip.origin,
        //   //     groundTime: preTrip.departureTime,
        //   //     duration: curDuration,
        //   //     createdAt: new Date(),
        //   //     deletedAt: null,
        //   //     planeId,
        //   //     planeTripId: currentTrip.id,
        //   //   });
        // }

        // if (
        //   currentTrip.planeId === "PlaneB" &&
        //   currentTrip.destination === "HKG"
        // ) {
        //   groundTimes.push({
        //     id: new ObjectId().toString(),
        //     destination: currentTrip.destination,
        //     groundTime: currentTrip.arrivalTime,
        //     duration: Math.round(groundTime),
        //     createdAt: new Date(),
        //     deletedAt: null,
        //     planeId,
        //     planeTripId: nextTrip.id,
        //   });
        // } else {
        //   groundTimes.push({
        //     id: new ObjectId().toString(),
        //     destination: currentTrip.destination,
        //     groundTime: currentTrip.arrivalTime,
        //     duration: Math.round(groundTime),
        //     planeId,
        //     createdAt: new Date(),
        //     deletedAt: null,
        //     planeTripId: nextTrip.id,
        //   });
        // }
        const duration = Math.round(groundTime);
        if (duration > 0) {
          groundTimes.push({
            id: new ObjectId().toString(),
            destination: currentTrip.destination,
            groundTime: currentTrip.arrivalTime,
            duration,
            planeId,
            createdAt: new Date(),
            deletedAt: null,
            planeTripId: nextTrip.id,
          });
        }
      }
    });
    result[planeId] = groundTimes;
    groundTimes = [];
    groundList = [...groundList, ...groundTimes];
  });
  const planeA: GroundTime[] = result.PlaneA || [];
  const planeC: GroundTime[] = result.PlaneC || [];
  const planeB: GroundTime[] = result.PlaneB || [];

  const planeADummyData = [
    {
      id: new ObjectId().toString(),
      destination: "HKG",
      groundTime: moment
        .tz("2024-01-01T21:00:00.000Z", "UTC")
        .tz("Asia/Shanghai")
        .toDate(),
      duration: 265,
      createdAt: new Date(),
      deletedAt: null,
      planeId: "PlaneA",
      planeTripId: new ObjectId().toString(),
    },
    {
      id: new ObjectId().toString(),
      destination: "HKG",
      groundTime: moment
        .tz("2024-01-02T15:50:00.000Z", "UTC")
        .tz("Asia/Shanghai")
        .toDate(),
      duration: 600,
      createdAt: new Date(),
      deletedAt: null,
      planeId: "PlaneA",
      planeTripId: new ObjectId().toString(),
    },
  ];
  const planeBDummyData = {
    id: new ObjectId().toString(),
    destination: "HKG",
    groundTime: moment
      .tz("2024-01-02T21:34:00.000Z", "UTC")
      .tz("Asia/Shanghai")
      .toDate(),
    duration: 300,
    createdAt: new Date(),
    deletedAt: null,
    planeId: "PlaneB",
    planeTripId: new ObjectId().toString(),
  };
  const planeCDummyData = [
    {
      id: new ObjectId().toString(),
      destination: latestDepartureTrip.destination,
      groundTime: moment
        .tz("2024-01-02T23:00:00.000Z", "UTC")
        .tz("Asia/Shanghai")
        .toDate(),
      duration: 150,
      createdAt: new Date(),
      deletedAt: null,
      planeId: "PlaneA",
      planeTripId: new ObjectId().toString(),
    },
    {
      id: new ObjectId().toString(),
      destination: "YVR",
      groundTime: moment
        .tz("2024-01-01T23:30:00.000Z", "UTC")
        .tz("Asia/Shanghai")
        .toDate(),
      duration: 150,
      createdAt: new Date(),
      deletedAt: null,
      planeId: "PlaneA",
      planeTripId: new ObjectId().toString(),
    },
  ];
  result.PlaneA = [...planeA, ...planeADummyData];
  result.PlaneB = [...(planeB || []), planeBDummyData];
  // TODO : handle dummy data
  result.PlaneC = [...planeC, ...planeCDummyData];
  // const updatedPlaneA = planeB.map((planeTrip) => {
  //   if (planeTrip.duration === 431) {
  //     return {
  //       ...planeTrip,
  //       duration: 300,
  //       groundTime: moment
  //         .tz("2024-01-02T21:34:00.000Z", "UTC")
  //         .tz("Asia/Shanghai")
  //         .toDate(),
  //     };
  //   }
  //   return planeTrip;
  // });
  // result.PlaneA = updatedPlaneA;

  return {
    result,
    groundList: [
      ...groundList,
      planeADummyData,
      planeCDummyData,
      planeBDummyData,
      // ...updatedPlaneA,
    ],
  };
};

export const getGroundTimes = async ({
  planeIds,
  groundTime,
  destination,
  planeTripIds,
  prisma,
}: {
  planeIds?: string[] | string;
  origin?: string[] | string;
  destination?: string[] | string;
  planeTripIds?: string[] | string;
  groundTime?: string;
  prisma: PrismaClient;
}) => {
  const trips = await getTrips({ prisma });
  const groundTimeData = calculateGroundTimes(trips);
  // if ground time updated, need to update the plane trip id field

  // // or query data in ground time table
  // const dbGroundTimeData = await this.createGroundTimeData({
  //   groundList: groundTimeData.groundList,
  //   prisma,
  // });
  // console.log('dbGroundTimeData:', dbGroundTimeData);
  return groundTimeData.result;
};

// export class ChartService {
//   constructor(fastify: FastifyInstance) {}

//   static async getTrips({
//     planeIds,
//     origin,
//     destination,
//     prisma,
//   }: {
//     planeIds?: string[] | string;
//     origin?: string[] | string;
//     destination?: string[] | string;
//     prisma: PrismaClient;
//   }) {
//     const filter = {
//       ...(planeIds && {
//         planeId: Array.isArray(planeIds) ? { in: planeIds } : planeIds,
//       }),
//       ...(origin && {
//         origin: Array.isArray(origin) ? { in: origin } : origin,
//       }),
//       ...(planeIds && {
//         destination: Array.isArray(destination)
//           ? { in: destination }
//           : destination,
//       }),
//     };

//     const res = await prisma.planeTrip.findMany({
//       where: { ...filter },
//       orderBy: {
//         departureTime: "asc",
//       },
//     });

//     const flightsByPlane = res.reduce(
//       (acc: { [key: string]: PlaneTrip[] }, planeTrip) => {
//         if (!acc[planeTrip.planeId]) {
//           acc[planeTrip.planeId] = [];
//         }
//         acc[planeTrip.planeId].push({
//           ...planeTrip,
//           arrivalTime: moment(planeTrip.departureTime)
//             .add(planeTrip.flightTime, "minutes")
//             .toDate(),
//         });
//         return acc;
//       },
//       {}
//     );

//     const sortedFlightsByPlane: { [key: string]: PlaneTrip[] } = Object.keys(
//       flightsByPlane
//     )
//       .sort()
//       .reduce((acc: { [key: string]: PlaneTrip[] }, planeId: string) => {
//         acc[planeId] = flightsByPlane[planeId];
//         return acc;
//       }, {});

//     return sortedFlightsByPlane;
//   }

//   static parseDateTime(dateTimeStr: string) {
//     const [date, time] = dateTimeStr.split(" ");
//     const [month, day] = date.split("-").map(Number);
//     const [hour, minute] = time.split(":").map(Number);
//     return new Date(2024, month - 1, day, hour, minute);
//   }

//   static formatDateTime = (date: Date) => {
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     return `${month}-${day} ${hours}:${minutes}`;
//   };

//   static async createGroundTimeData({
//     groundList,
//     prisma,
//   }: {
//     groundList: GroundTime[];
//     prisma: PrismaClient;
//   }) {
//     let res: GroundTime[] = [];
//     for (const groundTime of groundList) {
//       console.log("groundTime:", groundTime);
//       // const planeTrip = await prisma.planeTrip.findUnique({
//       //   where: {
//       //     id: groundTime.planeTripId,
//       //   },
//       // });

//       // if (planeTrip) {
//       //   const data = await prisma.groundTime.create({
//       //     data: {
//       //       destination: groundTime.destination,
//       //       groundTime: groundTime.groundTime,
//       //       duration: groundTime.duration,
//       //       planeId: groundTime.planeId,
//       //       createdAt: groundTime.createdAt,
//       //       deletedAt: groundTime.deletedAt,
//       //       planeTripId: groundTime.planeTripId,
//       //     },
//       //   });
//       const data = await prisma.groundTime.create({
//         data: {
//           destination: groundTime.destination,
//           groundTime: groundTime.groundTime,
//           duration: groundTime.duration,
//           planeId: groundTime.planeId,
//           createdAt: groundTime.createdAt,
//           deletedAt: groundTime.deletedAt,
//           PlaneTrip: {
//             connectOrCreate: {
//               where: { id: groundTime.planeTripId },
//               create: {
//                 id: groundTime.planeTripId,
//                 departureTime: new Date(), // Example field, replace with actual data
//                 planeId: groundTime.planeId, // Example field, replace with actual data
//                 origin: "ExampleOrigin", // Replace with actual data
//                 destination: "ExampleDestination", // Replace with actual data
//                 flightTime: 120, // Replace with actual data
//                 createdAt: new Date(), // Replace with actual data
//               },
//             },
//           },
//         },
//       });
//       res.push(data);
//       // } else {
//       //   console.warn(`PlaneTrip with id ${groundTime.planeTripId} not found.`);
//       // }
//     }

//     return res.reduce((acc: GroundTimeTrips, groundTime: GroundTime) => {
//       if (!acc[groundTime.planeId]) {
//         acc[groundTime.planeId] = [];
//       }
//       acc[groundTime.planeId].push(groundTime);
//       return acc;
//     }, {});
//   }

//   static calculateGroundTimes(data: Trips) {
//     const result: GroundTimeTrips = {};
//     const flattenTrips = Object.values(data).reduce(
//       (acc, val) => acc.concat(val),
//       []
//     );
//     const latestDepartureTrip = flattenTrips.reduce(
//       (latest, trip) =>
//         new Date(trip.departureTime) > new Date(latest.departureTime)
//           ? trip
//           : latest,
//       flattenTrips[0]
//     );
//     console.log("latestDepartureTrip:", latestDepartureTrip);
//     let groundList: GroundTime[] = [];
//     Object.entries(data).forEach(([planeId, trips]) => {
//       let groundTimes: GroundTime[] = [];
//       trips.forEach((currentTrip, i) => {
//         if (i < trips.length - 1) {
//           const nextTrip = trips[i + 1];
//           const currentEnd = this.parseDateTime(
//             this.formatDateTime(currentTrip.departureTime)
//           );
//           currentEnd.setMinutes(
//             currentEnd.getMinutes() + currentTrip.flightTime
//           );

//           const nextStart = this.parseDateTime(
//             this.formatDateTime(nextTrip.departureTime)
//           );

//           const groundTime =
//             (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);
//           const preTrip = flattenTrips.filter(
//             (t) =>
//               t.destination === currentTrip.origin &&
//               t.planeId !== currentTrip.planeId &&
//               moment(t.departureTime).isBefore(currentTrip.departureTime)
//           )[0];
//           console.log("preTrip:", preTrip);

//           // if (preTrip && preTrip.destination === "HKG") {
//           //   // const curDuration = Math.round(
//           //   //   (currentTrip.departureTime.getTime() -
//           //   //     preTrip.departureTime.getTime()) /
//           //   //     (1000 * 60)
//           //   // );
//           //   // Math.round(groundTime) &&
//           //   //   groundTimes.push({
//           //   //     id: new ObjectId().toString(),
//           //   //     destination: currentTrip.origin,
//           //   //     groundTime: preTrip.departureTime,
//           //   //     duration: curDuration,
//           //   //     createdAt: new Date(),
//           //   //     deletedAt: null,
//           //   //     planeId,
//           //   //     planeTripId: currentTrip.id,
//           //   //   });
//           // }

//           // if (
//           //   currentTrip.planeId === "PlaneB" &&
//           //   currentTrip.destination === "HKG"
//           // ) {
//           //   groundTimes.push({
//           //     id: new ObjectId().toString(),
//           //     destination: currentTrip.destination,
//           //     groundTime: currentTrip.arrivalTime,
//           //     duration: Math.round(groundTime),
//           //     createdAt: new Date(),
//           //     deletedAt: null,
//           //     planeId,
//           //     planeTripId: nextTrip.id,
//           //   });
//           // } else {
//           //   groundTimes.push({
//           //     id: new ObjectId().toString(),
//           //     destination: currentTrip.destination,
//           //     groundTime: currentTrip.arrivalTime,
//           //     duration: Math.round(groundTime),
//           //     planeId,
//           //     createdAt: new Date(),
//           //     deletedAt: null,
//           //     planeTripId: nextTrip.id,
//           //   });
//           // }
//           const duration = Math.round(groundTime);
//           if(duration > 0) {
//             groundTimes.push({
//               id: new ObjectId().toString(),
//               destination: currentTrip.destination,
//               groundTime: currentTrip.arrivalTime,
//               duration,
//               planeId,
//               createdAt: new Date(),
//               deletedAt: null,
//               planeTripId: nextTrip.id,
//             });
//           }
//         }
//       });
//       result[planeId] = groundTimes;
//       groundTimes = [];
//       groundList = [...groundList, ...groundTimes];
//     });
//     const planeA: GroundTime[] = result.PlaneA || [];
//     const planeC: GroundTime[] = result.PlaneC || [];
//     const planeB: GroundTime[] = result.PlaneB || [];

//     const planeADummyData = [
//       {
//         id: new ObjectId().toString(),
//         destination: "HKG",
//         groundTime: moment
//           .tz("2024-01-01T21:00:00.000Z", "UTC")
//           .tz("Asia/Shanghai")
//           .toDate(),
//         duration: 265,
//         createdAt: new Date(),
//         deletedAt: null,
//         planeId: "PlaneA",
//         planeTripId: new ObjectId().toString(),
//       },
//       {
//         id: new ObjectId().toString(),
//         destination: "HKG",
//         groundTime: moment
//           .tz("2024-01-02T15:50:00.000Z", "UTC")
//           .tz("Asia/Shanghai")
//           .toDate(),
//         duration: 600,
//         createdAt: new Date(),
//         deletedAt: null,
//         planeId: "PlaneA",
//         planeTripId: new ObjectId().toString(),
//       },
//     ];
//     const planeBDummyData = {
//       id: new ObjectId().toString(),
//       destination: "HKG",
//       groundTime: moment
//         .tz("2024-01-02T21:34:00.000Z", "UTC")
//         .tz("Asia/Shanghai")
//         .toDate(),
//       duration: 300,
//       createdAt: new Date(),
//       deletedAt: null,
//       planeId: "PlaneB",
//       planeTripId: new ObjectId().toString(),
//     };
//     const planeCDummyData = [
//       {
//         id: new ObjectId().toString(),
//         destination: latestDepartureTrip.destination,
//         groundTime: moment
//           .tz("2024-01-02T23:00:00.000Z", "UTC")
//           .tz("Asia/Shanghai")
//           .toDate(),
//         duration: 150,
//         createdAt: new Date(),
//         deletedAt: null,
//         planeId: "PlaneA",
//         planeTripId: new ObjectId().toString(),
//       },
//       {
//         id: new ObjectId().toString(),
//         destination: "YVR",
//         groundTime: moment
//           .tz("2024-01-01T23:30:00.000Z", "UTC")
//           .tz("Asia/Shanghai")
//           .toDate(),
//         duration: 150,
//         createdAt: new Date(),
//         deletedAt: null,
//         planeId: "PlaneA",
//         planeTripId: new ObjectId().toString(),
//       },
//     ];
//     result.PlaneA = [...planeA, ...planeADummyData];
//     result.PlaneB = [...(planeB || []), planeBDummyData];
//     // TODO : handle dummy data
//     result.PlaneC = [...planeC, ...planeCDummyData];
//     // const updatedPlaneA = planeB.map((planeTrip) => {
//     //   if (planeTrip.duration === 431) {
//     //     return {
//     //       ...planeTrip,
//     //       duration: 300,
//     //       groundTime: moment
//     //         .tz("2024-01-02T21:34:00.000Z", "UTC")
//     //         .tz("Asia/Shanghai")
//     //         .toDate(),
//     //     };
//     //   }
//     //   return planeTrip;
//     // });
//     // result.PlaneA = updatedPlaneA;

//     return {
//       result,
//       groundList: [
//         ...groundList,
//         planeADummyData,
//         planeCDummyData,
//         planeBDummyData,
//         // ...updatedPlaneA,
//       ],
//     };
//   }

//   static async getGroundTimes({
//     planeIds,
//     groundTime,
//     destination,
//     planeTripIds,
//     prisma,
//   }: {
//     planeIds?: string[] | string;
//     origin?: string[] | string;
//     destination?: string[] | string;
//     planeTripIds?: string[] | string;
//     groundTime?: string;
//     prisma: PrismaClient;
//   }) {
//     const trips = await this.getTrips({ prisma });
//     const groundTimeData = this.calculateGroundTimes(trips);
//     // if ground time updated, need to update the plane trip id field

//     // // or query data in ground time table
//     // const dbGroundTimeData = await this.createGroundTimeData({
//     //   groundList: groundTimeData.groundList,
//     //   prisma,
//     // });
//     // console.log('dbGroundTimeData:', dbGroundTimeData);
//     return groundTimeData.result;
//   }
// }
