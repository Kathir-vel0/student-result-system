import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

function getInitialMode() {
  try {
    return localStorage.getItem("theme-mode") || "light";
  } catch {
    return "light";
  }
}

export default function ThemeProviderWrapper({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    try {
      localStorage.setItem("theme-mode", mode);
    } catch {
      // ignore write errors (private browsing etc.)
    }
  }, [mode]);

  const theme = useMemo(() => {
    const isDark = mode === "dark";
    return createTheme({
      palette: {
        mode,
        primary: { main: "#4f46e5" }, // indigo-ish
        secondary: { main: "#06b6d4" }, // cyan-ish
        background: {
          default: isDark ? "#0b1220" : "#f1f5f9",
          paper: isDark ? "#0f172a" : "#ffffff",
        },
      },
      shape: { borderRadius: 12 },
      typography: {
        fontFamily:
          '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
            },
          },
        },
      },
    });
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            position: "fixed",
            right: { xs: 12, sm: 18 },
            bottom: { xs: "calc(12px + env(safe-area-inset-bottom, 0px))", sm: 18 },
            zIndex: 1350,
          }}
        >
          <Tooltip
            title={mode === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
          >
            <IconButton
              onClick={colorMode.toggleColorMode}
              color="primary"
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
              }}
            >
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

// Handy re-export for consumers that want the context without importing twice.
export function useColorMode() {
  return useContext(ColorModeContext);
}

