# ⭐ Superstar Teen Patti - Multiplayer Server

A robust multiplayer backend for the popular Indian three-card poker game, **Teen Patti** — built using **Node.js**, **Express**, **MongoDB**, and **Socket.IO**. This server handles real-time gameplay, user accounts, game logic, virtual currency, tournaments, bots, and social features.

---

## 🎮 Game Overview

This is a full-featured **Teen Patti** backend server designed to support real-time, multiplayer gameplay. It includes everything needed to power a mobile or web-based Teen Patti app, including bots, tournaments, in-app purchases, leaderboards, and more.

---

## 🂠 Core Gameplay

- **Classic Teen Patti**: Three-card poker game with betting, folding, and showdowns.
- **Game Tables**: Public, private, and tournament-based tables with configurable betting values.
- **AI Bots**: Intelligent bots fill tables to ensure a smooth and continuous game experience.
- **Card Management**: Standard 52-card deck shuffling and dealing handled server-side.
- **Betting System**: Includes blind, chaal (regular bet), showdown, and sideshow mechanics.
- **Game Variations**: Supports popular variants like:
  - AK47
  - Muflis
  - Lowest Joker
  - And more!

---

## 👤 User Management

- **Authentication**: Sign up/log in via guest mode or third-party (e.g. Facebook).
- **Profiles**: Each user has:
  - Unique ID
  - Username
  - Profile picture
  - Chip & coin balance
  - Game stats (wins, losses, total games)

---

## 💰 Virtual Currency

- **Chips**: Main currency for betting and in-game purchases.
  - New players receive **100,000** chips.
- **Coins**: Premium currency for cosmetics and special features.
  - New players receive **10** coins.

---

## 🤝 Social Features

- **Friends List**: Add, remove, and view friends.
- **Friend Requests**: Send and accept requests.
- **Block Users**: Mute or block other players.
- **Table Chat**: Real-time messaging during gameplay.
- **Virtual Gifts**: Send gift animations using chips.
- **Dealer Tips**: Tip the dealer using chips.

---

## 💵 Monetization

- **Chip Store**: Buy chips with real money.
- **Coin Store**: Purchase coins for premium features.
- **In-App Purchases**: Integrated verification with Apple/Google APIs.

---

## 🏆 Engagement Features

- **Daily Bonuses**: Reward returning players with free chips.
- **Leaderboards**: Weekly and all-time rankings (Global, National, Friends).
- **Notifications**: Alerts for messages, gifts, and friend requests.
- **Weekly Winners**: Top players win weekly prizes.
- **Mini-Games**: Additional chip-winning games like:
  - **High-Low**
  - **Andar-Bahar**
- **Tournaments**: Structured competitions with buy-ins and prize pools.

---

## 🛠 Technical Details

- **Backend**: Node.js + Express.js
- **Database**: MongoDB (with Mongoose)
- **Real-time Communication**: Socket.IO
- **API**: REST endpoints for account management, uploads, etc.
- **Card Logic**: Powered by [`teenpattisolver`](https://www.npmjs.com/package/teenpattisolver) for accurate hand ranking.
- **Configuration**: `.env` file supports flexible settings (DB URI, game timers, ports, etc.)

---

## 📦 Installation & Setup

```bash
git clone https://github.com/your-username/superstar-teenpatti-backend.git
cd superstar-teenpatti-backend
npm install
cp .env.example .env  # then configure your environment
npm start
``` 

---

## 📁 Project Structure

```
├── controllers/         # Game & user logic
├── models/              # Mongoose schemas
├── routes/              # REST API endpoints
├── sockets/             # Socket.IO events
├── utils/               # Card logic, helpers
├── config/              # Environment configs
└── server.js            # Entry point
```

---

## 🚧 Future Improvements

- Admin Dashboard
- Anti-cheat System
- Better AI for bots
- Achievements and Badges
- Cross-platform support (Web, iOS, Android)

---

## 📜 License

This project is licensed under the MIT License. See the LICENSE file for details. 