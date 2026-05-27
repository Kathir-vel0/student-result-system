import { useEffect, useState } from "react";
import API from "../../api/api";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import ChartCard from "../common/ChartCard";

const COLORS = ["#10B981", "#EF4444", "#4F46E5", "#F59E0B"];

export function AdminExamAnalytics({ examId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId) return;
    setLoading(true);
    API.get(`/exams/analytics/admin/${examId}`)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [examId]);

  if (!examId) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Exam Analytics — {data?.examName || ""}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <ChartCard title="Pass %" loading={loading}>
            {loading ? <Skeleton height={40} /> : (
              <Typography variant="h4" sx={{ fontWeight: 900, color: "success.main" }}>
                {data?.passPercentage ?? 0}%
              </Typography>
            )}
          </ChartCard>
        </Grid>
        <Grid item xs={6} md={3}>
          <ChartCard title="Fail %" loading={loading}>
            {loading ? <Skeleton height={40} /> : (
              <Typography variant="h4" sx={{ fontWeight: 900, color: "error.main" }}>
                {data?.failPercentage ?? 0}%
              </Typography>
            )}
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Pass / Fail" loading={loading} height={220}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data?.passFailPie || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {(data?.passFailPie || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Subject Averages" loading={loading} height={260}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.subjectAverages || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12}>
          <ChartCard title="Top Performers" loading={loading}>
            {(data?.toppers || []).map((t, i) => (
              <Typography key={i} variant="body2" sx={{ py: 0.5 }}>
                {i + 1}. {t.name} ({t.studentId}) — {t.percentage}%
              </Typography>
            ))}
            {!loading && !(data?.toppers || []).length && (
              <Typography color="text.secondary">No data yet.</Typography>
            )}
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}

export function TeacherExamAnalytics({ examId, subjectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId || !subjectId) return;
    setLoading(true);
    API.get("/exams/analytics/teacher", { params: { examId, subjectId } })
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [examId, subjectId]);

  if (!examId || !subjectId) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <ChartCard title="Class Average" loading={loading}>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              {data?.classAverage ?? "—"}
            </Typography>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={8}>
          <ChartCard title="Marks Distribution" loading={loading} height={240}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.marksDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12}>
          <ChartCard title="Students Needing Support" loading={loading}>
            {(data?.weakStudents || []).map((s, i) => (
              <Typography key={i} variant="body2">
                {s.name} ({s.studentId}) — {s.marks} marks
              </Typography>
            ))}
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}

export function StudentExamAnalytics({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    API.get(`/exams/analytics/student/${studentId}`)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <ChartCard title="Rank" loading={loading}>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              #{data?.rank || "—"}
            </Typography>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={9}>
          <ChartCard title="GPA / Performance Trend" loading={loading} height={240}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data?.gpaTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exam" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#4F46E5" strokeWidth={2} />
                <Line type="monotone" dataKey="gpa" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12}>
          <ChartCard title="Subject Performance" loading={loading} height={240}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.subjectPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
