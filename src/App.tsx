import { RouterProvider } from "react-router";
import { appRouter } from "./router";
import { ToastContainer } from "./components/ui/toast";

function App() {
  return (
    <>
      <RouterProvider router={appRouter} />
      <ToastContainer />
    </>
  );
}

export default App;

