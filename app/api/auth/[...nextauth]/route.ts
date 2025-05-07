import dbConnect from "@/backend/config/dbConnect";
import User, { IUser } from "@/backend/models/user";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import GoogleProvider from 'next-auth/providers/google';
type Credentials = {
  email: string;
  password: string;
};

type Token = {
  user: IUser;
}

async function auth(req: NextRequest, res: any) {
  return await NextAuth(req, res, {
    session: {
      strategy: "jwt",
    },
    providers: [
      CredentialsProvider({
        // @ts-ignore
        async authorize(credentials: Credentials) {
          dbConnect();

          const { email, password } = credentials;

          const user = await User.findOne({ email }).select("+password");

          if (!user) {
            throw new Error("Invalid email or password");
          }

          const isPasswordMatched = await bcrypt.compare(
            password,
            user.password
          );

          if (!isPasswordMatched) {
            throw new Error("Invalid email or password");
          }

          return user;
        },
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      })
    ],
    callbacks: {
      jwt: async ({ token, user }) => {
        const jwtToken = token as Token;
        user && (token.user = user);

        // Update session when user is updated
        if (req.url?.includes("/api/auth/session?update")) {
          // Hit the database and return the updated user
          const updatedUser = await User.findById(jwtToken?.user?.id);
          token.user = updatedUser;
        }

        return token;
      },
      session: async ({ session, token }) => {
        session.user = token.user as IUser;

        //@ts-ignore
        delete session?.user?.password;

        return session;
      },
    },
    pages: {
      signIn: "/"
    },
    secret: process.env.NEXTAUTH_SECRET,
  });
}

export { auth as GET, auth as POST };

// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import bcrypt from "bcryptjs";
// import db from "@/backend/config/dbConnect";
// import { NextRequest } from "next/server";

// type Credentials = {
//   email: string;
//   password: string;
// };

// type IUser = {
//   id: string;
//   name: string;
//   email: string;
//   password?: string;
//   avatar: any;
//   role: string;
//   google_id?: string;
//   created_at: Date;
// };

// type Token = {
//   user: IUser;
// };

// async function auth(req: NextRequest, res: any) {
//   return await NextAuth(req, res, {
//     session: {
//       strategy: "jwt",
//     },
//     providers: [
//       CredentialsProvider({
//         name: "Credentials",
//         credentials: {
//           email: { label: "Email", type: "email" },
//           password: { label: "Password", type: "password" },
//         },
//         // @ts-ignore
//         async authorize(credentials: Credentials) {
//           const { email, password } = credentials;

//           const { rows } = await db.pool.query(
//             "SELECT * FROM users WHERE email = $1",
//             [email]
//           );

//           const user = rows[0];

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

//           delete user.password;

//           return user;
//         },
//       }),
//       GoogleProvider({
//         clientId: process.env.GOOGLE_CLIENT_ID as string,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//       }),
//     ],
//     callbacks: {
//       jwt: async ({ token, user }) => {
//         if (user) {
//           token.user = user;
//         }

//         // Optional: Refresh user data
//         if (req.url?.includes("/api/auth/session?update")) {
//           const { rows } = await db.pool.query(
//             "SELECT * FROM users WHERE id = $1",
//             [(token.user as IUser).id]
//           );
//           const updatedUser = rows[0];
//           if (updatedUser) {
//             delete updatedUser.password;
//             token.user = updatedUser;
//           }
//         }

//         return token;
//       },
//       session: async ({ session, token }) => {
//         session.user = token.user as IUser;
//         delete (session.user as any).password;
//         return session;
//       },
//     },
//     pages: {
//       signIn: "/",
//     },
//     secret: process.env.NEXTAUTH_SECRET,
//   });
// }

// export { auth as GET, auth as POST };
