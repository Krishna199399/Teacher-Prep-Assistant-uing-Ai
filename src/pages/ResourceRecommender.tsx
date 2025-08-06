import React from 'react';
import { Container } from '@mui/material';
import ResourceRecommender from '../components/ResourceRecommender';

const ResourceRecommenderPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <ResourceRecommender />
    </Container>
  );
};

export default ResourceRecommenderPage; 