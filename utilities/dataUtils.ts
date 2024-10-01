import { openaiApiKey } from '@/constants/env';
import { storeJsonData } from './firebaseClient';
import { fetchEtherscanData, checkFlaggedAddress } from './apiUtils';

interface Transaction {
  timestamp: string;
  type: 'Sent' | 'Received';
  cryptocurrency: string;
  usdAmount: number;
  thirdPartyWallet: string;
  flagged: boolean;
}

// Function to fetch data for a specified cryptocurrency
export const fetchData = async (address: string, cryptocurrency: string): Promise<Transaction[] | null> => {
  switch (cryptocurrency.toLowerCase()) {
    case 'eth':
      return fetchEtherscanData(address); // Fetch Ethereum transactions
    // case 'btc':  // Uncomment and implement if BTC support is added
    //   return fetchBlockCypherData(address);
    default:
      console.error('Unsupported cryptocurrency');
      return null;
  }
};

// Generate the OpenAI prompt for relationship analysis and recommendations
export const generateOpenAIPrompt = (
  userAddress: string,
  transactions: Transaction[],
  status: string // Pass, Fail, or Warning
): string => {
  // Limit transactions to avoid token issues with the API
  const limitedTransactions = (transactions || []).slice(0, 10);

  const transactionDetails = limitedTransactions
    .map(
      (txn, index) =>
        `Transaction ${index + 1} - ${txn.type}: ${txn.usdAmount} USD involving ${txn.thirdPartyWallet}. Status: ${txn.flagged ? 'Flagged' : 'Safe'}.`
    )
    .join('\n');

  const prompt = `
    Analyze the Ethereum address ${userAddress} to identify patterns and relationships with other unique addresses found in the transaction details.
    Focus on mapping out transaction patterns, identifying potential malicious activities, and relationships with flagged addresses (parents or children).
    Based on the status of FAIL, PASS, or WARNING (${status}), provide recommendations for improving security and transaction practices.
    IF the status is FAIL, indicate to not interact with the address.
    IF the status is WARNING, caution about indirect involvement with flagged addresses and advise on preventive actions.
    ${transactionDetails}
  `;

  console.log('Generated OpenAI Prompt:', prompt);

  return prompt;
};

// Function to generate insights using OpenAI
export const generateInsights = async (
  userAddress: string,
  transactions: Transaction[],
  status: string // Pass, Fail, or Warning
): Promise<string | null> => {
  try {
    const openAIPrompt = generateOpenAIPrompt(userAddress, transactions || [], status);

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Provide insights and recommendations for Ethereum address ${userAddress}. The security status is: PASS, FAIL, or WARNING (${status}).`,
        },
        { role: 'user', content: openAIPrompt },
      ],
    };

    console.log('Request payload:', payload);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log('Response data:', responseData);

    if (responseData.choices && responseData.choices.length > 0) {
      const insightsText = responseData.choices[0]?.message?.content;

      if (insightsText) {
        // Store the generated insights in Firebase or any storage backend
        await storeJsonData({
          insights: insightsText,
          timestamp: Date.now(),
          userAddress,
        });

        return insightsText;
      } else {
        console.error('Insights text is undefined or null.');
        return null;
      }
    } else {
      console.error('No insights available.');
      return null;
    }
  } catch (error) {
    console.error('Error generating insights:', error);
    return null;
  }
};

// Fetch data and metrics for a given Ethereum address
export const fetchDataAndMetrics = async (address: string) => {
  try {
    const response = await fetch(
      `https://api.idef.ai/api/get_data_and_metrics?address=${address}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data and metrics:', error);
    return null;
  }
};
