# Deployment Guide: Vercel

This project is built with **Vite + React** and is optimized for deployment on Vercel.

## Option 1: Automatic Deployment via Git (Recommended)
This is the easiest method and enables automatic updates whenever you push to GitHub, GitLab, or Bitbucket.

1.  **Push your code** to a Git repository (e.g., GitHub).
2.  Go to [Vercel.com](https://vercel.com) and sign up/log in.
3.  Click **"Add New..."** -> **"Project"**.
4.  **Import** your repository.
5.  Vercel will detect it's a **Vite** project.
    *   **Build Command**: `npm run build` (default)
    *   **Output Directory**: `dist` (default)
6.  **Environment Variables**:
    *   Expand the "Environment Variables" section.
    *   Copy the values from your local `.env` file and add them here matching the keys (e.g., `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_CLOUDINARY_CLOUD_NAME`).
7.  Click **Deploy**.

## Option 2: Deployment via Vercel CLI (Manual)
If you want to deploy directly from your terminal without Git.

1.  Install Vercel CLI:
    ```bash
    npm i -g vercel
    ```
2.  Login:
    ```bash
    vercel login
    ```
3.  Deploy from project root:
    ```bash
    vercel
    ```
    *   Follow the prompts. Keep defaults for most settings.
4.  For Production (Live):
    ```bash
    vercel --prod
    ```

## Crucial Note on Routing
A `vercel.json` file has been added to the project root. This ensures that when users refresh a page like `/about` or `/donate`, they don't get a 404 error. It tells Vercel to always serve `index.html` and let React handle the routing.
