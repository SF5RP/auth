"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/shared/hooks/redux";
import { useCurrentUser } from "@/features/auth/hooks";
import styled from "@emotion/styled";
import { Button } from "@/shared/ui/button";

const WelcomeCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  margin: 100px auto;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #6c757d;
  margin-bottom: 32px;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/profile");
    }
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <WelcomeCard>
        <Title>Загрузка...</Title>
      </WelcomeCard>
    );
  }

  return (
    <WelcomeCard>
      <Title>Auth Service</Title>
      <Subtitle>
        Добро пожаловать в сервис авторизации!
        <br />
        Войдите через Discord, чтобы продолжить.
      </Subtitle>
      <ButtonGroup>
        <Button size="large" onClick={() => router.push("/login")}>
          Войти
        </Button>
      </ButtonGroup>
    </WelcomeCard>
  );
}
