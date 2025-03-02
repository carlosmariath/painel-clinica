import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

const MainLayout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3,  mt: "64px" }}>
        <Header />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;