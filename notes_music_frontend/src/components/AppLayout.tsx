import { component$, Slot, useSignal } from '@builder.io/qwik';
import Sidebar from './Sidebar';
import MusicPlayerBar from './MusicPlayerBar';
import { AuthContextProvider } from './auth/AuthContext';

/**
 * Wraps the app in sidebar, main content, and a persistent music player bar.
 */
// PUBLIC_INTERFACE
export default component$(() => {
  // Used to control sidebar collapse for mobile in the future if needed
  const sidebarCollapsed = useSignal(false);

  return (
    <AuthContextProvider>
      <div class="app-layout">
        {/* Sidebar for navigation */}
        {!sidebarCollapsed.value && <Sidebar />}
        {/* Main area takes all remaining width */}
        <div class="main-content" id="main-content">
          <Slot />
        </div>
        {/* Player docked at bottom of screen */}
        <MusicPlayerBar />
      </div>
    </AuthContextProvider>
  );
});
