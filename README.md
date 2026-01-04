 ![UNO](./public/image.jpg)
 # Uno Game
## Description
Uno Card Game online.<br> 
 * 2 to 10 players <br>
 * no need to install anything <br>
 * no need to register<br>
 * double-deck draw pile so large games don't run out of cards<br>
 * Self-hosted REST + WebSocket backend (no Firebase required)<br>
## Demo: Uno Card Game website
### https://uno-game.now.sh<br>
| ![Uno Game gif](./public/readme/UNO%20Game%20_%20Uno%20online.gif)

## Technologies Used
The App is built with:<br>
* React
* Next.js 
* [Firebase](https://firebase.google.com/) for Realtime Database 
* Tailwindcss as CSS framework
* Jest for testing
* Vercel for fast deployments, hosting our website.

## Development
### Getting Started
Duplicate .env.template and rename it as .env. Set up a Firebase Database and put the necessary settings inside the .env file in order to be able to run the project.

Install dependencies:
```bash
npm install 
# or
yarn install
```
Start the game API server (self-hosted):
```bash
npm run server
# defaults to http://localhost:4000
```

Run the development server:
```bash
npm run dev
# or
yarn dev
```
Open http://localhost:3000 with your browser to see the result.
The API server (`npm run server`) responds with JSON (e.g., `GET /` shows a short help message); the web UI lives at port 3000.

### Configuration
- Create a `.env.local` (or `.env`) file from `.env.template`.
- Set `NEXT_PUBLIC_API_BASE_URL` to the REST/WebSocket server origin (default `http://localhost:4000`).

### Local/LAN play
You can run the app entirely on a local network by pointing the client to a Firestore emulator instead of the hosted Firebase project:

1. Install the Firebase CLI and start the Firestore emulator on your LAN host:
   ```bash
   firebase emulators:start --only firestore --host 0.0.0.0 --port 8080
   ```
2. Expose the host (e.g., `192.168.0.10:8080`) to players on the same network.
3. Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=192.168.0.10:8080
   NEXT_PUBLIC_API_BASE_URL=http://192.168.0.10:4000
   ```
4. Start the API server (`npm run server`) and the dev server (`npm run dev`). Clients will connect to the local API/WebSocket server and, if configured, the Firestore emulator.
