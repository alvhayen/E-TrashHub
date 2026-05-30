// Role di frontend menggunakan lowercase (sesuai yang disimpan di AuthContext)
// Role di backend menggunakan UPPERCASE (sesuai yang disimpan di database)
// Mapping terjadi di AuthContext saat login

export type Role = 'rumah_tangga' | 'driver' | 'admin_tps3r' | 'mitra_b2b' | 'pemda' | 'super_admin' | 'admin_driver' | 'admin_pemda';

export type AccountStatus = 'active' | 'pending' | 'rejected';

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
  driverType?: 'MITRA_TPS3R' | 'FREELANCE' | string;
  domicile?: string;
  region?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  zone?: string;
  isOnDuty?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
