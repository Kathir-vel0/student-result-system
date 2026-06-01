import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Slide from "@mui/material/Slide";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CampaignIcon from "@mui/icons-material/Campaign";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import API from "../../api/api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Synthesizes a soft, pleasant notification chime natively
const playSubtleSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    // Soft dual-tone melody (C5 -> E5 -> G5)
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
    
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.7);
  } catch (e) {
    console.warn("Subtle sound playback blocked or unsupported by browser policy:", e);
  }
};

function AnnouncementPopup() {
  const theme = useTheme();
  const [queue, setQueue] = useState([]);
  const [open, setOpen] = useState(false);
  const role = localStorage.getItem("role");

  // Fetch unread popup announcements on mount
  useEffect(() => {
    if (!role || role === "ADMIN") return;

    API.get("/announcements/unread-popup")
      .then((res) => {
        const items = res.data || [];
        if (items.length > 0) {
          setQueue(items);
          setOpen(true);
          // Play a gentle notification chime
          setTimeout(() => {
            playSubtleSound();
          }, 400);
        }
      })
      .catch((err) => {
        console.error("Error fetching unread announcement popups:", err);
      });
  }, [role]);

  if (queue.length === 0) return null;

  const current = queue[0];

  const handleAction = async (markRead = true) => {
    try {
      if (markRead) {
        await API.post(`/announcements/${current.id}/mark-read`);
      }
    } catch (err) {
      console.error("Failed to mark announcement as read:", err);
    } finally {
      // Dequeue current notification
      const remaining = queue.slice(1);
      setQueue(remaining);
      if (remaining.length === 0) {
        setOpen(false);
      } else {
        // Trigger subtle chime for the next notification in queue
        setTimeout(() => {
          playSubtleSound();
        }, 300);
      }
    }
  };

  // Format the date/time beautifully
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      // If the string does not end with Z or a timezone offset, append the IST offset (+05:30)
      let formattedStr = dateStr;
      if (typeof dateStr === "string" && !dateStr.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(dateStr)) {
        formattedStr = dateStr + "+05:30";
      }
      const d = new Date(formattedStr);
      return d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Determine role-based badge details and color gradients for headers
  const getRoleDesign = (target) => {
    switch (target) {
      case "STUDENT":
        return {
          label: "Students Only",
          bg: "linear-gradient(135deg, #0288d1 0%, #26c6da 100%)",
          chipColor: "info",
        };
      case "TEACHER":
        return {
          label: "Teachers Only",
          bg: "linear-gradient(135deg, #7b1fa2 0%, #ab47bc 100%)",
          chipColor: "secondary",
        };
      default:
        return {
          label: "Everyone",
          bg: "linear-gradient(135deg, #e65100 0%, #ffa726 100%)",
          chipColor: "warning",
        };
    }
  };

  const design = getRoleDesign(current.targetRole);

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => handleAction(true)}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: theme.shadows[24],
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
        },
      }}
    >
      {/* Premium Gradient Header */}
      <Box
        sx={{
          background: design.bg,
          px: 3,
          py: 2.5,
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          color: "#fff",
        }}
      >
        <CampaignIcon sx={{ fontSize: 28 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Announcement
          </Typography>
          <Chip
            label={design.label}
            size="small"
            color={design.chipColor}
            variant="filled"
            sx={{
              height: 20,
              fontSize: "0.75rem",
              fontWeight: 700,
              mt: 0.5,
              bgcolor: "rgba(255, 255, 255, 0.25)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.4)",
            }}
          />
        </Box>
        <IconButton
          size="small"
          onClick={() => handleAction(true)}
          sx={{
            color: "rgba(255,255,255,0.85)",
            "&:hover": {
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.15)",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Modern Dialog Content */}
      <DialogContent sx={{ p: 3, mt: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1.5,
            color: "text.primary",
            lineHeight: 1.3,
          }}
        >
          {current.title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            whiteSpace: "pre-line",
            lineHeight: 1.6,
            mb: 3,
          }}
        >
          {current.message}
        </Typography>

        {/* Sender and Timing Meta labels */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            pt: 2,
            borderTop: `1px dashed ${theme.palette.divider}`,
            fontSize: "0.8rem",
            color: "text.secondary",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 16, color: "action.active" }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Sender: Admin Staff
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: "action.active" }} />
            <Typography variant="caption">
              {formatDateTime(current.createdAt)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 1,
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        {queue.length > 1 ? (
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            {queue.length - 1} more pending
          </Typography>
        ) : (
          <div />
        )}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => handleAction(true)}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleAction(true)}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            Mark as Read
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default AnnouncementPopup;
