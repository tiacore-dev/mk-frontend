import React, { useEffect, useMemo, useState } from "react";
import { Spin, Row, Col, Typography, Button, Divider } from "antd";
// import { setBreadcrumbs } from "../../redux/slices/breadcrumbsSlice";
// import { useDispatch } from "react-redux";
// import { ShiftDetails } from "../shiftsPage/shiftDetailPage/components/shiftDetail";
import { useNavigate } from "react-router-dom";
// import { useShiftQuery } from "../../hooks/shifts/useShiftQuery";
// import { useShiftsQuery } from "../../hooks/shifts/useShiftsQuery";
// import { useMobileDetection } from "../../hooks/useMobileDetection";
// import { DesktopManifestsTable } from "../shiftsPage/shiftDetailPage/components/desktopManifestsTable";
// import { MobileManifestsList } from "../shiftsPage/shiftDetailPage/components/mobileManifestsList";

export const HomePage: React.FC = () => {
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  // const isMobile = useMobileDetection();
  // const [areDetailsCollapsed, setAreDetailsCollapsed] = useState(false);
  //
  // const { data: shiftsData } = useShiftsQuery({ limit: 1, offset: 0 });
  // const lastShiftId = shiftsData?.data?.[0]?.id;
  // const { data: shiftData, isLoading } = useShiftQuery(lastShiftId || "");

  // const breadcrumbs = useMemo(() => [{ label: " ", to: "/home" }], []);

  // useEffect(() => {
  //   dispatch(setBreadcrumbs(breadcrumbs));
  // }, [dispatch, breadcrumbs]);

  // const manifestsTable = useMemo(() => {
  //   if (!shiftData?.manifests?.length) return null;

  //   return isMobile ? (
  //     <MobileManifestsList
  //       data={shiftData.manifests}
  //       isLoading={false}
  //       shiftId={lastShiftId || ""}
  //     />
  //   ) : (
  //     <DesktopManifestsTable
  //       data={shiftData.manifests}
  //       rowKey="id"
  //       shiftId={lastShiftId || ""}
  //     />
  //   );
  // }, [isMobile, shiftData?.manifests, lastShiftId]);

  // if (isLoading) return <Spin size="large" />;

  return (
    <Row justify="center">
      <Col xs={24} sm={24} md={22} lg={20} xl={18}>
        <Typography.Paragraph>hello world ^^ </Typography.Paragraph>
      </Col>
    </Row>
  );
};
