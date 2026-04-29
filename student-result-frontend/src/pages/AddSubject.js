import { useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useToast } from "../components/ToastProvider";
import { useNavigate } from "react-router-dom";

function AddSubject() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [subject, setSubject] = useState({
    subjectName: "",
    subjectCode: ""
  });

  const handleChange = (e) => {
    setSubject({ ...subject, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/subjects/add", {
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode
      });

      showToast("Subject Added Successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Error adding subject", "error");
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
        Add Subject
      </Typography>

      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3} direction="column">
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                name="subjectName"
                label="Subject Name"
                value={subject.subjectName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                name="subjectCode"
                label="Subject Code"
                value={subject.subjectCode}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                sx={{ borderRadius: 3, px: 3, py: 1.25 }}
              >
                Add
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                onClick={() => navigate("/view-subjects")}
                sx={{ borderRadius: 3, px: 3, py: 1.25, width: "100%" }}
              >
                View Existing Subjects
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      </Box>
    </Box>
  );
}

export default AddSubject;