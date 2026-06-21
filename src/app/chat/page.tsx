"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function Home() {
 const [supabase] = useState(() => createClient());
 const [input, setInput] = useState("");
 const [messages, setMessages] = useState<any[]>([]);
 const [sessionId, setSessionId] = useState("");
 const [isWaiting, setIsWaiting] = useState(false);
 const [loadingDots, setLoadingDots] = useState(".");
 const [recentChats, setRecentChats] = useState<any[]>([]);
 const [role, setRole] = useState<string | null>(null);
 const router = useRouter();
 const [userId, setUserId] = useState("");
 const hasSession = sessionId !== "";
 const [userEmail, setUserEmail] = useState("");
 const [stats, setStats] = useState({documents: 0, chunks: 0,});

 useEffect(() => {
  async function loadUserData() {
   const {data: { user },} = await supabase.auth.getUser();
   if (!user) return;
   setUserId(user.id);
   setUserEmail(user.email || "");
   const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
   if (profile) {setRole(profile.role);}
   const { count: documentCount } = await supabase.from("acme_documents").select("*", { count: "exact", head: true });
   const { count: chunkCount } = await supabase.from("acme_document_chunks").select("*", { count: "exact", head: true });
   setStats({documents: documentCount || 0,chunks: chunkCount || 0,});
  }loadUserData();
 }, []);

 useEffect(() => {
  if (!isWaiting) return;
  const interval = setInterval(() => {setLoadingDots((prev) => {if (prev === ".") return "..";if (prev === "..") return "...";return ".";});}, 400);
  return () => clearInterval(interval);
 }, [isWaiting]);

 useEffect(() => {
  const loadRecentChats = async () => {
   if (!userId) return;
   const { data, error } = await supabase.from("acme_chat_sessions").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
   if (error) return;
   if (!data || data.length === 0) {setSessionId("");setRecentChats([]);return;}
   setRecentChats(data);
   setSessionId((current) => current || data[0].id);};
  loadRecentChats();
  const interval = setInterval(loadRecentChats, 2000);
  return () => clearInterval(interval);
 }, [userId, supabase]);

 useEffect(() => {
  if (!sessionId) return;
  const loadMessages = async () => {
   const { data, error } = await supabase.from("acme_conversations").select("*").eq("session_id", sessionId).order("created_at", {ascending: true,});
  if (!error) {setMessages(data || []);if (data && data.length > 0) {const lastMessage =data[data.length - 1];setIsWaiting(lastMessage.role === "user");} else {setIsWaiting(false);}}};
  loadMessages();
  const interval = setInterval(loadMessages,1000);
  return () => clearInterval(interval);
 }, [sessionId]);

 const deleteSession = async (chatId: string) => {
  const confirmed = window.confirm("Delete this conversation permanently?");
  if (!confirmed) return;
  const { error } = await supabase.from("acme_chat_sessions").delete().eq("id", chatId);
  if (error) {console.error(error);alert("Failed to delete conversation");return;}
  setRecentChats((prev) => prev.filter((chat) => chat.id !== chatId));
  if (chatId === sessionId) {setSessionId("");setMessages([]);}
 };

 const switchConversation = (id: string) => {setSessionId(id);};

 const scrollToBottom = () => {const container = document.getElementById("chat-container");if (container) {container.scrollTop = container.scrollHeight;}};

 const newChat = async () => {if (!userId) return;const { data, error } = await supabase.from("acme_chat_sessions").insert({user_id: userId,title: "New Chat"}).select().single();console.log("DATA",data);console.log("ERROR", error);if   
(error) {console.error(error);return;}setSessionId(data.id);setMessages([]);setIsWaiting(false);};

 const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {console.error(error);return;}
  window.location.href = "/login";
 };

const sendMessage = async () => {
  if (!input.trim()) return;
  if (!sessionId) return;
  if (isWaiting) return;
  const messageText = input;
  setMessages((prev) => [...prev,{id: crypto.randomUUID(),role: "user",message: messageText,},]);
  setInput("");
  setIsWaiting(true);
  setTimeout(scrollToBottom, 100);
  const { error } = await supabase.from("acme_conversations").insert({session_id: sessionId,role: "user",message: messageText,status: "pending",});
  if (error) {console.error(JSON.stringify(error, null, 2));setIsWaiting(false);}
};

