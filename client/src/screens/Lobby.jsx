import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/Socket";
import { TextField, Button, Box, Typography, Container, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue color for primary theme
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const LobbyScreen = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  
  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { username, room });
    },
    [username, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { username, room } = data;
      console.log(username);
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" color="primary">
            Join Lobby
          </Typography>
          <Box component="form" onSubmit={handleSubmitForm} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="room"
              label="Room Number"
              name="room"
              autoComplete="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
            >
              Join Room
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default LobbyScreen;
