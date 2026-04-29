import React, { useEffect, useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useToast } from "../components/ToastProvider";

function ViewStudents() {
  const [students, setStudents] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const { showToast } = useToast();
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    photo: "",
    className: "",
    section: "",
    email: "",
    dob: "",
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    API.get("/students")
      .then((res) => {
        console.log("Students:", res.data);
        setStudents(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
      });
  };

  const openEdit = (student) => {
    setEditingStudent(student);
    setForm({
      studentId: student?.studentId || "",
      name: student?.name || "",
      photo: student?.photo || "",
      className: student?.className || "",
      section: student?.section || "",
      email: student?.email || "",
      dob: student?.dob ? String(student.dob).slice(0, 10) : "",
    });
    setPhotoPreview(student?.photo || "");
    setEditOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoFileEdit = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      setForm((prev) => ({ ...prev, photo: result }));
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!editingStudent) return;

    const payload = {
      studentId: form.studentId,
      name: form.name,
      photo: form.photo,
      className: form.className,
      section: form.section,
      email: form.email,
      dob: form.dob,
    };

    const id = editingStudent.id; // student entity id in backend
    try {
      await API.put(`/students/${id}`, payload);
    } catch (e) {
      console.error(e);
      showToast("Unable to update student. Check backend endpoint.", "error");
      return;
    }

    showToast("Student updated successfully", "success");
    setEditOpen(false);
    setEditingStudent(null);
    loadStudents();
  };

  const handleDelete = async (student) => {
    setPendingDelete(student);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete?.id;
    if (!id) {
      showToast("Missing student id", "error");
      setConfirmOpen(false);
      setPendingDelete(null);
      return;
    }
    try {
      await API.delete(`/students/${id}`);
    } catch (e) {
      console.error(e);
      showToast("Unable to delete student. Check backend endpoint.", "error");
      setConfirmOpen(false);
      setPendingDelete(null);
      return;
    }
    showToast("Student deleted successfully", "success");
    setConfirmOpen(false);
    setPendingDelete(null);
    loadStudents();
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
        All Students
      </Typography>

      {students.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">No students found</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small" aria-label="students table">
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  ID
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Student ID
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Name
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Class
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Section
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Email
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  DOB
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s) => (
                <TableRow
                  key={s.id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center">{s.id}</TableCell>
                  <TableCell align="center">{s.studentId}</TableCell>
                  <TableCell align="center">{s.name}</TableCell>
                  <TableCell align="center">{s.className}</TableCell>
                  <TableCell align="center">{s.section}</TableCell>
                  <TableCell align="center">{s.email}</TableCell>
                  <TableCell align="center">{s.dob}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(s)}
                      aria-label="Edit"
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(s)}
                      aria-label="Delete"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Edit Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="studentId"
                label="Student ID"
                value={form.studentId}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="name"
                label="Name"
                value={form.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="className"
                label="Class"
                value={form.className}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="section"
                label="Section"
                value={form.section}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={form.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="dob"
                label="DOB"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.dob}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <Typography sx={{ fontWeight: 800, mb: 1 }}>
                  Student Photo
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  sx={{ borderRadius: 3 }}
                >
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handlePhotoFileEdit}
                  />
                </Button>

                {photoPreview ? (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={photoPreview}
                      alt="Student preview"
                      style={{
                        width: 72,
                        height: 72,
                        objectFit: "cover",
                        borderRadius: 12,
                      }}
                    />
                  </Box>
                ) : (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 2 }}
                  >
                    No photo selected
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 3 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Delete student "
            {pendingDelete?.name || pendingDelete?.studentId || ""}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              setPendingDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={confirmDelete} sx={{ borderRadius: 3 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ViewStudents;