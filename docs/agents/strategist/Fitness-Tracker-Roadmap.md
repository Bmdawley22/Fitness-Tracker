# Fitness-Tracker Roadmap Summary

## Conversation Summary (from hosting discussion onward)

We discussed how to host Fitness-Tracker once development is complete and broke hosting into three layers:
1. **App distribution** (App Store / Google Play, plus Expo EAS for beta/internal testing)
2. **Backend/API hosting** (Supabase, Firebase, Railway/Render/Fly, or AWS/GCP/Azure)
3. **Data + ops stack** (database, auth, storage, analytics, monitoring, payments)

You asked for full details, and I provided a phase-based plan:

### Recommended stack for your current stage
- **Frontend:** Expo React Native + EAS
- **Backend/Data:** Supabase (Postgres/Auth/Storage)
- **Server logic/jobs:** Supabase Edge Functions or small Node API on Railway/Render
- **Payments:** RevenueCat + store IAP handling (with Stripe where appropriate)
- **Monitoring/Analytics:** Sentry + PostHog (or Firebase Analytics)

### Phase roadmap
- **Phase 1 (MVP):** launch fast with managed services and low ops burden
- **Phase 2 (Paid launch):** add staging/prod separation, backups, hardening, alerting
- **Phase 3 (Scale):** optimize infrastructure (queues, caching, DB tuning, optional multi-region)

### Cost ranges shared
- **~100 MAU:** about **$0–$50/mo**
- **~1,000 MAU:** about **$55–$276/mo**
- **~10,000 MAU:** about **$430–$2,250/mo**
- Plus dev account costs: **Apple $99/year**, **Google Play $25 one-time**

### Execution plan delivered
I provided a practical **8-week implementation checklist** covering:
- environment setup,
- schema/data pipeline,
- auth/sync,
- subscription/payments wiring,
- reliability hardening,
- beta testing,
- launch steps,
- post-launch optimization.

### Monetization framing
We also included a quick MRR sanity check using a $9.99 subscription at different conversion rates, to tie hosting cost decisions to expected revenue.

---

If needed, the next step is to turn this into a one-page implementation spec for your Planning topic to execute sprint-by-sprint.
