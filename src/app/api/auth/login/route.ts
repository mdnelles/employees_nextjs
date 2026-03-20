import { NextRequest, NextResponse } from "next/server";
import store from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
   try {
      const { email, password } = await req.json();
      if (!email || !password) {
         return NextResponse.json(
            { error: "Email and password required" },
            { status: 400 },
         );
      }
      const user = store.users.find((u) => u.email === email);
      if (!user) {
         return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Plain-text comparison for demo mode
      const valid = password === user.password;

      if (!valid) {
         return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const isAdmin = user.admin === 1 || email === process.env.ADMIN_EMAIL;
      const token = signToken({ email, isAdmin });
      user.last_login = new Date().toISOString();
      return NextResponse.json({
         token,
         email: user.email,
         first_name: user.first_name,
         last_name: user.last_name,
         isAdmin,
      });
   } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
