# AHD Product Source of Truth

AHD (عهد) helps customers in Saudi Arabia explore published domestic-worker profiles and describe a household need for a service-transfer conversation. The website organizes the first step; business and operations continue through the configured WhatsApp conversation.

> **Product promise:** A clearer beginning for a household decision, without pretending to be a booking system, CRM, or government-transfer platform.

## MVP Loop

Operations staff maintain workers, taxonomies, media metadata, publication state, availability, content, settings, and audit records in the protected admin area. Customers either browse the public catalogue and a worker profile or start the two-step matching flow. The React frontend validates temporary form state, builds a structured Arabic/English message, and opens the trusted WhatsApp destination.

## Supported Worker Profile

The implemented worker domain contains a public code, display name, slug, nationality, age, city, years of experience, Saudi experience years, public Arabic/English summaries, languages, skills, availability status, publication status, featured flag, sort order, and public media. Internal notes, audit data, and non-public media remain administrative data.

## Scope Boundaries

AHD does not persist leads, customers, matching requests, or CRM history. It does not provide customer or worker accounts, booking, hourly scheduling, payments, marketplace chat, queues, Redis, BullMQ, or government-transfer integration. The product is intentionally a catalogue and WhatsApp handoff, not a transaction-management system.

## Current Architecture

The maintained presentation layer is React 19/Vite/TypeScript with Arabic RTL UI. The approved production backend is Laravel 12 on PHP 8.2+ with MySQL and Eloquent. The superseded Express/PostgreSQL implementation remains in the repository only as the verified behavioral reference and rollback comparison; it is not the current architecture.
