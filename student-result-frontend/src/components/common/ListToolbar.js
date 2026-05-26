import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

export default function ListToolbar({
  search,
  onSearchChange,
  onSearch,
  onReset,
  children,
  searchPlaceholder = "Search by name, ID, email...",
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={children ? 4 : 8}>
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
          />
        </Grid>
        {children}
        <Grid item xs={12} md="auto" sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={onSearch} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Search
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterAltOffIcon />}
            onClick={onReset}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Reset
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
