import type { Character } from "@/shared/types/character";
import type { CreateCharacterFormData } from "@/shared/types/characterForm";
import { api } from "./api";

export async function getCharactersByServerId(
  serverId: number
): Promise<Character[]> {
  return await api.get<Character[]>(`/servers/${serverId}/characters`, {
    requiresAuth: true,
  });
}

export async function createCharacter(
  data: CreateCharacterFormData & { server_id?: number }
): Promise<Character> {
  return await api.post<Character>("/characters", data, { requiresAuth: true });
}

export async function updateCharacter(
  id: string,
  data: CreateCharacterFormData
): Promise<Character> {
  return await api.put<Character>(`/characters/${id}`, data, {
    requiresAuth: true,
  });
}

export async function deleteCharacter(id: string): Promise<void> {
  await api.delete(`/characters/${id}`, { requiresAuth: true });
}
