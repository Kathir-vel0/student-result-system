import { useEffect, useState } from "react";
import API from "../../api/api";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import ChartCard from "../common/ChartCard";

function StatCard({ label, value, loading }) {
  return (
    <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={60} height={40} />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function TeacherAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    API.get("/analytics/teacher")
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const distribution = data?.marksDistribution || [];
  const topPerformers = data?.topPerformers || [];
  const subjectPerf = data?.subjectPerformance || [];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
        Teaching Analytics
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard label="Assigned Subjects" value={data?.assignedSubjects ?? 0} loading={loading} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Students" value={data?.totalStudents ?? 0} loading={loading} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Marks Submitted" value={data?.marksSubmitted ?? 0} loading={loading} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Attendance %" value={`${data?.attendancePercentage ?? 0}%`} loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Marks Distribution" loading={loading} empty={!distribution.length}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Subject Averages" loading={loading} empty={!subjectPerf.length}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerf}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="average" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                Top Performers
              </Typography>
              {loading ? (
                <Skeleton height={80} />
              ) : topPerformers.length === 0 ? (
                <Typography color="text.secondary">No marks data yet.</Typography>
              ) : (
                topPerformers.map((s, i) => (
                  <Box
                    key={s.studentId}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      #{i + 1} {s.name} ({s.studentId})
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: "primary.main" }}>{s.marks}</Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
