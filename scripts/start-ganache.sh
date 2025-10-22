#!/bin/bash

echo "🚀 Starting Ganache blockchain..."

# Start Ganache with deterministic accounts
npx ganache \
  --host 0.0.0.0 \
  --port 7545 \
  --chainId 1337 \
  --gasPrice 20000000000 \
  --gasLimit 12000000 \
  --accounts 20 \
  --accountKeysPath "./ganache-keys.json" \
  --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" \
  --deterministic \
  --fork.deleteCache \
  --verbose

echo "✅ Ganache started at http://127.0.0.1:7545"
echo "📋 Chain ID: 1337"
echo "💰 20 accounts with 1000 ETH each"
echo "🔐 Mnemonic: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"