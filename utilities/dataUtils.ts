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
    As a wealth management professional working with clients in the crypto space, provide a comprehensive analysis for the Ethereum address ${userAddress} covering the following four main areas:
    
    1. **Security Check**: 
       - Analyze transaction patterns to identify potential malicious activities and relationships with flagged addresses (parents or children).
       - Based on the status of PASS, FAIL, or WARNING (${status}), provide actionable recommendations for improving security and transaction practices.
         - If the status is **FAIL**, advise against interacting with the address.
         - If the status is **WARNING**, caution about indirect involvement with flagged addresses and suggest preventive actions.
    
    2. **Financial Roadmap**: 
       - Assess the transaction history to provide insights into the client's financial journey with cryptoassets.
       - Identify trends, significant events, and suggest strategies for achieving long-term financial goals in the crypto space.
    
    3. **Financial Health**: 
       - Evaluate the overall financial health of the client's crypto holdings based on their transaction history.
       - Offer advice on diversification, risk management, and optimizing their crypto portfolio in line with best practices in wealth management.
    
    4. **Visualize Wallet**: 
       - Provide a conceptual visualization of the client's wallet, highlighting asset allocation, transaction types, and relationships with other addresses.
       - Use this visualization to enhance understanding and support strategic financial planning.
    
    **Transaction Details**:
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
          content: `
          You are a seasoned wealth management professional specializing in cryptoassets. Your role is to provide comprehensive analyses and recommendations to clients based on their cryptocurrency transactions and holdings.

          When analyzing the Ethereum address ${userAddress}, focus on the following four areas:

          1. **Security Check**
          2. **Financial Roadmap**
          3. **Financial Health**
          4. **Visualize Wallet**

          Use the transaction details and the security status (${status}) provided to generate insightful, actionable advice. Ensure that your response is professional, clear, and tailored to the client's needs.
          `,
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
