import Nav from '@/components/store/Nav';
import Footer from '@/components/store/Footer';
import CartDrawer from '@/components/store/CartDrawer';
import Providers from '@/components/Providers';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Nav />
      <main style={{ paddingTop: '80px' }}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </Providers>
  );
}
