import styled from "@emotion/styled";

export const Card = styled.div`
  background: #1a1f2b;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
  }
`;

export const CardTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 700;
  color: #f1f3f5;
`;

export const CardContent = styled.div`
  color: #c5d0de;
  line-height: 1.6;
`;
