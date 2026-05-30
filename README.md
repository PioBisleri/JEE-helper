<div align="center">

# 🔥 JEE Forge

**Learn JEE by solving, not reading.**

AI-powered JEE Mains study helper that generates chapter-wise questions, scaffolds you down to first principles when stuck, tracks every concept you learn, and tests you weekly.

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-owl--alpha-6366f1?style=flat-square&logo=openrouter&logoColor=white)](https://openrouter.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

## ✨ Features

### 🧠 Smart Question Generation
Every question is generated live by the AI model, tailored to your current chapter, difficulty level, and previously learned concepts. No two students get the same experience.

### 🪜 Scaffold Loop — Never Stay Stuck
When you get a question wrong, JEE Forge doesn't just give you the answer. It walks you down:

1. **Hint** — a nudge in the right direction
2. **Simpler question** — isolates the concept you're missing
3. **Concept explanation** — analogy, common mistake, JEE connection
4. **Concept ladder** — 5 rungs from Class 9 basics to the advanced topic

### 🔄 Spaced Repetition
Concepts you learn are scheduled for review at increasing intervals (1, 3, 7, 14 days). The app surfaces due reviews before each study session so nothing slips.

### 📝 Weekly Tests
Every week (after 5+ concepts learned), take a 10-question timed assessment. No hints. No scaffolds. Just you and the concepts. Results are graded, weak concepts are flagged, and your progress is tracked over time.

### 📊 Stats & Predictions
- Current and best study streaks
- Predicted JEE score based on chapter progress
- Mistake breakdown: Conceptual Gap vs Calculation Error vs Misread vs Distractor Trap
- Concept cloud: green (mastered), yellow (due for review)
- Weekly test score trends
- Session history

### 🎯 Mood-Aware Difficulty
Tell the app how you're feeling:
- 😤 **Focused** — normal JEE Mains difficulty
- 😴 **Tired** — easier, more conceptual
- 😰 **Stressed** — easiest, encouraging phrasing

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│                   JEE Forge                  │
├─────────────┬──────────────┬─────────────────┤
│   React 19  │  Tailwind v4 │  React Router 6 │
│  Components │  Dark Theme  │   5 Routes      │
├─────────────┴──────────────┴─────────────────┤
│              localStorage (zero backend)      │
│  Progress · Concepts · Sessions · Streaks     │
├──────────────────────────────────────────────┤
│           OpenRouter AI API                │
│  Questions · Hints · Scaffolds · Tests       │
└──────────────────────────────────────────────┘
```

**28 source files · ~2,500 lines · zero backend dependencies**

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- A free [OpenRouter API key](https://openrouter.ai/keys)

### Installation

```bash
git clone <repository-url>
cd jeeforge
npm install --legacy-peer-deps
```

### Configure

Create a `.env` file in the project root:

```env
VITE_OPENROUTER_KEY=your_openrouter_api_key_here
```

> **No API key?** Get one free at [OpenRouter](https://openrouter.ai/keys). The free tier is fully sufficient for personal use.

### Run

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
jeeforge/
├── src/
│   ├── main.jsx                    # React entry point
│   ├── App.jsx                     # Router — 5 routes, onboarding gate
│   ├── index.css                   # Tailwind v4 + theme tokens + animations
│   │
│   ├── data/
│   │   └── chapters.js             # Complete JEE syllabus (42 chapters)
│   │
│   ├── utils/
│   │   ├── storage.js              # localStorage wrapper — all persistence
│   │   ├── api.js                  # 9 AI functions (OpenRouter)
│   │   ├── spaceRepetition.js      # SM-2 style review intervals
│   │   └── notifications.js        # Browser daily reminder notifications
│   │
│   ├── components/
│   │   ├── QuestionCard.jsx        # Question display + option buttons
│   │   ├── OptionButton.jsx        # State-aware answer button
│   │   ├── ScaffoldPanel.jsx       # Reusable scaffold question UI
│   │   ├── ConceptLadder.jsx       # First-principles stepper
│   │   ├── ChapterSelector.jsx     # Chapter cards with progress
│   │   ├── ProgressBar.jsx         # Visual progress indicator
│   │   ├── MoodSelector.jsx        # Focused / Tired / Anxious
│   │   ├── NotificationSetup.jsx   # Reminder permission + time picker
│   │   ├── SessionSummary.jsx      # AI-generated session recap
│   │   ├── WeeklyTest.jsx          # Test history + focus areas
│   │   ├── LoadingSkeleton.jsx     # Animated skeleton placeholder
│   │   └── ErrorState.jsx          # Error message with retry
│   │
│   └── pages/
│       ├── Onboarding.jsx          # 3-step setup (name, exam date, reminders)
│       ├── Home.jsx                # Dashboard — chapters, banners, countdown
│       ├── Study.jsx               # Core experience — 7-phase state machine
│       ├── TestPage.jsx            # Weekly 10-question timed assessment
│       └── StatsPage.jsx           # Analytics — charts, predictions, history
│
├── .env                            # OpenRouter API key (gitignored)
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔑 Key Design Decisions

### Zero Backend, Zero Setup
Everything runs in the browser. Progress, concepts, streaks, sessions — all stored in `localStorage`. No database, no auth server, no deployment needed. Open the app and start studying.

### Two Hard Rules
1. **No component calls AI directly** — all AI calls go through `src/utils/api.js`
2. **No component calls localStorage directly** — all persistence goes through `src/utils/storage.js`

This keeps the UI layer pure and makes every data flow testable.

### State Machine Study Flow
The Study page is a strict 7-phase state machine:

```
mood → review? → question → correct → summary (every 5th) → question...
                  ↓ wrong
              hint
                  ↓ still stuck
              scaffold1 (simpler question)
                  ↓ wrong
              scaffold2 (concept explanation + analogy)
                  ↓ still confused
              ladder (5 rungs from basics to advanced)
                  ↓ complete
              back to scaffold2
```

No shortcuts allowed. Every phase transition is explicit.

---

## 🛠️ Tech Stack

| Layer        | Technology            | Version |
|--------------|----------------------|---------|
| Framework    | React                 | 19.x    |
| Bundler      | Vite                  | 8.x     |
| Styling      | Tailwind CSS          | 4.x     |
| Routing      | React Router          | 6.22.x  |
| Charts       | Recharts              | 2.12.x  |
| AI           | OpenRouter (owl-alpha)  | API   |
| Storage      | localStorage          | Browser |

---

## 📚 JEE Syllabus Coverage

| Subject    | Chapters |
|------------|----------|
| Physics    | 15       |
| Chemistry  | 12       |
| Math       | 15       |
| **Total**  | **42**   |

Each chapter contains:
- `id` — unique identifier (e.g., `phy_01`)
- `name` — chapter title
- `subtopics[]` — 4-5 key subtopics
- `difficulty_curve[]` — 6-10 progressive difficulty points

---

## 🤝 How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and test: `npm run dev && npm run build`
4. Commit: `git commit -m "Add: my feature"`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request

---

## 📄 License

MIT — do whatever you want with it. Built for students, by someone who remembers what JEE prep feels like.

---

<div align="center">

**Made with frustration, caffeine, and the memory of solving problems at 2 AM.**

⭐ Star this repo if it helped your prep.

</div>
