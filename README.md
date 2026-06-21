# ReuniteAI

**Lead, not confirmation.**

ReuniteAI is a disaster reunification case-desk tool that helps trusted reviewers turn messy missing-person and sighting reports into safer, structured, human-reviewed leads.

Built by **Lumen** for the **USAII Global AI Hackathon 2026 — Crisis-Action** challenge.

---

## Project Summary

During disasters like floods, wildfires, storms, or evacuations, missing-person and sighting reports come in quickly from many sources: families, shelter staff, trained volunteers, responder partners, school/community centers, and community witnesses.

The problem is that these reports are often:

* messy
* incomplete
* duplicated
* emotionally written
* inconsistent across sources
* unsafe to share publicly

ReuniteAI helps organize those reports into safer possible leads while keeping humans in control.

The app does **not** confirm identity.
The app does **not** auto-contact anyone.
The app does **not** publish exact locations.
Every lead requires human review.

---

## The One Thing the AI Does

ReuniteAI uses AI for one focused task:

> **Turn messy crisis report text into structured, redacted, risk-flagged report data.**

The AI helps with:

* extracting fields from messy notes
* summarizing reports
* flagging missing information
* flagging risky or uncertain details
* helping redact sensitive information

The AI does **not** decide whether two people are the same person.

---

## Why AI Is Useful

A simple spreadsheet or search form struggles when reports are written in different ways.

Example:

* “Teen girl in blue hoodie near the shelter”
* “Maya, maybe 15 or 16, seen near the Riverside bus pickup”
* “Young Arabic-speaking girl with gray backpack came through gym registration”

These reports might be related, but the wording is messy and inconsistent.

AI is useful because it can structure unorganized text into fields that a reviewer can actually compare. After that, ReuniteAI uses deterministic rule-based matching so the reasoning stays explainable.

---

## How It Works

```txt
Report Form
   ↓
Gemini NLP Extraction
   ↓
Deterministic Redaction
   ↓
Local Synthetic Report Storage
   ↓
Rule-Based Matching Engine
   ↓
Restricted Human Review Queue
```

---

## Core Workflow

1. A reporter submits a missing-person or found/sighting report.
2. Gemini structures the messy notes and flags risks.
3. Deterministic redaction checks for sensitive details.
4. The rule-based matching engine compares missing reports against sighting reports.
5. A possible lead is shown to a trusted reviewer.
6. The reviewer checks evidence, conflicts, and missing information.
7. The reviewer decides whether to request more information, reject the lead, or escalate it.

---

## Human-in-the-Loop Design

ReuniteAI is designed as a restricted case-desk tool, not a public crowd-investigation board.

### Reporters

Reporters may be family members, witnesses, shelter guests, or community members. They can submit reports, but they cannot browse the lead queue.

### Reviewers

Reviewers may be shelter staff, trained volunteers, school/community center staff, family-liaison workers, or responder partners. They review possible leads and check evidence before any action is taken.

### Coordinators

Coordinators decide whether a lead should be escalated to official responders or trusted organizations.

Humans stay in control at the highest-risk point: **before a lead becomes action.**

---

## Matching Engine

ReuniteAI’s matching engine is rule-based and explainable.

It compares reports using:

* name or nickname similarity
* age range overlap
* broad location similarity
* timeline consistency
* clothing and description overlap
* language overlap
* source reliability

The app returns lead strength labels:

* Low
* Medium
* High

It does **not** return percentages because percentages can create false confidence.

Even a high-strength lead is still unconfirmed.

---

## Responsible AI Guardrails

ReuniteAI was designed around this question:

> If the AI gets it wrong, who could be harmed, and what design choices reduce that risk?

| Risk                                  | Who Could Be Harmed                                                                             | Design Mitigation                                                                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| False match                           | Families may receive false hope, panic, or misinformation.                                      | Every result is labeled as a lead, not confirmation. Evidence, conflicts, and missing information are shown before review.              |
| Missed match                          | A real lead may be overlooked.                                                                  | Low and medium leads remain visible, and missing fields are shown so reviewers can request more information.                            |
| Privacy exposure                      | Survivors, children, or vulnerable people could be located by unsafe actors.                    | Phone numbers, exact addresses, room numbers, and private details are redacted where detected. Precise locations are hidden by default. |
| Over-reliance on AI                   | Reviewers may treat AI output as truth.                                                         | The app avoids percentages, avoids “confirmed” language, and requires human review before action.                                       |
| Bias from names/language/descriptions | People with non-Western names, unclear spelling, or multilingual reports may be matched poorly. | Matching does not rely on name alone. It also compares age, location, timeline, clothing, language, and description evidence.           |
| AI hallucination or extraction error  | Reviewers may see incorrect structured fields.                                                  | The original redacted notes remain visible, deterministic redaction still runs, and reviewers must verify before escalation.            |

---

## Data Privacy

This prototype uses **synthetic demo data only**.

No real missing-person cases are included.
No real personal data is required to demo the app.
No public lead browsing is enabled.
No automatic contact is performed.

---

## AI Fallback Mode

ReuniteAI works in two modes:

### Gemini Extraction Mode

Gemini structures messy report text, summarizes notes, redacts sensitive information, and flags risks.

### Fallback Mode

If Gemini is unavailable or the API key is missing, deterministic redaction and rule-based matching still run.

Fallback mode is a safety backup, not the main AI feature.

---

## Tech Stack

* Next.js
* React
* Tailwind CSS
* Google Gemini API
* Next.js API routes
* Local JSON demo storage
* Deterministic matching logic
* Synthetic data

---

## Tools and AI Disclosure

Google Gemini API was used for report structuring, summarization, risk flagging, and redaction support.

The matching engine is deterministic and rule-based.

The demo uses synthetic local data only.

---

## Running Locally

### 1. Clone the repo

```bash
git clone https://github.com/lumenali/ReuniteAI.git
cd ReuniteAI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a file called `.env.local` in the project root:

```txt
GEMINI_API_KEY=your_key_here
```

Do not expose this key in frontend code.

### 4. Run the app

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Environment Variables

| Variable         | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| `GEMINI_API_KEY` | Server-side key used for Gemini report processing |

The app still runs without this key, but AI extraction will switch to fallback mode.

---

## Project Links

Live Demo: `ADD_DEPLOYED_LINK_HERE`
Demo Video: `ADD_VIDEO_LINK_HERE`
GitHub: `https://github.com/lumenali/ReuniteAI`

---

## Team

Built by **Lumen**.

Team members:

* Ali Kassem
* Naethan Nel

---

## Judge Summary

ReuniteAI is a disaster-response support tool that helps trusted reviewers organize messy missing-person and sighting reports into explainable possible leads. The AI does not identify people or make decisions. It only structures messy text, redacts sensitive information, summarizes notes, and flags risks. Matching is done with transparent rules, and every result shows evidence, conflicts, and missing information. The app is designed around the failure question: if the AI is wrong, a human reviewer sees warnings, checks conflicts, follows a review checklist, and no family is contacted automatically.
