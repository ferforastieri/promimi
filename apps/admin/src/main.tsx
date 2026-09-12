import { createRoot } from "react-dom/client";
import { PromimiQueryProvider } from "@promimi/query";
import { ToastProvider } from "@promimi/design-system";
import "./tailwind.css";
import { AdminScreen } from "./features/admin/AdminScreen";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js"));
}

createRoot(document.getElementById("root")!).render(
  <PromimiQueryProvider>
    <ToastProvider>
      <AdminScreen />
    </ToastProvider>
  </PromimiQueryProvider>,
);
