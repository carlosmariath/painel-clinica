import { createContext, useContext, useState, ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";

interface NotificationContextType {
  showNotification: (message: string, severity?: "success" | "error" | "warning" | "info") => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error" | "warning" | "info">("info");

  const showNotification = (msg: string, sev: "success" | "error" | "warning" | "info" = "info") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setOpen(false)} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification deve ser usado dentro de um NotificationProvider");
  }
  return context;
};