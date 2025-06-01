import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt"
import prisma from "@repo/db";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
          name: "Login with username",
          credentials: {
            username: { label: "Username", type: "text", placeholder: "username" },
            password: { label: "Password", type: "password" }
          },
          async authorize(credentials, req) {
            const username = credentials?.username
            const password = credentials?.password
            if(!username || !password){
                return null
            }
            const user = await prisma.user.findFirst({
                where:{
                    username:username
                }
            })
            if(!user){
                return null
            }
            const isPasswordValid = await bcrypt.compare(password,user.password)
            if(!isPasswordValid){
                return null
            }
            
            return {
                id:user.id,
                username:user.username
            }
          }
        })
      ]

})

export {handler as GET, handler as POST}