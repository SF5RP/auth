import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCharactersByServerId,
  createCharacter,
  updateCharacter,
} from "@/shared/lib/characters";
import type { Character } from "@/shared/types/character";
import type { CreateCharacterFormData } from "@/shared/types/characterForm";

export function useCharacters(serverId: number) {
  return useQuery<Character[]>({
    queryKey: ["characters", serverId],
    queryFn: async () => getCharactersByServerId(serverId),
    enabled: Number.isFinite(serverId),
    staleTime: 60 * 1000,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      serverId,
    }: {
      data: CreateCharacterFormData;
      serverId: number;
    }) => {
      const characterData = {
        ...data,
        server_id: serverId,
      };

      return await createCharacter(characterData);
    },
    onSuccess: (newCharacter, variables) => {
      // Обновляем кэш персонажей для соответствующего сервера
      queryClient.setQueryData(
        ["characters", variables.serverId],
        (oldData: Character[] | undefined) => {
          return oldData ? [...oldData, newCharacter] : [newCharacter];
        }
      );
    },
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      serverId,
    }: {
      id: string;
      data: CreateCharacterFormData;
      serverId: number;
    }) => {
      const updated = await updateCharacter(id, data);
      return { updated, serverId } as { updated: Character; serverId: number };
    },
    onSuccess: ({ updated, serverId }) => {
      // Обновляем кэш списка персонажей для сервера
      queryClient.setQueryData(
        ["characters", serverId],
        (oldData: Character[] | undefined) => {
          if (!oldData) return [updated];
          return oldData.map((c) => (c.id === updated.id ? updated : c));
        }
      );
    },
  });
}
