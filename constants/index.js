import xGrapeJson from '../artifacts/contracts/xGRAPE.sol/xGRAPE.json';
import ZapperJson from '../artifacts/contracts/Zapper.sol/Zapper.json';
import LpZapperJson from '../artifacts/contracts/LPZapper.sol/LPZapper.json';
import GrapeMIMLPJson from '../artifacts/contracts/GrapeMIMLP.sol/GrapeMIMLP.json';
import { erc20ABI } from "wagmi";

// use avax by default in prod and localhost by default in dev
export const defaultChain = process.env.NODE_ENV === 'production' ? 43_114 : 1337
const chains = [
  {
    id: 43_114,
    name: 'Avalanche',
    network: 'avalanche',
    nativeCurrency: {
      decimals: 18,
      name: 'Avalanche',
      symbol: 'AVAX',
    },
    rpcUrls: {
      default: 'https://api.avax.network/ext/bc/C/rpc',
    },
    blockExplorers: {
      default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    },
    testnet: false,
  },
];
export const validChains = process.env.NODE_ENV === 'production' ? chains : chains.concat([
  {
    id: 43_113,
    name: 'Fuji Testnet',
    network: 'avalancheFuji',
    nativeCurrency: {
      decimals: 18,
      name: 'Avalanche',
      symbol: 'AVAX',
    },
    rpcUrls: {
      default: 'https://api.avax-test.network/ext/bc/C/rpc',
    },
    blockExplorers: {
      default: { name: 'SnowTrace', url: 'https://testnet.snowtrace.io/' },
    },
    testnet: true,
  },
  {
    id: 1337,
    name: 'Ganache',
    network: 'ganache',
    nativeCurrency: {
      decimals: 18,
      name: 'Ethereum',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: 'http://127.0.0.1:8545',
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://wagmi.sh' },
    },
    testnet: true
  }
]);

export const GRAPEMIM = {
  1337: {
    address: '0xb382247667fe8ca5327ca1fa4835ae77a9907bc8',
    abi: erc20ABI
  },
  43113: {
    address: '0xb382247667fe8ca5327ca1fa4835ae77a9907bc8',
    abi: erc20ABI
  },
  43114: {
    address: '0xb382247667fe8ca5327ca1fa4835ae77a9907bc8', // Grape/MIM TJ LP token
    abi: erc20ABI
  }
}

export const GRAPE = {
  1337: {
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    abi: erc20ABI
  },
  43113: {
    address: '0x57F13579c400421ee45b089A28E2458450CC2BAb',
    abi: erc20ABI
  },
  43114: {
    address: '0x5541D83EFaD1f281571B343977648B75d95cdAC2',
    abi: erc20ABI
  }
}

export const GRAPE_MIM = {
  1337: {
    address: '0x280B2FFE2A9093A399223B170EC1D93F524157f9',
    abi: erc20ABI
  },
  43113: {
    address: '0xC108Abb54d7602331627569e2197389C26e4FE4f',
    abi: erc20ABI,
  },
  43114: {
    address: '0x9076C15D7b2297723ecEAC17419D506AE320CbF1',
    abi: erc20ABI
  }
}

export const GRAPE_MIM_LP_VAULT = {
  1337: {
    address: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    abi: erc20ABI,
  },
  43113: {
    address: '0xbbbb1Aa7f3F7cF7eb799E28ea43a169cd6D0cF0B',
    abi: erc20ABI,
  },
  43114: {
    address: '0x0dA1DC567D81925cFf22Df74C6b9e294E9E1c3A5',
    abi: erc20ABI
  }
}

export const GRAPE_MIM_SW_MAGIK = {
  1337: {
    address: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    abi: GrapeMIMLPJson.abi,
  },
  43113: {
    address: '0xbbbb1Aa7f3F7cF7eb799E28ea43a169cd6D0cF0B',
    abi: GrapeMIMLPJson.abi,
  },
  43114: {
    address: '0x0da1dc567d81925cff22df74c6b9e294e9e1c3a5',
    abi: GrapeMIMLPJson.abi
  }
}

export const MIM = {
  1337: {
    address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    abi: erc20ABI,
  },
  43113: {
    address: '0xA1ABc4f3279200e8C0ed87936d0dAFD8172f9d94',
    abi: erc20ABI,
  },
  43114: {
    address: '0x130966628846BFd36ff31a822705796e8cb8C18D',
    abi: erc20ABI
  }
}

export const XGRAPE = {
  1337: {
    address: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
    abi: xGrapeJson.abi
  },
  43113: {
    address: '0xbf15d4F0Bb8DE91957EFc8cf114b62b6D8cA8a5E',
    abi: xGrapeJson.abi
  },
  43114: {
    address: '0x95CED7c63eA990588F3fd01cdDe25247D04b8D98',
    abi: xGrapeJson.abi
  }
}

export const ZAPPER = {
  1337: {
    address: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82',
    abi: ZapperJson.abi,
  },
  43113: {
    address: '0xDB7aE2B356840eb5eF59ad1357C0f5A76060a964',
    abi: ZapperJson.abi
  },
  43114: {
    address: '0xe8f699B68ddE8e59DBe8fdF20955931B25fe7dFa',
    abi: ZapperJson.abi
  }
}

export const GRAPE_XGRAPE_LP = {
  43114: {
    address: '0xE00b91F35924832D1a7d081d4DCed55f3b80FB5C',
    abi: erc20ABI
  }
}

export const LP_ZAPPER = {
  43114: {
    address: '0x493A7099C1b7Ca8A4f1Cd3748A09EAe06fbD5b67',
    abi: LpZapperJson.abi
  }
}
