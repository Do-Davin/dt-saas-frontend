// Public surface of the digital-menu feature.
// Routing is owned by the top-level app router (src/router.tsx); this file
// only re-exports the route objects so a feature never mounts its own
// <RouterProvider>.
export { digitalMenuRoutes } from "./router";
