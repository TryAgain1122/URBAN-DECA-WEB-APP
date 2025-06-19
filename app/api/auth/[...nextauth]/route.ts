import pool from '@/backend/config/dbConnect';

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import { NextRequest, NextResponse } from 'next/server';

export const authOptions = (req: any, res: any) => {
  return NextAuth(req, res, {
    session: {
      strategy: "jwt",
    },
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        // @ts-ignore
        async authorize(credentials: any) {
          const { email, password } = credentials;

          const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
          );

          const user = result.rows[0];

          if (!user) throw new Error("Invalid email or password");

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) throw new Error("Invalid email or password");

          // remove password before returning to session
          delete user.password;
          return user;
        },
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    callbacks: {
      jwt: async ({ token, user }) => {
        if (user) {
          token.user = user as any;
        }

        // If session is being updated
        if (req.url?.includes("/api/auth/session?update")) {
          const updated = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [token.user.id]
          );
          token.user = updated.rows[0];
        }

        return token;
      },
      session: async ({ session, token }) => {
        
        session.user = token.user;
        //@ts-ignore
        delete session.user?.password;
        return session;
      },
    },
    pages: {
      signIn: "/",
    },
    secret: process.env.NEXTAUTH_SECRET,
  });
};

const handler = (req: NextRequest, res: NextResponse) => {
  return authOptions(req, res)
}

export { handler as GET, handler as POST };


// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import bcrypt from "bcryptjs";
// import pool from "@/backend/config/dbConnect";

// const handler = NextAuth({
//   session: {
//     strategy: "jwt",
//   },
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials: any) {
//         const { email, password } = credentials;

//         const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//         const user = result.rows[0];

//         if (!user) throw new Error("Invalid email or password");

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) throw new Error("Invalid email or password");

//         delete user.password;
//         return user;
//       },
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user, trigger }) {
//       if (user) {
//         //@ts-ignore
//         token.user = user;
//       }

//       if (trigger === "update" && token.user?.id) {
//         const result = await pool.query("SELECT * FROM users WHERE id = $1", [token.user.id]);
//         const updatedUser = result.rows[0];
//         delete updatedUser.password;
//         token.user = updatedUser;
//       }

//       return token;
//     },
//     async session({ session, token }) {
//       session.user = token.user;
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// });

// export { handler as GET, handler as POST };


// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import bcrypt from "bcryptjs";
// import pool from "@/backend/config/dbConnect";

// const handler = NextAuth({
//   session: {
//     strategy: "jwt",
//   },
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials: any) {
//         const { email, password } = credentials;

//         const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//         const user = result.rows[0];

//         if (!user) throw new Error("Invalid email or password");

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) throw new Error("Invalid email or password");

//         delete user.password;
//         return user;
//       },
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user, trigger }) {
//       if (user) {
//         //@ts-ignore
//         token.user = user;
//       }

//       if (trigger === "update" && token.user?.id) {
//         const result = await pool.query("SELECT * FROM users WHERE id = $1", [token.user.id]);
//         const updatedUser = result.rows[0];
//         delete updatedUser.password;
//         token.user = updatedUser;
//       }

//       return token;
//     },
//     async session({ session, token }) {
//       session.user = token.user;
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// });

// export { handler as GET, handler as POST };


// import dbConnect from "@/backend/config/dbConnect";
// import User, { IUser } from "@/backend/models/user";
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import { NextRequest } from "next/server";
// import GoogleProvider from 'next-auth/providers/google';
// type Credentials = {
//   email: string;
//   password: string;
// };

// type Token = {
//   user: IUser;
// }

// async function auth(req: NextRequest, res: any) {
//   return await NextAuth(req, res, {
//     session: {
//       strategy: "jwt",
//     },
//     providers: [
//       CredentialsProvider({
//         // @ts-ignore
//         async authorize(credentials: Credentials) {
//           dbConnect();

//           const { email, password } = credentials;

//           const user = await User.findOne({ email }).select("+password");

//           if (!user) {
//             throw new Error("Invalid email or password");
//           }

//           const isPasswordMatched = await bcrypt.compare(
//             password,
//             user.password
//           );

//           if (!isPasswordMatched) {
//             throw new Error("Invalid email or password");
//           }

//           return user;
//         },
//       }),
//       GoogleProvider({
//         clientId: process.env.GOOGLE_CLIENT_ID as string,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//       })
//     ],
//     callbacks: {
//       jwt: async ({ token, user }) => {
//         const jwtToken = token as Token;
//         user && (token.user = user);

//         // Update session when user is updated
//         if (req.url?.includes("/api/auth/session?update")) {
//           // Hit the database and return the updated user
//           const updatedUser = await User.findById(jwtToken?.user?._id);
//           token.user = updatedUser;
//         }

//         return token;
//       },
//       session: async ({ session, token }) => {
//         session.user = token.user as IUser;

//         //@ts-ignore
//         delete session?.user?.password;

//         return session;
//       },
//     },
//     pages: {
//       signIn: "/"
//     },
//     secret: process.env.NEXTAUTH_SECRET,
//   });
// }

// export { auth as GET, auth as POST };
