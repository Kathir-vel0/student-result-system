import { useEffect, useState } from "react";
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

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

function ViewTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    subjectId: "",
  });
  const { showToast } = useToast();

  const loadSubjects = async () => {
    try {
      const res = await API.get("/subjects/all");
      setSubjects(res.data || []);
    } catch (e) {
      console.error("Error fetching subjects:", e);
      setSubjects([]);
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await API.get("/teachers/all");
      setTeachers(res.data || []);
    } catch (e) {
      console.error("Error fetching teachers:", e);
      setTeachers([]);
    }
  };

  useEffect(() => {
    loadTeachers();
    loadSubjects();
  }, []);

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      name: t?.name || t?.user?.username || "",
      email: t?.email || t?.user?.email || "",
      phone: t?.phone || t?.user?.phone || "",
      status: t?.status || t?.role || "",
      subjectId: String(t?.subject?.id || t?.subjectId || "") || "",
    });
    setEditOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editing) return;
    const id = editing.id;
    if (!id) {
      showToast("Missing teacher id", "error");
      return;
    }

    if (!editing?.user?.id) {
      showToast(
        "Missing user info for this teacher record.",
        "error"
      );
      return;
    }
    if (!form.subjectId) {
      showToast("Please select a subject.", "error");
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      status: form.status,
      subject: form.subjectId
        ? { id: parseInt(form.subjectId, 10) }
        : undefined,
      user: editing?.user?.id ? { id: parseInt(editing.user.id, 10) } : undefined,
    };

    try {
      await API.put(`/teachers/update/${id}`, payload);
    } catch (e) {
      console.error(e);
      showToast(
        "Unable to update teacher. Check backend endpoint.",
        "error"
      );
      return;
    }

    showToast("Teacher updated successfully", "success");
    setEditOpen(false);
    setEditing(null);
    loadTeachers();
  };

  const handleDelete = async (t) => {
    setPendingDelete(t);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete?.id;
    if (!id) {
      showToast("Missing teacher id", "error");
      setConfirmOpen(false);
      setPendingDelete(null);
      return;
    }
    try {
      await API.delete(`/teachers/delete/${id}`);
    } catch (e) {
      console.error(e);
      showToast("Unable to delete teacher. Check backend endpoint.", "error");
      setConfirmOpen(false);
      setPendingDelete(null);
      return;
    }
    showToast("Teacher deleted successfully", "success");
    setConfirmOpen(false);
    setPendingDelete(null);
    loadTeachers();
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
        All Teachers
      </Typography>

      {teachers.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">No teachers found</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small" aria-label="teachers table">
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  ID
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Name
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Email
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Phone
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Status
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Subject
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((t) => {
                const subject =
                  t?.subject?.subjectName ||
                  t?.subject?.subjectCode ||
                  t?.subjectName ||
                  t?.subjectCode ||
                  "N/A";

                return (
                  <TableRow
                    key={t.id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell align="center">{t.id}</TableCell>
                    <TableCell align="center">{t.name || "N/A"}</TableCell>
                    <TableCell align="center">{t.email || "N/A"}</TableCell>
                    <TableCell align="center">{t.phone || "N/A"}</TableCell>
                    <TableCell align="center">{t.status || "N/A"}</TableCell>
                    <TableCell align="center">{subject}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(t)}
                        aria-label="Edit"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(t)}
                        aria-label="Delete"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Edit Teacher</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
                name="email"
                label="Email"
                value={form.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="phone"
                label="Phone"
                value={form.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="teacher-edit-status-label">
                  Status
                </InputLabel>
                <Select
                  labelId="teacher-edit-status-label"
                  name="status"
                  label="Status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="teacher-edit-subject-label">
                  Subject
                </InputLabel>
                <Select
                  labelId="teacher-edit-subject-label"
                  name="subjectId"
                  label="Subject"
                  value={form.subjectId}
                  onChange={handleChange}
                >
                  {subjects.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.subjectName} ({s.subjectCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ borderRadius: 3 }}
          >
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
            Delete teacher "
            {pendingDelete?.name || pendingDelete?.email || ""}"?
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
          <Button
            variant="contained"
            onClick={confirmDelete}
            sx={{ borderRadius: 3 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ViewTeachers;

