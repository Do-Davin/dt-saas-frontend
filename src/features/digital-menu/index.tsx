import { RouterProvider } from "react-router";
import { digitalMenuRouter } from "./router";

export function DigitalMenu() {
  return <RouterProvider router={digitalMenuRouter} />;
}
