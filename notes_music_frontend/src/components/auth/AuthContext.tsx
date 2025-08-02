import { createContextId, useContextProvider, useSignal, type Signal, component$, $ } from '@builder.io/qwik';

/**
 * A simple mock user object.
 */
export type User = { email: string } | undefined;

type AuthContextType = {
  user: Signal<User>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContextId<AuthContextType>('auth-context');

// PUBLIC_INTERFACE
export const AuthContextProvider = component$((props: { children?: any }) => {
  // Auth state; for demo, persists to localStorage
  const user = useSignal<User>(undefined);

  const login = $(async (email: string, password: string) => {
    // TODO: Replace with real API
    if (email && password) {
      user.value = { email };
      localStorage.setItem('user', JSON.stringify({ email }));
    }
  });
  const logout = $(() => {
    user.value = undefined;
    localStorage.removeItem('user');
  });
  // Restore on mount
  if (typeof window !== 'undefined' && !user.value) {
    const u = localStorage.getItem('user');
    if (u) user.value = JSON.parse(u);
  }

  useContextProvider(AuthContext, { user, login, logout });
  return <>{props.children}</>;
});
