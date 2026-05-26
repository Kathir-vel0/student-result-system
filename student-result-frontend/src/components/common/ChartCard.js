import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

export default function ChartCard({ title, subtitle, loading, height = 320, children, empty }) {
  return (
    <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", height: "100%" }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        <Box sx={{ width: "100%", height, minHeight: height }}>
          {loading ? (
            <Skeleton variant="rounded" width="100%" height={height} />
          ) : empty ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
                fontWeight: 600,
              }}
            >
              No data available
            </Box>
          ) : (
            children
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
