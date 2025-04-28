import React, { useEffect } from "react";
// import "@ant-design/v5-patch-for-react-19";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
// import { Provider } from "react-redux";
import ProtectedRoute from "./protectedRoute";
import { LoginPage } from "./pages/loginPage/loginPage";
import { HomePage } from "./pages/homePage/homePage";
// import { AccountPage } from "./pages/accountPage/accountPage";
// import { ShiftsPage } from "./pages/shiftsPage/shiftsPage";
// import { ShiftDetailPage } from "./pages/shiftsPage/shiftDetailPage/shiftDetailPage";
// import { ManifestDetailPage } from "./pages/shiftsPage/manifests/manifestDetailsPage";
// import { WarehouseReceivePage } from "./pages/warehousePage/receivePage/receivePage"; //
// import { WarehouseShipPage } from "./pages/warehousePage/shipPage/shipPage"; //
// import "antd/dist/reset.css";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { ConfigProvider } from "antd";
import ru_RU from "antd/locale/ru_RU";
// import { store } from "./redux/store";
// import theme from "./theme/themeConfig";
// import { TestPage } from "./pages/testPage/testPage";
import "./App.css";
import { OrdersPage } from "./pages/ordersPage/ordersPage";
import { OrderDetailsPage } from "./pages/ordersPage/orderDetailsPage";

dayjs.locale("ru");

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    // <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={ru_RU}>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              {/* <Route path="/home" element={<HomePage />} /> */}
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
    // {/* </Provider> */}
  );
};

export default App;
