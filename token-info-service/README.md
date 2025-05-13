# Token Information Service

A microservice for retrieving and caching ERC20 token information from the Ethereum blockchain. This service provides endpoints for fetching token details, with built-in caching, rate limiting, and access key validation.

## Features

- ERC20 token information retrieval (name, symbol, decimals, total supply, owner)
- Blockchain network information (network ID, type, block number)
- Redis-based caching for improved performance
- PostgreSQL database for persistent storage
- Rate limiting per access key
- Access key validation integration
- Event-driven architecture for key status updates
- Swagger API documentation
- Comprehensive test coverage

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- Ethereum node access (e.g., Infura)
- npm or yarn

## Environment Variables

Example environment variables (`.env.example`):

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/token_service?schema=public"
REDIS_URL="redis://localhost:6379"
RATE_LIMIT_MAX=100
RATE_LIMIT_TTL=60
WEB3_PROVIDER_URL="https://mainnet.infura.io/v3/your-infura-key"
ACCESS_KEY_SERVICE_URL="http://localhost:3000/api"
```

Copy `.env.example` to `.env` and update the values as needed. Never commit `.env` to version control.

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd token-info-service
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

### Token Information

- `GET /api/token/:address` - Get token information
  - Required header: `x-access-key`
  - Returns: Token details including name, symbol, decimals, total supply, owner, and network information

### Rate Limiting

- Rate limiting is applied per access key
- Default limit: 100 requests per minute
- Configurable via environment variables

## Caching Strategy

The service implements a multi-level caching strategy:

1. Redis Cache (First Level)
   - TTL: 1 hour
   - Stores token information for quick retrieval

2. Database Cache (Second Level)
   - Stores token information persistently
   - Used as fallback when Redis cache misses
   - Stale data (up to 24 hours old) is returned if fresh fetch fails

## Event System

The service listens for access key events:

- `access-key.created` - New key created
- `access-key.disabled` - Key disabled
- `access-key.deleted` - Key deleted

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
├── token/               # Token module
│   ├── dto/            # Data transfer objects
│   ├── token.controller.ts
│   ├── token.service.ts
│   └── token.module.ts
├── web3/               # Web3 module
│   ├── web3.service.ts
│   └── web3.module.ts
├── prisma/             # Database module
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── redis/              # Redis module
│   ├── redis.service.ts
│   └── redis.module.ts
├── rate-limit/         # Rate limiting module
│   ├── rate-limit.guard.ts
│   └── rate-limit.module.ts
├── app.module.ts       # Root module
└── main.ts            # Application entry point
```

## Database Schema

The service uses Prisma with the following models:

- `TokenInfo`: Stores token information
  - Basic token details (name, symbol, decimals)
  - Total supply and owner address
  - Network information and block number
  - Caching metadata (last fetched timestamp)

## Error Handling

The service implements comprehensive error handling:

- Invalid token addresses
- Network connectivity issues
- Rate limit exceeded
- Invalid or missing access keys
- Cache and database errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
