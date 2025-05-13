# Access Key Management and Token Information Retrieval System

This project consists of two microservices built with NestJS and Prisma ORM:

1. Access Key Management Service
2. Web3 Token Information Service

## Project Structure

```
.
├── access-key-service/     # Microservice 1: Access Key Management
├── token-info-service/     # Microservice 2: Token Information Service
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Docker and Docker Compose (for running databases)
- Redis (for event streaming between services)

## Getting Started

1. Clone the repository
2. Install dependencies for both services:
   ```bash
   cd access-key-service && npm install
   cd ../token-info-service && npm install
   ```
3. Set up the databases:
   ```bash
   docker-compose up -d
   ```
4. Run database migrations:
   ```bash
   # In access-key-service directory
   npx prisma migrate dev
   
   # In token-info-service directory
   npx prisma migrate dev
   ```
5. Start the services:
   ```bash
   # Start Access Key Service
   cd access-key-service
   npm run start:dev
   
   # In a new terminal, start Token Info Service
   cd token-info-service
   npm run start:dev
   ```

## Architecture Overview

### Access Key Management Service
- Handles access key generation and management
- Provides admin endpoints for key operations
- Uses JWT for admin authentication
- Stores key information in PostgreSQL
- Publishes key events to Redis for Token Info Service

### Token Information Service
- Provides token information endpoints
- Validates access keys and enforces rate limits
- Consumes key events from Redis
- Stores token information in PostgreSQL
- Implements rate limiting using Redis

## API Documentation

### Access Key Management Service

#### Admin Endpoints
- `POST /admin/keys` - Generate new access key
- `DELETE /admin/keys/:key` - Delete access key
- `GET /admin/keys` - List all keys
- `PATCH /admin/keys/:key` - Update key properties

#### User Endpoints
- `GET /keys/:key` - Get key details
- `POST /keys/:key/disable` - Disable key

### Token Information Service

#### User Endpoints
- `GET /tokens/:tokenId` - Get token information
- `GET /tokens` - List available tokens

## Testing

Run tests for both services:

```bash
# In access-key-service directory
npm run test
npm run test:e2e

# In token-info-service directory
npm run test
npm run test:e2e
```

## Assumptions

1. Admin authentication is handled by a gateway service (not implemented)
2. Rate limiting is implemented using Redis
3. Services communicate asynchronously via Redis pub/sub
4. Each service has its own database instance
5. Token information is fetched from CoinGecko API (mock data for this implementation)

## Environment Variables

Both services require the following environment variables (create .env files in each service directory):

### Access Key Service
```
DATABASE_URL="postgresql://user:password@localhost:5432/access_key_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret"
```

### Token Info Service
```
DATABASE_URL="postgresql://user:password@localhost:5432/token_info_db"
REDIS_URL="redis://localhost:6379"
```

## License

MIT 