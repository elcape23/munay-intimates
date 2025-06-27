import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { customerAccessTokenCreate, getCustomer } from "@/lib/shopify";

export const authOptions = {
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
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        // 1) Intentamos crear el token
        const response = await customerAccessTokenCreate({ email, password });
        if (!response.customerAccessToken) {
          // Si no hay token, salimos con null
          return null;
        }

        // 2) Con el accessToken válido, pedimos el customer
        const customer = await getCustomer(
          response.customerAccessToken.accessToken
        );
        if (!customer) {
          // Si no existe customer, también salimos
          return null;
        }

        // 3) Aquí TS ya sabe que customer no es null
        return {
          id: customer.id,
          name: customer.firstName,
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
};

console.log("🔑 GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("🔑 GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
