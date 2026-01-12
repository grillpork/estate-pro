import "dotenv/config";
// import gateway from "./gateway";
import { env } from "./config/env";

export default {
  port: env.PORT,
  fetch: async (request: Request, server: any) => {
    // Handle regular HTTP requests
    // return gateway.fetch(request, server);
  },

};
