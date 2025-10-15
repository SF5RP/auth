"use client";
import styled from "@emotion/styled";
import Link from "next/link";
import { useServers } from "@/features/servers/hooks";
import { Card, CardTitle, CardContent } from "@/shared/ui/card";
import { useServerContext } from "@/shared/contexts/serverContext";
import type { Server } from "@/shared/types/server";

const ServersCard = styled(Card)`
  max-width: 800px;
  margin: 40px auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
`;

const ServerItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: #141824;
  position: relative;
`;

const Icon = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Emoji = styled.span`
  font-size: 36px;
  line-height: 1;
`;

const ServerNumber = styled.div`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  font-size: 36px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.15);
  user-select: none;
  pointer-events: none;
`;

export const dynamic = "force-static";

export default function ServersPage() {
  const { data: servers } = useServers();
  const { setSelectedServer } = useServerContext();

  const handleServerSelect = (server: Server) => {
    setSelectedServer(server);
  };

  return (
    <ServersCard>
      <CardTitle>Серверы</CardTitle>
      <CardContent>
        <Grid>
          {(servers || []).map((srv: Server) => (
            <Link
              href={`/servers/${srv.id}/characters`}
              style={{ textDecoration: "none" }}
              key={srv.id}
              onClick={() => handleServerSelect(srv)}
            >
              <ServerItem>
                <Icon>
                  <Emoji aria-label={srv.name}>{srv.emoji}</Emoji>
                </Icon>
                <ServerText>
                  <ServerName>{srv.name}</ServerName>
                  {srv.description && (
                    <ServerDescription>{srv.description}</ServerDescription>
                  )}
                </ServerText>
                <ServerNumber>{srv.serverId}</ServerNumber>
              </ServerItem>
            </Link>
          ))}
        </Grid>
      </CardContent>
    </ServersCard>
  );
}

const ServerText = styled.div``;
const ServerName = styled.div`
  font-weight: 700;
`;
const ServerDescription = styled.div`
  color: #6c757d;
  font-size: 14px;
`;
