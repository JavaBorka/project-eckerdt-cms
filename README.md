# Eckerdt CMS

A custom content management system for managing and publishing articles about the artist Eckerdt.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js (framework TBD)
- **Database:** Netlify Database (managed PostgreSQL)
- **Rich Text Editor:** Plate UI
- **API:** REST, documented using OpenAPI

## Features

- Article creation, editing and publishing
- Article previews for the public website
- Author and category management
- Media library with externally hosted media
- Hero banner management
- Draft, publish and deactivate workflows

## Documentation

- [Project Overview](src/docs/project-overview.md)
- [Database Schema](src/docs/database-schema.md)
- [SQL Table Definitions](src/docs/sql/01_create_tables.md)
- [OpenAPI Specification](src/docs/openapi.yaml)
- [Netlify Database Setup](src/docs/netlify-database.md)

## Project Status

Under development as part of a full-stack mentoring project.

## Publishing states

Active draft: `status=draft`, `publishedAt=null`. Active published: `status=published`, `publishedAt` is the first publication time in the current activation cycle. Inactive: `status=null`, `publishedAt=null`. Backend updates `updated_at`.
