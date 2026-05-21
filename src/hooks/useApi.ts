import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

export function useApi() {
  const { token, logout } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store last request for refetching
  const [lastRequest, setLastRequest] = useState<{method: string, url: string, data?: any} | null>(null);

  const request = useCallback(async (method: string, url: string, reqData?: any, attempt = 1): Promise<any> => {
    setLoading(true);
    setError(null);
    setLastRequest({ method, url, data: reqData });
    try {
      const response = await axios({
        method,
        url,
        data: reqData,
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoading(false);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      // Auto-retry once on network error or 5xx
      if (attempt === 1 && (!err.response || err.response.status >= 500)) {
        console.log(`[useApi] Retrying request to ${url}...`);
        return request(method, url, reqData, 2);
      }
      
      setLoading(false);
      const errMsg = err.response?.data?.error || err.message || 'An error occurred';
      setError(errMsg);
      
      // Auto-logout on 401
      if (err.response?.status === 401) {
        showToast('Sesi Anda telah berakhir. Silakan login kembali.', 'error');
        logout();
      } else {
        showToast(errMsg, 'error');
      }
      
      throw err;
    }
  }, [token, logout, showToast]);

  const refetch = useCallback(() => {
    if (lastRequest) {
      return request(lastRequest.method, lastRequest.url, lastRequest.data);
    }
    return Promise.resolve(null);
  }, [lastRequest, request]);

  return { data, request, loading, error, refetch };
}
