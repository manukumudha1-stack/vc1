import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminShell from '@/components/admin/AdminShell';
import BackButton from '@/components/admin/BackButton';
import styles from './layout.module.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin;

  // The login page lives in this group but does NOT need auth.
  // Middleware handles the redirect for all /admin/* except /admin/login,
  // so reaching here without a session means we are on /admin/login.
  if (!isAdmin && session !== null) {
    // session exists but user is not admin — bounce to login
    redirect('/admin/login');
  }

  // Not authenticated: render children directly (login page)
  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <AdminShell session={session}>
      <div className={styles.shell}>
        <AdminSidebar />
        <main className={styles.main}>
          <BackButton />
          {children}
        </main>
      </div>
    </AdminShell>
  );
}
