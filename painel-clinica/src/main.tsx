import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./components/Notification";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <div className="main-content">
        <AppRoutes />
        </div>
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
);