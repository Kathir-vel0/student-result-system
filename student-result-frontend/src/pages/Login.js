import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { useToast } from "../components/ToastProvider";

function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [login, setLogin] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/users/login", login);
      console.log("Login Response:", res.data);
      showToast(String(res.data), "info");

      const idMatch = res.data.match(/id:(\d+)/);
      let userId = null;

      if (idMatch) {
        userId = idMatch[1];
        localStorage.setItem("userId", userId);
      } else {
        console.log("User ID not found");
      }

      if (res.data.includes("ADMIN")) {
        localStorage.setItem("role", "ADMIN");
        navigate("/admin");
      } else if (res.data.includes("TEACHER")) {
        localStorage.setItem("role", "TEACHER");
        navigate("/teacher");
      } else if (res.data.includes("STUDENT") && userId) {
        localStorage.setItem("role", "STUDENT");

        try {
          console.log("Fetching studentId for user:", userId);
          const studentRes = await API.get(`/students/user/${userId}`);
          console.log("Student Data:", studentRes.data);
          localStorage.setItem("studentId", studentRes.data.studentId);
        } catch (err) {
          console.error("Error fetching studentId:", err);
          showToast("Student data not found", "error");
          return;
        }

        navigate("/student");
      } else {
        showToast("Invalid Username or Password", "error");
      }

    } catch (error) {
      console.error("Login Error:", error);
      showToast("Login failed", "error");
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
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, color: "text.primary" }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Enter your credentials to securely login.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            name="username"
            label="Username"
            value={login.username}
            onChange={handleChange}
            required
            sx={{ mb: 2.5 }}
          />
          <TextField
            fullWidth
            type="password"
            name="password"
            label="Password"
            value={login.password}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />
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
            Login to Dashboard
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{" "}
            <Button
              component={Link}
              to="/register"
              sx={{ fontWeight: 800, textTransform: "none", p: 0, minWidth: "auto" }}
            >
              Register here
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;