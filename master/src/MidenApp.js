// src/MidenApp.js
import React, { useState, useEffect } from "react";
import { WebClient } from "@demox-labs/miden-sdk";
import { Box, Button, Flex, Heading, Spinner, Text } from "@chakra-ui/react";

const MidenApp = () => {
  const [client, setClient] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [faucetId, setFaucetId] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const candidate1 = "0xaddce0a4f2a74682";

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
    if (!client) {
      setStatus("Web client is not initialized.");
      return;
    }
    setLoading(true);

    try {
      setLoading(true);
      const faucetId = await client.new_faucet(
        "OffChain",
        false,
        "TOK",
        "6",
        "1000000"
      );
      setFaucetId(faucetId);

      setStatus(`Faucet created: ${faucetId}`);
      setLoading(false);
    } catch (error) {
      setStatus(`Error creating faucet: ${error.message}`);
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
      await client.new_mint_transaction(
        selectedCandidate,
        faucetId,
        "Public",
        "10000"
      );

      setStatus("Syncing state again...");
      await client.sync_state();
      setStatus(`Minted 10,000 tokens for account: ${accountId}`);

      // const notes = await client.get_input_notes(accountId);
      // setStatus(`Notes: ${notes}`);

      // await client.new_consume_transaction(accountId, notes);
      // setStatus(`Note consumed for account: ${accountId}`);

      setLoading(false);
    } catch (error) {
      setStatus(`Error minting tokens: ${error.message}`);
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

  const sendTokens = async () => {
    if (!client || !accountId) {
      setStatus("Create an account first.");
      return;
    }

    const recipientAddress = prompt("Enter the recipient address:");
    if (!recipientAddress) {
      setStatus("Recipient address is required.");
      return;
    }

    try {
      setLoading(true);
      await client.new_send_transaction(
        accountId,
        recipientAddress,
        faucetId,
        "Private",
        50
      ); // Adjust based on actual method
      setStatus(`Sent 50 tokens from ${accountId} to ${recipientAddress}`);
      setLoading(false);
    } catch (error) {
      setStatus(`Error sending tokens: ${error.message}`);
      setLoading(false);
    }
  };
  const handleElection = () => {
    setSelectedCandidate(candidate1);
  };

  console.log("accountId", accountId);
  console.log("candidate", selectedCandidate);

  return (
    <div>
      <Flex justify="space-around" mb="5rem">
        <Heading alignSelf="center">Miden ZkFunding</Heading>
      </Flex>
      <Box>
        <Button onClick={handleElection}>Select Candidate 1</Button>
      </Box>

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
        <Button m="1rem" onClick={sendTokens}>
          Send Tokens
        </Button>
      </Flex>

      <Flex flexDir="column">
        <Text>Account: {accountId ? accountId : " No account found"}</Text>
        <Text>You are voting for: {selectedCandidate}</Text>
      </Flex>

      <p>Status: {status}</p>
      {accountInfo && (
        <div>
          <h2>Account Info</h2>
          <pre>{JSON.stringify(accountInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default MidenApp;
