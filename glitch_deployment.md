# How to Deploy Backend to Glitch and Connect the APK

To get your Nordle app into the cloud completely free, we need to upload the `server` directory so it runs 24/7. **Glitch.com** is fantastic for this because they offer free hosting that natively persists your SQLite `nordle.db` database perfectly!

## 1: Create the Glitch Server
1. Go to **[Glitch.com](https://glitch.com/)** and create a free account if you haven't yet.
2. Click **New Project** in the upper right corner.
3. Select **"Glitch in Bio"** or just select **"Import from GitHub"** if you pushed this codebase. But the easiest way is to pick a basic **"Express, Node, and Vite"** template, delete the default files, and manually drag-and-drop your `nordle/server` files directly into the left-hand directory list on Glitch!
4. **Make sure `package.json`** is at the root. Glitch will automatically run `npm install` and start the server!
5. On Glitch, click **Preview** -> **Preview in a new window**. Copy the URL at the top (it'll look something like `https://silly-fuzzy-unicorn.glitch.me`).

## 2: Link Your URL & Compile the App
1. With your new server up and running, open up the `client/.env` file in your workspace here.
2. Under `VITE_SERVER_URL=`, carefully paste your shiny new live Glitch URL (e.g. `VITE_SERVER_URL=https://silly-fuzzy-unicorn.glitch.me`).
3. Whenever you generate your Android app in Android Studio now, the `.apk` will automatically communicate with your live server securely so your friends can play against each other from across the world!
