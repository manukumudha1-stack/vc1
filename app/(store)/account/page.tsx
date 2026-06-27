import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import UserModel from '@/lib/models/User';
import OrderModel from '@/lib/models/Order';
import { formatINR } from '@/lib/utils';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

async function getAccountData(email: string) {
  await connectDB();
  const user   = await UserModel.findOne({ email }).lean();
  if (!user) return { user: null, orders: [] };

  const userId = (user as { _id: unknown })._id;
  const orders = await OrderModel
    .find({ customerId: { $eq: userId } as unknown as string })
    .sort({ createdAt: -1 })
    .lean();

  return {
    user:   JSON.parse(JSON.stringify(user)),
    orders: JSON.parse(JSON.stringify(orders)),
  };
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/auth/signin');

  const { user, orders } = await getAccountData(session.user.email);

  const displayName  = user?.name ?? session.user.name ?? 'Valued Customer';
  const displayEmail = session.user.email;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          {(session.user as { image?: string }).image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(session.user as { image?: string }).image!}
              alt={displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            <span className={`serif ${styles.avatarLetter}`}>
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className={styles.headerInfo}>
          <p className="eyebrow">Welcome back</p>
          <h1 className={`serif ${styles.name}`}>{displayName}</h1>
          <p className={styles.email}>{displayEmail}</p>
        </div>
        {user?.segment && (
          <span className={`badge badge--${user.segment === 'vip' ? 'vip' : user.segment === 'returning' ? 'returning' : 'new'}`}>
            {user.segment.charAt(0).toUpperCase() + user.segment.slice(1)} member
          </span>
        )}
      </div>

      <hr className="hairline-rule" />

      {/* Orders */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={`serif ${styles.sectionTitle}`}>Order History</h2>
          <span className="caption">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        </div>

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <p className={`serif ${styles.emptyTitle}`}>No orders yet</p>
            <p className={styles.emptySub}>When you place an order it will appear here.</p>
            <Link href="/collections" className="btn btn--gold" style={{ marginTop: 24 }}>
              Shop now
            </Link>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Order</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Items</th>
                  <th className={styles.th}>Total</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th} />
                </tr>
              </thead>
              <tbody>
                {orders.map((order: {
                  _id: string;
                  orderNumber: string;
                  createdAt: string;
                  items: { name: string; qty: number }[];
                  total: number;
                  status: string;
                }) => (
                  <tr key={order._id} className={styles.tr}>
                    <td className={styles.td}>
                      <span className={styles.orderNum}>{order.orderNumber}</span>
                    </td>
                    <td className={styles.td}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className={styles.td}>
                      <span className={styles.itemsSummary}>
                        {order.items.slice(0, 2).map((i) => i.name).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className="price" style={{ fontSize: 15 }}>{formatINR(order.total)}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={`badge badge--${order.status}`}>{order.status}</span>
                    </td>
                    <td className={styles.td}>
                      <Link href={`/orders/${order._id}`} className="link">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
