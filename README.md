# ResumeIQ — AI Resume Analyzer & Interview Prep Platform

A full-stack AI SaaS app: upload a CV, get AI-generated feedback and a score,
generate role-specific interview questions, chat with an AI career coach, and
subscribe via Stripe for unlimited usage.

## Tech stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js API routes (Node.js)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (credentials/email+password, easy to extend with Google/GitHub OAuth)
- **AI:** OpenAI API (resume analysis, interview questions, chat)
- **Payments:** Stripe Checkout + webhooks (subscriptions)
- **Infra:** Docker + docker-compose, deployable to AWS

## Project structure

```
app/
  api/
    auth/[...nextauth]/route.ts   # NextAuth handler
    auth/register/route.ts        # Sign-up endpoint
    resume/analyze/route.ts       # Upload + AI resume analysis
    interview/generate/route.ts   # AI interview question generator
    chat/route.ts                 # AI chat endpoint
    stripe/checkout/route.ts      # Creates Stripe Checkout session
    stripe/webhook/route.ts       # Handles Stripe subscription events
  dashboard/                      # Authenticated app pages
  login/, register/, pricing/     # Public pages
lib/
  prisma.ts, auth.ts, openai.ts, stripe.ts
prisma/schema.prisma              # DB models: User, Subscription, Resume, Analysis, InterviewSet, ChatMessage
Dockerfile, docker-compose.yml
```

## 1. Local setup

### Prerequisites
- Node.js 20+
- Docker (for Postgres) or a local Postgres instance
- An OpenAI API key
- A Stripe account (test mode is fine)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in real values
cp .env.example .env

# 3. Start Postgres (or point DATABASE_URL at your own instance)
docker compose up -d db

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Start the dev server
npm run dev
```

Visit http://localhost:3000.

### Environment variables (`.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `NEXTAUTH_URL` | App base URL (`http://localhost:3000` locally) |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `OPENAI_API_KEY` | From platform.openai.com |
| `STRIPE_SECRET_KEY` | From Stripe dashboard (test mode) |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` or Stripe dashboard webhook config |
| `STRIPE_PRO_PRICE_ID` | Price ID for your "Pro" recurring plan |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

### Testing Stripe webhooks locally

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 2. Running with Docker (full stack)

```bash
cp .env.example .env   # fill in real values, set DATABASE_URL host to "db"
docker compose up --build
```

This starts Postgres and the Next.js app together. Run migrations once against
the containerized DB:

```bash
docker compose exec app npx prisma migrate deploy
```

## 3. Deploying to AWS

A simple, common path (ECS Fargate + RDS):

1. **Database:** Create an RDS PostgreSQL instance. Use its connection string as `DATABASE_URL`.
2. **Container registry:** Build and push the image:
   ```bash
   docker build -t ai-resume-platform .
   aws ecr create-repository --repository-name ai-resume-platform
   docker tag ai-resume-platform:latest <account>.dkr.ecr.<region>.amazonaws.com/ai-resume-platform:latest
   aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
   docker push <account>.dkr.ecr.<region>.amazonaws.com/ai-resume-platform:latest
   ```
3. **Compute:** Create an ECS Fargate service (or App Runner, for less config) using that image, with the env vars from the table above set as task secrets (use AWS Secrets Manager for `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `NEXTAUTH_SECRET`).
4. **Networking:** Put the service behind an Application Load Balancer; point a domain at it via Route 53 + ACM for HTTPS.
5. **Migrations:** Run `npx prisma migrate deploy` as a one-off ECS task (or CI/CD step) against the RDS instance before each deploy.
6. **Stripe webhook:** Point your Stripe webhook endpoint at `https://yourdomain.com/api/stripe/webhook`.

For a faster first deploy without touching ECS directly, **AWS App Runner** or
**AWS Amplify Hosting** can build straight from this repo/Dockerfile with far
less setup, at the cost of some flexibility.

## 4. Subscription logic

- New users get a `FREE` subscription row (3 resume analyses).
- `/api/resume/analyze` checks the plan and blocks a 4th analysis on `FREE`.
- `/api/stripe/checkout` creates a Stripe Checkout session for the `Pro` plan.
- `/api/stripe/webhook` listens for `checkout.session.completed` (upgrade) and
  `customer.subscription.deleted` (downgrade) to keep `Subscription.plan` in sync.

## 5. Extending this

- Add OAuth providers (Google/GitHub) in `lib/auth.ts` — NextAuth makes this a few lines.
- Swap `gpt-4o-mini` for a different OpenAI model in `lib/openai.ts` depending on cost/quality needs.
- Add rate limiting (e.g. Upstash) on the AI routes to control cost.
- Add a `PREMIUM` tier with higher limits, following the same pattern as `PRO`.

