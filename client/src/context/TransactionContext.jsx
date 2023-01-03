import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

// Create useContext
export const TransactionContext = React.createContext();

// Get Window_Info
const { ethereum } = window;

// Get Contract
const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

  return transactionsContract;
}

// Provide transaction details
export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([])

  // Update Form_info contents
  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  // Get All Transacitons
  const getAllTransactions = async () => {
    // Processes that may generate exception errors
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      // Get Contract
      const transactionsContract = getEthereumContract();
      // Available Transactions
      const availableTransactions = await transactionsContract.getAllTransactions();

      // Mapping transaction_Info
      const structuredTransactions = availableTransactions.map((transaction) => ({
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
        timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
        message: transaction.message,
        keyword: transaction.keyword,
        amount: parseInt(transaction.amount._hex) / (10 ** 18)
      }));
      console.log(structuredTransactions)
      setTransactions(structuredTransactions);

      // Process to be executed when an exception error occurs
    } catch (error) {
      console.log(error);
    }
  }

  // Check Wallet Connect
  const checkIfWalletIsConnected = async () => {
    // Processes that may generate exception errors
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      // Get Wallet Accounts
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        getAllTransactions();
      } else {
        console.log("No accounts found");
      }

      // Process to be executed when an exception error occurs
      } catch (error) {
        console.log(error);
        
        throw new Error("No ethereum object.")
    }
  }

  const checkIfTransactionsExist = async () => {
    // Processes that may generate exception errors
    try {
      const transactionsContract = getEthereumContract();
      const transactionCount = await transactionsContract.getTransactionCount();
      // Save Transaction Count Info
      window.localStorage.setItem("transactionCount",  transactionCount)
    } catch (error){
      console.log(error);

      throw new Error("No ethereum object");
    }
  }

  // Connect Wallet
  const connectWallet = async () => {
    // Processes that may generate exception errors
    try {
      if (!ethereum) return alert("Please install metamask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts", });

      setCurrentAccount(accounts[0]);

      // Process to be executed when an exception error occurs
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  }

  // Send Transaction
  const sendTransaction = async () => {
    // Processes that may generate exception errors
    try {
      if(!ethereum) return alert("Please install metamask");

      // ge the data from the Form...
      const { addressTo, amount, keyword, message } = formData;
      const transactionsContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: currentAccount,
          to: addressTo,
          gas: "0x5208", // 21000 GWEI
          value: parsedAmount._hex, // 0.00001
        }],
      });

      const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);

      const transactionCount = await transactionsContract.getTransactionCount();

      setTransactionCount(transactionCount.toNumber());

      window.reload()

      // Process to be executed when an exception error occurs
    } catch (error) {
      console.log(error);
      
      // throw new Error("No ethereum object.")
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, []);

  return (
    <TransactionContext.Provider value={{ 
      connectWallet, 
      currentAccount, 
      formData, 
      setFormData, 
      handleChange, 
      sendTransaction,
      transactionCount,
      isLoading,
      transactions
      }}>
      {children}
    </TransactionContext.Provider>
  )
}