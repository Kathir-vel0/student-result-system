import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function PaginationControls({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
  onSizeChange,
  rowsPerPageOptions = [5, 10, 25, 50],
}) {
  const from = totalElements === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mt: 2,
        p: 1.5,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        {totalElements > 0 ? `${from}–${to} of ${totalElements}` : "No records"}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Rows
        </Typography>
        <FormControl size="small">
          <Select value={size} onChange={(e) => onSizeChange(Number(e.target.value))}>
            {rowsPerPageOptions.map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <IconButton
          size="small"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 72, textAlign: "center" }}>
          {totalPages > 0 ? `${page + 1} / ${totalPages}` : "0 / 0"}
        </Typography>
        <IconButton
          size="small"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
