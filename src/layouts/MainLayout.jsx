import { Box, Container, AppBar, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            STANDARD EBOOKS
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container component="main" sx={{ py: 3, flexGrow: 1 }}>
        {children}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'grey.200',
          p: 2,
          mt: 'auto',
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © 2025 Standard Ebooks. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default MainLayout;