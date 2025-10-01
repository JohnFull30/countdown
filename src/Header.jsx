import React, { useEffect, useState } from "react";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (active) {
        setSession(session ?? null);
      }
    }

    load();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;
      setSession(newSession ?? null);
    });

    return () => {
      active = false;
      listener.subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  };

  const handleSignIn = () => {
    if (location.pathname !== "/auth") {
      navigate("/auth");
    }
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="h6"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Countdown Premium
          </Typography>
        </Box>

        {session ? (
          <Button color="inherit" onClick={handleSignOut}>
            Sign out
          </Button>
        ) : (
          <Button color="inherit" onClick={handleSignIn}>
            Sign in
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
