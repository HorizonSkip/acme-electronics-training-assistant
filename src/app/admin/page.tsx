"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function verifyAdmin() {
    const supabase = createClient();
      const {data: { user },} = await supabase.auth.getUser();
      if (!user) {router.push("/chat");return;}
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (data?.role !== "admin") {router.push("/chat");}
    }verifyAdmin();
  }, []);

  useEffect(() => {loadDocuments();}, []);

  useEffect(() => {const interval = setInterval(() => {loadDocuments();}, 5000);return () => clearInterval(interval);}, []);

  async function uploadDocument() {
    if (!file) {alert("Please select a PDF");return;}
    setUploading(true);
    const fileName = `${file.name}`;
    const { error: storageError } = await supabase.storage.from("documents").upload(fileName, file);
    if (storageError) {alert(storageError.message); setUploading(false);return;}
    const { error: dbError } = await supabase.from("acme_documents").insert({filename: file.name.replace(".pdf", ""),processed: false});
    if (dbError) {alert(dbError.message);} else {alert("Document uploaded successfully");}
    loadDocuments();
    setUploading(false);
  }

  async function loadDocuments() {
    const { data, error } = await supabase.from("acme_documents").select("*").order("uploaded_at", {ascending: false,});
    if (!error && data) {setDocuments(data);}
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
     <div className="border-b border-gray-800 pb-4 mb-8"><h1 className="text-2xl font-bold">Acme Electronics Admin Dashboard</h1><p className="text-gray-400 mt-1">Knowledge Base Management</p></div>
      <div className="bg-zinc-900 rounded-xl p-6 mb-8 border border-zinc-800"><h2 className="text-xl font-semibold mb-4">Upload Document</h2>
       <label className="inline-block px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer transition">Select PDF<input type="file" accept=".pdf" onChange={(e)=>setFile(e.target.files?.[0] || null)}className="hidden"/>
       </label>{file && (<div className="mt-4 border border-zinc-700 rounded-xl p-4 bg-zinc-900"><div className="text-xs text-gray-400 mb-1">Selected Document</div><div className="font-medium">📄 {file.name}</div></div>)}
       <button onClick={uploadDocument} disabled={uploading} className="mt-4 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">{uploading ? "Uploading..." : "Upload Document"}</button>
      </div>
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800"><h2 className="text-xl font-semibold mb-4">Documents</h2>
       <div className="space-y-2">{documents.map((doc) => (<div key={doc.id}className="border rounded p-3 flex justify-between"><div>{doc.filename}</div><div>{doc.processed === "true" ? "✅ Processed" : "⏳ Pending"}</div></div>))}</div>
      </div>
    </div>
  );
}
