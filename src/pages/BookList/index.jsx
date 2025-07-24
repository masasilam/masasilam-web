import { useEffect, useState } from 'react';
import { getEbooks } from '../../services/ebookService';
import BookCard from '../../components/BookCard';
import MainLayout from '../../layouts/MainLayout';
import { Typography, CircularProgress, Alert, Box } from '@mui/material';

export default function BookList() {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getEbooks({});
        console.log('API Response:', response); // Debug log
        setEbooks(response.data.list || []);
      } catch (error) {
        console.error('Error fetching ebooks:', error);
        setError('Failed to load ebooks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Browse Ebooks
      </Typography>

      {ebooks.length === 0 ? (
        <Typography variant="body1" textAlign="center" color="text.secondary">
          No ebooks found.
        </Typography>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ebooks.map(ebook => (
            <BookCard key={ebook.id} ebook={ebook} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}