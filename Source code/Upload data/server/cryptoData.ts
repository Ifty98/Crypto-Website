import * as AWS from 'aws-sdk';
import axios, { AxiosResponse } from 'axios';

AWS.config.update({
  
});

interface CryptoData {
  priceUsd: string;
  time: number;
  cryptoName: string;
}

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TableName = 'CryptoData';


const storeCryptoDataInDynamoDB = async (cryptoData: CryptoData[]): Promise<void> => {
  try {
    const putRequests = cryptoData.map((item) => ({
      PutRequest: {
        Item: {
          CryptoName: item.cryptoName, 
          TimeStamp: item.time,
          PriceUsd: Number(item.priceUsd),
        },
      },
    }));

    // Split putRequests into chunks of 25 items or fewer
    const chunkedPutRequests = [];
    for (let i = 0; i < putRequests.length; i += 25) {
      chunkedPutRequests.push(putRequests.slice(i, i + 25));
    }

    // Perform batchWrite for each chunk
    for (const chunk of chunkedPutRequests) {
      const batchWriteParams: AWS.DynamoDB.DocumentClient.BatchWriteItemInput = {
        RequestItems: {
          [TableName]: chunk,
        },
      };

      await dynamoDB.batchWrite(batchWriteParams).promise();
    }

    console.log('Data stored in DynamoDB.');
  } catch (error) {
    console.error('Error storing data in DynamoDB: Not Found!!' + error);
  }
};



const fetchCryptoHistory = async (cryptoName: string): Promise<void> => {
  try {
    // Fetch historical data from the API
    const response: AxiosResponse<{ data: CryptoData[] }> = await axios.get(
      `https://api.coincap.io/v2/assets/${cryptoName.toLowerCase()}/history?interval=d1`
    );

    // Map the response data to include the cryptoName for each item
    const cryptoHistory: CryptoData[] = response.data.data.map((item) => ({
      ...item,
      cryptoName,
    }));

    // Store data in DynamoDB
    await storeCryptoDataInDynamoDB(cryptoHistory);
  } catch (error) {
    console.error(`Error fetching ${cryptoName} history: Not Found!!`);
  }
};

// Call the function to fetch Bitcoin history
fetchCryptoHistory("Bitcoin");
fetchCryptoHistory("Ethereum");
fetchCryptoHistory("Binance-coin");
fetchCryptoHistory("Solana");
fetchCryptoHistory("Tether");