"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleLogin() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({email,password,});
    setLoading(false);
    if (error) {alert(error.message);return;}
    router.push("/chat");
   if (!data.user?.email_confirmed_at) {alert("Please verify your email first.");return;}}
  return (
    <div className="min-h-screen flex items-center justify-center">
     <div className="w-[400px] space-y-4"><h1 className="text-3xl font-bold">Login</h1>
      <input type="email" placeholder="Email" className="w-full border p-3 rounded" value={email} onChange={(e) => setEmail(e.target.value)}/>
      <input type="password" placeholder="Password" className="w-full border p-3 rounded" value={password} onChange={(e) => setPassword(e.target.value)}/>
      <button onClick={handleLogin} disabled={loading} className="w-full p-3 bg-blue-600 text-white rounded">{loading ? "Signing In..." : "Login"}</button>
      <p className="text-sm">Don't have an account?<Link href="/register" className="ml-2 text-blue-600">Create Account</Link></p>
     </div>
    </div>);
}