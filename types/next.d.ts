import { IUser } from "@/backend/models/user";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { NextRequest } from "next/server";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
declare module "next/server" {
  interface NextRequest {
    user: IUser;
  }
}


declare module "@reduxjs/toolkit/query/react" {
  interface FetchBaseQueryError {
    data?: any;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      avatar: any;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      avatar: any;
    };
  }
}