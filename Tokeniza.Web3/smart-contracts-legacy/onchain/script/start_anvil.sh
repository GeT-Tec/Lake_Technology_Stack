#!/bin/bash

# Iniciar o Anvil com uma chave privada predefinida para desenvolvimento
anvil --chain-id 31337 \
      --block-time 2 \
      --accounts 10 \
      --balance 1000 \
      --mnemonic "test test test test test test test test test test test junk" \
      --port 8545 \
      --fork-url https://eth-mainnet.g.alchemy.com/v2/demo \
      --fork-block-number 19000000
