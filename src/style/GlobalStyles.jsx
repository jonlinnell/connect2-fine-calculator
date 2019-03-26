import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Lato:300,400');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css');

  html {
    font-size: 12pt;
  }

  body {
    background-color: #fcfcfc;
    font-family: 'Lato', sans-serif;
  }
`;

export default GlobalStyle;
