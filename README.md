# HederaHive
HederaHive is an asset tokenization and state channels based payment solution for the Hedera ecosystem.

Try now - [HederaHive](https://www.hederahive.tech/)

Sample Estate - [https://hashscan.io/testnet/token/0.0.5268549/1](https://hashscan.io/testnet/token/0.0.5268549/1)

[Pitch Deck](https://www.canva.com/design/DAGZpt4YH3c/ISQvnXIYh1T8BH4pIzA_og/view?utm_content=DAGZpt4YH3c&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h08ec5ac23d)

## Table of Contents
1. [Introduction](#introduction)
2. [State Channels(Hives)](#state-channels)
3. [Estate Tokenization](#estate-tokenization)
4. [Technical Details](#technical-details)
5. [Run Locally](#run-locally)
6. [Known Issues](#known-issues)

---


## Introduction

![home](https://rose-melodic-felidae-510.mypinata.cloud/ipfs/QmRxE14TvV1EiLy3KVQkfh4Kw4BEUc2RYPBPi23BcRZd9X)

HederaHive is a real estate tokenization platform built for the hedera ecosystem. The key component of HederaHive is the state channels which allows bulk transactions over the month to be executed as just a couple of transactions (depends on the number of unique participants). The key objective behind choosing state channels for hedera is to attract the “whale” section of the crypto market. Using state channels, 100x gas fees reduction can be achieved. Real estate tokenization + State channels opens door for countless new possibilities such as rental sharing, fractional ownership and building connections among people just by transacting with them. 

HederaHive also provides a nice hangout space powered by Hedera Consensus Service for long chats!

---

## State Channels (Hives)

Let's consider a scenario where a large organization of 100 members makes 10,000 crypto transfers per month among its members. 

Hedera Network Fees - $0.0001 * 10000 = $1

With State Channels - $0.0001 * No. of members = $0.01

Cost Reduction = 100x

Apart from the cost reduction, it also reduces the load on Hedera Nodes. Hence, improving the overall throughput of the chain.

![home](https://rose-melodic-felidae-510.mypinata.cloud/ipfs/QmQbYVZj6RbyAGYzQRSxsvYLkdqEWJfqUPLp5N6VoUUomK)

- There are two types of Hives - Real Estate based Hive and Custom Hive.

- To create a custom hive, you can click on the "+" button on the home page and input the required details.

- Real Estate based hives are created upon estate tokenization.

- State Channel [Contract](https://github.com/parthg1901/HederaHive/blob/main/contracts/src/MultiPartyStateChannel.sol)

---

## Estate Tokenization

 - Fractional Ownership - allows holders to get ownership of the property along with a share in any kind of rental income. This is suitable for long-term investors. 

 - Rent Sharing - Rent sharing is a type of fractional ownership that allows investors to share in the rental income from a property without actually owning it. This is a good option for investors who are not interested in owning the property long-term and just want to get a share of the rental income. The actual owner of the property gets instant money from this. So, it serves as the rent paid in advance

![security](https://rose-melodic-felidae-510.mypinata.cloud/ipfs/QmNdvxjRupSDPVqtegkcgXh6By7SfQWDL7Py3hMtCNU91u)

- You can choose between the tokenization types based on your need.

- Follow the required steps and your estate is tokenized.

![estate](https://rose-melodic-felidae-510.mypinata.cloud/ipfs/QmaKRfpvmGT25XSa64QagwqwcVCG4Sa1mhzYCJHQKFqR9W)

---

## Technical Details

### Frontend:
- NextJS + TailwindCSS + TypeScript + GSAP

### Smart Contracts:
- Solidity + Foundry
- Contract -  [https://hashscan.io/testnet/contract/0.0.5268920](https://hashscan.io/testnet/contract/0.0.5268920)

### Hedera Services:
- Hedera Tokenization Service - Used for managing all kinds of tokens

- Hedera Consensus Service - Used for Hive Topic Creation and Subscription. (Messaging coming soon!)

- HederaSDK - Used for all the interactions from the Frontend.

### Backend:
- Express + MongoDB + Mongoose

- [Server](https://hederahive.onrender.com)

---

## Run Locally
1. ```git clone https://github.com/parthg1901/HederaHive.git```
2. Initialize .env for both frontend and the server based on the sample .env files.
3. Frontend - ```cd frontend && npm install && npm run dev```
4. Server - ```cd server && npm install && npm start```
5. For contract tests, ```forge test --via-ir --root=contract```
---

## Known Issues

Hive Creation may not work in the production environment due to unknown errors from Hedera Consensus Service. Please try running the project locally if you want to give it a try!
