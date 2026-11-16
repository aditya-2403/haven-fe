'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { getAccessToken } from '../../lib/api';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchCurrentUser();
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  }, [fetchCurrentUser]);

  return <>{children}</>;
}

