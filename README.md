# Terminal 1 — Start MongoDB (if not running)
mongod --dbpath /data/db

# Terminal 2 — Start backend
cd backend
node src/index.js
# → Server running on port 5000

# Terminal 3 — Start frontend
cd frontend
npm run dev
# → http://localhost:5173
