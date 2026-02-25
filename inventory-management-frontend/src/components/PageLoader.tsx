import React from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * Centered loading fallback for Suspense (e.g. lazy-loaded route chunks).
 * Keeps layout stable and matches admin theme.
 */
export const PageLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 280,
      width: '100%',
    }}
  >
    <CircularProgress size={40} />
  </Box>
);

/** Compact fallback for lazy-loaded modals/forms. */
export const ModalLoader: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
    <CircularProgress size={32} />
  </Box>
);
