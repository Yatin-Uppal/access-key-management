# Access Key Service

A microservice for managing access keys with rate limiting capabilities. This service provides endpoints for creating, validating, and managing access keys, along with event notifications for key status changes.

## Features

- Access key management (create, validate, disable, delete)
- Rate limiting per access key
- Event-driven architecture for key status changes
- Redis-based caching and rate limiting
- PostgreSQL database for persistent storage
- Swagger API documentation
- Comprehensive test coverage

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- npm or yarn

## Environment Variables

Example environment variables (`.env.example`):

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/access_key_service?schema=public"
REDIS_URL="redis://localhost:6379"
RATE_LIMIT_MAX=100
RATE_LIMIT_TTL=60
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="1h"
```

Copy `.env.example` to `.env` and update the values as needed. Never commit `.env` to version control.

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd access-key-service
   npm install
   ```
3. Set up the database:
   ```bash
   npx prisma migrate dev
   ```
4. Start the service:
   ```bash
   npm run start:dev
   ```

## API Endpoints

### Access Keys

- `POST /api/access-keys` - Create a new access key
- `GET /api/access-keys/:key` - Get access key details
- `DELETE /api/access-keys/:key` - Delete an access key
- `PATCH /api/access-keys/:key/disable` - Disable an access key

### Rate Limiting

- Rate limiting is applied per access key
- Default limit: 100 requests per minute
- Configurable via environment variables

## Event System

The service emits events for key status changes:

- `access-key.created` - When a new key is created
- `access-key.disabled` - When a key is disabled
- `access-key.deleted` - When a key is deleted

## Testing

Run the test suite:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Project Structure

```
src/
├── access-key/           # Access key module
│   ├── dto/             # Data transfer objects
│   ├── entities/        # Database entities
│   ├── access-key.controller.ts
│   ├── access-key.service.ts
│   └── access-key.module.ts
├── prisma/              # Database module
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── redis/               # Redis module
│   ├── redis.service.ts
│   └── redis.module.ts
├── rate-limit/          # Rate limiting module
│   ├── rate-limit.guard.ts
│   └── rate-limit.module.ts
├── app.module.ts        # Root module
└── main.ts             # Application entry point
```

## Database Schema

The service uses Prisma with the following models:

- `AccessKey`: Stores access key information
- `AccessKeyValidation`: Tracks key validation status
- `RateLimit`: Manages rate limiting data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
