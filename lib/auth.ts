import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Demo single-tutor credentials
const DEMO_USER = {
  id: "tutor-1",
  name: "Ms. Rachel Ng",
  email: "tutor@tutorsched.sg",
  password: "demo1234",
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === DEMO_USER.email &&
          credentials?.password === DEMO_USER.password
        ) {
          return {
            id: DEMO_USER.id,
            name: DEMO_USER.name,
            email: DEMO_USER.email,
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
