import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useToast } from "../components/ToastProvider";

function Register() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: "",
    password: "",
    role: "STUDENT"
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/users", user);
      showToast("User Registered Successfully. You can now login.", "success");
      navigate("/login");
    } catch (error) {
      console.error(error);
      showToast("Error registering user", "error");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background: "linear-gradient(135deg, rgba(79,70,229,0.98), rgba(6,182,212,0.92))",
      }}
    >
      <Paper
        elevation={24}
        sx={{
          p: { xs: 4, sm: 6 },
          borderRadius: 4,
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: "blur(12px)",
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="overline" sx={{ fontWeight: 800, color: "primary.main", letterSpacing: 1.5 }}>
            Student Result System
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              mt: 1,
              color: "text.primary",
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Register to join the portal and manage results.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            name="username"
            label="Username"
            value={user.username}
            onChange={handleChange}
            required
            sx={{ mb: 2.5 }}
          />
          <TextField
            fullWidth
            type="password"
            name="password"
            label="Password"
            value={user.password}
            onChange={handleChange}
            required
            sx={{ mb: 2.5 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="register-role-label">Platform Role</InputLabel>
            <Select
              labelId="register-role-label"
              name="role"
              label="Platform Role"
              value={user.role}
              onChange={handleChange}
            >
              <MenuItem value="STUDENT">Student</MenuItem>
              <MenuItem value="TEACHER">Teacher</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ 
              borderRadius: 3, 
              py: 1.5,
              fontWeight: 800,
              fontSize: "1rem"
            }}
          >
            Create My Account
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Button
              component={Link}
              to="/login"
              sx={{ fontWeight: 800, textTransform: "none", p: 0, minWidth: "auto" }}
            >
              Sign In
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Register;