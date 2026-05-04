import { useEffect, useMemo, useState } from "react";
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

function ViewSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [form, setForm] = useState({
    subjectName: "",
    subjectCode: "",
  });

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const res = await API.get("/subjects/all");
      setSubjects(res.data || []);
    } catch (e) {
      console.error(e);
      showToast("Unable to load subjects", "error");
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      subjectName: s?.subjectName || "",
      subjectCode: s?.subjectCode || "",
    });
    setEditOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editing) return;
    const id = editing?.id;
    if (!id) {
      showToast("Missing subject id", "error");
      return;
    }

    try {
      await API.put(`/subjects/update/${id}`, {
        subjectName: form.subjectName,
        subjectCode: form.subjectCode,
      });
      showToast("Subject updated successfully", "success");
      setEditOpen(false);
      setEditing(null);
      setForm({ subjectName: "", subjectCode: "" });
      loadSubjects();
    } catch (e) {
      console.error(e);
      showToast("Unable to update subject", "error");
    }
  };

  const handleDelete = (s) => {
    setPendingDelete(s);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete?.id;
    if (!id) {
      showToast("Missing subject id", "error");
      setConfirmOpen(false);
      setPendingDelete(null);
      return;
    }

    try {
      await API.delete(`/subjects/delete/${id}`);
      showToast("Subject deleted successfully", "success");
      setConfirmOpen(false);
      setPendingDelete(null);
      loadSubjects();
    } catch (e) {
      console.error(e);
      showToast("Unable to delete subject", "error");
    }
  };

  const title = useMemo(() => "View & Manage Subjects", []);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
        {title}
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 4 }}>
        {loading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : subjects.length === 0 ? (
          <Typography color="text.secondary">No subjects found.</Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "none",
              overflowX: "auto",
              maxWidth: "100%",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Table size="small" aria-label="subjects table" sx={{ minWidth: 400 }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 900 }}>
                    ID
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 900 }}>
                    Subject Name
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 900 }}>
                    Subject Code
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 900 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((s) => (
                  <TableRow
                    key={s.id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell align="center">{s.id}</TableCell>
                    <TableCell align="center">{s.subjectName}</TableCell>
                    <TableCell align="center">{s.subjectCode}</TableCell>
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
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Edit Subject</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="subjectName"
                label="Subject Name"
                value={form.subjectName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="subjectCode"
                label="Subject Code"
                value={form.subjectCode}
                onChange={handleChange}
              />
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
            Delete subject "{pendingDelete?.subjectName || ""}"?
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

export default ViewSubjects;

