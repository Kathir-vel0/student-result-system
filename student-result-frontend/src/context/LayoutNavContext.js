import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const LayoutNavContext = createContext(null);

/** md+ = permanent sidebar; below md = overlay drawer toggled from navbar */
export function LayoutNavProvider({ children }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileNav = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isDesktop,
      mobileOpen,
      setMobileOpen,
      closeMobileNav,
      drawerWidth: 240,
    }),
    [isDesktop, mobileOpen, closeMobileNav]
  );

  return (
    <LayoutNavContext.Provider value={value}>
      {children}
    </LayoutNavContext.Provider>
  );
}

export function useLayoutNav() {
  const ctx = useContext(LayoutNavContext);
  if (!ctx) {
    throw new Error("useLayoutNav must be used within LayoutNavProvider");
  }
  return ctx;
}
