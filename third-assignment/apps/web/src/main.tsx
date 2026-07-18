import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "@third-assignment/ui/globals.css";
import { createAppRouter } from "./router";
import { queryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";

const router = createAppRouter(queryClient);
const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element #app was not found.");
}

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}
