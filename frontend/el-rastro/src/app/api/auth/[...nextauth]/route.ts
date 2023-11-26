import NextAuth, { AuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

if (!process.env.GOOGLE_ID || !process.env.GOOGLE_SECRET) {
  throw new Error("GOOGLE environment variables not set");
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) {
        return true;
      } else {
        return false;
      }
    },
    async session({ session, token, user }) {
      const response = await fetch("http://localhost:8008/api/v1/auth/jwt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: session.user.name, email: session.user.email }),
      });
      const data = await response.json();
      if (session && session.user) {
        session.accessToken = data.jwt;
        session.user.id = data.id;
      }
      return session;
    },
  },
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
