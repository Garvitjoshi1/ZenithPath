# Zenith Path 🧘✨  
Find your calm, reach your peak.  

---

## 📛 Badges  

![Netlify Status](https://api.netlify.com/api/v1/badges/ca185c1d-bfd5-4e9b-9c38-ad9459565b29/deploy-status)  
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFCA28?logo=firebase&logoColor=white)  
![Gemini API](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white)  
![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)  
![GSAP](https://img.shields.io/badge/Animations-GSAP-88CE02?logo=greensock&logoColor=white)  
![License](https://img.shields.io/badge/License-MIT-green)  

## 🚀 Live Demo  
Experience Zenith Path live: [Zenith Path](https://zenithpath.netlify.app/)  

---

## 🌍 The Problem: A Silent Struggle  
In India, mental health is often a silent struggle, shrouded in stigma.  
For young adults and students, the immense pressure of academics and social life creates a heavy burden, yet seeking help is seen as a sign of weakness.  

Professional care is often inaccessible due to high costs and a lack of resources, leaving millions feeling isolated.  

👉 We built **Zenith Path** to be the first step on the journey to wellness—a private, non-judgmental space that's always available.  

---

## ✨ Our Solution: Zenith Path  
Zenith Path is an **AI-powered, confidential, and empathetic mental wellness companion** designed specifically for Indian youth.  

It’s more than just an app—it’s a supportive friend that helps users:  
- Build positive habits  
- Find a moment of calm  
- Connect with a supportive community  

Our goal is to make **mental wellness accessible and normal** in everyday life.  

---

## 📸 Screenshots  

### Light Mode  
![Light Mode](screenshots/light-mode.png)  

### Dark Mode  
![Dark Mode](screenshots/dark-mode.png) 

### AI Chatbot  
![Chatbot](screenshots/chatbot.png)  

### Streaks & Calendar  
![Streaks](screenshots/streaks.png) 

### Breathe Page  
![Login](screenshots/breathe.png)  

### Community Feed  
![Community](screenshots/community.png)  

### Friends System  
![Friends](screenshots/friends.png)  

### Profile Page  
![Profile](screenshots/profile.png)  

---

## 💡 The Ideation  
Our core idea: create a solution that feels **less like a clinical tool and more like a supportive companion**.  

### Principles  
1. **Anonymity & Safety First**  
   - Engage anonymously with AI chat & streaks  
   - Social features are **opt-in** for full user control  

2. **Gamification for Habit Building**  
   - Inspired by **Duolingo** streaks  
   - Rewards daily check-ins  
   - Encourages long-term positive habits  

3. **Community over Isolation**  
   - Friend system & community wall foster belonging  
   - Celebrate progress together  
   - Show users they’re **not alone**  

---

## 🚀 Key Features  
- 🤖 **Empathetic AI Chatbot** – Powered by **Google’s Gemini API**, available 24/7  
- 🔥 **Gamified Wellness Streaks** – Duolingo-style streak counter + calendar  
- 🧑‍🤝‍🧑 **Community Wall** – Share progress, thoughts & images  
- 👥 **Friends System** – Add/manage friends, view streaks  
- 🌬️ **Guided Breathing Exercises** – Instant calm during stress/anxiety  
- 👤 **Customizable Profiles** – Profile pic & bio  
- 🌗 **Dark/Light Mode Toggle** – Sleek personalized UI  

---

## 🛠️ Tech Stack  
- **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript  
- **Backend & Database:** Google Firebase (Auth, Firestore)  
- **Generative AI:** Google Gemini API  
- **UI Libraries:** GSAP (Animations), Lucide (Icons), SweetAlert2 (Notifications)  
- **Deployment:** Netlify  

---

## 🏁 Getting Started  
---

## 🔒 Protecting API Keys & Secrets

**Never commit your API keys or secrets to GitHub!**

### Checklist for Safe Deployment

- ✅ **Do NOT** put your API keys in any file tracked by git (e.g., `.js`, `.json`, `.env` files in the repo)
- ✅ Use environment variables for all secrets (as in `process.env.GEMINI_API_KEY`)
- ✅ Add `.env` and any secret config files to your `.gitignore`
- ✅ Set secrets in Netlify via the Netlify UI or CLI:
   - Go to Site settings → Environment variables
   - Add `GEMINI_API_KEY` and any other secrets there
- ✅ If using GitHub Actions or other CI/CD, set secrets in the repo's Settings → Secrets
- ✅ Never log or return secrets in your API responses

### How this project handles secrets
- The Gemini API key is only accessed via `process.env.GEMINI_API_KEY` in serverless functions
- No secrets are present in the codebase or committed files
- The README and sample files do not contain any real API keys

**If you ever accidentally commit a secret:**
1. Immediately delete the secret from your code and commit history
2. Revoke and regenerate the key from the provider (Google, etc.)
3. Force-push a cleaned history if needed, and update all deployments

For more, see: [Netlify docs: Environment variables](https://docs.netlify.com/environment-variables/overview/)


### Clone the repo  
```bash
git clone https://github.com/Garvitjoshi1/ZenithAI.git
cd ZenithAI/public
---

## Mental-wellness-only enforcement (serverless chat)

This project includes a serverless chat function at `netlify/functions/chat.js` that can be configured to only respond to mental-wellness related messages. The enforcement uses a simple keyword detector and can be toggled with environment variables.

Environment variables:
- `MENTAL_ENFORCEMENT` (true|false) — enable or disable enforcement (default: true)
- `MENTAL_REDIRECT_MSG` — custom redirect message for non-wellness questions
- `MENTAL_CRISIS_MSG` — custom message when crisis language is detected

Quick manual test (from project root):
1. Inspect `netlify/functions/sample_requests.json` for example payloads.
2. Use a tool like curl or Postman to POST one of the payloads to your deployed Netlify function or to Netlify's CLI local function runner.

Example (Netlify CLI) — run the dev server and call the function locally:
```powershell
# start local dev (if using Netlify CLI)
netlify dev

# then in another terminal call the function (adjust URL if different)
curl -X POST http://localhost:8888/.netlify/functions/chat -H "Content-Type: application/json" -d @netlify/functions/sample_requests.json
```

