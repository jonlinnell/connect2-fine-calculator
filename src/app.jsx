import React from 'react';
import { render } from 'react-dom';
import { ThemeProvider } from 'styled-components';

import theme from './style/theme.json';

import GlobalStyles from './style/GlobalStyles';

import Home from './pages/Home';

const App = () => (
  <ThemeProvider theme={theme}>
    <main>
      <GlobalStyles />
      <Home />
    </main>
  </ThemeProvider>
);

render(<App />, document.getElementById('root'));
