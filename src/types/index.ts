export type Role = 'rumah_tangga' | 'driver' | 'admin_tps3r' | 'mitra_b2b' | 'pemda';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  address?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
