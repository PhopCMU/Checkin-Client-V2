import { createContext, useContext, useState, type ReactNode } from "react";
import { AlertBottomSheet } from "./AlertBottomSheet";

export type AlertState = {
  type: "success" | "error" | "info";
  message: string;
  actionText?: string;
  onAction?: () => void;
};

type AlertContextType = {
  alert: AlertState | null;
  showAlert: (alert: AlertState) => void;
  hideAlert: () => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = (data: AlertState) => setAlert(data);
  const hideAlert = () => setAlert(null);

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
      <AlertBottomSheet />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used inside AlertProvider");
  return ctx;
}
