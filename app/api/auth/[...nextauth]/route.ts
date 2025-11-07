import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";

// Conditionally import PrismaAdapter and PrismaClient only on server
let PrismaAdapter, PrismaClient;
if (typeof window === 'undefined') {
  PrismaAdapter = require("@auth/prisma-adapter").PrismaAdapter;
  PrismaClient = require("@prisma/client").PrismaClient;
}

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isVerified?: boolean;
    } & DefaultSession["user"];
  }
}

const prisma = typeof window === 'undefined' ? new PrismaClient() : null;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: typeof window === 'undefined' ? PrismaAdapter(prisma) : undefined,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        // Verificar si el usuario tiene contraseña (no es OAuth)
        if (!user.password) {
          throw new Error("Please use social login (Google/Facebook) for this account");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          throw new Error("Invalid password");
        }

        // Verificar si el email está verificado
        if (!user.isVerified) {
          throw new Error("Please verify your email before logging in");
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.profileImage,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Para OAuth providers (Google/Facebook), marcar como verificado automáticamente
      if (account?.provider !== "credentials") {
        if (user.email && typeof window === 'undefined') {
          try {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email },
            });

            if (existingUser && !existingUser.isVerified) {
              await prisma.user.update({
                where: { email: user.email },
                data: { isVerified: true },
              });
            }
          } catch (error) {
            console.error("Error updating user verification:", error);
          }
        }
      }
      return true;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Asegurarnos que el user.id siempre esté presente
      if (token?.id) {
        session.user.id = token.id;
      }
      if (token?.email) {
        session.user.email = token.email;
      }
      if (token?.name) {
        session.user.name = token.name;
      }
      if (token?.picture) {
        session.user.image = token.picture;
      }
      if (token?.isVerified !== undefined) {
        session.user.isVerified = token.isVerified;
      }
      return session;
    },
    async jwt({ token, user, trigger, account }: { token: any; user: any; trigger?: string; account?: any }) {
      // Al hacer login, guardar el user.id en el token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        
        // Para OAuth, marcar como verificado automáticamente
        if (account?.provider !== "credentials") {
          token.isVerified = true;
        } else if (typeof window === 'undefined') {
          // Para credenciales, verificar el estado en la base de datos
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isVerified: true },
          });
          token.isVerified = dbUser?.isVerified || false;
        }
      }
      return token;
    },
  },
  // Configuración adicional para producción
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NODE_ENV === 'production',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
