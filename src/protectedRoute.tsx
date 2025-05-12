import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Navbar } from "./components/navbar/navbar";
// import { Breadcrumbs } from "./components/breadcrumbs/breadcrumbs";
// import "./layout.css"; // Не забудь подключить стили, если используешь их

const ProtectedRoute: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="main-content">
        {/* <Breadcrumbs /> */}
        <Outlet />
      </div>
    </>
  );
};

export default ProtectedRoute;
