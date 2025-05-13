import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

// ERC20 ABI for token information
const ERC20_ABI: AbiItem[] = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    type: 'function',
  },
];

@Injectable()
export class Web3Service {
  private readonly web3: Web3;
  private readonly logger = new Logger(Web3Service.name);

  constructor(private readonly configService: ConfigService) {
    const providerUrl = this.configService.get<string>('WEB3_PROVIDER_URL');
    if (!providerUrl) {
      throw new Error('WEB3_PROVIDER_URL is not configured');
    }
    this.web3 = new Web3(providerUrl);
  }

  async getTokenInfo(address: string) {
    try {
      const contract = new this.web3.eth.Contract(ERC20_ABI, address);

      // Fetch token information in parallel
      const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
        contract.methods
          .name()
          .call()
          .catch(() => null),
        contract.methods
          .symbol()
          .call()
          .catch(() => null),
        contract.methods
          .decimals()
          .call()
          .catch(() => null),
        contract.methods
          .totalSupply()
          .call()
          .catch(() => null),
        contract.methods
          .owner()
          .call()
          .catch(() => null),
      ]);

      return {
        name,
        symbol,
        decimals: decimals ? parseInt(decimals, 10) : null,
        totalSupply: totalSupply ? totalSupply.toString() : null,
        owner,
        metadata: {
          network: await this.getNetworkInfo(),
          blockNumber: await this.web3.eth.getBlockNumber(),
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching token info for ${address}:`, error);
      throw error;
    }
  }

  private async getNetworkInfo() {
    try {
      const networkId = await this.web3.eth.net.getId();
      // Map network ID to network type
      const networkType = this.getNetworkTypeFromId(Number(networkId));
      return {
        id: networkId,
        type: networkType,
      };
    } catch (error) {
      this.logger.error('Error fetching network info:', error);
      return null;
    }
  }

  private getNetworkTypeFromId(networkId: number): string {
    switch (networkId) {
      case 1:
        return 'mainnet';
      case 3:
        return 'ropsten';
      case 4:
        return 'rinkeby';
      case 5:
        return 'goerli';
      case 42:
        return 'kovan';
      case 11155111:
        return 'sepolia';
      default:
        return 'unknown';
    }
  }
}
