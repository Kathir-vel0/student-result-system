import { NavLink, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useLayoutNav } from "../context/LayoutNavContext";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SchoolIcon from "@mui/icons-material/School";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PostAddIcon from "@mui/icons-material/PostAdd";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

function Sidebar() {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const { isDesktop, mobileOpen, closeMobileNav, drawerWidth } = useLayoutNav();

  const items =
    role === "ADMIN"
      ? [
          { label: "Dashboard", to: "/admin", icon: <DashboardIcon /> },
          { label: "Add Student", to: "/add-student", icon: <PersonAddIcon /> },
          { label: "Add Teacher", to: "/add-teacher", icon: <PersonAddIcon /> },
          { label: "Add Subject", to: "/add-subject", icon: <SchoolIcon /> },
          { label: "View Students", to: "/view-students", icon: <PeopleAltIcon /> },
          { label: "View Teachers", to: "/view-teachers", icon: <AccountCircleIcon /> },
          { label: "View Results", to: "/view-results", icon: <AssignmentTurnedInIcon /> },
        ]
      : role === "TEACHER"
      ? [
          { label: "Dashboard", to: "/teacher", icon: <DashboardIcon /> },
          { label: "View Students", to: "/view-students", icon: <PeopleAltIcon /> },
          { label: "Add Marks", to: "/add-result", icon: <PostAddIcon /> },
          { label: "Profile", to: "/teacher-profile", icon: <AccountCircleIcon /> },
        ]
      : role === "STUDENT"
      ? [
          { label: "Dashboard", to: "/student", icon: <DashboardIcon /> },
          { label: "My Results", to: "/result", icon: <AssignmentTurnedInIcon /> },
          { label: "Profile", to: "/view-profile", icon: <AccountCircleIcon /> },
        ]
      : [];

  return (
    <Drawer
      variant={isDesktop ? "permanent" : "temporary"}
      open={isDesktop || mobileOpen}
      onClose={closeMobileNav}
      ModalProps={{
        keepMounted: true,
        BackdropProps: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(2px)",
          },
        },
      }}
      sx={(theme) => ({
        width: { md: drawerWidth },
        flexShrink: { md: 0 },
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
          boxShadow:
            theme.palette.mode === "dark"
              ? "8px 0 40px rgba(0,0,0,0.55)"
              : "6px 0 28px rgba(15, 23, 42, 0.1)",
          ...(!isDesktop && {
            top: 56,
            height: "calc(100% - 56px)",
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
            pb: "env(safe-area-inset-bottom, 0px)",
            [theme.breakpoints.up("sm")]: {
              top: 64,
              height: "calc(100% - 64px)",
            },
          }),
        },
      })}
    >
      <Box
        sx={{
          px: 2,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: (t) =>
            t.palette.mode === "dark" ? "grey.900" : "grey.50",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", letterSpacing: -0.3 }}>
          ResultSys
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", fontWeight: 600, textTransform: "capitalize" }}>
          {role ? role.toLowerCase() : "guest"} portal
        </Typography>
      </Box>

      <Divider />

      <List sx={{ p: 1, flex: 1, overflowY: "auto" }}>
        {items.map((item) => {
          const selected = location.pathname === item.to;
          return (
            <ListItemButton
              key={item.to}
              selected={selected}
              component={NavLink}
              to={item.to}
              onClick={() => {
                if (!isDesktop) closeMobileNav();
              }}
              sx={{
                borderRadius: 2,
                my: 0.5,
                "&:hover": {
                  bgcolor: "action.hover",
                },
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}

        {items.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            Please login to see the menu.
          </Typography>
        )}
      </List>
    </Drawer>
  );
}

export default Sidebar;