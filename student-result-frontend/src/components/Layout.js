import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import { LayoutNavProvider } from "../context/LayoutNavContext";

function Layout() {
  return (
    <LayoutNavProvider>
      <Box
        sx={{
          display: "flex",
          minHeight: "100dvh",
          bgcolor: "background.default",
        }}
      >
        <Sidebar />

        <Box
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            width: { xs: "100%", md: "auto" },
          }}
        >
          <Navbar />
          <Box
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              overflowY: "auto",
              flex: 1,
              bgcolor: "background.default",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </LayoutNavProvider>
  );
}

export default Layout;