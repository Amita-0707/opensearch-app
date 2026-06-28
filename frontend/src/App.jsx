// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

function App() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Typography variant="h4" component="h1" color="primary">
        OpenSearch Full-Stack App Initialized
      </Typography>
    </Box>
  );
}

export default App;