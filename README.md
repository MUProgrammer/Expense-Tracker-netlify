# Kharcha – MERN stack (MongoDB + Express + React + Node)

Aap ke HTML demo ka full-stack version. Data ab MongoDB mein save hota hai,
har user ko apna account (JWT login) aur apna alag data milta hai.

## Folder structure

```
kharcha/
├── package.json        ← root: `npm run dev` dono (server + client) chalata hai
├── server/             ← Express + MongoDB API
│   ├── server.js
│   ├── seed.js         ← demo data
│   ├── .env            ← MONGO_URI, JWT_SECRET
│   ├── config/db.js
│   ├── models/         ← User, Account, Transaction
│   ├── middleware/auth.js
│   └── routes/         ← auth, accounts, transactions
└── client/             ← React (Vite)
    └── src/
        ├── api.js, utils.js, styles.css
        ├── context/AuthContext.jsx
        └── components/ ← AuthPage, Dashboard, Stats, AccountsPanel, TxForm, TxList, History, Settings
```

## Chalane ka tareeqa

1. **MongoDB** chahiye: ya to local MongoDB install karein, ya free
   [MongoDB Atlas](https://www.mongodb.com/atlas) cluster banayein aur uski connection string lein.
2. `server/.env` kholein aur `MONGO_URI` aur `JWT_SECRET` set karein
   (`.env.example` mein example maujood hai).
3. Root folder (`kharcha/`) mein:

```bash
npm run install-all     # root + server + client sab ke packages install
npm run seed            # (optional) demo@kharcha.pk / demo123 wala demo data
npm run dev             # API: http://localhost:5000  |  App: http://localhost:5173
```

Browser mein **http://localhost:5173** kholein.

> Pehle wala `'concurrently' is not recognized` error is liye aa raha tha ke root folder mein
> `npm install` nahi hua tha. `npm run install-all` yeh sab theek kar deta hai.

## API

| Method | URL | Kaam |
|---|---|---|
| POST | /api/auth/register | naya account (3 default accounts ban jaate hain) |
| POST | /api/auth/login | login, JWT token milta hai |
| GET | /api/auth/me | current user |
| PATCH | /api/auth/theme | color scheme save |
| PATCH | /api/auth/profile | naam / email badalna |
| PATCH | /api/auth/password | password badalna |
| DELETE | /api/auth/me | account aur saara data delete |
| GET/POST | /api/accounts | accounts list / naya account |
| PATCH | /api/accounts/:id | balance (ya naam) update |
| GET/POST | /api/transactions | list / naya expense, income, transfer |
| DELETE | /api/transactions/:id | transaction delete |

Saare routes (auth ke pehle teen ke ilawa) `Authorization: Bearer <token>` maangte hain,
aur har query `user` ke hisaab se filter hoti hai, is liye koi doosre ka data nahi dekh sakta.

## Production

```bash
cd client && npm run build     # dist/ folder banta hai
```
`CLIENT_URL` (server/.env) ko apne deployed frontend ke URL par set karein.
Agar frontend aur API alag domains par hon to `client/src/api.js` mein `'/api'` ki jagah
poora API URL (env variable se) use karein.

## Netlify par deploy (free, card ke baghair)

Is project mein `netlify.toml` aur `netlify/functions/api.js` shamil hain: React app Netlify par
host hoti hai aur Express API ek Netlify Function ban kar chalti hai. Database Atlas par rahta hai.

1. Code GitHub par push karein.
2. app.netlify.com par **Add new project, Import an existing project**, GitHub chunein aur `kharcha` repo select karein.
3. Build settings `netlify.toml` se khud aa jati hain (Build: `npm run build`, Publish: `client/dist`). Badalne ki zaroorat nahi.
4. **Environment variables** mein add karein: `MONGO_URI` (Atlas string, `/kharcha` ke sath) aur `JWT_SECRET`.
5. **Deploy** dabayein. Link `https://naam.netlify.app` jaisa milega.

Dhyan rakhein: Atlas ki Network Access mein `0.0.0.0/0` allow hona chahiye.
