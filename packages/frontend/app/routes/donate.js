import Route from '@ember/routing/route';

const cryptos = [
  {
    address:
      '49UPDubdAzJ6TL3KMgxSugMV2KwtmeDmX2M2HZSTkcuS1jabsfZYy2hfyzLygW7DPCjhHojQC5gZMCpLiigVV4YcNbeh6d9',
    label: 'Monero (XMR)',
    private: true,
  },
  {
    address: 'TP3Ef7PCGKDfEH2U9ZaSgeM6i4dFxHzEfy',
    label: 'Tron (TRX)',
  },
  {
    address: '38knur9QLqmD2CrV6UZJioWE6JK8CJsZyH',
    label: 'Bitcoin (BTC)',
  },
  {
    address: 'rwCQCJHFUbzpqCxYkYWfDBcRBGCy6u1UT7',
    label: 'Ripple (XRP)',
  },
  {
    address: 'tz1SXFdQzVKvXRGkGPMFcqKiLhKHgyiRkNDv',
    label: 'Tezos (XTZ)',
  },
];

export default class DonateRoute extends Route {
  model() {
    return {
      cryptos,
    };
  }
}
