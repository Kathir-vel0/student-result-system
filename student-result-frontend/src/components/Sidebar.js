import { NavLink, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

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
  const drawerWidth = 240;

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
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(180deg, rgba(79,70,229,0.12), rgba(6,182,212,0.06))",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          ResultSys
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {role ? role.toLowerCase() : "guest"}
        </Typography>
      </Box>

      <Divider />

      <List sx={{ p: 1 }}>
        {items.map((item) => {
          const selected = location.pathname === item.to;
          return (
            <ListItemButton
              key={item.to}
              selected={selected}
              component={NavLink}
              to={item.to}
              sx={{
                borderRadius: 2,
                my: 0.5,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
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