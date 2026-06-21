# ReuniteAI

## Project summary

ReuniteAI is a disaster-response case-desk tool that helps volunteers turn messy missing-person and sighting reports into structured, redacted, explainable possible leads. It does not confirm identity. It supports trusted human review.

## V2 Product Clarification

ReuniteAI is a restricted case-desk tool, not a public crowd-investigation board. Public users can submit reports, but possible leads are meant for trusted reviewers such as shelter staff, trained volunteers, family liaisons, school/community center staff, or emergency responder partners. The prototype simulates this workflow using synthetic data.

## The one thing the AI does

The AI structures and redacts messy reports. It flags risks and missing information. It does not make final decisions.

## Why AI, not just search

Crisis reports are messy, emotional, inconsistent, multilingual, and incomplete. AI helps extract fields and summarize text. Matching remains rule-based and explainable.

## AI availability

The app works in two modes:

1. Gemini extraction mode: Gemini structures messy report text and flags risks.
2. Fallback mode: deterministic redaction and rule-based matching still run if Gemini is unavailable.

Fallback mode is a safety feature, not the main AI feature.

## System architecture

Report form -> Gemini processing -> deterministic redaction -> local storage -> rule-based matching -> human review

## Responsible AI

| Failure mode | Who could be harmed | Mitigation |
| --- | --- | --- |
| False match | Families may receive false hope, panic, or misinformation. | Every result is labeled as a lead, not confirmation. The app shows evidence, conflicts, and missing information. Human review is required before action. |
| Missed match | A real lead may be overlooked. | Low-confidence leads remain visible, missing fields are shown, and reviewers are encouraged to request more information instead of ignoring uncertain reports. |
| Privacy exposure | Survivors, children, or vulnerable people could be located by unsafe actors. | Phone numbers, emails, exact addresses, apartment numbers, and precise locations are redacted or hidden by default. |
| Bias against names, languages, or descriptions | People with non-Western names, unclear spellings, multilingual reports, or vague descriptions may be matched poorly. | The app does not rely on name alone. It compares age, broad location, time, clothing, language, and description evidence. It also explains what caused each lead. |
| Over-reliance on AI | Volunteers may treat suggestions as truth. | The UI avoids percentages, avoids "confirmed" language, repeats warnings, and requires reviewers to check a human review box. |
| Malicious misuse | Someone could try to locate a vulnerable person. | The app hides precise locations by default, redacts contact details, stores only synthetic demo data, and never auto-contacts anyone. |
| AI hallucination or extraction error | Reviewers may see incorrect structured fields. | The original redacted notes remain visible, risks are flagged, fallback rules run after AI, and reviewers must verify facts manually. |

## Human oversight

Every lead requires human review. The app never auto-contacts anyone.

## Tools used

* Next.js
* React
* Tailwind CSS
* Google Gemini API
* @google/genai
* Synthetic demo data

## Data

Only synthetic data is used. No real missing-person data.

## How to run

1. `npm install`
2. Create `.env.local`
3. Add `GEMINI_API_KEY=YOUR_API_KEY_HERE` if available
4. `npm run dev`
5. Open `http://localhost:3000`

The app still works without a Gemini key. It uses deterministic fallback redaction and rule-based matching.

## Vercel deployment

ReuniteAI is a Next.js website. Deploy it to Vercel as a standard Next project.

1. Import the project into Vercel.
2. Set the build command to `npm run build` if Vercel does not auto-detect it.
3. Add `GEMINI_API_KEY` in Vercel Project Settings -> Environment Variables.
4. Redeploy after adding or changing the key.

The API key is read only from environment variables. The website UI does not expose a key-management form.

Common AI setup failure reasons:

* `.env.local` missing
* dev server or deployment was not restarted after adding key
* wrong environment variable name
* package not installed
* invalid API key
* model name unavailable

## Demo script

1. Open dashboard and explain the problem.
2. Open Settings and reset synthetic demo data if needed.
3. Submit or view a messy report.
4. Show how AI structures and redacts it.
5. Open Lead Review Queue.
6. Expand a lead and show evidence, conflicts, missing info.
7. Open Reviewer Decision Desk and save a review receipt.
8. End with: "ReuniteAI helps people review leads faster, but it never replaces human verification."

## Development note

AI coding assistance was used during implementation. The project design, safety decisions, testing, and final submission are the team's responsibility.

## Judge summary

ReuniteAI is a disaster-response support tool that helps volunteers organize messy missing-person and sighting reports into explainable possible leads. The AI does not identify people or make decisions. It only structures messy text, redacts sensitive information, summarizes notes, and flags risks. Matching is done with transparent rules, and every result shows evidence, conflicts, and missing information. The app is designed around the failure question: if the AI is wrong, a human reviewer sees warnings, checks conflicts, follows a review checklist, and no family is contacted automatically.
