# Acme Electronics Training Assistant

AI-powered Employee Training & Knowledge Assistant built with RAG, Vector Search, Supabase, OpenAI, and n8n.

An intelligent workplace assistant that enables employees to instantly search company knowledge, learn procedures, access SOPs, receive grounded answers from internal documentation, and complete AI-generated training assessments.

## Features

### AI Knowledge Assistant

* Natural language chat interface
* Answers grounded in company documentation
* Context-aware conversations
* Source citations for transparency
* Conversation history persistence

### Retrieval Augmented Generation (RAG)

* Semantic document search
* OpenAI embeddings
* Vector similarity matching
* Multi-document knowledge base
* Context injection into AI responses

### Document Management

* PDF upload and ingestion
* Automatic chunking
* Embedding generation
* Knowledge base indexing
* Admin document management

### Employee Training

* AI-generated quizzes
* Multiple-choice questions
* Scenario-based assessments
* Long-form response evaluation
* Personalized learning recommendations

### Authentication & User Management

* Secure authentication
* Role-based access control
* Admin dashboard
* Protected knowledge base

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase Auth

### Backend & AI

* OpenAI GPT Models
* OpenAI Embeddings
* n8n Workflow Automation
* Retrieval Augmented Generation (RAG)

### Database

* Supabase
* PostgreSQL
* pgvector

### Infrastructure

* Vercel
* Supabase Storage
* Docker
* Local n8n Deployment

## Architecture

```text
User
 │
 ▼
Next.js Frontend
 │
 ▼
Supabase
 │
 ├── Authentication
 ├── Conversation Storage
 ├── Document Storage
 └── Vector Database
          │
          ▼
      n8n Workflows
          │
          ▼
     OpenAI APIs
          │
          ▼
     Grounded Response
```

## Knowledge Base Workflow

```text
PDF Upload
    │
    ▼
Supabase Storage
    │
    ▼
n8n Processing Workflow
    │
    ├── Extract Text
    ├── Chunk Document
    ├── Generate Embeddings
    └── Store Vectors
    │
    ▼
Vector Database Ready
```

## Chat Workflow

```text
User Question
      │
      ▼
Generate Embedding
      │
      ▼
Vector Search
      │
      ▼
Retrieve Relevant Chunks
      │
      ▼
Build Context
      │
      ▼
OpenAI Response
      │
      ▼
Return Answer + Sources
```

## Demonstrated Skills

This project demonstrates practical experience with:

* Retrieval Augmented Generation (RAG)
* Semantic Search
* OpenAI Embeddings
* Vector Databases
* PostgreSQL
* pgvector
* AI Application Development
* Workflow Automation
* Authentication Systems
* Role-Based Access Control
* Document Processing Pipelines
* Knowledge Management Systems
* Full Stack Development
* API Integration
* Cloud Deployment

## Example Use Cases

### Employee Onboarding

> "What documents do I need to complete during onboarding?"

### HR & Policies

> "How many casual leaves am I entitled to?"

### IT Support

> "What is the company's password policy?"

### Customer Service

> "What is the warranty process for returned products?"

### Learning & Assessment

> "Generate a quiz on workplace security policies."

## Screenshots

<img width="1919" height="912" alt="image" src="https://github.com/user-attachments/assets/96cf50cb-3050-4125-a8dd-d44e08929651" />
<img width="1919" height="899" alt="image" src="https://github.com/user-attachments/assets/14c5d7cc-41d0-42ed-b1c9-d354851b19e3" />
<img width="1919" height="899" alt="image" src="https://github.com/user-attachments/assets/0c88a702-f934-42fc-af13-4620c26f1d91" />


## Future Enhancements

* Multi-tenant architecture
* Voice interaction
* Learning analytics dashboard
* Department-specific assistants
* Advanced reporting
* Agentic workflows
* Slack and Teams integration
* Automated onboarding journeys

## Project Motivation

Most organizations store critical knowledge across PDFs, SOPs, policy documents, and training manuals that employees struggle to navigate efficiently.

This project demonstrates how modern AI systems can transform static documentation into an interactive knowledge assistant that improves onboarding, reduces support overhead, and accelerates employee learning.

## Author

**Xitij Thorat**

AI Generalist | Workflow Automation | RAG Systems | AI Applications

GitHub: [HorizonSkip](https://github.com/HorizonSkip?utm_source=chatgpt.com)

---

One thing I'd strongly suggest: add a GIF of the chatbot answering questions from your uploaded PDFs. Recruiters spend 15–30 seconds on a repo. A 10-second demo GIF often does more than 500 lines of README text.
