FROM node:18-alpine
RUN apk add --no-cache make gcc g++ python3

WORKDIR /tokene-contracts

COPY package.json ./
COPY package-lock.json ./
COPY hardhat.config.ts ./
COPY tsconfig.json ./

COPY contracts ./contracts
COPY deploy ./deploy
COPY scripts ./scripts

RUN npm install

ENTRYPOINT ["npm", "run"]
