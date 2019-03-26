import React from 'react';

import SectionTitle from '../components/SectionTitle';
import FullPageSection from '../components/FullPageSection';

import Calculator from '../components/Calculator';

const Home = () => (
  <FullPageSection>
    <SectionTitle noYMargin>Late fee calculator</SectionTitle>
    <p>Drag and drop a CSV report from Connect2 below to begin.</p>
    <Calculator />
  </FullPageSection>
);

export default Home;
