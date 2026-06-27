import { NextAuthOptions, type Session } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import UserModel from './models/User';
import AdminModel from './models/Admin';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    error:  '/auth/signin',
  },
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id:   'user-credentials',
      name: 'Email',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await UserModel.findOne({ email: credentials.email.toLowerCase() });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user._id.toString(), email: user.email, name: user.name, role: 'customer', isAdmin: false };
      },
    }),
    CredentialsProvider({
      id:   'admin-credentials',
      name: 'Admin',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const admin = await AdminModel.findOne({ email: credentials.email.toLowerCase() });
        if (!admin) return null;
        const valid = await bcrypt.compare(credentials.password, admin.passwordHash);
        if (!valid) return null;
        return { id: admin._id.toString(), email: admin.email, role: admin.role, isAdmin: true };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();
        const existing = await UserModel.findOne({ email: user.email! });
        if (!existing) {
          await UserModel.create({
            name:     user.name ?? '',
            email:    user.email!,
            googleId: user.id,
            avatar:   user.image ?? '',
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
        token.role    = (user as { role?: string }).role ?? 'customer';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { isAdmin?: boolean }).isAdmin = token.isAdmin as boolean;
        (session.user as { role?: string }).role        = token.role as string;
      }
      return session;
    },
  },
};

export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    const req = new NextRequest('http://localhost', { headers: { cookie: cookieString } });
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token) return null;
    return {
      user: {
        name:    (token.name    as string)  ?? null,
        email:   (token.email   as string)  ?? null,
        image:   (token.picture as string)  ?? null,
        isAdmin: (token.isAdmin as boolean) ?? false,
        role:    (token.role    as string)  ?? 'customer',
      },
      expires: new Date((token.exp as number) * 1000).toISOString(),
    } as Session;
  } catch {
    return null;
  }
}
