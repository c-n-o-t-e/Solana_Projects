# Voting Contract

## Overview

This project contains a Solana-based voting contract located in the `programs` folder. The voting contract allows users to create and participate in decentralized voting processes on the Solana blockchain.

## Features

-   **Create Polls**: Users can create new polls with a set of options to vote on.
-   **Cast Votes**: Users can cast their votes on active polls.
-   **View Results**: Users can view the results of the polls in real-time.

## Folder Structure

-   `programs/`
-   `voting_contract/`
-   `src/` - Contains the source code for the voting contract.
-   `Cargo.toml` - Configuration file for the Rust project.

## Getting Started

To get started with the voting contract, follow these steps:

1. **Clone the Repository**:

```sh
git clone https://github.com/your-repo/voting_contract.git
cd voting_contract
```

2. **Build the Project**:

```sh
anchor build
```

3. **Deploy the Contract**:

```sh
solana program deploy /path/to/voting_contract.so
```

4. **Interact with the Contract**:
   Use the Solana CLI or a front-end application to create polls, cast votes, and view results.

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.
