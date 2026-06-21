"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleRegister() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({email,password,});
    setLoading(false);
    if (error) {alert(error.message);return;}
    alert("Account created. Please check your email and verify your account before logging in.");
    router.push("/login");}
  return (
    <div className="min-h-screen flex items-center justify-center">
     <div className="w-[400px] space-y-4"><h1 className="text-3xl font-bold">Create Account</h1>
      <input type="email" placeholder="Email" className="w-full border p-3 rounded" value={email} onChange={(e) => setEmail(e.target.value)}/>
      <input type="password" placeholder="Password" className="w-full border p-3 rounded" value={password} onChange={(e) => setPassword(e.target.value)}/>
      <button onClick={handleRegister} disabled={loading} className="w-full p-3 bg-blue-600 text-white rounded">{loading ? "Creating..." : "Create Account"}</button>
      <p className="text-sm">Already have an account?<Link href="/login" className="ml-2 text-blue-600">Login</Link></p>
     </div>
    </div>);
}