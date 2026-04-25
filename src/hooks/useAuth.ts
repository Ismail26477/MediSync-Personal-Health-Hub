import { useStore } from "@/lib/store";
export const useAuth = () => {
  const user = useStore(s => s.user);
  const session = useStore(s => s.session);
  const loading = useStore(s => s.loading);
  return { user, session, loading, isAuthed: !!session };
};
