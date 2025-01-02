/\*\*

-   The Swap contract facilitates token exchanges between users in a decentralized manner.
-
-   Here is a step-by-step overview of the process:
-   1. A user, referred to as Alice, creates an offer specifying the amount of token A she wishes to swap.
-   2. Alice sends the specified amount of token A to a secure vault controlled by the offer address.
-   3. Another user, referred to as Bob, can view Alice's offer and choose to accept it by sending token B to Alice.
-   4. Once Bob accepts the offer, the offer address authorizes the vault to transfer Alice's token A to Bob.
-
-   This entire process is demonstrated in the accompanying test file, providing a clear example of the contract's functionality.
-
-   To interact with the code:
-   1. Clone the repository from the provided source.
-   2. Run `npm install` to install all necessary dependencies.
-   3. Execute `anchor build` to compile the project.
-   4. Run `anchor test` to perform the tests and validate the contract's behavior.
       \*/
