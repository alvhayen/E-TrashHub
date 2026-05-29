export type Role = 'RUMAH_TANGGA' | 'DRIVER' | 'ADMIN_TPS3R' | 'MITRA_B2B' | 'PEMDA' | 'SUPER_ADMIN';

export type AccountStatus = 'active' | 'pending' | 'suspended';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  status: AccountStatus;
  address?: string;
  phone?: string;
  points?: number;
  tps3r_id?: number;
  tps3r_name?: string;
  driverType?: 'MITRA_TPS3R' | 'INDEPENDENT' | string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
