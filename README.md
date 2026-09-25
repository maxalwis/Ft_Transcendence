*This project has been created as part of the 42 curriculum by flebrun, maalwis, sleroy, helsnous, npagnon.*

# Ft_Transcendence

## Description

**ft_transcendence** is a full-stack web application built around an interactive map of events in Paris.

The application combines event discovery with social features, user accounts, real-time communication and a public API. Events are primarily imported from the **Paris Open Data** platform and stored in a PostgreSQL/PostGIS database, but external clients can also add events through the public API.

Users can browse events on an interactive map, search and filter them, interact with other users, exchange messages in real time, manage their profile and control their personal data.

### Key Features

* Interactive event map using Leaflet
* Paris Open Data event ingestion
* Event creation through a public API
* Advanced search by category, price and precise date
* Nearby-event search using geospatial queries
* User registration, authentication and profiles
* JWT authentication
* Remote OAuth 2.0 authentication
* Friend management
* Real-time messaging
* Event interests
* French, English, Spanish and Arabic
* Arabic right-to-left (RTL) interface
* GDPR personal-data export and account deletion
* API key protected public API
* OpenAPI/Swagger documentation
* Redis/BullMQ background worker
* ELK centralized logging and monitoring
* Local HTTPS through Nginx
* Mailpit email testing
* Responsive interface

---

# Prerequisites

The project is designed to run with **Podman** and **Podman Compose**.

Podman is used instead of Docker because of the container/root-permission restrictions encountered in the 42 environment.

Required tools:

* Git
* Podman
* Podman Compose
* `make`

Node.js is included in the application containers and is not required locally for normal startup.

---

# Installation & Execution

## 1. Clone the repository

```bash
git clone https://github.com/maxalwis/Ft_Transcendence
cd Ft_Transcendence
```

## 2. Configure the environment

Create the local environment file:

```bash
cp .env.example .env
```

Configure the required values for:

* PostgreSQL
* Redis
* JWT
* Public API key
* OAuth
* LibreTranslate
* Application URLs
* Mailpit
* HTTPS

Do not commit real credentials, API keys or OAuth secrets.

The default HTTPS port is:

```text
8443
```

## 3. Start the application

Recommended:

```bash
make
```

or:

```bash
make up
```

Equivalent Podman Compose commands:

```bash
podman compose build
podman compose up -d
```

## 4. Access the application

Open:

```text
https://localhost:8443
```

The application uses a locally generated self-signed HTTPS certificate, so the browser may display a security warning on first access. This is expected in the local development environment.

## 5. Stop the application

```bash
make down
```

## 6. Run tests

```bash
make test
```

The test suite includes unit tests, health checks and end-to-end tests.

## 7. Start ELK

```bash
make elk
```

This starts Elasticsearch, Logstash and Kibana through the corresponding Compose profile.

---

# Team Information

The team consisted of five developers. Responsibilities were divided by main areas of ownership, while development remained collaborative and members also contributed to other parts of the project.

## flebrun — Technical Lead / DevOps

* Overall architecture and technical integration
* Podman/container environment
* Nginx HTTPS and reverse proxy
* ELK stack and dashboards
* Redis/BullMQ worker infrastructure
* Event fetching and frontend/backend integration
* Interactive map and marker clustering
* Marker styling
* Arabic RTL integration
* Cross-module fixes and infrastructure integration

## maalwis — Frontend Developer

* React frontend architecture and implementation
* Event pages and event presentation
* User profile interface
* Friend management interface
* Authentication pages
* Responsive navigation and layouts
* CSS and reusable components
* Frontend internationalization

## sleroy — Backend Developer

* Initial NestJS backend architecture
* Prisma/PostgreSQL/PostGIS integration
* Event schema and API
* Paris Open Data ingestion
* Geospatial nearby-event queries
* JWT authentication
* OAuth 2.0 authentication
* Event interests
* Translation backend
* Authenticated WebSocket gateway
* Backend security and validation

## helsnous — Backend Developer

* User management and CRUD
* User validation
* Advanced event filtering
* Category, price and date filtering
* Frontend/backend filtering integration
* Multilingual and legal-page integration
* Testing and backend stabilization

## npagnon — Backend / Infrastructure Developer

