import { PrismaClient } from '@prisma/client';
import moment from "moment-timezone";

const prisma = new PrismaClient();


  
  const main = async () => {
    // eslint-disable-next-line no-console
    console.log('Seeding Database');
  
    try {
      console.log('Creating planeTrip data...');
      await prisma.planeTrip.createMany({
        data: [
          {
            origin: 'HKG',
            destination: 'NRT',
            departureTime: moment.tz("2024-01-02 01:25", "UTC").tz("Asia/Shanghai").toDate(),
            flightTime: 270,
            planeId: 'PlaneA',
            createdAt: new Date(),
            deletedAt: null,
          },
          {
            origin: 'NRT',
            destination: 'TPE',
            departureTime: moment.tz("2024-01-02 08:39", "UTC").tz("Asia/Shanghai").toDate(),
            flightTime: 230,
            planeId: 'PlaneA',
            createdAt: new Date(),
            deletedAt: null,
          },
          {
            origin: 'TPE',
            destination: 'HKG',
            departureTime: moment.tz("2024-01-02 13:50", "UTC").tz("Asia/Shanghai").toDate(),
            flightTime: 120,
            planeId: 'PlaneA',
            createdAt: new Date(),
            deletedAt: null,
          },
          // section 2
          {
            origin: 'CTS',
            destination: 'HKG',
            departureTime: moment.tz("2024-01-01 21:00", "UTC").tz("Asia/Shanghai").toDate(),
            flightTime: 450,
            planeId: 'PlaneB',
            createdAt: new Date(),
            deletedAt: null,
          },
          {
            origin: 'HKG',
            destination: 'NGO',
            departureTime: moment.tz("2024-01-02 09:11", "UTC").tz("Asia/Shanghai").toDate(),
            flightTime: 240,
            planeId: 'PlaneB',
            createdAt: new Date(),
            deletedAt: null,
          },
          {
            origin: 'NGO',
            destination: 'HKG',
            departureTime: moment.tz("2024-01-02 17:34", "UTC").tz("Asia/Shanghai").toDate(),
            flightTime: 240,
            planeId: 'PlaneB',
            createdAt: new Date(),
            deletedAt: null,
          },
          // section 3
          {
            origin: 'YVR',
            destination: 'HKG',
            departureTime: moment.tz("2024-01-02 02:00", "UTC").tz("Asia/Shanghai").toDate(),
            flightTime: 750,
            planeId: 'PlaneC',
            createdAt: new Date(),
            deletedAt: null,
          },
          {
            origin: 'HKG',
            destination: 'NRT',
            departureTime: moment.tz("2024-01-02 19:00", "UTC").tz("Asia/Shanghai").toDate(),
            flightTime: 240,
            planeId: 'PlaneC',
            createdAt: new Date(),
            deletedAt: null,
          },
        ],
      });
      console.log('Flight data created.');
      console.log('Creating groundTime data...');
      // await prisma.groundTime.createMany({
      //   data: [
      //     {
      //       destination: 'HKG',
      //       groundTime: moment.tz("2024-01-01 21:00", "UTC").tz("Asia/Shanghai").toDate(),
      //       duration: 265,
      //       planeId: 'PlaneA',
      //       createdAt: new Date(),
      //       deletedAt: null,
      //       PlaneTrip:{
      //         connect: {id: 1}
      //       }
      //     }, {
      //       destination: 'NRT',
      //       groundTime: moment.tz("2024-01-02 05:55", "UTC").tz("Asia/Shanghai").toDate(),
      //       duration: 164,
      //       planeId: 'PlaneA',
      //       createdAt: new Date(),
      //       deletedAt: null,
      //     }, {
      //       destination: 'TPE',
      //       groundTime: moment.tz("2024-01-02 12:29", "UTC").tz("Asia/Shanghai").toDate(),
      //       duration: 81,
      //       planeId: 'PlaneA',
      //       createdAt: new Date(),
      //       deletedAt: null,
      //     }, {
      //       destination: 'HKG',
      //       groundTime: moment.tz("2024-01-02 15:50", "UTC").tz("Asia/Shanghai").toDate(),
      //       duration: 600,
      //       planeId: 'PlaneA',
      //       createdAt: new Date(),
      //       deletedAt: null,
      //     }, {
      //       destination: 'HKG',
      //       groundTime: moment.tz("2024-01-02 04:30", "UTC").tz("Asia/Shanghai").toDate(),
      //       duration: 281,
      //       planeId: 'PlaneB',
      //       createdAt: new Date(),
      //       deletedAt: null,
      //     }, {
      //       destination: 'NGO',
      //       groundTime: moment.tz("2024-01-02 13:11", "UTC").tz("Asia/Shanghai").toDate(),
      //       duration: 263,
      //       planeId: 'PlaneB',
      //       createdAt: new Date(),
      //       deletedAt: null,
      //     }, {
      //       destination: 'HKG',
      //       groundTime: moment.tz("2024-01-02 21:34", "UTC").tz("Asia/Shanghai").toDate(),
      //       duration: 300,
      //       planeId: 'PlaneB',
      //       createdAt: new Date(),
      //       deletedAt: null,
      //     }, {
      //       destination: 'YVB',
      //       groundTime: moment.tz("2024-01-02 23:30", "UTC").tz("Asia/Shanghai").toDate(),
      //       duration: 150,
      //       planeId: 'PlaneC',
      //       createdAt: new Date(),
      //       deletedAt: null,
      //     }, {
      //       destination: 'HKG',
      //       groundTime: moment.tz("2024-01-02 14:30", "UTC").tz("Asia/Shanghai").toDate(),
      //       duration: 270,
      //       planeId: 'PlaneC',
      //       createdAt: new Date(),
      //       deletedAt: null,
      //     }, {
      //       destination: 'NRT',
      //       groundTime: moment.tz("2024-01-02 23:00", "UTC").tz("Asia/Shanghai").toDate(),
      //       duration: 150,
      //       planeId: 'PlaneC',
      //       createdAt: new Date(),
      //       deletedAt: null,
      //     },
      //   ],
      // });
      console.log('Ground Time data created.');
    } catch (error) {
      console.error('Error creating planeTrip data:', error);
    }
  
    // eslint-disable-next-line no-console
    console.log('Seeding Completed');
    await prisma.$disconnect(); // 关闭数据库连接
  };
  
  main().catch(error => {
    // eslint-disable-next-line no-console
    console.warn('Error While generating Seed: \n', error);
    prisma.$disconnect(); // 确保在发生错误时也关闭数据库连接
  });

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
