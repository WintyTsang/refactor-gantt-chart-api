import fastify from "fastify";
import fastifyEnv from "@fastify/env";
import fastifyCors from "@fastify/cors";
import fastifyCompress from "@fastify/compress";
import fastifyHelmet from "@fastify/helmet";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

import envConfig from "./lib/env.config";
import corsConfig from "./config/cors.config";
import loggerConfig from "./config/logger.config";
import compressConfig from "./config/compress.config";
import prismaPlugin from "./plugins/prisma.plugin";
import helmetConfig from "./config/helmet.config";
import { swaggerConfig } from "./config/swagger.config";

import chartsRoutes from "./routes/charts.routes";
import { groundTimeQuerySchema, messageSchema, planeTripQuerySchema } from "./schema/common.schema";
import {
  groundTimeSchema,
  groundTimesSchema,
  planeTripSchema,
  planeTripsSchema,
} from "./schema/models.schema";

const main = async () => {
  const app = fastify({
    logger: loggerConfig,
    ajv: {
      customOptions: {
        strict: "log",
        allowUnionTypes: true,
      },
    },
  });

  // Now we setup our app, plugins and such
  await app.register(fastifyEnv, envConfig);
  await app.register(fastifyCors, corsConfig);
  await app.register(fastifyCompress, compressConfig);
  await app.register(fastifyHelmet, helmetConfig);
  await app.register(prismaPlugin);

  app.addSchema(messageSchema);
  
  app.addSchema(planeTripSchema);
  app.addSchema(planeTripQuerySchema);
  app.addSchema(planeTripsSchema);

  app.addSchema(groundTimeSchema);
  app.addSchema(groundTimesSchema);
  app.addSchema(groundTimeQuerySchema);

  // Swagger Docs
  if (app.config.ENABLE_SWAGGER) {
    await app.register(fastifySwagger, swaggerConfig);
    await app.register(fastifySwaggerUi, {
      routePrefix: "/docs",
    });
  }

  // API Endpoint routes
  await app.register(
    async (api) => {
      // api.register(categoriesRoutes, { prefix: "/categories" });
      // api.register(productsRoutes, { prefix: "/products" });
      api.register(chartsRoutes, { prefix: "/chart" });
    },
    { prefix: "/api/v1" }
  );

  return app;
};

export { main };
