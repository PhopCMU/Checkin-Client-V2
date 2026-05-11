import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticatedLocally } from "../utils/authService";

interface Props {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // เช็ค offline ก่อน → เร็วทันใจ
    const isValid = isAuthenticatedLocally();
    setIsAuth(isValid);
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return <div>กำลังตรวจสอบ...</div>;
  }

  return isAuth ? (
    <>{children}</>
  ) : (
    <Navigate to="/sign-in" replace state={{ from: location }} />
  );
};

export default PrivateRoute;
