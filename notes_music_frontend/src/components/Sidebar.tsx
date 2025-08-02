import { component$, useContext, $ } from '@builder.io/qwik';
import { AuthContext } from './auth/AuthContext';

/**
 * Sidebar component for navigation and auth user controls.
 */
// PUBLIC_INTERFACE
export default component$(() => {
  const { user, logout } = useContext(AuthContext);

  return (
    <aside class="sidebar">
      <div class="logo">Notes<span style={{color: "var(--accent-color)"}}>&</span>Music</div>
      <nav class="nav">
        <a class="nav-btn active" href="/">
          📝 Notes
        </a>
        {/* <a class="nav-btn" href="/music">🎵 Player</a> */}
      </nav>
      <div class="bottom-area">
        {user.value ? (
          <div class="userbox">
            <span>👤 {user.value.email || 'User'}</span>
            <button class="nav-btn" style={{fontSize:'0.98rem'}} onClick$={logout}>
              Logout
            </button>
          </div>
        ) : (
          <div class="userbox">
            <span>Not signed in</span>
          </div>
        )}
      </div>
    </aside>
  );
});
