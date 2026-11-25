# Dashprocess

A desktop Kanban board built for candidates, to make it easier to track their hiring processes.
Built with Electron, React, TypeScript, Tailwind and SQLite.

## Requirements

- **Node.js 22.12 or newer**
- **Git**

## Getting started

```powershell
npm install
npm run dev
```

## Google sign-in

Signing in is optional. It only shows your name ("Good morning, Andrea 👋") and photo. Your data always stays in the local database on your computer. The app keeps just your Google profile (name, email, photo), never a password or a token.

To turn it on, create a free Google OAuth client once. Google calls this area **Google Auth Platform** (it was "OAuth consent screen"):

1. **Create a project.** Open [Google Cloud Console](https://console.cloud.google.com/) and create a project, for example "Dashprocess".
2. **Set up the app.** Go to **APIs & Services → OAuth consent screen**, which opens Google Auth Platform, and click **Get started**. The wizard has four steps:
   1. **App information:** app name `Dashprocess`, and your email as the user support email.
   2. **Audience:** choose **External**.
   3. **Contact information:** your email.
   4. **Finish:** accept the Google API Services User Data Policy, then click **Create**.
3. **Add yourself as a test user.** In the left menu, open **Audience**. Under **Test users**, click **Add users** and add the Gmail address you'll sign in with. While the app is in "Testing" mode, only these users can sign in.
4. **Create the client.** In the left menu, open **Clients → Create client**, choose **Desktop app** as the application type, and click **Create**.
   - Copy the **Client ID** and **Client secret** right away, or click **Download JSON**. Google shows the secret in full only at this moment; if you lose it, add a new secret to the same client.
   - There's no need to change **Data access**: the app only asks for your basic profile (`openid`, `email`, `profile`).
5. **Add the keys to the app.** Copy `.env.example` to `.env.local` and paste the two values into it:

   ```
   MAIN_VITE_GOOGLE_CLIENT_ID=1234567890-abc….apps.googleusercontent.com
   MAIN_VITE_GOOGLE_CLIENT_SECRET=GOCSPX-…
   ```

   `.env.local` is ignored by git, so the keys are never committed. Treat them like a password.
6. **Sign in.** Restart `npm run dev`, open **Settings**, and click **Sign in with Google**. Google's sign-in page opens in your browser.
   - In Testing mode Google warns that the app isn't verified. That's expected: continue to sign in.
   - When you're done, the app greets you.

The keys are built into the app at build time. Installers made with `npm run build:win` include them, so rebuild after changing `.env.local`.
