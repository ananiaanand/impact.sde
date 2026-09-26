# Impact SDG 🌍🔍

**Impact SDG** is an interactive, narrative-driven detective game built to educate and engage players on the United Nations' Sustainable Development Goal (SDG) 11: Sustainable Cities and Communities. 

Players step into the role of an urban investigator tasked with piecing together environmental, political, and social crises across different districts using simulated NASA satellite telemetry data and AI-driven interactive storytelling.

## ✨ Features

- **Dynamic AI Storytelling:** Powered by Google Gemini, the game randomly assigns one of 4 unique, dramatic plotlines (Urban Heat Islands, Sudden Flooding, Heritage Bulldozing, or Informal Settlement Evictions) to each session.
- **Real-World Locations:** Investigate cases set in real locations like Electronic City, Whitefield, Koramangala, and Cedar Hollow.
- **Geospatial Analysis:** Features an interactive Leaflet map to analyze and compare Land Surface Temperature (LST) and vegetation indexes between 2012 and 2026.
- **Narrative Investigation:** Progress through 4 immersive levels by reading through planning memos, interception transcripts, and analyzing NASA data clues.
- **Final Evaluation:** Submit a final causal report of the events and receive an AI-evaluated score and unique completion code to share with mentors.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS, React-Leaflet, Framer Motion
- **Backend:** Python, FastAPI, Uvicorn
- **AI / LLM:** Google Gemini API
- **Data Visualization:** Leaflet, CartoDB Dark Matter Base Maps

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.9+)
- A Google Gemini API Key

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   python -m pip install -r requirements.txt
   ```
3. Set up your environment variables by creating a `.env` file in the `backend` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --env-file .env
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory (if your backend isn't on the default port):
   ```env
   VITE_API_URL=http://localhost:8000
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 3. Play the Game
Open your browser and navigate to `http://localhost:5173`. Click **Start New Investigation** to begin your assignment!

## 🌐 Deployment

The frontend is configured to be easily deployable via **Vercel**. 
To deploy:
```bash
cd frontend
npx vercel --prod
```
*Note: Make sure your hosted frontend has access to your backend API via the `VITE_API_URL` environment variable.*

## 📄 License
This project is open-source and available under the MIT License.
