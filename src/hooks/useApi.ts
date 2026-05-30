import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

export function useApi() {
  const { token, logout } = useAuth();
  const { error: showErrorToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<{ method: string; url: string; data?: any } | null>(null);

  const request = useCallback(async (method: string, url: string, reqData?: any, attempt = 1): Promise<any> => {
    setLoading(true);
    setError(null);
    setLastRequest({ method, url, data: reqData });

    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await axios({ method, url, data: reqData, headers });
      setLoading(false);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      // Auto-retry once on 5xx or network error
      if (attempt === 1 && (!err.response || err.response.status >= 500)) {
        return request(method, url, reqData, 2);
      }

      setLoading(false);
      const errMsg = err.response?.data?.error || err.message || 'Terjadi kesalahan.';
      setError(errMsg);

      if (err.response?.status === 401) {
        showErrorToast('Sesi Anda telah berakhir. Silakan login kembali.');
        logout();
      } else {
        showErrorToast(errMsg);
      }

      throw err;
    }
  }, [token, logout, showErrorToast]);

  const refetch = useCallback(() => {
    if (lastRequest) return request(lastRequest.method, lastRequest.url, lastRequest.data);
    return Promise.resolve(null);
  }, [lastRequest, request]);

  return { data, request, loading, error, refetch };
}
