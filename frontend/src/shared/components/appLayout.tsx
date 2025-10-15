"use client";

import styled from "@emotion/styled";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/shared/hooks/useSidebar";
import { Sidebar } from "./sidebar";

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main<{ sidebarOpen: boolean; hasSidebar: boolean }>`
  flex: 1;
  margin-left: ${(props) => (props.hasSidebar ? "250px" : "0")};
  padding: 0;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 0;
  }
`;

const ContentWrapper = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 80px 20px 20px;
  }
`;

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <AppContainer>
      {!isLoginPage && <Sidebar isOpen={isOpen} onToggle={toggleSidebar} />}
      <MainContent sidebarOpen={isOpen} hasSidebar={!isLoginPage}>
        <ContentWrapper>{children}</ContentWrapper>
      </MainContent>
    </AppContainer>
  );
}
