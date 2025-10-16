"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import styled from "@emotion/styled";
import Image from "next/image";
import { useServers } from "@/features/servers/hooks";
import {
  useCharacters,
  useCreateCharacter,
  useUpdateCharacter,
} from "@/features/characters/hooks";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { CreateCharacterDialog } from "@/shared/components/createCharacterDialog";
import type { CreateCharacterFormData } from "@/shared/types/characterForm";
import type { Character } from "@/shared/types/character";

const CharactersCard = styled(Card)`
  max-width: 900px;
  margin: 40px auto;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #e9ecef;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
`;

const CharacterItem = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px;
  background: #141824;
`;

const CharacterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
`;

const NameText = styled.div`
  color: #e9ecef;
  font-weight: 700;
  font-size: 16px;
`;

const AvatarFallback = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
`;

interface SimpleAvatarProps {
  src: string;
  alt: string;
}

function UserPlaceholderIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" fill="#94a3b8" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1Z" fill="#94a3b8" />
    </svg>
  );
}

function SimpleAvatar({ src, alt }: SimpleAvatarProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <AvatarWrapper>
      {hasError ? (
        <AvatarFallback aria-label={alt}>
          <UserPlaceholderIcon size={28} />
        </AvatarFallback>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="48px"
          onError={() => setHasError(true)}
        />
      )}
    </AvatarWrapper>
  );
}

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
`;

const Label = styled.span`
  color: #94a3b8;
  font-weight: 600;
`;

const Value = styled.span`
  color: #e9ecef;
`;

const StatusContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 8px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
`;

const StatusIcon = styled.span<{ active: boolean }>`
  font-size: 14px;
  color: ${(props) => (props.active ? "#22c55e" : "#6b7280")};
`;

const StatusText = styled.span<{ active: boolean }>`
  color: ${(props) => (props.active ? "#22c55e" : "#6b7280")};
  font-weight: 500;
`;

const ExpirationDate = styled.span`
  color: #f59e0b;
  font-size: 11px;
  margin-left: 4px;
`;

// Helper function to format expiration date
function formatExpirationDate(expiresAt?: string): string {
  if (!expiresAt) return "";

  const date = new Date(expiresAt);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "истек";
  if (diffDays === 0) return "сегодня";
  if (diffDays === 1) return "завтра";
  if (diffDays <= 7) return `через ${diffDays} дн.`;

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

// Status item component
interface StatusItemProps {
  icon: string;
  label: string;
  active: boolean;
  expiresAt?: string;
}

function StatusItemComponent({
  icon,
  label,
  active,
  expiresAt,
}: StatusItemProps) {
  return (
    <StatusItem>
      <StatusIcon active={active}>{icon}</StatusIcon>
      <StatusText active={active}>{label}</StatusText>
      {active && expiresAt && (
        <ExpirationDate>({formatExpirationDate(expiresAt)})</ExpirationDate>
      )}
    </StatusItem>
  );
}

export default function ServerCharactersPage() {
  const params = useParams<{ slug: string }>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<null | Character>(
    null
  );

  const { data: servers } = useServers();
  const server = useMemo(
    () => (servers || []).find((s) => s.id === params.slug),
    [servers, params.slug]
  );
  const serverId = server?.serverId ?? NaN;
  const { data: characters } = useCharacters(serverId);
  const createCharacterMutation = useCreateCharacter();
  const updateCharacterMutation = useUpdateCharacter();

  const handleCreateCharacter = (data: CreateCharacterFormData) => {
    createCharacterMutation.mutate({ data, serverId });
  };

  const handleEditCharacter = (id: string, data: CreateCharacterFormData) => {
    updateCharacterMutation.mutate({ id, data, serverId });
  };

  return (
    <CharactersCard>
      <HeaderContainer>
        <Title>Персонажи — {server?.name || params.slug}</Title>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Создать персонажа
        </Button>
      </HeaderContainer>
      <CardContent>
        <List>
          {(characters || []).map((ch) => (
            <CharacterItem key={ch.id}>
              <CharacterHeader>
                <SimpleAvatar src="/default-avatar.png" alt={ch.name} />
                <NameText>{ch.name}</NameText>
              </CharacterHeader>
              <Row>
                <Button size="small" onClick={() => setIsEditDialogOpen(ch)}>
                  Редактировать
                </Button>
              </Row>
              <Row>
                <Label>Наличные</Label>
                <Value>{ch.cash.toLocaleString("ru-RU")}</Value>
              </Row>
              <Row>
                <Label>Банк</Label>
                <Value>{ch.bank.toLocaleString("ru-RU")}</Value>
              </Row>

              <StatusContainer>
                {ch.apartment?.has_apartment && (
                  <StatusItemComponent
                    icon="🏠"
                    label="Квартира"
                    active
                    expiresAt={ch.apartment?.expires_at}
                  />
                )}
                {ch.house?.has_house && (
                  <StatusItemComponent
                    icon="🏡"
                    label="Дом"
                    active
                    expiresAt={ch.house?.expires_at}
                  />
                )}
                {ch.pet?.has_pet && (
                  <StatusItemComponent
                    icon="🐾"
                    label="Животное"
                    active
                    expiresAt={ch.pet?.expires_at}
                  />
                )}
                {ch.laboratory?.has_laboratory && (
                  <StatusItemComponent
                    icon="🧪"
                    label="Лаборатория"
                    active
                    expiresAt={ch.laboratory?.expires_at}
                  />
                )}
                <StatusItemComponent
                  icon="🏥"
                  label="Медкарта"
                  active={ch.medical_card?.has_medical_card || false}
                  expiresAt={ch.medical_card?.expires_at}
                />
                <StatusItemComponent
                  icon="👑"
                  label="VIP"
                  active={ch.vip_status?.has_vip_status || false}
                  expiresAt={ch.vip_status?.expires_at}
                />
              </StatusContainer>
            </CharacterItem>
          ))}
        </List>
      </CardContent>

      <CreateCharacterDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateCharacter}
        serverId={serverId}
      />

      <CreateCharacterDialog
        isOpen={!!isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(null)}
        onSubmit={(data) =>
          isEditDialogOpen && handleEditCharacter(isEditDialogOpen.id, data)
        }
        serverId={serverId}
        initialValues={
          isEditDialogOpen
            ? {
                name: isEditDialogOpen.name,
                level: isEditDialogOpen.level,
                cash: isEditDialogOpen.cash,
                bank: isEditDialogOpen.bank,
                apartment: {
                  has_apartment: !!isEditDialogOpen.apartment?.has_apartment,
                },
                house: { has_house: !!isEditDialogOpen.house?.has_house },
                pet: { has_pet: !!isEditDialogOpen.pet?.has_pet },
                laboratory: {
                  has_laboratory: !!isEditDialogOpen.laboratory?.has_laboratory,
                },
                medical_card: {
                  has_medical_card:
                    !!isEditDialogOpen.medical_card?.has_medical_card,
                },
                vip_status: {
                  has_vip_status: !!isEditDialogOpen.vip_status?.has_vip_status,
                },
              }
            : undefined
        }
        title="Редактировать персонажа"
        submitLabel="Сохранить изменения"
      />
    </CharactersCard>
  );
}
