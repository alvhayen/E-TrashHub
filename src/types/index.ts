export type Role = 'rumah_tangga' | 'driver' | 'admin_tps3r' | 'mitra_b2b' | 'pemda';

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
}

export interface AuthResponse {
  token: string;
  user: User;
}
