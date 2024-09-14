import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/Socket";
import { Box, Button, Typography, Container, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [myUsername, setMyUsername] = useState(""); // To store user's own username
  const [remoteUsername, setRemoteUsername] = useState(""); // To store the remote user's username

  const handleUserJoined = useCallback(({ username, id }) => {
    console.log(`Username ${username} joined room`);
    setRemoteSocketId(id);
    setRemoteUsername(username);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer, username }) => {
      setRemoteSocketId(from);
      setRemoteUsername(username);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="lg">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" color="primary">
            Room Page
          </Typography>
          <Typography component="h4" color="textSecondary" sx={{ mb: 2 }}>
            {remoteSocketId ? `Connected to ${remoteUsername}` : "No one in room"}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' }, // Vertically on mobile, horizontally on larger screens
              justifyContent: 'center',
              gap: 2,
            }}
          >
            {myStream && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6">{myUsername}'s Stream</Typography>
                <ReactPlayer
                  playing
                  muted
                  height="300px"
                  width="100%" // Responsive width
                  url={myStream}
                  style={{ borderRadius: '8px', border: '2px solid #1976d2' }}
                />
              </Box>
            )}
            {remoteStream && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6">{remoteUsername}'s Stream</Typography>
                <ReactPlayer
                  playing
                  height="300px"
                  width="100%" // Responsive width
                  url={remoteStream}
                  style={{ borderRadius: '8px', border: '2px solid #1976d2' }}
                />
              </Box>
            )}
          </Box>
          {remoteSocketId && (
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={handleCallUser}
            >
              Share Video
            </Button>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default RoomPage;
