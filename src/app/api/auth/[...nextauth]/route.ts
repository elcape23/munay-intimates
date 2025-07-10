// @ts-nocheck
import NextAuth, {
  type NextAuthOptions,
  type Session,
  type User,
} from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { customerAccessTokenCreate, getCustomer } from "@/lib/shopify";

interface ShopifyUser extends User {
  shopifyToken?: string;
}

interface Token extends JWT {
  shopifyToken?: string;
}

const authOptions: NextAuthOptions = {
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
      async authorize(credentials): Promise<ShopifyUser | null> {
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
    async jwt({ token, user }): Promise<Token> {
      const u = user as ShopifyUser | undefined;
      if (u?.shopifyToken) {
        (token as Token).shopifyToken = u.shopifyToken;
      }
      return token as Token;
    },
    // Session callback
    async session({ session, token }): Promise<Session> {
      const s = session as Session & { user?: ShopifyUser };
      s.user = s.user || ({} as ShopifyUser);
      s.user.shopifyToken = (token as Token).shopifyToken;
      return s;
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
