<div align="center">

# Nexus JEE

**AI-Powered JEE Mains Preparation Platform**

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![KaTeX](https://img.shields.io/badge/KaTeX-0.17-ffffff?style=flat-square&logo=katex&logoColor=black)](https://katex.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

## About

Nexus JEE is a fully client-side AI tutoring platform for JEE Mains preparation. It generates personalized questions in real-time, scaffolds students through difficult concepts, tracks learning milestones, and provides comprehensive performance analytics. No backend required — all data persists in the browser via `localStorage`.

---

## Key Features

### AI-Generated Content
- **Real-time question generation** — every question is unique, tailored to chapter, difficulty, and student progress
- **14 specialized AI prompt functions** — questions, scaffolds, hints, summaries, test papers, and more
- **Request deduplication** and **automatic retries** with exponential backoff

### Adaptive Scaffolding
When a student answers incorrectly, the system provides four progressive support levels:

1. **Simplified Question** — isolates the missed concept
2. **Concept Explanation** — analogy, worked example, common mistakes
3. **Concept Ladder** — 5-rung progression from fundamentals to advanced
4. **Worked Solution** — full step-by-step derivation

### Spaced Repetition
Scheduled reviews at 1, 3, 7, and 14-day intervals. Due reviews surface before each session to reinforce long-term retention.

### Full Syllabus Coverage

| Subject | Chapters |
|---------|----------|
| Physics | 15 |
| Chemistry | 12 |
| Mathematics | 15 |
| **Total** | **42** |

Each chapter includes 4–10 progressive difficulty steps with curated subtopics.

### Mock Exams & Practice
- **Full JEE simulation** — 75 questions, 180 minutes, zero hints
- **Single-subject mocks** — Physics, Chemistry, or Mathematics
- **Custom practice** — configurable question count, difficulty, and chapter selection

### Performance Analytics
- Projected JEE score based on solving accuracy
- Mistake DNA — categorized error analysis (conceptual, calculation, misread, distractor)
- Activity heatmap, concept map, chapter mastery charts
- Weekly test trends and session replays

### Gamification
- **XP & Leveling** — 6 progression tiers from JEE Aspirant to JEE Legend
- **15 achievement badges** — streaks, speed solving, perfect scores, consistency
- **Daily challenges** — 30-question assessments weighted toward weak areas

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 6 |
| Charts | Recharts |
| Math Rendering | KaTeX |
| Animations | Framer Motion |
| AI Backend | OpenRouter API |
| Visualizations | Python Manim |

---

## Project Structure

```
nexus-jee/
├── src/
│   ├── main.jsx                    # Entry point
│   ├── App.jsx                     # Router, layout, navigation
│   ├── index.css                   # Design system, global styles
│   ├── data/                       # Chapters, formulas, achievements
│   ├── utils/                      # API, storage, spaced repetition
│   ├── components/                 # 25 reusable UI components
│   └── pages/                      # 9 route components
├── manim/                          # Python Manim animation source
│   ├── physics/                    # 15 chapter scripts
│   ├── maths/                      # 15 chapter scripts
│   └── chemistry/                  # 12 chapter scripts
├── public/animations/              # 128 pre-rendered .webm files
├── .env                            # API key (gitignored)
└── package.json
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [OpenRouter API key](https://openrouter.ai/keys)

### Installation

```bash
git clone <repository-url>
cd nexus-jee
npm install
```

### Configuration

Create a `.env` file:

```env
VITE_OPENROUTER_KEY=your_api_key_here
```

### Development

```bash
npm run dev
```

Open `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

---

## Study Flow

The study session follows a 9-phase state machine:

```
Mood Selection → Spaced Reviews → Main Questions
                                        │
                                 ┌──────┴──────┐
                                 ▼              ▼
                             Correct          Wrong
                                 │              │
                                 ▼              ▼
                           Next Question   Scaffold L1 → L2 → Ladder → Solution
                                                              │
                                                         ┌────┘
                                                         ▼
                                                   Back to Question
```

Every phase transition is explicit — no shortcuts.

---

## Data Persistence

All user data is stored in `localStorage` under the `jeeforge_` namespace:

| Domain | Key | Contents |
|--------|-----|----------|
| Progress | `jeeforge_progress` | Per-chapter metrics |
| Concepts | `jeeforge_concepts` | Learned concepts with review scheduling |
| Sessions | `jeeforge_sessions` | Study session logs |
| Streak | `jeeforge_streak` | Current and longest streaks |
| XP | `jeeforge_xp` | Total experience points |
| Mistakes | `jeeforge_mistakes` | Error log with categorization |
| Bookmarks | `jeeforge_bookmarks` | Saved questions |
| Notes | `jeeforge_notes` | Per-concept revision notes |
| Achievements | `jeeforge_achievements` | Unlocked badge IDs |
| Weekly | `jeeforge_weekly` | Test history and weekly concepts |

---

## XP Progression

| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | JEE Aspirant | 0 |
| 2 | Problem Solver | 500 |
| 3 | Concept Crusher | 1,000 |
| 4 | Formula Master | 1,500 |
| 5 | JEE Warrior | 2,000 |
| 6 | JEE Legend | 2,500+ |

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `cd manim && python render_all.py` | Render all Manim animations |

---

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Requires `localStorage` and `fetch` API support.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built for students who learn by solving.

</div>
