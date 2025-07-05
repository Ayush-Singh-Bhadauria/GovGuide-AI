# Nagrik Mitra AI

Nagrik Mitra AI is a full-stack Next.js application that helps users discover, check eligibility for, and apply to government schemes in India. It features a personalized AI chatbot (powered by LangChain and OpenAI), user authentication, an admin panel for scheme management, and a comprehensive user profile system.

---

## 🚀 Features

- **Personalized AI Chatbot**: Chat with an AI assistant that recommends schemes based on your profile and answers queries about government benefits.
- **User Authentication**: Secure registration, login, and session management using JWT cookies and MongoDB.
- **Profile Management**: Edit and save detailed personal, socioeconomic, banking, and preference information.
- **Scheme Discovery**: Browse, search, and apply for government schemes.
- **Admin Panel**: Admins can add, edit, and delete schemes.
- **Eligibility Engine**: The chatbot uses your profile to suggest the most relevant schemes.
- **Modern UI**: Responsive, accessible, and visually appealing interface.

---
## UML Diagram

- Below is the UML diagram that illustrates the architecture and relationships of the application:

  ![Screenshot 2025-06-11 141052](https://github.com/user-attachments/assets/95af8c2a-e704-47dc-99f8-56b771c1463b)


     ![Screenshot 2025-06-11 140925](https://github.com/user-attachments/assets/6ab5d065-112b-4208-843b-12fb1a95deb4)

---
## Screenshots

- **Home Page**

  ![image](https://github.com/user-attachments/assets/fe71f35d-fd7f-4ef9-ae1e-fb6ccb0b2ea2)

- **Login/Signup**

  ![image](https://github.com/user-attachments/assets/e5ab3436-fe5a-465b-b703-dff42c0046b1)

  ![image](https://github.com/user-attachments/assets/1086738b-0bed-4468-aab5-2f725bdb21c3)

- **Chatbot**

  ![Screenshot 2025-06-11 145926](https://github.com/user-attachments/assets/cce20012-bad0-4c21-abc8-eeaae66dc9a6)

- **Admin Panel**

 ![Screenshot 2025-06-11 164723](https://github.com/user-attachments/assets/6d419ddd-7bb9-45d9-aaf5-aaf9c5981e80)

---

## 🏗️ Project Structure

```
app/
  api/                # API routes (login, logout, profile, schemes, chatbot)
  profile/            # User profile page
  admin/              # Admin dashboard
  ...
components/           # UI components (chatbot, navigation, forms, etc.)
contexts/             # React context (auth)
mdoels/               # Mongoose models (user, scheme)
src/lib/              # Utilities (dbconnect, auth)
public/               # Static assets
```

---

## 🛠️ Getting Started

### 1. **Clone the Repository**
```bash
git clone git@github.com:Ayush-Singh-Bhadauria/Nagrik-Mitra-AI.git
cd Nagrik-Mitra-AI
```

### 2. **Install Dependencies**
```bash
npm install
# or
yarn
# or
pnpm install
```

### 3. **Set Up Environment Variables**
Create a `.env.local` file in the root directory:

```
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

- For production, use a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) URI.
- Get your OpenAI API key from [OpenAI](https://platform.openai.com/account/api-keys).

### 4. **Run the Development Server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🌐 Deployment (Vercel)

1. **Push your code to GitHub.**
2. **Import the repo on [Vercel](https://vercel.com/).**
3. **Set environment variables in the Vercel dashboard:**
   - `MONGODB_URI` (Atlas connection string)
   - `OPENAI_API_KEY`
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD`
4. **Deploy!**

---

## 👤 User Guide

### Registration & Login
- Sign up with your email and password.
- Log in to access your personalized dashboard and chatbot.

### Profile Management
- Click on your profile to edit personal, socioeconomic, banking, and preference details.
- All fields are saved securely in MongoDB.

### Chatbot
- Ask questions about government schemes, eligibility, or benefits.
- The chatbot uses your profile and the latest schemes for personalized answers.

### Admin Panel
- Log in as admin to add, edit, or delete schemes.
- Only accessible to users with admin credentials.

---

## 🧑‍💻 Developer Guide

### Key Files
- `app/api/profile/route.ts` — User profile API (GET/PUT)
- `app/api/login/route.ts` — Login API
- `app/api/langchain-bot/route.ts` — Chatbot API (LangChain + OpenAI)
- `components/chatbot.tsx` — Chatbot UI
- `contexts/auth-context.tsx` — Auth context
- `mdoels/user.js` — User schema
- `mdoels/scheme.js` — Scheme schema

### Adding a New Scheme
- Use the admin panel or add directly to MongoDB.

### Customizing the Chatbot
- Edit the prompt construction in `app/api/langchain-bot/route.ts` to change how user profile and schemes are injected.

---

## 📝 Example .env.local

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nagrikmitra?retryWrites=true&w=majority
OPENAI_API_KEY=sk-...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

---

## ❓ FAQ

**Q: How do I reset my password?**
A: Password reset is not implemented yet. Contact the admin for help.

**Q: How do I add more fields to the user profile?**
A: Update the user schema in `mdoels/user.js` and the profile form in `app/profile/page.tsx`.

**Q: How do I make the chatbot more personalized?**
A: The chatbot already receives the full user profile. You can further tune the prompt or add custom LangChain tools.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

MIT

---

## 💬 Contact

- [Ayush Singh Bhadauria](https://github.com/Ayush-Singh-Bhadauria)
- Issues? Open one on GitHub!

---

## ⚡️ Chatbot Optimizations: Token & Retrieval Efficiency

Nagrik Mitra AI's chatbot is designed for both cost-efficiency and high relevance using advanced token and retrieval optimization techniques. Here’s how it works under the hood:

### 1. Token Utilization Optimization
- **Trimmed Chat History:** Only the last 5 user/assistant messages are included in the prompt, reducing unnecessary context and token usage.
- **Scheme Summarization:** Each government scheme is summarized before being sent to the LLM (title, first 100 chars of description, category, first 80 chars of eligibility, and link). This ensures only the most important information is used.
- **Concise System Prompt:** The system prompt instructs the model to keep answers crisp, concise, and under 100 words unless more detail is requested. Markdown formatting is encouraged for readability.
- **Max Token Limit:** The OpenAI API is called with a strict `maxTokens` limit to prevent runaway responses and control costs.

### 2. Retrieval Optimization (Embeddings-Based)
- **Embeddings for Relevance:** For every user query, the chatbot:
  1. Embeds the latest user message using OpenAI embeddings.
  2. Embeds each summarized scheme (title, description, category, eligibility).
  3. Calculates cosine similarity between the user query and each scheme.
  4. Selects only the top 5 most relevant schemes to include in the prompt.
- **Result:** The LLM only sees the most relevant, summarized schemes, not the entire database, making responses faster, cheaper, and more accurate.

### 3. Privacy & Persona
- **Built-in Knowledge Persona:** The chatbot is instructed to never mention or imply that it is receiving data from the user, a database, or an API. It always responds as if it has built-in, up-to-date knowledge of all schemes and user profiles, like a fine-tuned expert model.

---

**Why?**
- These optimizations dramatically reduce OpenAI API costs and latency, while improving the quality and relevance of answers for users.
- The approach is scalable to thousands of schemes and users, and can be further tuned for even greater efficiency.

---
