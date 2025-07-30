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

## 🔌 Socket.IO Events

Here is a comprehensive list of all the socket events used in the Teen Patti game logic.

| Event Name (en) | Direction | Description | Payload (data) |
|-----------------|-----------|-------------|----------------|
| **GUP** | Client → Server | Get User Profile: Fetches the profile information for a specific user. | `{ "user_id": "..." }` |
| **GTS** | Client → Server | Get Table State: Retrieves the current state of a game table, including players, pot amount, and game status. | `{ "user_id": "...", "tid": "table_id" }` |
| **JT** | Client → Server | Join Table: Allows a user to join a specific game table. | `{ "user_id": "...", "tid": "table_id" }` |
| **LT** | Client → Server | Leave Table: Removes a user from their current table. | `{ "user_id": "...", "tid": "table_id" }` |
| **ST** | Client → Server | See Table / Sit: Moves a player from a waiting or spectator state to an active player seat at the table. | `{ "user_id": "...", "tid": "table_id" }` |
| **PACK** | Client → Server | Pack / Fold: The player chooses to fold their cards for the current round. | `{ "user_id": "...", "tid": "table_id" }` |
| **CB** | Client → Server | Chaal / Bet: The player places a bet (chaal). | `{ "user_id": "...", "tid": "table_id", "bv": amount }` (bv = bet value) |
| **SS** | Client → Server | Start Show: Initiates the "show" phase at the end of a round when only two players remain. | `{ "user_id": "...", "tid": "table_id" }` |
| **RS** | Client → Server | Request Sideshow: A player requests a "sideshow" with the player who acted before them. | `{ "user_id": "...", "tid": "table_id" }` |
| **AS** | Client → Server | Action on Sideshow: The other player's response to a sideshow request. | `{ "user_id": "...", "tid": "table_id", "st": "accept/deny" }` |
| **SL** | Client → Server | Show Last Hand: Triggered at the end of a round to see the cards of the last players. | `{ "user_id": "...", "tid": "table_id" }` |
| **LPA** | Client → Server | Last Player Action: Fetches the last action taken on the table, often used for syncing state. | `{ "user_id": "...", "tid": "table_id" }` |
| **STIPS** | Client → Server | Send Tip: Allows a player to send a tip to the dealer. | `{ "user_id": "...", "tid": "table_id", "tip": amount }` |
| **RTJ** | Client → Server | Re-Join Table: Allows a disconnected player to rejoin their previous table. | `{ "user_id": "...", "tid": "table_id" }` |
| **DE** | Server → Client | Display Error: Sends a user-facing error message to be displayed on the client. | `{ "msg": "Error message to display" }` |
| **GTI** | Server → Client | Game Table Info: Broadcasts the full state of the game table after a significant event (e.g., a player joins or leaves). | `{ "tableId": "...", "players": [...], "gameState": "...", "potValue": amount }` |
| **NT** | Server → Client | New Turn: Announces the start of a new turn and which player is now active. | `{ "activePlayer": "...", "nextPlayer": "...", "countdown": number }` |
| **UJP** | Server → Client | User Joined Pot: Informs clients that a new user has joined the table and a pot has been created. | `{ "pot": { ... } }` |
| **CD** | Server → Client | Card Dealing: Broadcasts that cards are being dealt to the players. | `{ "message": "Card dealing..." }` |
| **Winner** | Server → Client | Announce Winner: Declares the winner of the round, the winning hand, and the pot amount. | `{ "winnerId": "...", "potValue": amount, "winningCards": [...] }` |

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