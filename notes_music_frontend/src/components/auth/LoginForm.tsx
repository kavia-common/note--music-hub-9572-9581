import { component$, useSignal, useContext, $ } from '@builder.io/qwik';
import { AuthContext } from './AuthContext';

/**
 * Authentication form for login or signup.
 */
// PUBLIC_INTERFACE
export default component$(() => {
  const mode = useSignal<'login'|'signup'>('login');
  const email = useSignal('');
  const password = useSignal('');
  const loading = useSignal(false);
  const error = useSignal('');
  const { login } = useContext(AuthContext);

  return (
    <div style={{
      maxWidth:'380px', margin:'60px auto', padding:'2.2rem 2.5rem', background:'#fff', borderRadius:'12px', boxShadow:'0 2px 20px #1e40af1c'
    }}>
      <h2 style={{textAlign:'center', color:'var(--primary-color)', marginBottom:'2rem'}}>
        {mode.value==='login' ? 'Sign In' : 'Register'}
      </h2>
      {error.value && <div style={{color:'#e53e3e', marginBottom:'1rem'}}>{error.value}</div>}
      <form preventdefault:submit
        onSubmit$={async () => {
          loading.value = true;
          error.value = '';
          try {
            await login(email.value, password.value);
          } catch (err: any) {
            error.value = 'Failed to authenticate.';
          }
          loading.value = false;
        }}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email.value}
          onInput$={e => email.value = (e.target as HTMLInputElement).value}
          style={{ width:'100%', marginBottom:'0.9rem', padding:'0.68em 1em', borderRadius:'8px', border:'1px solid #b4bfcf', fontSize:'1rem'}}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password.value}
          onInput$={e => password.value = (e.target as HTMLInputElement).value}
          style={{ width:'100%', marginBottom:'1.2rem', padding:'0.68em 1em', borderRadius:'8px', border:'1px solid #b4bfcf', fontSize:'1rem'}}
        />
        <button
          type="submit"
          class="save-btn"
          style={{ width:'100%' }}
          disabled={loading.value}
        >
          {loading.value ? 'Loading...' : (mode.value === 'login' ? 'Sign In' : 'Register')}
        </button>
      </form>
      <div style={{marginTop:'1.3rem', textAlign:'center', color:'var(--secondary-color)', fontSize:'0.98em'}}>
        {mode.value === 'login'
          ? <>Don't have an account? <a href="#" style={{color:'var(--primary-color)'}} onClick$={$(() => { mode.value='signup'; })}>Register</a></>
          : <>Already have an account? <a href="#" style={{color:'var(--primary-color)'}} onClick$={$(() => { mode.value='login'; })}>Sign in</a></>
        }
      </div>
    </div>
  );
});
