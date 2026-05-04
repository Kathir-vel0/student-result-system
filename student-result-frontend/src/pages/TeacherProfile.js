import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

// Icons
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

function handleLogout() {
  localStorage.clear();
  window.location.href = "/";
}

function TeacherProfile() {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        if (!userId) {
          if (!cancelled) {
            setTeacher(null);
            setLoading(false);
          }
          return;
        }

        // backend doesn't expose "teacher by userId"; fetch all and match by user.id
        const teachersRes = await API.get("/teachers/all");
        const allTeachers = teachersRes.data || [];
        const data = allTeachers.find(
          (t) => String(t?.user?.id) === String(userId)
        );

        if (!cancelled) {
          setTeacher(data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setTeacher(null);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const statusChip = useMemo(() => {
    const status = teacher?.status || teacher?.role || "";
    if (!status) return null;
    return (
      <Chip 
        label={String(status).toUpperCase()} 
        size="small" 
        color="primary" 
        sx={{ fontWeight: "bold", letterSpacing: 1 }} 
      />
    );
  }, [teacher]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!teacher) {
    return (
      <Box>
        <Paper sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: "text.secondary" }}>
            Profile Not Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Your teacher profile details could not be retrieved at this time. Please try again later.
          </Typography>
          <Button variant="outlined" color="error" startIcon={<LogoutOutlinedIcon />} onClick={handleLogout}>
            Log out
          </Button>
        </Paper>
      </Box>
    );
  }

  const name =
    teacher?.name ||
    teacher?.user?.name ||
    teacher?.user?.username ||
    teacher?.username ||
    "Teacher";

  const email = teacher?.email || teacher?.user?.email || "Not Provided";
  const phone = teacher?.phone || teacher?.user?.phone || "Not Provided";

  const subjectName =
    teacher?.subject?.subjectName ||
    teacher?.subject?.subjectCode ||
    teacher?.subjectName ||
    teacher?.subjects?.[0]?.subjectName ||
    "Not Assigned";

  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, color: 'text.primary' }}>
        My Profile
      </Typography>

      <Card sx={{ borderRadius: 6, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 4 }}>
        {/* Cover Banner */}
        <Box 
          sx={{ 
            height: 160, 
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            position: 'relative'
          }}
        />

        {/* Profile Content */}
        <Box sx={{ px: { xs: 3, md: 5 }, pb: 5, pt: 0 }}>
          {/* Avatar & Header Info */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              alignItems: { xs: 'center', md: 'flex-end' },
              mb: 4
            }}
          >
              <Avatar
                src={teacher?.photo}
                alt={name}
                sx={{ 
                  width: 140, 
                  height: 140, 
                  border: '6px solid', 
                  borderColor: 'background.paper',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                bgcolor: 'primary.main',
                fontSize: 56,
                fontWeight: 800,
                mt: -7,
                mb: { xs: 2, md: 0 },
                mr: { xs: 0, md: 3 }
              }}
            >
              {name?.[0]?.toUpperCase() || "T"}
            </Avatar>
            
            <Box sx={{ pb: 1, textAlign: { xs: 'center', md: 'left' }, flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                {name}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1.5 }}>
                {teacher?.id ? `Teacher ID: ${teacher.id}` : "Instructor"}
              </Typography>
              {statusChip}
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={4}>
            {/* Contact Details */}
            <Grid item xs={12} md={7}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'text.primary' }}>
                Contact & Professional Info
              </Typography>
              
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', color: 'text.secondary', display: 'flex' }}>
                    <EmailOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Email Address</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>{email}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', color: 'text.secondary', display: 'flex' }}>
                    <PhoneOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Phone Number</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>{phone}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(79,70,229,0.1)', color: 'primary.main', display: 'flex' }}>
                    <MenuBookOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Primary Subject</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>{subjectName}</Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>

            {/* Quick Stats / Identifiers */}
            <Grid item xs={12} md={5}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'text.primary' }}>
                System Details
              </Typography>
              
              <Stack spacing={2}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <PersonOutlineOutlinedIcon sx={{ color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>USERNAME</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {teacher?.user?.username || teacher?.username || "N/A"}
                    </Typography>
                  </Box>
                </Paper>

                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <VerifiedUserOutlinedIcon sx={{ color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>ROLE ACCOUNT</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {teacher?.role || "TEACHER"}
                    </Typography>
                  </Box>
                </Paper>

                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <BadgeOutlinedIcon sx={{ color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>SUBJECT ID</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {teacher?.subject?.id || teacher?.subjectId || "N/A"}
                    </Typography>
                  </Box>
                </Paper>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
              Session
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 560 }}>
              Sign out on this device when you are done. Your account stays secure; sign in again when you return.
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="large"
              fullWidth
              startIcon={<LogoutOutlinedIcon />}
              onClick={handleLogout}
              sx={{ borderRadius: 2, fontWeight: 800, py: 1.25, maxWidth: { sm: 400 } }}
            >
              Log out
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

export default TeacherProfile;
