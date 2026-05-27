import { useEffect, useState } from "react";
import API from "../../api/api";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TableSortLabel from "@mui/material/TableSortLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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
  const [examDetail, setExamDetail] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Table state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState("marksObtained");
  const [order, setOrder] = useState("desc");

  useEffect(() => {
    if (!examId || !subjectId) return;
    setLoading(true);
    Promise.all([
      API.get(`/exams/${examId}`),
      API.get(`/exams/${examId}/marks`, { params: { subjectId, includeUnpublished: true } }),
    ])
      .then(([examRes, marksRes]) => {
        setExamDetail(examRes.data);
        setMarks(marksRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [examId, subjectId]);

  if (!examId || !subjectId) return null;

  if (loading) {
    return (
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 2 }}>
        <CircularProgress size={50} />
        <Typography color="text.secondary">Loading analytical workspace...</Typography>
      </Box>
    );
  }

  // --- STATS COMPUTATIONS ---
  const presentStudents = marks.filter((m) => m.marksObtained !== null);
  const totalStudents = marks.length;
  const absentStudents = totalStudents - presentStudents.length;

  const subjectDetail = examDetail?.subjects?.find((s) => Number(s.subjectId) === Number(subjectId));
  const maxMarks = subjectDetail?.maxMarks || 100;
  const passMarks = subjectDetail?.passMarks || 35;

  const presentMarks = presentStudents.map((m) => Number(m.marksObtained));
  const classAverage = presentMarks.length
    ? Math.round((presentMarks.reduce((a, b) => a + b, 0) / presentMarks.length) * 100) / 100
    : 0;
  const highestMark = presentMarks.length ? Math.max(...presentMarks) : 0;
  const lowestMark = presentMarks.length ? Math.min(...presentMarks) : 0;

  const passCount = presentStudents.filter((m) => m.marksObtained >= passMarks).length;
  const passPercentage = presentMarks.length ? Math.round((passCount / presentMarks.length) * 10000) / 100 : 0;

  const distinctionCount = presentStudents.filter((m) => m.marksObtained >= maxMarks * 0.75).length;

  // Rank Map with mathematical tie handling
  const sortedForRank = [...presentStudents].sort((a, b) => b.marksObtained - a.marksObtained);
  const studentRanks = {};
  let currentRank = 1;
  for (let i = 0; i < sortedForRank.length; i++) {
    if (i > 0 && sortedForRank[i].marksObtained < sortedForRank[i - 1].marksObtained) {
      currentRank = i + 1;
    }
    studentRanks[sortedForRank[i].studentId] = currentRank;
  }

  // --- CHART DATASETS ---
  const distributionData = [
    { range: `0-${passMarks - 1}`, count: presentStudents.filter((m) => m.marksObtained < passMarks).length },
    { range: `${passMarks}-50`, count: presentStudents.filter((m) => m.marksObtained >= passMarks && m.marksObtained <= 50).length },
    { range: "51-70", count: presentStudents.filter((m) => m.marksObtained >= 51 && m.marksObtained <= 70).length },
    { range: "71-85", count: presentStudents.filter((m) => m.marksObtained >= 71 && m.marksObtained <= 85).length },
    { range: "86-100", count: presentStudents.filter((m) => m.marksObtained >= 86).length },
  ];

  const pieData = [
    { name: "Pass", value: passCount },
    { name: "Fail/Absent", value: totalStudents - passCount },
  ];
  const PIE_COLORS = ["#10B981", "#EF4444"];

  const gradeCount = { "A+": 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
  presentStudents.forEach((s) => {
    const g = s.grade || "F";
    if (gradeCount[g] !== undefined) gradeCount[g]++;
    else gradeCount["F"]++;
  });
  const gradeData = Object.entries(gradeCount).map(([grade, count]) => ({ grade, count }));

  const performanceCurveData = [...presentStudents]
    .sort((a, b) => a.marksObtained - b.marksObtained)
    .map((s, idx) => ({
      index: idx + 1,
      name: s.name,
      marks: s.marksObtained,
    }));

  // --- WEAK & ABSENT LISTS ---
  const weakList = presentStudents.filter((s) => s.marksObtained < passMarks);
  const absentList = marks.filter((s) => s.marksObtained === null);

  // --- SMART INSIGHTS ---
  const insights = [];
  if (presentStudents.length > 0) {
    insights.push(`Class average is at ${classAverage} / ${maxMarks} (${Math.round((classAverage / maxMarks) * 1000) / 10}%).`);
    if (passPercentage >= 80) {
      insights.push(`Excellent performance! Subject pass rate is at ${passPercentage}%.`);
    } else if (passPercentage >= 50) {
      insights.push(`Moderate performance: Subject pass rate is ${passPercentage}%. Active support suggested.`);
    } else {
      insights.push(`High Alert: Subject pass rate is under target at ${passPercentage}%. Immediate support needed.`);
    }
    if (distinctionCount > 0) {
      insights.push(`${distinctionCount} students achieved Distinction (scored >=75% marks).`);
    }
    if (weakList.length > 0) {
      insights.push(`${weakList.length} students scored below the pass threshold of ${passMarks} and need support.`);
    }
  } else {
    insights.push("Roster contains no grading results yet.");
  }

  // --- CSV EXPORT UTILITY ---
  const exportToCSV = () => {
    const headers = "Student ID,Student Name,Marks,Percentage,Grade,Rank,Status\n";
    const rows = marks
      .map((s) => {
        const isAbsent = s.marksObtained === null;
        const marksVal = isAbsent ? "ABSENT" : s.marksObtained;
        const pctVal = isAbsent ? "0%" : `${Math.round((s.marksObtained / maxMarks) * 1000) / 10}%`;
        const gradeVal = isAbsent ? "F" : (s.grade || "—");
        const rankVal = isAbsent ? "—" : (studentRanks[s.studentId] || "—");
        const statusVal = isAbsent ? "ABSENT" : (s.marksObtained >= passMarks ? "PASSED" : "FAILED");
        return `"${s.studentId}","${s.name}",${marksVal},"${pctVal}","${gradeVal}",${rankVal},"${statusVal}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Analytics_${examDetail?.examName || "Exam"}_${subjectDetail?.subjectName || "Subject"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ROSTER FILTERING, SORTING, PAGINATION ---
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredRoster = marks.filter((s) => {
    const q = search.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.studentId?.toLowerCase().includes(q);
  });

  const sortedRoster = [...filteredRoster].sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    // Handle absent values
    if (orderBy === "marksObtained") {
      aValue = a.marksObtained === null ? -1 : a.marksObtained;
      bValue = b.marksObtained === null ? -1 : b.marksObtained;
    } else if (orderBy === "rank") {
      aValue = a.marksObtained === null ? 9999 : (studentRanks[a.studentId] || 9999);
      bValue = b.marksObtained === null ? 9999 : (studentRanks[b.studentId] || 9999);
    }

    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    if (aValue < bValue) return order === "asc" ? -1 : 1;
    if (aValue > bValue) return order === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedRoster = sortedRoster.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ mt: 2 }}>
      {/* 🌟 KPI CARDS GRID */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Students", value: totalStudents, color: "primary.main" },
          { label: "Present Students", value: presentStudents.length, color: "success.main" },
          { label: "Absent Students", value: absentStudents, color: absentStudents > 0 ? "error.main" : "text.secondary" },
          { label: "Class Average", value: `${classAverage} / ${maxMarks}`, color: "primary.main" },
          { label: "Highest Mark", value: highestMark, color: "success.main" },
          { label: "Lowest Mark", value: lowestMark, color: lowestMark < passMarks ? "error.main" : "text.primary" },
          { label: "Pass Rate", value: `${passPercentage}%`, color: passPercentage >= 75 ? "success.main" : "warning.main" },
          { label: "Distinctions (>=75%)", value: distinctionCount, color: "primary.main" },
        ].map((kpi, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", height: "100%" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {kpi.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5, color: kpi.color }}>
                  {kpi.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 📊 CHARTS SECTION */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Histogram */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Marks Distribution Histogram" loading={false} height={260}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Pass Fail Pie Chart */}
        <Grid item xs={12} sm={6} md={3}>
          <ChartCard title="Pass vs Fail / Absent" loading={false} height={260}>
            {presentStudents.length === 0 ? (
              <Box sx={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="text.secondary" variant="body2">No present student data</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, bgcolor: "#10B981", borderRadius: "50%" }} />
                <Typography variant="caption">Pass ({passCount})</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, bgcolor: "#EF4444", borderRadius: "50%" }} />
                <Typography variant="caption">Fail/Absent ({totalStudents - passCount})</Typography>
              </Box>
            </Box>
          </ChartCard>
        </Grid>

        {/* Grade Distribution */}
        <Grid item xs={12} sm={6} md={3}>
          <ChartCard title="Grade Distribution" loading={false} height={260}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="grade" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Performance Curve Line Chart */}
        <Grid item xs={12}>
          <ChartCard title="Class Performance Curve (Sorted Scores Slope)" loading={false} height={260}>
            {presentStudents.length === 0 ? (
              <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="text.secondary" variant="body2">No score slope curve available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={performanceCurveData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="index" label={{ value: 'Students Ordered by Score', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                  <YAxis domain={[0, maxMarks]} tick={{ fontSize: 10 }} />
                  <Tooltip labelFormatter={(v, items) => items[0]?.payload?.name || "Student"} />
                  <Line type="monotone" dataKey="marks" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* 🧠 SMART INSIGHTS & WEAK STUDENTS PANEL */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Smart Insights */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, height: "100%", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Smart Performance Insights</Typography>
              </Box>
              <List dense>
                {insights.map((ins, i) => (
                  <ListItem key={i} sx={{ px: 0, py: 0.75 }}>
                    <ListItemText
                      primary={ins}
                      primaryTypographyProps={{ variant: "body2", fontWeight: 700 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk / Weak Students Alerts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, height: "100%", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <WarningAmberIcon color="error" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Academic Risk Alerts</Typography>
              </Box>
              
              {weakList.length === 0 && absentList.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  ✔ Outstanding! Roster contains no failing or absent students.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {/* Weak Students */}
                  {weakList.length > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="error" sx={{ fontWeight: 800, mb: 0.5 }}>
                        Failing Students ({weakList.length})
                      </Typography>
                      <Paper sx={{ p: 1, maxHeight: 120, overflowY: "auto", border: "1px solid", borderColor: "divider" }} elevation={0}>
                        {weakList.map((s, i) => (
                          <Typography key={i} variant="caption" display="block" sx={{ fontWeight: 600, py: 0.25 }}>
                            • {s.name} ({s.marksObtained} Marks)
                          </Typography>
                        ))}
                      </Paper>
                    </Grid>
                  )}

                  {/* Absent Students */}
                  {absentList.length > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800, mb: 0.5 }}>
                        Absent Students ({absentList.length})
                      </Typography>
                      <Paper sx={{ p: 1, maxHeight: 120, overflowY: "auto", border: "1px solid", borderColor: "divider" }} elevation={0}>
                        {absentList.map((s, i) => (
                          <Typography key={i} variant="caption" display="block" sx={{ fontWeight: 600, py: 0.25 }}>
                            • {s.name} ({s.studentId})
                          </Typography>
                        ))}
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 📊 STUDENT PERFORMANCE LIST TABLE */}
      <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Student Performance Roster
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <TextField
                size="small"
                placeholder="Search student..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 220 }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadIcon />}
                onClick={exportToCSV}
                sx={{ borderRadius: 2 }}
              >
                Export CSV
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: (t) => t.palette.mode === "dark" ? "grey.900" : "grey.50" }}>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "studentId"}
                      direction={orderBy === "studentId" ? order : "asc"}
                      onClick={() => handleSort("studentId")}
                      sx={{ fontWeight: 800 }}
                    >
                      Student ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={() => handleSort("name")}
                      sx={{ fontWeight: 800 }}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "marksObtained"}
                      direction={orderBy === "marksObtained" ? order : "desc"}
                      onClick={() => handleSort("marksObtained")}
                      sx={{ fontWeight: 800 }}
                    >
                      Marks
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Percentage</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "grade"}
                      direction={orderBy === "grade" ? order : "desc"}
                      onClick={() => handleSort("grade")}
                      sx={{ fontWeight: 800 }}
                    >
                      Grade
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "rank"}
                      direction={orderBy === "rank" ? order : "asc"}
                      onClick={() => handleSort("rank")}
                      sx={{ fontWeight: 800 }}
                    >
                      Rank
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRoster.map((row) => {
                  const isAbsent = row.marksObtained === null;
                  const score = isAbsent ? "ABSENT" : `${row.marksObtained} / ${maxMarks}`;
                  const pct = isAbsent ? "—" : `${Math.round((row.marksObtained / maxMarks) * 1000) / 10}%`;
                  const grade = isAbsent ? "—" : (row.grade || "F");
                  const rank = isAbsent ? "—" : `#${studentRanks[row.studentId] || "—"}`;
                  
                  let chipColor = "success";
                  let chipLabel = "PASSED";
                  if (isAbsent) {
                    chipColor = "default";
                    chipLabel = "ABSENT";
                  } else if (row.marksObtained < passMarks) {
                    chipColor = "error";
                    chipLabel = "FAILED";
                  }

                  return (
                    <TableRow key={row.studentId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{row.studentId}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: isAbsent ? "text.secondary" : "text.primary" }}>
                        {score}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{pct}</TableCell>
                      <TableCell>
                        <Chip size="small" label={grade} color={isAbsent ? "default" : (grade === "F" ? "error" : "primary")} />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "primary.main" }}>{rank}</TableCell>
                      <TableCell>
                        <Chip size="small" label={chipLabel} color={chipColor} variant="outlined" sx={{ fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredRoster.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No students found matching search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredRoster.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>
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
