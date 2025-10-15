import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCharactersByServerId,
  createCharacter,
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
    onSuccess: (newCharacter) => {
      // Обновляем кэш персонажей для соответствующего сервера
      queryClient.setQueryData(
        ["characters", newCharacter.serverId],
        (oldData: Character[] | undefined) => {
          return oldData ? [...oldData, newCharacter] : [newCharacter];
        }
      );
    },
  });
}
