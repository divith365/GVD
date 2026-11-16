import { onRequestGet as __api_photos___path___ts_onRequestGet } from "/home/arun/GVD/functions/api/photos/[[path]].ts"
import { onRequestPost as __api_auth_ts_onRequestPost } from "/home/arun/GVD/functions/api/auth.ts"
import { onRequestGet as __api_centers_ts_onRequestGet } from "/home/arun/GVD/functions/api/centers.ts"
import { onRequestPost as __api_centers_ts_onRequestPost } from "/home/arun/GVD/functions/api/centers.ts"
import { onRequestGet as __api_managers_ts_onRequestGet } from "/home/arun/GVD/functions/api/managers.ts"
import { onRequestPost as __api_managers_ts_onRequestPost } from "/home/arun/GVD/functions/api/managers.ts"
import { onRequestPost as __api_upload_ts_onRequestPost } from "/home/arun/GVD/functions/api/upload.ts"
import { onRequestGet as __api_vehicles_ts_onRequestGet } from "/home/arun/GVD/functions/api/vehicles.ts"
import { onRequestPost as __api_vehicles_ts_onRequestPost } from "/home/arun/GVD/functions/api/vehicles.ts"
import { onRequestPut as __api_vehicles_ts_onRequestPut } from "/home/arun/GVD/functions/api/vehicles.ts"

export const routes = [
    {
      routePath: "/api/photos/:path*",
      mountPath: "/api/photos",
      method: "GET",
      middlewares: [],
      modules: [__api_photos___path___ts_onRequestGet],
    },
  {
      routePath: "/api/auth",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_ts_onRequestPost],
    },
  {
      routePath: "/api/centers",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_centers_ts_onRequestGet],
    },
  {
      routePath: "/api/centers",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_centers_ts_onRequestPost],
    },
  {
      routePath: "/api/managers",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_managers_ts_onRequestGet],
    },
  {
      routePath: "/api/managers",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_managers_ts_onRequestPost],
    },
  {
      routePath: "/api/upload",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_upload_ts_onRequestPost],
    },
  {
      routePath: "/api/vehicles",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_vehicles_ts_onRequestGet],
    },
  {
      routePath: "/api/vehicles",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_vehicles_ts_onRequestPost],
    },
  {
      routePath: "/api/vehicles",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_vehicles_ts_onRequestPut],
    },
  ]