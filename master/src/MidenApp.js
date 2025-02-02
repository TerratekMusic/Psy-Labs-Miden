// src/MidenApp.js
import React, { useState, useEffect } from "react";
import { WebClient } from "@demox-labs/miden-sdk";
import { Box, Button, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import bg from "./img/bg1.jpg";

const MidenApp = () => {
  const [client, setClient] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [faucetId, setFaucetId] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [mintObject, setMintObject] = useState(null);
  const [notes, setNotes] = useState(null);

  const candidate1 = "0x9e1a72fcadaf2c10";
  const candidate2 = "0x9ed2cfe63f05f25b";

  useEffect(() => {
    const initializeClient = async () => {
      try {
        const webClient = new WebClient();
        const remote_node_url = "http://18.203.155.106:57291";
        await webClient.create_client(remote_node_url);
        setClient(webClient);
        setStatus("Web client initialized");
      } catch (error) {
        setStatus(`Error initializing client: ${error.message}`);
      }
    };

    initializeClient();
  }, []);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (client && accountId) {
        try {
          const info = await client.get_account(accountId);
          setAccountInfo(info);
        } catch (error) {
          setStatus(`Error fetching account info: ${error.message}`);
        }
      }
    };

    fetchAccountInfo();
  }, [client, accountId]);

  const createAccount = async () => {
    if (!client) {
      setStatus("Web client is not initialized.");
      return;
    }
    setLoading(true);
    console.log("creating account");

    try {
      setLoading(true);

      const newAccountId = await client.new_wallet("OffChain", true);
      setAccountId(newAccountId);
      setStatus(`Account created: ${newAccountId}`);

      setLoading(false);
    } catch (error) {
      setStatus(`Error creating account: ${error.message}`);
    }
  };

  const createFaucet = async () => {
    setLoading(true);

    if (!client) {
      setStatus("Web client is not initialized.");
      setLoading(false);
      return;
    }

    try {
      const faucetId = await client.new_faucet(
        "OffChain",
        false,
        "VOTE",
        "6",
        "1000000"
      );
      setFaucetId(faucetId);

      setStatus(`Faucet created: ${faucetId}`);
      setLoading(false);
    } catch (error) {
      setStatus(`Error creating faucet: ${error.message}`);
      setLoading(false);
    }
  };

  const mintTokens = async () => {
    if (!client || !accountId || !faucetId) {
      setStatus("Create an account and a faucet first.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Syncing state...");
      await client.sync_state();

      setStatus("Fetching and caching account auth...");
      await client.fetch_and_cache_account_auth_by_pub_key(faucetId);

      setStatus("Minting tokens...");
      const result = await client.new_mint_transaction(
        selectedCandidate,
        faucetId,
        "Private",
        "10000"
      );

      setStatus("Syncing state again...");
      await client.sync_state();
      setStatus(`Minted 1 vote for candidate: ${selectedCandidate}`);
      setMintObject(result);

      console.log("mint result: ", result);
      setLoading(false);
      return result;

      // const notes = await client.get_input_notes(accountId);
      // setStatus(`Notes: ${notes}`);

      // await client.new_consume_transaction(accountId, notes);
      // setStatus(`Note consumed for account: ${accountId}`);
    } catch (error) {
      setStatus(`Error minting tokens: ${error.message}`);
      setLoading(false);
    }
  };
  const consumeTransaction = async () => {
    // if (!client || !accountId || !mintObject) {
    //   setStatus("Mint Tokens first");
    //   return;
    // }

    try {
      setLoading(true);
      setStatus("Syncing state...");
      // await client.sync_state();

      await client.fetch_and_cache_account_auth_by_pub_key(selectedCandidate);

      setStatus("Consuming transactions...");
      const tx = await client.new_consume_transaction(selectedCandidate, notes);

      setStatus("Syncing state again...");
      // await client.sync_state();

      setStatus(`Consumed Votes for account: ${selectedCandidate}`);

      console.log("tx: ", tx);
      setLoading(false);

      // const notes = await client.get_input_notes(accountId);
      // setStatus(`Notes: ${notes}`);

      // await client.new_consume_transaction(accountId, notes);
      // setStatus(`Note consumed for account: ${accountId}`);
    } catch (error) {
      setStatus(`Error consuming transaction tokens: ${error.message}`);
      setLoading(false);
    }
  };

  const getNotes = async () => {
    if (mintObject) {
      setNotes(mintObject.created_note_ids);
      console.log("notes ", notes);
    } else {
      setStatus("No vote tokens found");
    }
  };

  const syncState = async () => {
    if (!client) {
      setStatus("Web client is not initialized.");
      return;
    }
    setLoading(true);

    try {
      setLoading(true);
      await client.sync_state();
      setStatus("State synchronized.");
      setLoading(false);
      setLoading(false);
    } catch (error) {
      setStatus(`Error syncing state: ${error.message}`);
    }
  };

  // const sendTokens = async () => {
  //   if (!client || !accountId) {
  //     setStatus("Create an account first.");
  //     return;
  //   }

  //   const recipientAddress = prompt("Enter the recipient address:");
  //   if (!recipientAddress) {
  //     setStatus("Recipient address is required.");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     await client.new_send_transaction(
  //       accountId,
  //       recipientAddress,
  //       faucetId,
  //       "Private",
  //       50
  //     ); // Adjust based on actual method
  //     setStatus(`Sent 50 tokens from ${accountId} to ${recipientAddress}`);
  //     setLoading(false);
  //   } catch (error) {
  //     setStatus(`Error sending tokens: ${error.message}`);
  //     setLoading(false);
  //   }
  // };
  const selectCandidate1 = () => {
    setSelectedCandidate(candidate1);
  };
  const selectCandidate2 = () => {
    setSelectedCandidate(candidate2);
  };

  console.log("accountId", accountId);
  console.log("candidate", selectedCandidate);
  console.log("mintObject: ", mintObject);

  // console.log("notes from object: ", mintObject.created_note_ids);
  console.log("notes from state: ", notes);

  return (
    <div>
      <Flex
        h="15rem"
        bgImage={bg}
        bgSize="cover"
        justify="space-around"
        mb="5rem"
      >
        <Heading color="white" alignSelf="center">
          Miden ZkVoting
        </Heading>
      </Flex>
      <Flex mb="4rem" justify="space-around">
        <Button color="white" bgColor="blue" onClick={selectCandidate1}>
          Select Candidate 1
        </Button>
        <Button color="white" bgColor="red" onClick={selectCandidate2}>
          Select Candidate 1
        </Button>
      </Flex>

      <Flex justify="space-around">
        {loading && (
          <Box>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
            <Text>Loading</Text>
          </Box>
        )}
      </Flex>

      <Flex>
        <Button m="1rem" onClick={createAccount}>
          Create Account
        </Button>
        <Button m="1rem" onClick={createFaucet}>
          Create Faucet
        </Button>
        <Button m="1rem" onClick={mintTokens}>
          Mint Tokens
        </Button>
        <Button m="1rem" onClick={syncState}>
          Sync State
        </Button>
        <Button m="1rem" onClick={getNotes}>
          Get Notes
        </Button>

        <Button m="1rem" onClick={consumeTransaction}>
          Vote
        </Button>
      </Flex>

      <Flex ml="4rem" flexDir="column">
        <Text>Account: {accountId ? accountId : " No account found"}</Text>

        <Text>You are voting for: {selectedCandidate}</Text>
      </Flex>

      <Box ml="4rem">
        <p>Status: {status}</p>
        {accountInfo && (
          <div>
            <h2>Account Info</h2>
            <pre>{JSON.stringify(accountInfo, null, 2)}</pre>
          </div>
        )}
      </Box>
    </div>
  );
};

export default MidenApp;
