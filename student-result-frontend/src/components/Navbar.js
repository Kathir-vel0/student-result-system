import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useTheme } from "@mui/material/styles";
import { useContext, useEffect, useState } from "react";
import { ColorModeContext } from "../theme/ThemeProviderWrapper";
import { useLayoutNav } from "../context/LayoutNavContext";
import API from "../api/api";

function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDesktop, setMobileOpen } = useLayoutNav();
  const { toggleColorMode } = useContext(ColorModeContext);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username") || "User";
  const avatarLetter = username.charAt(0).toUpperCase();

  const title = role 
    ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    : "Dashboard";

  const [notifications, setNotifications] = useState([
    { title: "Welcome", body: "Check exam updates and results here." },
  ]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!role) return;
    API.get("/exams/notifications", { params: { limit: 10 } })
      .then((res) => {
        const items = (res.data || []).map((n) => ({
          title: n.title,
          body: n.message,
        }));
        if (items.length) {
          setNotifications(items);
          setUnreadCount(items.length);
        }
      })
      .catch(() => {});
  }, [role]);

  const openNotifications = Boolean(notificationAnchor);
  const openSettings = Boolean(settingsAnchor);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const profileRoute = role === "TEACHER" ? "/teacher-profile" : "/view-profile";
  const isAdmin = role === "ADMIN";
  const showNavbarLogout = !!role;

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          px: { xs: 1, sm: 2 },
          gap: 1,
          minHeight: { xs: 56, sm: 64 },
          flexWrap: "nowrap",
        }}
      >
        {!isDesktop && (
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
            sx={{ color: "text.primary", mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
            flex: { xs: 1, md: "unset" },
            mr: { xs: 0, md: 2 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              display: { xs: "none", md: "block" },
              whiteSpace: "nowrap",
            }}
          >
            ResultSys
          </Typography>
          <Typography
            variant="subtitle1"
            component="div"
            color="text.secondary"
            sx={{
              fontWeight: 700,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title} Dashboard
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: { xs: 8, sm: 16 } }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.25, sm: 0.5 }, flexShrink: 0 }}>
          <IconButton
            color="inherit"
            aria-label="Notifications"
            onClick={(e) => {
              setNotificationAnchor(e.currentTarget);
              setUnreadCount(0);
            }}
            sx={{ color: "text.primary" }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>

          <Popover
            open={openNotifications}
            anchorEl={notificationAnchor}
            onClose={() => setNotificationAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Box
              sx={{
                p: 1.5,
                width: "min(100vw - 24px, 320px)",
                maxWidth: "100vw",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 900, mb: 1 }}
              >
                Notifications
              </Typography>
              <List dense>
                {notifications.map((n, idx) => (
                  <ListItem key={idx} sx={{ borderRadius: 2 }}>
                    <ListItemText primary={n.title} secondary={n.body} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Popover>

          <IconButton
            color="inherit"
            aria-label="Settings"
            onClick={(e) => setSettingsAnchor(e.currentTarget)}
            sx={{ color: "text.primary" }}
          >
            <SettingsOutlinedIcon />
          </IconButton>

          <Menu
            anchorEl={settingsAnchor}
            open={openSettings}
            onClose={() => setSettingsAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              onClick={() => {
                toggleColorMode();
                setSettingsAnchor(null);
              }}
            >
              {theme.palette.mode === "dark"
                ? "Switch to Light mode"
                : "Switch to Dark mode"}
            </MenuItem>

            <MenuItem
              onClick={() => {
                setSettingsAnchor(null);
                if (isAdmin) return;
                navigate(profileRoute);
              }}
            >
              View Profile
            </MenuItem>

            {showNavbarLogout && (
              <MenuItem
                onClick={() => {
                  setSettingsAnchor(null);
                  handleLogout();
                }}
              >
                Logout
              </MenuItem>
            )}
          </Menu>

          <Divider orientation="vertical" flexItem sx={{ mx: { xs: 0.5, sm: 1.5 }, my: 1.5 }} />

          <Box
            onClick={(e) => setProfileAnchor(e.currentTarget)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.75, sm: 1.25 },
              cursor: "pointer",
              p: 0.5,
              px: { xs: 0.5, sm: 1.25 },
              borderRadius: 3,
              transition: "all 0.2s ease-in-out",
              border: "1px solid transparent",
              "&:hover": {
                bgcolor: "action.hover",
                borderColor: "divider",
              }
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                display: { xs: "none", sm: "block" },
                color: "text.primary",
                whiteSpace: "nowrap",
              }}
            >
              {username}
            </Typography>
            <Avatar
              sx={{
                background: theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                fontWeight: 800,
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                fontSize: { xs: 13, sm: 15 },
                boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
                }
              }}
            >
              {avatarLetter}
            </Avatar>
          </Box>

          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={() => setProfileAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 220,
                borderRadius: 3,
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
                border: "1px solid",
                borderColor: "divider",
                p: 0.5,
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {username}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                {role?.toLowerCase()}
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              disabled={isAdmin}
              onClick={() => {
                setProfileAnchor(null);
                navigate(profileRoute);
              }}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                setProfileAnchor(null);
                toggleColorMode();
              }}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon>
                {theme.palette.mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </ListItemIcon>
              {theme.palette.mode === "dark" ? "Light Mode" : "Dark Mode"}
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() => {
                setProfileAnchor(null);
                handleLogout();
              }}
              sx={{
                color: "error.main",
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              <ListItemIcon sx={{ color: "error.main" }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;