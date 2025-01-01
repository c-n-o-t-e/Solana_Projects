To build and test any project after cloning the repository, follow these steps:

1. Navigate to the project directory:

```sh
cd project_name
```

2. Install the necessary dependencies:

```sh
npm i
```

3. Build the project:

```sh
anchor build
```

4. Test the project:

```sh
anchor test
```

5. Deploy locally:

To deploy the project locally, first run the Solana test validator:

```sh
solana-test-validator
```

Then deploy the project:

```sh
anchor deploy --provider.cluster localnet
```
