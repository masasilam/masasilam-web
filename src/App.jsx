import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import BookList from './pages/BookList';
// import BookDetail from './pages/BookDetail';
// import UploadBook from './pages/UploadBook';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/books" element={<BookList />} />
        {/* <Route path="/books/:id" element={<BookDetail />} /> */}
        {/* <Route path="/upload" element={<UploadBook />} /> */}
      </Routes>
    </ThemeProvider>
  );
}

export default App;