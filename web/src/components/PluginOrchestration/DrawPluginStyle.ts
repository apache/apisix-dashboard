import styled from 'styled-components';

export const SOuter = styled.div`
  padding: 30px;
`;

export const SInput = styled.input`
  padding: 10px;
  border: 1px solid cornflowerblue;
  width: 100%;
`;

export const SMessage = styled.div`
  margin: 10px;
  padding: 10px;
  line-height: 1.4em;
`;

export const SButton = styled.div`
  padding: 10px 15px;
  background: cornflowerblue;
  color: white;
  border-radius: 3px;
  text-align: center;
  transition: 0.3s ease all;
  cursor: pointer;
  &:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  &:active {
    background: #5682d2;
  }
`;

export const SPortDefaultOuter = styled.div`
  width: 24px;
  height: 24px;
  background: cornflowerblue;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

export const SSidebar = styled.div`
  width: 300px;
  background: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

export const SPageContent = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  max-width: 100vw;
  max-height: 100vh;
`;
