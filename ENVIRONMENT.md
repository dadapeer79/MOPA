# Keeping secrets out of the repository

This file documents recommended steps to push the project to a new private repository while keeping API keys and other secrets safe.

1) Create a private GitHub repository
   - On GitHub, create a new repository and set its visibility to "Private".

2) Ensure local secrets are ignored
   - This project already ignores `.env` (see `.gitignore`). Keep storing secrets in a local `.env` file only.
   - Use `.env.example` to document required variable names (do not store real values there).

3) Use repository/hosting secrets for CI and production
   - For GitHub Actions: Go to Settings → Secrets and variables → Actions → New repository secret. Add your keys (e.g. `OPENAI_API_KEY`, `DATABASE_URL`).
   - For Vercel/Netlify/Render: use their Environment Variables UI for production builds and runtime.

4) Build-time vs runtime
   - In Next.js, variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Do NOT use that prefix for private keys.
   - Server-side code (API routes, getServerSideProps, server components) can access secret env vars safely.

5) If secrets were already committed
   - Assume they are leaked. Rotate/replace the keys immediately (revoke and create new ones).
   - To remove secrets from git history, use tools like `git filter-repo` or the BFG Repo-Cleaner, then force-push to the new remote. Example (careful):

     - With `git filter-repo` (may need to install):

       git clone --mirror <old-repo-url>
       cd <repo>.git
       git filter-repo --invert-paths --paths .env
       git push --force --all

     - With BFG (simpler for file deletion):

       java -jar bfg.jar --delete-files .env <repo.git>
       cd <repo>
       git reflog expire --expire=now --all && git gc --prune=now --aggressive

   - Note: rewriting history is disruptive. It's often safer to rotate keys and start fresh with a private repo.

6) Push code to the new repo
   - Add the remote and push your code:

       git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
       git branch -M main
       git push -u origin main

7) Add collaborators and access control
   - In the repo Settings → Manage access, invite team members or collaborators. Only invited members will have access to the private repository.

8) Use least privilege and rotate keys
   - Give services and users only the permissions they need. Rotate keys regularly.

9) Extra: encrypted secrets in repo
   - For advanced cases, use `git-crypt` or `sops` to encrypt specific files in the repository. These solutions require additional setup and key distribution to collaborators.

Quick checklist:
- [ ] Keep `.env` local and ignored
- [ ] Commit `.env.example` only
- [ ] Add secrets to GitHub / hosting provider
- [ ] Rotate keys if leaked
- [ ] Make repo private and invite collaborators
