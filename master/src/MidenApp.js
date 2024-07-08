// src/MidenApp.js
import React, { useState, useEffect } from 'react';
import { WebClient } from '@demox-labs/miden-sdk';

const MidenApp = () => {
  const [client, setClient] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [faucetId, setFaucetId] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const initializeClient = async () => {
      try {
        const webClient = new WebClient();
        const remote_node_url = "http://18.203.155.106:57291"
        await webClient.create_client(remote_node_url);
        setClient(webClient);
        setStatus('Web client initialized');
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
      setStatus('Web client is not initialized.');
      return;
    }

    try {
      const newAccountId = await client.new_wallet('OffChain', true);
      setAccountId(newAccountId);
      setStatus(`Account created: ${newAccountId}`);
    } catch (error) {
      setStatus(`Error creating account: ${error.message}`);
    }
  };

  const createFaucet = async () => {
    if (!client) {
      setStatus('Web client is not initialized.');
      return;
    }

    try {
      const faucetId = await client.new_faucet('OffChain', false, 'TOK', '6', '1000000');
      setFaucetId(faucetId);
      setStatus(`Faucet created: ${faucetId}`);
    } catch (error) {
      setStatus(`Error creating faucet: ${error.message}`);
    }
  };

  const mintTokens = async () => {
    if (!client || !accountId || !faucetId) {
      setStatus('Create an account and a faucet first.');
      return;
    }

    try {
      setStatus('Syncing state...');
      await client.sync_state();

      setStatus('Fetching and caching account auth...');
      await client.fetch_and_cache_account_auth_by_pub_key(faucetId);

      setStatus('Minting tokens...');
      await client.new_mint_transaction(accountId, faucetId, 'Public', '10000');

      setStatus('Syncing state again...');
      await client.sync_state();
      setStatus(`Minted 10,000 tokens for account: ${accountId}`);

      // const notes = await client.get_input_notes(accountId);
      // setStatus(`Notes: ${notes}`);

      // await client.new_consume_transaction(accountId, notes);
      // setStatus(`Note consumed for account: ${accountId}`);
    } catch (error) {
      setStatus(`Error minting tokens: ${error.message}`);
    }
  };

  const syncState = async () => {
    if (!client) {
      setStatus('Web client is not initialized.');
      return;
    }

    try {
      await client.sync_state();
      setStatus('State synchronized.');
    } catch (error) {
      setStatus(`Error syncing state: ${error.message}`);
    }
  };

  const sendTokens = async () => {
    if (!client || !accountId) {
      setStatus('Create an account first.');
      return;
    }

    const recipientAddress = prompt('Enter the recipient address:');
    if (!recipientAddress) {
      setStatus('Recipient address is required.');
      return;
    }

    try {
      await client.send_tokens(accountId, recipientAddress, 50); // Adjust based on actual method
      setStatus(`Sent 50 tokens from ${accountId} to ${recipientAddress}`);
    } catch (error) {
      setStatus(`Error sending tokens: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Miden Client App</h1>
      <button onClick={createAccount}>Create Account</button>
      <button onClick={createFaucet}>Create Faucet</button>
      <button onClick={mintTokens}>Mint Tokens</button>
      <button onClick={syncState}>Sync State</button>
      <button onClick={sendTokens}>Send Tokens</button>
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
