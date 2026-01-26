import { createMiddleware } from "hono/factory";
import { cors } from "hono/cors"


export const corsMiddleware = createMiddleware( 
    cors({
        origin:["http://localhost:4000", "http://localhost:3000", "*"],
        allowMethods:["GET","POST" ,"PUT" ,"DELETE" , "OPTIONS"], 
        allowHeaders:["Content-Type", "Authorization"],
        credentials:true,



    })
)


