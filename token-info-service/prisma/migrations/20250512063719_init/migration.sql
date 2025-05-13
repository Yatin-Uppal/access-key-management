-- CreateTable
CREATE TABLE "TokenInfo" (
    "id" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "name" TEXT,
    "symbol" TEXT,
    "decimals" INTEGER,
    "totalSupply" TEXT,
    "owner" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "accessKey" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessKeyValidation" (
    "id" TEXT NOT NULL,
    "accessKey" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessKeyValidation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenInfo_tokenAddress_key" ON "TokenInfo"("tokenAddress");

-- CreateIndex
CREATE INDEX "TokenInfo_tokenAddress_idx" ON "TokenInfo"("tokenAddress");

-- CreateIndex
CREATE INDEX "TokenInfo_symbol_idx" ON "TokenInfo"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_accessKey_key" ON "RateLimit"("accessKey");

-- CreateIndex
CREATE INDEX "RateLimit_accessKey_idx" ON "RateLimit"("accessKey");

-- CreateIndex
CREATE UNIQUE INDEX "AccessKeyValidation_accessKey_key" ON "AccessKeyValidation"("accessKey");

-- CreateIndex
CREATE INDEX "AccessKeyValidation_accessKey_idx" ON "AccessKeyValidation"("accessKey");
