import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import ListToolbar from "../components/common/ListToolbar";
import PaginationControls from "../components/common/PaginationControls";
import usePaginatedList from "../hooks/usePaginatedList";

export default function AuditLogs() {
  const paginated = usePaginatedList("/audit/page", {
    defaultSize: 15,
    extraParams: { action: "", role: "" },
  });

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
        Audit Logs
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Enterprise activity trail for security and compliance.
      </Typography>

      <ListToolbar
        search={paginated.filters.search}
        onSearchChange={(v) => paginated.updateFilter("search", v)}
        onSearch={() => paginated.setPage(0)}
        onReset={paginated.resetFilters}
        searchPlaceholder="Search action, user, description..."
      >
        <Grid item xs={6} md={2}>
          <TextField
            select
            fullWidth
            size="small"
            label="Role"
            value={paginated.filters.role || ""}
            onChange={(e) => paginated.updateFilter("role", e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
            <MenuItem value="TEACHER">TEACHER</MenuItem>
            <MenuItem value="STUDENT">STUDENT</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Action"
            value={paginated.filters.action || ""}
            onChange={(e) => paginated.updateFilter("action", e.target.value)}
          />
        </Grid>
      </ListToolbar>

      {paginated.loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Target</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.data.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {log.timestamp ? String(log.timestamp).replace("T", " ").slice(0, 19) : "—"}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={log.action} sx={{ fontWeight: 800 }} />
                      </TableCell>
                      <TableCell>{log.performedBy}</TableCell>
                      <TableCell>{log.role}</TableCell>
                      <TableCell>{log.targetEntity || "—"}</TableCell>
                      <TableCell>{log.description}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <PaginationControls
            page={paginated.page}
            totalPages={paginated.totalPages}
            totalElements={paginated.totalElements}
            size={paginated.size}
            onPageChange={paginated.setPage}
            onSizeChange={(s) => {
              paginated.setSize(s);
              paginated.setPage(0);
            }}
          />
        </>
      )}
    </Box>
  );
}
