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
import { Toaster } from "react-hot-toast";
import { themeConfig } from "./theme/themeConfig";
import { BalancePage } from "./pages/balancePage/balancePage";
import { WriteOffsPage } from "./pages/writeOffsPage/writeOffsPage";
import { WriteOffDetailsPage } from "./pages/writeOffsPage/writeOffDetailsPage";
import { ReportPage } from "./pages/reportPage/reportPage";
import { SalesPage } from "./pages/salesPage/salesPage";
import { SalesDetailsPage } from "./pages/salesPage/salesDetailsPage";

dayjs.locale("ru");

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={themeConfig}>
        <ConfigProvider locale={ru_RU}>
          <Router basename="/client">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/write_offs" element={<WriteOffsPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/sales/:id" element={<SalesDetailsPage />} />
                <Route
                  path="/write_offs/:id"
                  element={<WriteOffDetailsPage />}
                />

                <Route path="/orders/:id" element={<OrderDetailsPage />} />
                <Route path="/movements" element={<MovementsPage />} />
                <Route
                  path="/movements/:id"
                  element={<MovementDetailsPage />}
                />
                <Route path="/balance" element={<BalancePage />} />
                <Route path="/reports" element={<ReportPage />} />
                <Route path="*" element={<Navigate to="/orders" />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
          <Toaster
            toastOptions={{
              error: {
                style: {
                  maxWidth: 420,
                  padding: "12px 14px",
                },
              },
            }}
          />
        </ConfigProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
