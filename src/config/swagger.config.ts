export const swaggerConfig = {
  swagger: {
    info: {
      title: 'RESTful APIs',
      description: 'CRUDs using Swagger, Fastify and Prisma',
      version: '0.0.1'
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here'
    },
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'Gantt Chart', description: '' },
    ],
  }
};
