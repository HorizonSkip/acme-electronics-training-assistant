"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRef } from "react";

export default function QuizPage() {
 const supabase = createClient();
 const [results, setResults] = useState<any>(null);
 const [quizId, setQuizId] = useState("");
 const [messages, setMessages] = useState([{role: "assistant",content:"Welcome to the Acme Training Quiz. What topic would you like to be tested on?",},]);
 const [input, setInput] = useState("");
 const [isWaiting, setIsWaiting] = useState(false);
 const [quizData, setQuizData] = useState<any>(null);
 const [currentQuestion, setCurrentQuestion] = useState(0);
 const [answers, setAnswers] = useState<any[]>([]);
 const [quizStarted, setQuizStarted] = useState(false);
 const [quizComplete, setQuizComplete] = useState(false);
 const [resultsSubmitted, setResultsSubmitted] = useState(false);
 const [evaluationComplete, setEvaluationComplete] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const buttonText = results? "Start New Test": quizStarted? "Submit Answer": "Send";
 const chatContainerRef = useRef<HTMLDivElement>(null);

 useEffect(() => {if (chatContainerRef.current) {chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;}}, [messages]);

 useEffect(() => {if (!quizId) return;
  const interval = setInterval(async () => {
   const { data } = await supabase.from("quizzes").select("*").eq("id", quizId).single();
   if (!data) return;
   if (data.status === "ready" && data.quiz_data && !quizStarted) {
    console.log("Quiz Ready", data);
    setQuizData(data.quiz_data);
    setQuizStarted(true);
    setCurrentQuestion(0);
    const firstQuestion = data.quiz_data.questions[0];
    setMessages([{role: "assistant",content: firstQuestion.question + (firstQuestion.options?.length? "\n\n" +firstQuestion.options.map((o: string, i: number) =>`${String.fromCharCode(65 + i)}. ${o}`).join("\n"): ""),},]);
    setIsWaiting(false);}
   if (data.status === "completed" && data.feedback) {
       setResults(data.feedback);
       setEvaluationComplete(true);
       setIsWaiting(false);}
  }, 1000);
  return () => clearInterval(interval);
 }, [quizId, quizStarted]);

 const handleSend = async () => {
  if (results) {window.location.reload();return;}
  if (quizStarted && quizData) {
   if (!input.trim() || quizComplete) return;
   const question = quizData.questions[currentQuestion];
   const newAnswers = [...answers,{question_id: question.id,answer: input,},];
   setAnswers(newAnswers);
   setMessages((prev) => [...prev,{role: "user",content: input,},]);
   setInput("");
   if (currentQuestion < quizData.questions.length - 1) {
    const nextQuestion = currentQuestion + 1;
    setCurrentQuestion(nextQuestion);
    const nextQ = quizData.questions[nextQuestion];
    setMessages((prev) => [...prev,{role: "assistant",content: nextQ.question +(nextQ.options?.length? "\n\n" +nextQ.options.map((o: string, i: number) =>`${String.fromCharCode(65 + i)}. ${o}`).join("\n"): ""),},]);
    return;}
   setQuizComplete(true);
   setMessages((prev) => [...prev,{role: "assistant",content:"All questions answered. Submit the quiz for evaluation.",},]);
   return;}
  if (!input.trim() || isWaiting) return;
  const topic = input;
  setMessages((prev) => [...prev,{role: "user",content: topic,},]);
  setInput("");
  setIsWaiting(true);
  const {data: { user },} = await supabase.auth.getUser();
  if (!user) {setIsWaiting(false);return;}
  const { data, error } = await supabase.from("quizzes").insert({user_id: user.id,topic,status: "in_progress",}).select().single();
  if (error) {console.error(error);setMessages((prev) => [...prev,{role: "assistant",content: "Failed to create quiz.",},]);setIsWaiting(false);return;}
  setQuizId(data.id);
  setMessages((prev) => [...prev,{role: "assistant",content: "Generating quiz...",},]);
 };

 return (
  <div className="h-screen bg-gray-950 text-white flex flex-col">
   <div className="border-b border-gray-800 p-4"><h1 className="text-xl font-bold">Acme Quiz Dashboard</h1></div>
   <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
    {messages.map((message, index) => (<div key={index} className={`max-w-3xl p-4 rounded-lg ${message.role === "user"? "bg-blue-600 ml-auto": "bg-gray-800"}`}>{message.content}</div>))}
    {resultsSubmitted && results && (
     <div className="bg-gray-800 p-6 rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
      <div className="mb-6"><div>Score: {results.overall_score}/7</div><div>Percentage: {results.percentage}%</div></div>
      <h3 className="font-bold mb-4">Question Breakdown</h3>
      {results.breakdown?.map((item: any, index: number) => (
       <div key={index} className="border border-gray-700 rounded p-4 mb-3">
        <div className="font-semibold mb-2">Question {index + 1}</div>
        <div className="mb-2">{item.question}</div>
        <div className="mb-1"><strong>Your Answer:</strong> {item.user_answer}</div>
        <div className="mb-1"><strong>Correct Answer:</strong> {item.correct_answer}</div>
        <div className="mb-1"><strong>Result:</strong>{" "}{item.correct ? "✅ Correct" : "❌ Incorrect"}</div>
        <div><strong>Feedback:</strong> {item.feedback}</div>
       </div>
      ))}
      {results.onboarding_plan && (<>
       <h3 className="font-bold mt-6 mb-2">Recommended Onboarding Plan</h3>
       <div className="bg-gray-900 p-4 rounded">
        {Object.entries(results.onboarding_plan).map(
         ([week, tasks]) => (
          <div key={week} className="mb-6">
           <h4 className="font-bold capitalize mb-3">{week.replace("_", " ")}</h4>
           {(tasks as any[]).map((task, index) => (
            <div key={index} className="border border-gray-700 rounded p-3 mb-2">
             <div><strong>Material:</strong> {task.material}</div>
             <div><strong>Section:</strong> {task.section}</div>
             <div><strong>Section:</strong> {task.objective}</div>
            </div>
           ))}
          </div>
         )
        )}
       </div>
      </>)}
     </div>
    )}
   </div>
   <div className="border-t border-gray-800 p-4">
    <div className="w-[65%] mx-auto flex items-center gap-2">
     <input value={input}disabled={quizComplete && !evaluationComplete}onChange={(e) => setInput(e.target.value)}placeholder="Enter a topic..."
     className="flex-1 bg-gray-800 rounded px-4 py-2 outline-none"onKeyDown={(e) => {if (e.key === "Enter") {handleSend();}}}/>
     <button onClick={handleSend}disabled={quizComplete && !evaluationComplete}className={`px-4 py-2 rounded ${quizComplete && !evaluationComplete? "bg-gray-600 cursor-not-allowed": "bg-blue-600"}`}>{buttonText}</button>
     {quizComplete && !evaluationComplete && !resultsSubmitted && (
      <button disabled={isSubmitting} onClick={async () => {
       setIsSubmitting(true); await supabase.from("quizzes").update({user_answers: answers,status: "submitted",}).eq("id", quizId); setIsWaiting(true);
        setMessages((prev) => [...prev, {role: "assistant",content: "Evaluating your answers...",} ,]);}}
       className={`px-4 py-2 rounded ${isSubmitting? "bg-gray-500 cursor-not-allowed opacity-50": "bg-yellow-600 hover:bg-yellow-700"}`}>
       {isSubmitting ? "Submitting..." : "Submit Quiz"}</button>)}
     {evaluationComplete && results && !resultsSubmitted && (<button onClick={() => {setResultsSubmitted(true);}}className="bg-green-600 px-4 py-2 rounded">Show Results</button>)}
    </div>
   </div>
  </div>
 );
}
