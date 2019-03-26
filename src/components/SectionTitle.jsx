import styled from 'styled-components';

const SectionTitle = styled.h1`
  margin: ${({ noYMargin }) => (noYMargin ? 0 : '0.67em')} 0;
`;

export default SectionTitle;
