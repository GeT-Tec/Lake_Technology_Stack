#!/bin/bash

# Chave privada da primeira conta do Anvil
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Implantar os contratos
forge script script/DeployContracts.s.sol:DeployContracts --rpc-url http://localhost:8545 --broadcast
