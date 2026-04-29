import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { useToast } from "../components/ToastProvider";

const digitWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

const convertMarksToWords = (marks) => {
  if (marks === null || marks === undefined || marks === "") return "";
  const marksStr = String(marks);
  return marksStr.split('').map(char => {
    if (char >= '0' && char <= '9') {
      return digitWords[parseInt(char)];
    }
    return char;
  }).join(' ');
};

const calculateGrade = (marks) => {
  if (marks === null || marks === undefined || marks === "") return "";
  const numericMarks = parseFloat(marks);
  if (isNaN(numericMarks)) return "";
  if (numericMarks >= 90) return "A+";
  if (numericMarks >= 80) return "A";
  if (numericMarks >= 70) return "B";
  if (numericMarks >= 60) return "C";
  if (numericMarks >= 50) return "D";
  return "F";
};

function AddResult() {
  const { showToast } = useToast();
  const role = localStorage.getItem("role");
  const [subjects, setSubjects] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");

  const [studentsForClass, setStudentsForClass] = useState([]);
  // Keyed by `student.studentId` (this is what backend expects in /results/add)
  const [entries, setEntries] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch subjects + students once; "Search" just filters by class.
    API.get("/students")
      .then((res) => {
        setAllStudents(res.data || []);
      })
      .catch((err) => console.error(err));

    const role = localStorage.getItem("role");
    if (role === "TEACHER") {
      const teacherUserId = localStorage.getItem("userId");
      API.get("/teachers/all")
        .then((res) => {
          const allTeachers = res.data || [];
          const teacher = allTeachers.find(
            (t) => String(t?.user?.id) === String(teacherUserId)
          );
          if (teacher && teacher.subject) {
            setSubjects([teacher.subject]);
            setSelectedSubjectCode(teacher.subject.subjectCode);
          } else {
            setSubjects([]);
          }
        })
        .catch((err) => console.error(err));
    } else {
      API.get("/subjects/all")
        .then((res) => {
          setSubjects(res.data || []);
        })
        .catch((err) => console.error(err));
    }
  }, []);

  const classOptions = useMemo(() => {
    const set = new Set();
    for (const s of allStudents) {
      if (s?.className) set.add(String(s.className));
    }
    return Array.from(set).sort();
  }, [allStudents]);

  const handleSearch = () => {
    if (!selectedSubjectCode) {
      showToast("Please select a subject.", "error");
      return;
    }
    if (!selectedClassName) {
      showToast("Please select a class.", "error");
      return;
    }

    const filtered = allStudents.filter(
      (s) => String(s?.className || "") === String(selectedClassName)
    );

    setStudentsForClass(filtered);

    // Initialize/keep per-student form entries for the filtered list
    setEntries((prev) => {
      const next = {};
      for (const s of filtered) {
        const sid = s.studentId;
        next[sid] = prev[sid] || { marks: "", grade: "", comment: "", marksInWords: "" };
      }
      return next;
    });
  };

  const handleEntryChange = (studentId, field) => (e) => {
    const value = e.target.value;
    setEntries((prev) => {
      const studentData = prev[studentId] || { marks: "", grade: "", comment: "", marksInWords: "" };
      const updatedData = { ...studentData, [field]: value };
      
      if (field === "marks") {
        updatedData.grade = calculateGrade(value);
        updatedData.marksInWords = convertMarksToWords(value);
      }
      
      return {
        ...prev,
        [studentId]: updatedData,
      };
    });
  };

  const handleSave = async () => {
    if (!selectedSubjectCode || !selectedClassName) {
      showToast("Please select subject and class first.", "error");
      return;
    }
    if (studentsForClass.length === 0) {
      showToast("No students found for this class. Please search again.", "error");
      return;
    }

    const missingMarks = studentsForClass.filter((s) => {
      const sid = s.studentId;
      const marks = entries?.[sid]?.marks;
      return marks === undefined || marks === null || String(marks).trim() === "";
    });

    if (missingMarks.length > 0) {
      showToast(
        "Please enter marks for all students before saving.",
        "error"
      );
      return;
    }

    setSaving(true);
    try {
      // Save each student's result using the existing API.
      for (const s of studentsForClass) {
        const sid = s.studentId;
        const entry = entries?.[sid] || {};
        const payload = {
          studentId: sid,
          subjectCode: selectedSubjectCode,
          marks: entry.marks,
          grade: entry.grade,
          comment: entry.comment,
        };
        await API.post("/results/add", payload);
      }

      showToast("Results saved successfully", "success");

      // Clear input fields so teacher can mark next subject.
      setEntries({});
    } catch (err) {
      console.error(err);
      showToast("Error saving results", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
        Add Marks
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <TextField
              select
              fullWidth
              required
              disabled={role === "TEACHER"}
              label="Select Subject"
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">
                <em>Select Subject</em>
              </MenuItem>
              {subjects.map((sub) => (
                <MenuItem key={sub.id} value={sub.subjectCode}>
                  {sub.subjectCode} - {sub.subjectName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={12}>
            <TextField
              select
              fullWidth
              required
              label="Select Class"
              value={selectedClassName}
              onChange={(e) => setSelectedClassName(e.target.value)}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">
                <em>Select Class</em>
              </MenuItem>
              {classOptions.map((c) => (
                <MenuItem key={c} value={c}>
                  Class {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={12}>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ borderRadius: 3, px: 3, py: 1.25, width: "100%" }}
            >
              Search
            </Button>
          </Grid>

          <Grid item xs={12} md={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || studentsForClass.length === 0}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.25,
                  backgroundColor: "primary.main",
                }}
              >
                {saving ? "Saving..." : "Save Marks"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Students table */}
      {studentsForClass.length === 0 ? (
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography color="text.secondary">
            Select a subject and class, then click `Search` to load students.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
          <Table size="small" aria-label="students results entry table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Marks</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Marks in Words</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Grade</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Comment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentsForClass.map((s) => {
                const sid = s.studentId;
                const row = entries?.[sid] || {};
                return (
                  <TableRow key={sid}>
                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography sx={{ fontWeight: 800 }}>
                          {s.name || "N/A"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {s.studentId}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ width: 140 }}>
                      <TextField
                        fullWidth
                        type="number"
                        value={row.marks ?? ""}
                        onChange={handleEntryChange(sid, "marks")}
                      />
                    </TableCell>

                    <TableCell sx={{ width: 160 }}>
                      <Typography sx={{ color: "text.secondary", fontStyle: "italic", textTransform: "capitalize" }}>
                        {row.marksInWords || convertMarksToWords(row.marks) || "—"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ width: 120 }}>
                      <TextField
                        fullWidth
                        value={row.grade ?? ""}
                        onChange={handleEntryChange(sid, "grade")}
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        fullWidth
                        value={row.comment ?? ""}
                        onChange={handleEntryChange(sid, "comment")}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default AddResult;