const renderMessage = (message: string) => {
  const sourceMatch = message.match(/\[SOURCES\]([\s\S]*?)\[\/SOURCES\]/);
  if (!sourceMatch) {return (<div className="whitespace-pre-wrap">{message}</div>);}
  const answer = message.replace(/\[SOURCES\][\s\S]*?\[\/SOURCES\]/,"");
  const sources = sourceMatch[1].split("\n").map((s) => s.trim()).filter(Boolean);
  return (<><div className="whitespace-pre-wrap">{answer}</div><div className="mt-4 pt-3 border-t border-zinc-700"><p className="text-xs uppercase tracking-wide text-zinc-400 mb-2">Sources</p><div className="flex flex-wrap gap-2">
   {sources.map((source)=>(<div key={source} className="bg-zinc-700 text-zinc-200 text-xs px-3 py-1 rounded-full">📄{" "}{source.replace(".pdf", "").replaceAll("_", " ")}</div>))}</div></div></>);};
  return (<div className="h-screen bg-zinc-950 text-white flex overflow-hidden">
   <aside className="w-72 bg-zinc-900 border-r border-zinc-800 p-4 flex-shrink-0"><h1 className="text-xl font-semibold">Acme Electronics ChatBot</h1>
    <div className="mt-4 bg-zinc-800 rounded-lg p-3 space-y-2 text-sm">
     <div><span className="text-zinc-400">User:</span><div className="font-medium break-all">{userEmail}</div></div>
     <div><span className="text-zinc-400">Access Level:</span><div className="font-medium capitalize">{role || "user"}</div></div>
     <div className="border-t border-zinc-700 pt-2">
      <div className="flex justify-between">
       <span className="text-zinc-400">Documents</span>
       <span>{stats.documents}</span>
      </div>
      <div className="flex justify-between">
       <span className="text-zinc-400">Chunks</span>
       <span>{stats.chunks}</span>
      </div>
     </div>
    </div>
    <button onClick={newChat}className={`w-full mt-6 bg-blue-900 hover:bg-blue-700 rounded-lg py-2 ${!hasSession ? "ring-2 ring-yellow-400 animate-pulse" : ""}`}>New Chat</button>
    {role === "admin" && (<button onClick={() => router.push("/admin")}className="w-full bg-blue-700 hover:bg-gray-600 text-white p-3 rounded mt-2">Admin Dashboard</button>)}
    <button onClick={() => router.push("/quiz")}className="w-full bg-blue-500 hover:bg-gray-600 text-white p-3 rounded mt-2">📝 Quiz Dashboard</button>
    <div className="mt-8"><p className="text-sm text-zinc-400 mb-2">Recent Chats</p><div className="space-y-2">{recentChats.length === 0 && (<div className="text-zinc-500 text-sm">No conversations yet</div>)}
    {recentChats.map((chat: any) => (
     <div key={chat.id}className="flex items-center gap-2">
      <button onClick={() => switchConversation(chat.id)}className={`flex-1 text-left p-2 rounded text-sm transition ${sessionId === chat.id? "bg-blue-600 text-white": "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"}`}>
       {chat.title || "Untitled Chat"}</button>
      <button onClick={(e) => {e.stopPropagation();deleteSession(chat.id);}} className="text-red-500 px-2 hover:text-red-400" title="Delete chat"> 🗑️ </button>
     </div>))}</div></div>
    <button onClick={handleLogout}className="w-full mt-4 p-2 rounded bg-red-100 hover:bg-red-700 text-black">Logout</button>
   </aside>
   <main className="flex-1 flex flex-col h-screen overflow-hidden">
    <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4"><h2 className="font-medium">Employee Handbook, SOP Guide & Training Assistant</h2></header>
    <div id="chat-container" className="flex-1 overflow-y-auto p-6 bg-zinc-950">
     <div className="max-w-5xl mx-auto space-y-4">
      {!hasSession && (<div className="text-center p-6"><h2 className="text-lg font-semibold">Welcome to ACME Assistant</h2><p className="text-gray-500 mt-2">Click "New Chat" to start your first conversation.</p></div>)}
       {hasSession && messages.length === 0 && (<div className="text-zinc-500 text-center mt-20">Start a conversation...</div>)}
      {messages.map((msg) => (<div key={msg.id} className={msg.role === "user"? "flex justify-end": "flex justify-start"}>
       <div className={msg.role === "user"? "bg-blue-600 text-white px-4 py-3 rounded-xl max-w-[800px] shadow-sm": "bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl text-white max-w-[800px] shadow-sm"}>
       {renderMessage(msg.message)}</div></div>))}
      {isWaiting && (<div className="flex justify-start"><div className="bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl text-zinc-400">Gathering information{loadingDots}</div></div>)}
     </div>
    </div>
    <div className="border-t border-zinc-800 bg-zinc-900 p-4">
     <div className="max-w-5xl mx-auto flex gap-3"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter") {sendMessage();}}}
      type="text" placeholder="Ask a question..." className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-400"/>
      <button onClick={sendMessage}disabled={!hasSession || isWaiting}className={!hasSession || isWaiting? "bg-gray-400 cursor-not-allowed px-6 rounded-lg": "bg-blue-600 hover:bg-blue-700 px-6 rounded-lg"}>Send</button></div>
    </div>
   </main>
  </div>
  );
}