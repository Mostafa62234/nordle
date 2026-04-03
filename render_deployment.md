# How to Deploy Backend to Render.com

Since Glitch is effectively sunset, **Render.com** is an excellent modern alternative for running our backend Node.js server. 

> [!WARNING]
> Render's Free Tier web services use an **ephemeral disk**, meaning the server will wipe any files written natively during runtime if it goes to sleep or restarts. Your `nordle.db` (SQLite) will reset every few days automatically. If you plan to heavily monetize or keep it alive permanently, a free Postgres host (like Supabase or Neon.tech) mixed with Render would be required!

## 1: Prepare the Codebase for GitHub
Render natively pulls deployments securely directly from GitHub.
1. Make sure you have a GitHub account.
2. Initialize a repository inside your `nordle` folder and push this code to a public/private repo:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nordle.git
git push -u origin main
```

## 2: Host on Render
1. Create a free account on **[Render.com](https://render.com/)**.
2. From the Render Dashboard, click **New +** and select **Web Service**.
3. Connect your GitHub account and select your newly minted `nordle` repository.
4. Render will ask for your configuration details:
   - **Name**: `nordle-backend` (or whatever you prefer)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. Click **Advanced**, then select **Add Environment Variable**.
   - Input **Key**: `DATABASE_URL`
   - Input **Value**: `postgresql://neondb_owner:.../neondb?sslmode=require` (Paste your unique Neon Database connection string here!)
6. Select the **Free** instance type.
7. Click **Create Web Service**. Render will start building and deploying your server immediately!
7. Once it completes, you'll see a green "Live" badge and a URL appearing near the top left (e.g. `https://nordle-backend-xyz.onrender.com`). Copy this address string block completely!

## 3: Link Your App & Export APK
1. Back in your local project workspace, open the `client/.env` file.
2. Change the `VITE_SERVER_URL` value to the brand new active URL Render generated for you (e.g. `VITE_SERVER_URL=https://nordle-backend-xyz.onrender.com`). 
3. Open **Android Studio**, open the newly generated `android` folder under your client directory as your project, and build your compiled `.apk` to send to your friends!
