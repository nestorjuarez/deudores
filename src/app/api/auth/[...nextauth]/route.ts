import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('Authorize function called with credentials:', credentials);

        if (!credentials?.email || !credentials?.password) {
          console.log('Error: Faltan email o contraseña.');
          throw new Error('Credenciales inválidas');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log('Usuario encontrado en la BD:', user);

        if (!user || !user.password) {
          console.log('Error: Usuario no encontrado o sin contraseña en la BD.');
          throw new Error('Credenciales inválidas');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        console.log('¿La contraseña es válida?:', isValid);

        if (!isValid) {
          console.log('Error: La comparación de bcrypt falló.');
          throw new Error('Credenciales inválidas');
        }

        console.log('Autorización exitosa, retornando usuario.');
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
