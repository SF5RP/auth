"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import styled from "@emotion/styled";
import { useEffect } from "react";
import { useState } from "react";
import { useAppSelector } from "@/shared/hooks/redux";
import { useCurrentUser } from "@/features/auth/hooks";
import { useServers } from "@/features/servers/hooks";
import { useRouter } from "next/navigation";
import { useServerContext } from "@/shared/contexts/serverContext";
import Image from "next/image";

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background: #1a1d29;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 20px 0 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &.open {
      transform: translateX(0);
    }
  }
`;

const SidebarScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
`;

const Logo = styled.div`
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 20px;
`;

const LogoText = styled.h2`
  color: #e9ecef;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
`;

const NavSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: #6c757d;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px 20px;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLink = styled(Link)<{ active?: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: ${(props) => (props.active === "true" ? "#ffffff" : "#94a3b8")};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.active === "true" ? "rgba(255, 255, 255, 0.05)" : "transparent"};
  border-right: ${(props) =>
    props.active === "true" ? "3px solid #22c55e" : "3px solid transparent"};

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
  }
`;

const NavIcon = styled.span`
  font-size: 18px;
  width: 20px;
  text-align: center;
`;

const NavText = styled.span`
  font-size: 14px;
`;

const MobileToggle = styled.button`
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background: #1a1d29;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px;
  color: #e9ecef;
  cursor: pointer;
  font-size: 18px;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Overlay = styled.div<{ open: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;

  @media (max-width: 768px) {
    display: ${(props) => (props.open ? "block" : "none")};
  }
`;

const ServerSelector = styled.div`
  margin: 0 20px 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
`;

const CurrentServer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const ServerEmoji = styled.span`
  font-size: 16px;
`;

const ServerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ServerName = styled.div`
  color: #e9ecef;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Removed unused ServerId styled component to satisfy lints

const ChangeServerButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 6px;
  color: #22c55e;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(34, 197, 94, 0.2);
    border-color: rgba(34, 197, 94, 0.5);
  }
`;

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: user } = useCurrentUser();
  const { data: servers } = useServers();
  const { selectedServer, setSelectedServer } = useServerContext();

  // Определяем текущий сервер из URL или из сохраненного состояния
  const getCurrentServer = () => {
    if (pathname.startsWith("/servers/") && servers) {
      const serverSlug = pathname.split("/")[2];
      const serverFromUrl = servers.find(
        (srv: { id: string }) => srv.id === serverSlug
      );
      if (serverFromUrl) {
        return serverFromUrl;
      }
    }
    // Возвращаем сохраненный сервер, если не находимся на странице сервера
    return selectedServer;
  };

  const currentServer = getCurrentServer();

  // Обновляем выбранный сервер при изменении URL или списка серверов
  useEffect(() => {
    if (pathname.startsWith("/servers/") && servers) {
      const serverSlug = pathname.split("/")[2];
      const serverFromUrl = servers.find(
        (srv: { id: string }) => srv.id === serverSlug
      );
      if (serverFromUrl && serverFromUrl.id !== selectedServer?.id) {
        setSelectedServer(serverFromUrl);
      }
    }
  }, [pathname, servers, selectedServer, setSelectedServer]);

  const charactersHref = currentServer
    ? `/servers/${currentServer.id}/characters`
    : "/servers";

  const navigationItems = [
    {
      title: "Основное",
      items: [
        {
          href: "/",
          icon: "🏠",
          label: "Главная",
          show: true,
        },
        {
          href: charactersHref,
          icon: "🧍",
          label: "Персонажи",
          show: isAuthenticated,
        },
        {
          href: "/profile",
          icon: "👤",
          label: "Профиль",
          show: isAuthenticated,
        },
        {
          href: "/admin/users",
          icon: "👥",
          label: "Пользователи",
          show: isAuthenticated && user?.role === "admin",
        },
      ],
    },
  ];

  return (
    <>
      <MobileToggle onClick={onToggle}>☰</MobileToggle>

      <Overlay open={isOpen} onClick={onToggle} />

      <SidebarContainer className={isOpen ? "open" : ""}>
        <SidebarScroll>
          <Logo>
            <LogoText>User Service</LogoText>
          </Logo>

          {currentServer && isAuthenticated && (
            <ServerSelector>
              <CurrentServer>
                <ServerEmoji>{currentServer.emoji}</ServerEmoji>
                <ServerInfo>
                  <ServerName>{currentServer.name}</ServerName>
                </ServerInfo>
              </CurrentServer>
              <ChangeServerButton onClick={() => void router.push("/servers")}>
                Сменить сервер
              </ChangeServerButton>
            </ServerSelector>
          )}

          {navigationItems.map((section) => (
            <NavSection key={section.title}>
              <SectionTitle>{section.title}</SectionTitle>
              <NavList>
                {section.items
                  .filter((item) => item.show)
                  .map((item) => (
                    <NavItem key={item.href}>
                      <NavLink
                        href={item.href}
                        active={pathname === item.href ? "true" : "false"}
                      >
                        <NavIcon>{item.icon}</NavIcon>
                        <NavText>{item.label}</NavText>
                      </NavLink>
                    </NavItem>
                  ))}
              </NavList>
            </NavSection>
          ))}
        </SidebarScroll>

        {isAuthenticated && user && (
          <UserFooter>
            <UserAvatar>
              <SafeAvatar src={getAvatarSrc(user.avatar)} alt={user.username} />
            </UserAvatar>
            <UserInfo>
              <UserName>{user.username}</UserName>
              {user.discriminator && user.discriminator !== "0" && (
                <UserSub>@{user.discriminator}</UserSub>
              )}
            </UserInfo>
          </UserFooter>
        )}
      </SidebarContainer>
    </>
  );
}

const UserFooter = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const UserAvatar = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
`;

const UserAvatarFallback = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const UserInfo = styled.div`
  min-width: 0;
`;

const UserName = styled.div`
  color: #e9ecef;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserSub = styled.div`
  color: #6c757d;
  font-size: 12px;
`;

function getAvatarSrc(avatar?: string): string {
  if (!avatar) return "/default-avatar.png";
  try {
    const url = new URL(avatar);
    return url.href;
  } catch {
    return "/default-avatar.png";
  }
}

function SafeAvatar({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);
  return hasError ? (
    <UserAvatarFallback aria-label={alt}>
      <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" fill="#94a3b8" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1Z" fill="#94a3b8" />
      </svg>
    </UserAvatarFallback>
  ) : (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="40px"
      onError={() => setHasError(true)}
    />
  );
}
