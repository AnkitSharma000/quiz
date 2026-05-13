# ai::quiz — AI-Powered Knowledge Challenge

A Claude-powered quiz app that generates 15–25 unique questions on any programming topic you type.

---

## Project Structure

```
quiz-app/
├── server.js          ← Express backend (calls Claude API securely)
├── package.json
├── .env.example       ← Copy to .env and add your API key
├── .gitignore
└── public/
    └── index.html     ← Frontend UI (served by Express)
```

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Anthropic API key
```bash
cp .env.example .env
# Edit .env and set:
# ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Start the server
```bash
npm start
# ✅ Quiz server running at http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## Deploy to Render (Free)

1. Push this folder to a GitHub repository
2. Go to https://render.com → **New Web Service**
3. Connect your GitHub repo
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variable:
   - `ANTHROPIC_API_KEY` = your key from https://console.anthropic.com
6. Click **Deploy** — live in ~2 minutes!

---

## Deploy to Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
railway variables set ANTHROPIC_API_KEY=sk-ant-...
```

---

## Deploy to Heroku

```bash
heroku create your-quiz-app
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
git push heroku main
heroku open
```

---

## Deploy to Fly.io

```bash
fly launch
fly secrets set ANTHROPIC_API_KEY=sk-ant-...
fly deploy
```

---

## How It Works

1. User types a topic and selects 15/20/25 questions
2. Frontend POSTs to `/api/generate-quiz` on the Express server
3. Server calls the Claude API with your API key (key never exposed to browser)
4. Claude returns a JSON array of questions
5. Frontend renders the quiz with syntax highlighting, scoring, and feedback

---

## API Endpoint

```
POST /api/generate-quiz
Content-Type: application/json

{ "topic": "std::map in C++", "count": 15 }

→ { "questions": [ { category, text, hint, code, options, explanation, correct_title }, ... ] }
```

---

## Features

- 🤖 Claude generates fresh questions every time — no repeated quizzes
- 🎨 Syntax-highlighted code snippets (C++, Python, JS, Java, SQL auto-detected)
- 🔥 Streak scoring bonus
- 📊 Progress trail + final grade (A+ → D)
- ⌨️ Keyboard shortcuts (A/B/C/D or 1/2/3/4, Enter to advance)
- 🔒 API key secured on the server — never sent to the browser
