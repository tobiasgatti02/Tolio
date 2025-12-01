import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Check for required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("⚠️ Missing Google OAuth credentials in environment variables");
}
if (!process.env.NEXTAUTH_SECRET) {
  console.error("⚠️ Missing NEXTAUTH_SECRET in environment variables");
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

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma) as any,
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
    error: "/login", // Redirect to login page on error
  },
  logger: {
    error(code, metadata) {
      console.error(`[NextAuth][Error][${code}]`, metadata);
    },
    warn(code) {
      console.warn(`[NextAuth][Warn][${code}]`);
    },
    debug(code, metadata) {
      console.debug(`[NextAuth][Debug][${code}]`, metadata);
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log(`[NextAuth] SignIn callback for user: ${user.email}, provider: ${account?.provider}`);
      // Para OAuth providers (Google/Facebook), marcar como verificado automáticamente
      if (account?.provider !== "credentials") {
        if (user.email) {
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
        } else {
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
  events: {
    async createUser({ user }) {
      console.log(`[NextAuth] createUser event for user: ${user.email}`);
      // Cuando se crea un usuario con OAuth, asegurarse de que tenga los campos necesarios
      if (user.email && user.name) {
        try {
          // Separar el nombre en firstName y lastName si es posible
          const nameParts = user.name.split(' ');
          const firstName = nameParts[0] || user.name;
          const lastName = nameParts.slice(1).join(' ') || nameParts[0];
          
          await prisma.user.update({
            where: { id: user.id },
            data: {
              firstName,
              lastName,
              isVerified: true, // Los usuarios de OAuth se marcan como verificados automáticamente
            },
          });
        } catch (error) {
          console.error("Error updating OAuth user:", error);
        }
      }
    },
    async linkAccount({ user, account, profile }) {
      console.log(`[NextAuth] linkAccount event for user: ${user.email}, provider: ${account.provider}`);
    }
  },
  // Configuración adicional para producción
  debug: true, // Enable debug logs temporarily
  useSecureCookies: process.env.NODE_ENV === 'production',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
