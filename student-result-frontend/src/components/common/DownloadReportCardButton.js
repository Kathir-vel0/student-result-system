import { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import API from "../../api/api";
import { generateReportCardPdf } from "../../utils/reportCardPdf";
import { useToast } from "../ToastProvider";

export default function DownloadReportCardButton({ studentId, variant = "contained", size = "medium", sx }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!studentId) {
      showToast("Student ID not found.", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await API.get(`/analytics/report-card/${studentId}`);
      await generateReportCardPdf(res.data);
      showToast("Report card downloaded successfully.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate report card.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PictureAsPdfIcon />}
      sx={{ borderRadius: 2, fontWeight: 800, ...sx }}
    >
      {loading ? "Generating..." : "Download Report Card"}
    </Button>
  );
}
