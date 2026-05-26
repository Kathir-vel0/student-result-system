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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import ChartCard from "../common/ChartCard";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"];

function StatCard({ label, value, loading, color }) {
  return (
    <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={80} height={48} />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 900, color: color || "text.primary", mt: 1 }}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    API.get("/analytics/admin")
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

  const subjectPerf = data?.subjectPerformance || [];
  const growth = data?.studentGrowth || [];
  const passFail = data?.passFailPie || [];
  const classAnalytics = data?.classAnalytics || [];
  const recent = data?.recentActivities || [];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
        Analytics Overview
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Students" value={data?.totalStudents ?? 0} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Teachers" value={data?.totalTeachers ?? 0} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Subjects" value={data?.totalSubjects ?? 0} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Results" value={data?.totalResults ?? 0} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Pass %" value={`${data?.passPercentage ?? 0}%`} loading={loading} color="#10b981" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Fail %" value={`${data?.failPercentage ?? 0}%`} loading={loading} color="#ef4444" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Subject-wise Performance" loading={loading} empty={!subjectPerf.length}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerf}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="average" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Student Growth" loading={loading} empty={!growth.length}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <ChartCard title="Pass / Fail" loading={loading} empty={!passFail.length}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={passFail} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {passFail.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <ChartCard title="Class-wise Analytics" loading={loading} empty={!classAnalytics.length}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="className" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" name="Avg Marks" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                Recent Activities
              </Typography>
              {loading ? (
                <Skeleton height={120} />
              ) : recent.length === 0 ? (
                <Typography color="text.secondary">No recent audit activity.</Typography>
              ) : (
                recent.map((a, i) => (
                  <Box
                    key={i}
                    sx={{
                      py: 1.5,
                      borderBottom: i < recent.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                    }}
                  >
                    <Typography sx={{ fontWeight: 800 }}>{a.action}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {a.performedBy} ({a.role}) — {a.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {a.timestamp}
                    </Typography>
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
