import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

const ProfileFooter = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        p: 4,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 10px 30px rgba(0,0,0,0.01)"
      }}
    >
      <Typography 
        variant="subtitle2" 
        color="text.secondary" 
        sx={{ mb: 1.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.5 }}
      >
        Session Settings
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
        Sign out on this device when you are finished. Your authentication credentials and tokens will be securely cleared.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<LogoutOutlinedIcon />}
          onClick={handleLogout}
          sx={{ 
            borderRadius: 3, 
            fontWeight: "bold", 
            py: 1.5, 
            px: 4, 
            width: { xs: "100%", sm: "auto" },
            minWidth: 200,
            textTransform: "none",
            boxShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.2)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow: "0 6px 20px 0 rgba(239, 68, 68, 0.3)",
              transform: "translateY(-1px)"
            }
          }}
        >
          Log out
        </Button>
      </Box>
    </Paper>
  );
};

export default ProfileFooter;
