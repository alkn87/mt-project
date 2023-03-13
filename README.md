# Monorepo Master Thesis Project

This is the repository that contains the implementation for the master thesis project *Incentive based Geodata Mapping*.

## Prerequisites
Make sure to install NodeJS, NPM (+ NPX which should be bundled with NPM), PNPM on your machine.

To install all necessary packages and resolve dependencies within the project run the following command:

```shell
pnpm install
```

## What's inside?

This monorepo includes the following packages/apps:

### Apps and Packages

The detailed README files can be found in the sub folders.

- `apps/web`: another [svelte-kit](https://kit.svelte.dev/) app, frontend for the system
- `apps/blockchain`: all the smart contracts as hardhat project
- `docs`: plantuml source code for sequence diagrams and additional documentation in the future
- `packages/eslint-config-custom`: `eslint` configurations (includes `eslint-plugin-svelte` and `eslint-config-prettier`)

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Run the System

To run the system:
- start the local test blockchain as described in the README in `apps/blockchain`
- start the frontend as described in the README in `apps/web`

## Test the System:

when opening the frontend under `http://localhost:3000`, you have to connect to MetaMask by clicking on the highlighted text.
In some cases, MetaMask will automatically open up, without having to click on the highlighted text.

Once connected, you should be able to click on `Go to claims!`, the application will route you to `http://localhost:3000/claims`
where you can create a map claim or retrieve existing map claims.

Depending on the account you have selected in MetaMask, you have a verifier role, or a contributor role.
The first account in the list is the admin (+ verifier), because it has deployed the smart contracts.
If you have selected this account you can go to `http://localhost:3000/verification` to verify activated claims.

If you want to simulate the contributor role where you just create and activate claims, you should select a different account then the first one in the list.
