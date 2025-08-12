'use client';

import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useEffect } from 'react';

export function useUserSync() {
  const { user, isSignedIn, isLoaded } = useUser();
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Sync user data with Convex
      createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || 'Unknown User',
        imageUrl: user.imageUrl,
      }).catch(console.error);
    }
  }, [isLoaded, isSignedIn, user, createUser]);

  return { user, isSignedIn, isLoaded };
}
