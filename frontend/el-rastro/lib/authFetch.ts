import { useSession } from 'next-auth/react';

type FetchWithToken = (url: string, options?: RequestInit) => Promise<Response>;

export const getToken = async () => {
  const { data: session } = useSession();
  return session?.accessToken || null;
};

export const fetchWithToken: FetchWithToken = async (url, options = {}) => {
  const token = await getToken();

  if (!token) {
    throw new Error('Token not available');
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, { ...options, headers });
};