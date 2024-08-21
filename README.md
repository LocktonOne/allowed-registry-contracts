# The TokenE operating system on top of EVM by Distributed Lab

This repository serves as a registry for the hashes of bytecodes of smart contracts that have passed review.

There are supposed to be two roles:

1. To add contract hashes to the registry using the `addAllowedContract` function.
2. To switch the flag that indicates whether the contract is deployed or not through the `switchDeployedFlag` function.

#### Compilation

To compile the contracts, use the next script:

```bash
npm run compile
```

#### Test

To run the tests, execute the following command:

```bash
npm run test
```

Or to see the coverage, run:

```bash
npm run coverage
```

#### deployment

To deploy the contracts locally, run the following commands (in the different terminals):

```bash
npm run private-network
npm run deploy-localhost
```

To deploy the contracts on a specific network, run the command:

```bash
npm run deploy-sepolia
```

#### Bindings

The command to generate the bindings is as follows:

```bash
npm run generate-types
```

> See the full list of available commands in the `package.json` file.

## License 

The TokenE core is released under the custom License. Please take a look to understand the limitations.
