import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./protectedRoute";
import { LoginPage } from "./pages/loginPage/loginPage";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { ConfigProvider } from "antd";
import ru_RU from "antd/locale/ru_RU";
import "./App.css";
import { OrdersPage } from "./pages/ordersPage/ordersPage";
import { OrderDetailsPage } from "./pages/ordersPage/orderDetailsPage";
import { MovementsPage } from "./pages/movementsPage/movementsPage";
import { MovementDetailsPage } from "./pages/movementsPage/movementDetailsPage";

dayjs.locale("ru");

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={ru_RU}>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailsPage />} />
              <Route path="/movements" element={<MovementsPage />} />
              <Route path="/movements/:id" element={<MovementDetailsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