* Nginx development infrastructure
* HTTPS setup
* Public API
* API key authentication
* Rate limiting
* OpenAPI/Swagger documentation
* GDPR functionality
* Personal-data export
* Account/data deletion
* Confirmation email workflows

---

# Project Management

The project was developed collaboratively using GitHub, pull requests and dedicated feature branches.

## Git Workflow

Branches generally followed:

```text
<login>/<feature>
```

Examples:

```text
flebrun/elk-stack-implementing
sleroy/events-schema-api
maalwis/front-profile
npagnon/public-api
```

Pull requests were used to integrate feature branches, review changes, resolve conflicts and combine work from different team members.

Branch and PR ownership are used as the primary indication of feature ownership. Commit history also reflects cross-contributions such as fixes, testing and integration work.

## Communication

* **In person meetings**: updates on everyone current work and decisions sharing
* **Discord**: communication and technical discussions
* **Notion**: ticketing and task organization
* **Google Sheets**: module accountability

---

# Technical Stack

## Frontend

| Technology              | Purpose                            |
| ----------------------- | ---------------------------------- |
| React                   | Component-based UI                 |
| Vite                    | Frontend development/build tooling |
| TypeScript              | Type-safe frontend development     |
| Tailwind CSS            | UI styling                         |
| React Router            | Client-side routing                |
| Leaflet / React Leaflet | Interactive event map              |
| Socket.IO Client        | Real-time communication            |
| i18next / react-i18next | Internationalization               |

React and Vite provide the main frontend architecture. Leaflet was selected for the interactive geographical event interface, while React Leaflet integrates it with React.

## Backend

| Technology        | Purpose                       |
| ----------------- | ----------------------------- |
| NestJS            | Backend framework             |
| Node.js           | Runtime                       |
| TypeScript        | Type-safe backend development |
| Socket.IO         | WebSockets                    |
| Prisma            | ORM                           |
| Passport          | Authentication integration    |
| JWT               | Local authentication          |
| Swagger / OpenAPI | API documentation             |

NestJS provides a modular backend structure for users, authentication, events, messages, friends, translations, GDPR and the public API.

## Database

| Technology | Purpose                     |
| ---------- | --------------------------- |
| PostgreSQL | Relational database         |
| PostGIS    | Geospatial data and queries |
| Prisma     | ORM and schema management   |

PostGIS is used for event coordinates and nearby-event queries.

## Infrastructure

| Technology     | Purpose                         |
| -------------- | ------------------------------- |
| Podman         | Containerization                |
| Podman Compose | Container orchestration         |
| Nginx          | HTTPS and reverse proxy         |
| Redis          | Shared in-memory infrastructure |
| BullMQ         | Background job queue            |
| Elasticsearch  | Log storage/search              |
| Logstash       | Log processing                  |
| Kibana         | Log visualization               |
| LibreTranslate | Translation service             |
| Mailpit        | Local email testing             |

---

# Features

| Feature              | Description                                    | Contributors                       |
| -------------------- | ---------------------------------------------- | ---------------------------------- |
| Event ingestion      | Fetches and stores events from Paris Open Data | sleroy, flebrun                    |
| Event creation API   | Adds events through the public API             | npagnon, sleroy                    |
| Interactive map      | Displays events geographically                 | flebrun, maalwis, sleroy           |
| Marker clustering    | Groups nearby map markers                      | flebrun                            |
| Event details        | Displays event information and metadata        | maalwis                            |
| Advanced search      | Category, price and precise-date filtering     | helsnous, sleroy                   |
| Nearby events        | Geospatial radius queries                      | sleroy                             |
| User management      | Registration, profiles and account management  | helsnous, maalwis, sleroy          |
| JWT authentication   | Local authentication                           | sleroy, helsnous                   |
| OAuth 2.0            | Remote authentication                          | sleroy                             |
| Friends              | User search and friend management              | maalwis, sleroy                    |
| Real-time messaging  | WebSocket-based messaging                      | sleroy, npagnon, flebrun           |
| Event interests      | User interaction with events                   | sleroy, maalwis                    |
| Internationalization | French, English, Spanish and Arabic            | sleroy, helsnous, maalwis, flebrun |
| RTL support          | Arabic right-to-left interface                 | flebrun, maalwis                   |
| Public API           | API-key protected documented API               | npagnon, sleroy                    |
| GDPR                 | Personal-data export and account/data deletion | npagnon                            |
| Worker               | Redis/BullMQ background infrastructure         | flebrun                            |
| ELK monitoring       | Centralized logging and dashboards             | flebrun                            |
| HTTPS                | Local HTTPS and reverse proxy                  | npagnon, flebrun                   |
| Responsive UI        | Responsive layouts and navigation              | maalwis                            |
| Legal pages          | Terms of service and privacy policy            | helsnous, maalwis                  |

