import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import { useTheme } from "@mui/material/styles";
import { useContext, useMemo, useState } from "react";
import { ColorModeContext } from "../theme/ThemeProviderWrapper";
import { useLayoutNav } from "../context/LayoutNavContext";

function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDesktop, setMobileOpen } = useLayoutNav();
  const { toggleColorMode } = useContext(ColorModeContext);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [settingsAnchor, setSettingsAnchor] = useState(null);

  const role = localStorage.getItem("role");
  const avatarInitial = role ? role[0] : "A";

  const title = role 
    ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    : "Dashboard";

  const notifications = useMemo(
    () => [
      { title: "System Update", body: "Latest changes are now live." },
      { title: "New Activity", body: "Check your latest results." },
      { title: "Reminder", body: "Keep adding marks on time." },
    ],
    []
  );

  const openNotifications = Boolean(notificationAnchor);
  const openSettings = Boolean(settingsAnchor);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const profileRoute = role === "TEACHER" ? "/teacher-profile" : "/view-profile";

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
            onClick={(e) => setNotificationAnchor(e.currentTarget)}
            sx={{ color: "text.primary" }}
          >
            <NotificationsNoneIcon />
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
                if (role === "ADMIN") return;
                navigate(profileRoute);
              }}
            >
              View Profile
            </MenuItem>

            <MenuItem
              onClick={() => {
                setSettingsAnchor(null);
                handleLogout();
              }}
            >
              Logout
            </MenuItem>
          </Menu>

        <IconButton 
          color="inherit" 
          aria-label="Account"
          onClick={() => {
            if (role === "ADMIN") return;
            navigate(profileRoute);
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 32,
              height: 32,
              fontSize: 14,
            }}
          >
            {avatarInitial}
          </Avatar>
        </IconButton>

        <Button
          variant="contained"
          color="error"
          size="small"
          sx={{
            ml: { xs: 0.5, sm: 1.5 },
            borderRadius: 2,
            display: { xs: "none", sm: "inline-flex" },
            whiteSpace: "nowrap",
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;