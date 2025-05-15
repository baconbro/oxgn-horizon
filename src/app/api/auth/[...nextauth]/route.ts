import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma'; // Your Prisma client instance
import bcrypt from 'bcryptjs'; 

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
              return null; // Or throw an error
            }

            const user = await prisma.user.findUnique({
              where: { email: credentials.email }
                 });
                  if (user && user.password) { // Ensure user and password exist
              const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
              if (isPasswordCorrect) {
                // Return the user object that NextAuth will use
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    // You can add other properties like roles here if needed
                };
              }
            }
            return null; // Or throw an error for incorrect credentials
          }
        })
        // Add other providers (e.g., GitHub, Google) later as per your plan
        // import GitHubProvider from "next-auth/providers/github";
        // GitHubProvider({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! }),
      ],
      session: {
        strategy: 'jwt', // Using JWTs for session management
      },
      callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {
          // `user` object is available on initial sign-in or when using database sessions.
          // For JWT strategy, we augment the token with user ID here.
          if (user) {
            token.id = user.id; // Add custom properties to the JWT token
            // token.role = user.role; // Example if you have roles
          }
          return token;
        },
        async session({ session, token, user }) {
          // The `token` object contains what we put in the `jwt` callback.
          // The `user` object (if using database sessions) or the token's user data.
          if (session.user && token.id) {
            session.user.id = token.id as string;
            // session.user.role = token.role as string; // Example
          }
          return session;
        },
      },
      pages: {
        signIn: '/auth/signin', // A custom sign-in page you'll create
        // error: '/auth/error', // A custom error page (optional)
        // signOut: '/auth/signout', // A custom sign-out page (optional)
      },
      // Enable debug messages for development
      debug: process.env.NODE_ENV === 'development',
      secret: process.env.NEXTAUTH_SECRET, // Essential for JWT signing
    };

    const handler = NextAuth(authOptions);
    export { handler as GET, handler as POST };

    // Extend NextAuth types for session.user to include your custom properties like 'id'
    declare module 'next-auth' {
      interface Session {
        user: {
          id: string;
        } & NextAuthUser; // Merges with default User (name, email, image)
      }
      // If you add custom properties to the User object returned by `authorize`
      // and want them directly on the `user` object in the `jwt` or `session` callback
      interface User extends NextAuthUser {
        // id: string; // Already part of NextAuthUser usually
        // role?: string; // Example
      }
    }
    declare module 'next-auth/jwt' {
        interface JWT {
            id?: string;
            // role?: string; // Example
        }
    }
