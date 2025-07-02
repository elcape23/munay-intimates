// @ts-nocheck
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { customerAccessTokenCreate, getCustomer } from "@/lib/shopify";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Shopify",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // Lógica antigua de tu auth-store:
        const response = await customerAccessTokenCreate({
          email: credentials.email,
          password: credentials.password,
        });
        if (!response.customerAccessToken) return null;

        const customer = await getCustomer(
          response.customerAccessToken.accessToken
        );
        if (!customer) return null;

        // Lo que vamos a guardar en el JWT:
        return {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          shopifyToken: response.customerAccessToken.accessToken,
        };
      },
    }),
  ],
  callbacks: {
    // JWT callback
    async jwt(ctx: any) {
      // ahora ctx.token y ctx.user son any
      const token = ctx.token as any;
      const user = ctx.user as any;

      if (user?.shopifyToken) {
        token.shopifyToken = user.shopifyToken;
      }
      return token;
    },
    // Session callback
    async session(ctx: any) {
      // ctx.session y ctx.token son any
      const session = ctx.session as any;
      const token = ctx.token as any;

      session.user = session.user || {};
      session.user.shopifyToken = token.shopifyToken;
      return session;
    },
  },
  pages: {
    // Ajustamos la URL de login para que coincida con la ruta existente
    signIn: "/login",
  },

  debug: false,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
