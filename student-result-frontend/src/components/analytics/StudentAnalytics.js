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
  LineChart,
  Line,
} from "recharts";
import ChartCard from "../common/ChartCard";

function StatCard({ label, value, loading, suffix = "" }) {
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
            {suffix}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function StudentAnalytics({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    API.get(`/analytics/student/${studentId}`)
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
  }, [studentId]);

  const subjectMarks = data?.subjectMarks || [];
  const trend = data?.performanceTrend || [];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
        Performance Analytics
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard label="GPA / Avg %" value={data?.gpaPercentage ?? 0} loading={loading} suffix="%" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Attendance" value={data?.attendancePercentage ?? 0} loading={loading} suffix="%" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Class Rank" value={data?.rank ?? "—"} loading={loading} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Subjects" value={data?.totalSubjects ?? 0} loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Subject-wise Marks" loading={loading} empty={!subjectMarks.length}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectMarks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="marks" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Performance Trend" loading={loading} empty={!trend.length}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="marks" stroke="#10B981" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
