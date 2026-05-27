import { useMemo } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import EventIcon from "@mui/icons-material/Event";
import RoomIcon from "@mui/icons-material/Room";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const STATUS_COLOR = {
  SCHEDULED: "info",
  ONGOING: "warning",
  COMPLETED: "secondary",
  PUBLISHED: "success",
  DRAFT: "default",
};

export default function ExamTimetableView({ entries, viewMode = "grid", loading }) {
  const byDate = useMemo(() => {
    const map = {};
    (entries || []).forEach((e) => {
      const key = e.examDate || "TBD";
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [entries]);

  if (loading) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
        Loading timetable...
      </Typography>
    );
  }

  if (!entries?.length) {
    return (
      <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
        <Typography color="text.secondary">No exam schedule found.</Typography>
      </Paper>
    );
  }

  if (viewMode === "table") {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Exam</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Teacher</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((e, i) => (
              <TableRow key={i} hover>
                <TableCell>{e.examDate || "—"}</TableCell>
                <TableCell>
                  {e.startTime} – {e.endTime}
                  {e.durationMinutes ? ` (${e.durationMinutes}m)` : ""}
                </TableCell>
                <TableCell>{e.examName}</TableCell>
                <TableCell>{e.subjectName}</TableCell>
                <TableCell>
                  {e.className} {e.section}
                </TableCell>
                <TableCell>{e.roomNumber || "—"}</TableCell>
                <TableCell>{e.teacherName || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Box>
      {byDate.map(([date, items]) => (
        <Box key={date} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            <EventIcon color="primary" fontSize="small" />
            {date}
          </Typography>
          <Grid container spacing={2}>
            {items.map((e, i) => (
              <Grid item xs={12} sm={6} md={4} key={`${date}-${i}`}>
                <Card sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {e.subjectName}
                      </Typography>
                      <Chip size="small" label={e.status || "—"} color={STATUS_COLOR[e.status] || "default"} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {e.examName} · {e.examType}
                    </Typography>
                    <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                      <AccessTimeIcon fontSize="inherit" />
                      {e.startTime || "—"} – {e.endTime || "—"}
                      {e.durationMinutes ? ` (${e.durationMinutes} min)` : ""}
                    </Typography>
                    <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                      <RoomIcon fontSize="inherit" />
                      Room {e.roomNumber || "TBA"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {e.className} {e.section} · {e.teacherName || "Teacher TBA"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}
