import { Session } from 'next-auth';

type FetchWithToken = (url: string, options?: RequestInit, session?: Session | null) => Promise<Response>;

export const getToken = (session: Session | null) => {
  return session?.accessToken || null;
};

export const fetchWithToken: FetchWithToken = async (url, options = {}, session) => {
  const token = await getToken(session);

  if (!token) {
    throw new Error('Token not available');
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, { ...options, headers });
};