---
# Modules

The project implements the following selected modules.

| Category         | Module                                  | Points | Implementation                                                      | Contributors                       |
| ---------------- | --------------------------------------- | -----: | ------------------------------------------------------------------- | ---------------------------------- |
| Web              | Framework for frontend and backend      |      2 | React/Vite + NestJS                                                 | maalwis, sleroy                    |
| Web              | User interaction                        |      2 | Friends and real-time messaging                                     | maalwis, sleroy, npagnon, flebrun  |
| Web              | ORM                                     |      1 | Prisma                                                              | sleroy                             |
| Web              | Public API                              |      2 | API key, rate limiting and OpenAPI documentation                    | npagnon, sleroy                    |
| Web              | Custom design system                    |      1 | Reusable React components, shared styling and responsive layouts    | maalwis                            |
| Web              | WebSockets                              |      2 | Socket.IO backend gateway and frontend integration                  | sleroy, npagnon, flebrun           |
| Web              | Multiple languages                      |      1 | French, English, Spanish and Arabic                                 | sleroy, helsnous, maalwis, flebrun |
| Web              | RTL language                            |      1 | Arabic translations and RTL layout                                  | flebrun, maalwis                   |
| Web              | Advanced search                         |      1 | Category, price and precise-date filtering                          | helsnous, sleroy                   |
| User management  | Standard user management/authentication |      2 | Accounts, JWT and profile management                                | helsnous, sleroy, maalwis          |
| User management  | Remote OAuth 2.0                        |      1 | Remote OAuth authentication                                         | sleroy                             |
| DevOps           | ELK                                     |      2 | Elasticsearch, Logstash and Kibana                                  | flebrun                            |
| Data & analytics | Data export and import                  |      1 | Personal-data export/deletion and event creation through public API | npagnon                            |

**Total: 19 points**

The table documents the modules implemented by the project; final module validation is determined during the 42 evaluation.

---

# Resources

The project relied primarily on official documentation and technical references.

### Documentation

* NestJS documentation
* React documentation
* Vite documentation
* Prisma documentation
* PostgreSQL/PostGIS documentation
* Socket.IO documentation
* Leaflet documentation
* Tailwind CSS documentation
* Podman and Compose documentation
* Elasticsearch, Logstash and Kibana documentation
* BullMQ documentation
* i18next documentation

### Additional References

* NestJS / TypeScript learning material
  https://www.youtube.com/watch?v=ffCIANfx_-0&list=PLjwdMgw5TTLX1tQ1qDNHTsy_lrkCt4VW3

* MDN CRUD reference
  https://developer.mozilla.org/fr/docs/Glossary/CRUD

* Paris Open Data — event dataset
  https://opendata.paris.fr/explore/dataset/que-faire-a-paris-/api/

* Directory of available free maps
  https://www.openstreetmap.fr/

* React learning material
  https://fr.react.dev/

* Open source library for interactive maps
  https://leafletjs.com/download.html

These resources were used for framework concepts, CRUD architecture, event-data ingestion and the APIs used by the application.

---

# AI Usage

AI tools, including LLM-based assistants, were used as development assistance during the project.

They were primarily used for:

* debugging TypeScript and JavaScript errors;
* investigating compiler and runtime errors;
* troubleshooting frontend styling;
* understanding framework and library documentation;
* resolving configuration and infrastructure issues;
* reviewing implementation approaches.

AI-generated suggestions were reviewed and adapted by the team before integration. The final implementation, architecture and integration were performed and validated by the project members.

---

# Conclusion

**ft_transcendence** combines event discovery, an interactive map, social features and real-time communication in a single full-stack application.

The project uses a React/Vite frontend, a modular NestJS backend, PostgreSQL/PostGIS for relational and geospatial data, Redis/BullMQ for background processing, and a containerized Podman infrastructure with Nginx and ELK monitoring.
