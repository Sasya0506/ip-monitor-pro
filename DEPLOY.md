# Deploy IP Monitor Pro to Railway

## Steps (takes about 5 minutes)

### 1. Create a Railway account
Go to https://railway.app and sign up (free with GitHub).

### 2. Create a new project
- Click **"New Project"**
- Choose **"Deploy from GitHub repo"** — OR — click **"Empty project"**

### 3. If using Empty Project (easiest with a zip):
- Click **"+ Add Service"** → **"GitHub Repo"**
- Upload your code to a GitHub repo first, then connect it
- **OR** use the Railway CLI:
  ```
  npm install -g @railway/cli
  railway login
  railway init
  railway up
  ```

### 4. Add a PostgreSQL database
- In your Railway project, click **"+ Add Service"** → **"Database"** → **"PostgreSQL"**
- Railway will automatically create a `DATABASE_URL` environment variable

### 5. Set environment variables
In your Railway service → **Variables**, add:
```
NODE_ENV=production
PORT=3000
SESSION_SECRET=any-long-random-string-here
DATABASE_URL=${{Postgres.DATABASE_URL}}   ← Railway fills this automatically
```

### 6. Set up the database tables (one time only)
After first deploy, open the Railway **Shell** tab and run:
```
node scripts/db-push.mjs
```

### 7. Done!
Railway gives you a live URL like `https://your-app.up.railway.app`

---

## Default login
- **Username:** admin
- **Password:** admin123

Change these after first login via the Users settings.
