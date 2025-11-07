# 🌍 Tour Guide AI Agent

An intelligent **AI-powered tour guide** built with [Mastra](https://mastra.ai/) and powered by **Google Gemini 2.5 Flash**.  
This agent helps users explore tourist attractions, learn about countries, and get travel insights — all through natural conversation.

---

## 🚀 Features

- 🏛 **Tourist Attractions** — Finds museums, landmarks, and points of interest using OpenStreetMap.
- 🌎 **Country Information** — Fetches real-world country data (languages, currencies, population, etc.).
- ✈️ **Travel Tips & Insights** — Combines Wikipedia overviews with practical travel advice.
- 🧠 **AI-Powered Conversations** — Uses Gemini to respond conversationally and intelligently.
- 💾 **Memory & Observability** — Powered by `@mastra/memory` and `@mastra/libsql`.

---

## 🧩 Tech Stack

| Component | Description |
|------------|--------------|
| **Mastra** | AI agent orchestration framework |
| **Gemini 2.5 Flash** | Core LLM model |
| **OpenStreetMap (Overpass API)** | Provides real tourist attraction data |
| **RestCountries API** | Supplies detailed country information |
| **Wikipedia API** | Provides travel overviews and local insights |
| **TypeScript** | For type safety and clarity |

---

## 📁 Project Structure

```

src/
├── mastra/
│   ├── agents/
│   │   └── tour-guide-agent.ts
│   ├── tools/
│   │   └── tour-guide-tools.ts
│   ├── index.ts
│   └── ...

````

---

## ⚙️ Setup & Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/Henshaw-knight/tourguide-ai-agent.git
cd tourguide-ai-agent

# 2. Install dependencies
npm install

# 3. Start the Mastra dev server
npx mastra dev
````

Then open your browser at **[http://localhost:4111](http://localhost:4111)** and chat with your AI Tour Guide 🧳.

---

## 🧭 Example Questions

Try asking:

* “Show me the top tourist attractions in Nairobi, Kenya”
* “Tell me about the country Japan”
* “What are some travel tips for visiting Rome?”
* “Give me interesting landmarks in Cairo”
* “What’s the best time to visit Bali?”
* “How many days should I spend in Rome?”
* “Can you suggest a 3-day itinerary for Cape Town?”
* “Is Thailand safe for solo travelers?”
* “What food should I try in Japan?”
* “If I could only visit one place in Italy, which should it be?”
* “What are fun things to do at night in Bangkok?”
* “Surprise me with a random country and a cool attraction.”
* “Give me a weekend getaway idea in Africa.”
* “Is Yankari National Park worth visiting?”
* “How do people greet each other in Ghana?”

---

## 🛠 APIs Used

| API                                                           | Purpose                          | Auth         |
| ------------------------------------------------------------- | -------------------------------- | ------------ |
| [OpenStreetMap Overpass](https://overpass-api.de/)            | Get tourist attractions and POIs | ❌ No API key |
| [RestCountries](https://restcountries.com/)                   | Get country information          | ❌ No API key |
| [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page) | Get city/country summaries       | ❌ No API key |

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 💬 Acknowledgments

* [Mastra](https://mastra.ai) for the amazing AI agent framework
* [OpenStreetMap](https://www.openstreetmap.org/) for free geospatial data
* [RestCountries](https://restcountries.com/) and [Wikipedia](https://wikipedia.org) for open data APIs


