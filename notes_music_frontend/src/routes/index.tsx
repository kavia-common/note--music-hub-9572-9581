import { component$, useContext } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { AuthContext } from "../components/auth/AuthContext";
import LoginForm from "../components/auth/LoginForm";
import NotesMain from "../components/NotesMain";

/**
 * The main application page. Authenticates users and shows notes interface.
 */
// PUBLIC_INTERFACE
export default component$(() => {
  const { user } = useContext(AuthContext);

  return (
    <>
      {user.value
        ? <NotesMain />
        : <LoginForm />
      }
    </>
  );
});

export const head: DocumentHead = {
  title: "Notes & Music Player",
  meta: [
    {
      name: "description",
      content: "A notes app with a built-in music player, built with Qwik",
    },
  ],
};
