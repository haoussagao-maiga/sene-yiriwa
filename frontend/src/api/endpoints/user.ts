/**
 * Endpoints utilisateur - Sènè Yiriwa
 *
 * Fournit des wrappers simples autour de `apiClient` pour les opérations
 * liées au profil utilisateur, préférences, champs et statistiques.
 */

import { apiClient } from '../clients';
import { API_CONFIG } from '../../config/api.config';
import type {
  AgriculteurStats,
  ChampAgricole,
  UserPreferences,
  BaseUser as User,
} from '../../types/user.types';

export const getProfile = async (token?: string): Promise<User> => {
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return await apiClient.get<User>(API_CONFIG.ENDPOINTS.USER.PROFILE, { headers });
};

export const updateProfile = async (data: Partial<User>, token?: string): Promise<User> => {
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return await apiClient.put<User>(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE, data, { headers });
};

export const getPreferences = async (token?: string): Promise<UserPreferences> => {
  const url = '/users/preferences';
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return await apiClient.get<UserPreferences>(url, { headers });
};

export const updatePreferences = async (data: any, token?: string): Promise<UserPreferences> => {
  const url = '/users/preferences';
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return await apiClient.patch<UserPreferences>(url, data, { headers });
};

export const getChampsAgricoles = async (token?: string): Promise<ChampAgricole[]> => {
  const url = '/users/champs';
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return await apiClient.get<ChampAgricole[]>(url, { headers });
};

export const addChampAgricole = async (champ: Partial<ChampAgricole>, token?: string): Promise<ChampAgricole> => {
  const url = '/users/champs';
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return await apiClient.post<ChampAgricole>(url, champ, { headers });
};

export const updateChampAgricole = async (champId: string, data: Partial<ChampAgricole>, token?: string): Promise<ChampAgricole> => {
  const url = `/users/champs/${champId}`;
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return await apiClient.put<ChampAgricole>(url, data, { headers });
};

export const deleteChampAgricole = async (champId: string, token?: string): Promise<{ message?: string }> => {
  const url = `/users/champs/${champId}`;
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return await apiClient.delete<{ message?: string }>(url, { headers });
};

export const getAgriculteurStats = async (token?: string): Promise<AgriculteurStats> => {
  const url = '/users/stats';
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return await apiClient.get<AgriculteurStats>(url, { headers });
};

export default {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getChampsAgricoles,
  addChampAgricole,
  updateChampAgricole,
  deleteChampAgricole,
  getAgriculteurStats,
};
