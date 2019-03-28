import React from 'react';

import SectionTitle from '../components/SectionTitle';
import FullPageSection from '../components/FullPageSection';

import Calculator from '../components/Calculator';

const Home = () => (
  <FullPageSection>
    <SectionTitle>Late fee calculator</SectionTitle>
    <Calculator />
    <footer style={{ fontSize: '0.8rem', margin: '12px 0' }}>
      2019 Jon Linnell, Loughborough University London
    </footer>
  </FullPageSection>
);

export default Home;
