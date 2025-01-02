# Swap Contract

## Overview

The Swap contract facilitates token exchanges between users in a decentralized manner.

## Process

1. **Create Offer**: A user, referred to as Alice, creates an offer specifying the amount of token A she wishes to swap.
2. **Send Token A**: Alice sends the specified amount of token A to a secure vault controlled by the offer address.
3. **Accept Offer**: Another user, referred to as Bob, can view Alice's offer and choose to accept it by sending token B to Alice.
4. **Transfer Token A**: Once Bob accepts the offer, the offer address authorizes the vault to transfer Alice's token A to Bob.

This entire process is demonstrated in the accompanying test file, providing a clear example of the contract's functionality.

## Getting Started

To interact with the code, follow these steps:

1. **Clone the Repository**:

```sh
git clone /Users/macbook/Documents/Blockchain/everythingSolana/Solana_Projects/swap_contract
cd swap_contract
```

2. **Install Dependencies**:

```sh
npm install
```

3. **Build the Project**:

```sh
anchor build
```

4. **Run Tests**:

```sh
anchor test
```

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.
