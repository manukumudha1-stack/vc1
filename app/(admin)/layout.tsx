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

  // Middleware guards all /admin/* except /admin/login.
  // Render children without the shell for any unauthenticated or non-admin request
  // (covers the login page and avoids redirect loops for logged-in non-admin users).
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
