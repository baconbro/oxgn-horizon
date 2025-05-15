import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma'; // Your Prisma client instance
import bcrypt from 'bcryptjs'; 
import { JWT } from 'next-auth/jwt';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const userFromDb = await prisma.user.findUnique({ // Renamed to avoid confusion with NextAuth.User
          where: { email: credentials.email }
        });

        if (userFromDb && userFromDb.password) {
          const isPasswordCorrect = await bcrypt.compare(credentials.password, userFromDb.password);
          if (isPasswordCorrect) {
            // This object MUST match the 'User' interface defined in the 'next-auth' module augmentation
            return {
                id: userFromDb.id,
                name: userFromDb.name,
                email: userFromDb.email,
                image: userFromDb.image,
                // Add any other custom properties you want on the User object
                // e.g., role: userFromDb.role
            };
          }
        }
        return null;
      }
    })
    // Other providers
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // The `user` object is passed on initial sign-in:
      // - From `authorize` callback for Credentials provider
      // - From OAuth profile for OAuth providers
      if (user) { // `user` here should conform to the augmented `NextAuth.User` type
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image; // Standard claim for image in JWT is 'picture'
        // token.role = user.role; // If you add a role property to your User type
      }
      return token;
    },
    async session({ session, token }) {
      // The `token` object is the JWT token that the `jwt` callback returned.
      // We are using it to populate `session.user`.
      // Note: The `user` parameter in the session callback is typically not used with JWT strategy.
      if (token && session.user) {
        session.user.id = token.id as string; // Ensure id is string
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture; // Use 'picture' from token
        // session.user.role = token.role as string; // If you added role
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// TYPE AUGMENTATIONS FOR NEXTAUTH.JS (Very Important!)
// Place these at the bottom of the file or in a separate next-auth.d.ts file in your src directory

declare module 'next-auth' {
  /**
   * Represents the core user object used by NextAuth.js.
   * This interface is what the `authorize` callback should return,
   * and what the `user` parameter in the `jwt` callback (on initial sign-in) will be.
   */
  interface User {
    id: string; // You must include id
    name?: string | null;
    email?: string | null;
    image?: string | null;
    // Add any other custom properties your user object will have, e.g.:
    // role?: string;
  }

  /**
   * Represents the session object.
   * The `user` property here should match the `User` interface above.
   */
  interface Session {
    user: User; // Now `session.user` will have `id`, `name`, `email`, `image`, `role` etc.
  }
}

declare module 'next-auth/jwt' {
  /**
   * Represents the NextAuth.js JWT token.
   * This interface is what the `jwt` callback returns and what the `token` parameter
   * in the `session` callback will be.
   * Add any custom claims you added to the token in the `jwt` callback.
   */
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null; // Standard claim for image; maps to `user.image`
    // Add any other custom properties you added to the token, e.g.:
    // role?: string;
  }
}
