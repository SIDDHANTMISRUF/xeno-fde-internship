# Multi-Tenant Shopify Data Ingestion & Insights Service

## Overview
A scalable service for ingesting Shopify store data with multi-tenant architecture and real-time analytics dashboard.

## Architecture

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Shopify │────▶│ Backend API │────▶│ PostgreSQL │
│ Store(s) │ │ (Node.js) │ │ Database │
└─────────────────┘ └─────────────────┘ └─────────────────┘
│ │ │
▼ ▼ ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Webhooks │ │ Next.js │ │ Redis Queue │
│ (Real-time) │ │ Dashboard │ │ (Async Jobs) │
└─────────────────┘ └─────────────────┘ └─────────────────┘


## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Shopify Partner Account
- Railway/Render account

### 2. Backend Setup
```bash
cd apps/backend
cp .env.example .env
# Edit .env with your credentials
npm install
npx prisma migrate dev
npm run dev