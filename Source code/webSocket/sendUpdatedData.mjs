import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient, ScanCommand, QueryCommand } from "@aws-sdk/client-dynamodb";

//Create new Client
const ddbClient = new DynamoDBClient();

export const handler = async (event) => {

      const domain = '10e0k9xqti.execute-api.us-east-1.amazonaws.com';
      const stage = 'prod';

      const callbackUrl = `https://${domain}/${stage}`;
      const apiGwClient = new ApiGatewayManagementApiClient({ endpoint: callbackUrl });

      try {
        const connIds = await getAllConnectionIds();
        const bitcoin = await getCryptoData('Bitcoin');
        const ethereum = await getCryptoData('Ethereum');
        const solana = await getCryptoData('Solana');
        const binanceCoin = await getCryptoData('Binance-coin');
        const tether = await getCryptoData('Tether');
        const bitcoinPred = await getPredictions("BitcoinPredictions");
        const ethereumPred = await getPredictions("EthereumPredictions");
        const solanaPred = await getPredictions("SolanaPredictions");
        const binanceCoinPred = await getPredictions("BinanceCoinPredictions");
        const tetherPred = await getPredictions("TetherPredictions");
        const syntheticPred = await getSyntheticPredictions();
        const bitcoinSent = await getSentimentData("Bitcoin");
        const ethereumSent = await getSentimentData("Ethereum");
        const solanaSent = await getSentimentData("Solana");
        const binanceCoinSent = await getSentimentData("Binance-coin");
        const tetherSent = await getSentimentData("Tether");


        // Combine all data arrays into a single object
        const combinedData = {
          bitcoin: bitcoin,
          ethereum: ethereum,
          solana: solana,
          binanceCoin: binanceCoin,
          tether: tether,
          bitcoinPred: bitcoinPred,
          ethereumPred: ethereumPred,
          solanaPred: solanaPred,
          binanceCoinPred: binanceCoinPred,
          tetherPred: tetherPred,
          bitcoinSent: bitcoinSent,
          ethereumSent: ethereumSent,
          solanaSent: solanaSent,
          binanceCoinSent: binanceCoinSent,
          tetherSent: tetherSent,
          syntheticPred: syntheticPred
        };

        // Send data to all connected clients
        for (const connId of connIds) {
          const postToConnectionCommand = new PostToConnectionCommand({
            ConnectionId: connId,
            Data: JSON.stringify({
              route: 'getAllData',
              data: combinedData
            })
          });

          //Wait for API Gateway to execute and log result
          await apiGwClient.send(postToConnectionCommand);
        }

          //Return response
          return {
            statusCode: 200,
            body: "Client connected"
          };

        }
        catch (err) {
          console.error(JSON.stringify(err));
          return {
            statusCode: 500,
            body: "Server Error: " + JSON.stringify(err)
          };
        }
      };

      // Get all data of the specified crypto
      async function getCryptoData(cryptoName) {
        try {
          // Define query parameters
          const params = {
            TableName: 'CryptoData',
            KeyConditionExpression: 'CryptoName = :crypto',
            ExpressionAttributeValues: {
              ':crypto': { S: cryptoName }
            },
            ScanIndexForward: true // Ascending order
          };

          // Execute the query
          const response = await ddbClient.send(new QueryCommand(params));

          // Extract and return only the PriceUsd attribute from each item
          const itemsWithPriceAndTimeStamp = response.Items.map(item => ({
            priceUsd: item.PriceUsd.N,
            timeStamp: item.TimeStamp.N
          }));

          return itemsWithPriceAndTimeStamp;
        }
        catch (error) {
          console.error('Error fetching Bitcoin data:', error);
          throw error;
        }
      }

      // Get all predictions of the specified crypto
      async function getPredictions(cryptoName) {
        try {
          // Define scan parameters
          const params = {
            TableName: cryptoName
          };

          // Execute the scan
          const response = await ddbClient.send(new ScanCommand(params));

          // Extract and return only the PriceUsd attribute from each item
          const itemsWithPriceUsd = response.Items.map(item => item.PriceUsd.N);

          return itemsWithPriceUsd;
        }
        catch (error) {
          console.error('Error fetching data from table:', error);
          throw error;
        }
      }

      // Get the ids of all connected clients
      async function getAllConnectionIds() {
        try {
          const params = {
            TableName: 'WebSocketClients',
            ScanIndexForward: false, // Sort in descending order
          };

          const command = new ScanCommand(params);
          const response = await ddbClient.send(command);

          if (response.Items && response.Items.length > 0) {
            // Extract all connection IDs
            const connectionIds = response.Items.map(item => item.ConnectionId.S);
            return connectionIds;
          }
          else {
            console.log('No connection IDs found in the table.');
            return [];
          }
        }
        catch (error) {
          console.error('Error fetching connection IDs:', error);
          throw error;
        }
      }

      // Get all sentiment data for the specified crypto
      async function getSentimentData(cryptoName) {
        try {
          // Define query parameters
          const params = {
            TableName: 'SentimentData',
            KeyConditionExpression: 'CryptoName = :crypto',
            ExpressionAttributeValues: {
              ':crypto': { S: cryptoName }
            },
            ScanIndexForward: true // Ascending order
          };

          // Execute the query
          const response = await ddbClient.send(new QueryCommand(params));

          // Extract and return only the PriceUsd attribute from each item
          const itemsWithPriceUsd = response.Items.map(item => item.Result.S);

          return itemsWithPriceUsd;
        }
        catch (error) {
          console.error('Error fetching Bitcoin data:', error);
          throw error;
        }
      }
 
      // Get all the predictions for synthetic data
      async function getSyntheticPredictions() {
        try {
          // Define scan parameters
          const params = {
            TableName: "SyntheticPredictions"
          };

          // Execute the scan
          const response = await ddbClient.send(new ScanCommand(params));

          // Extract and return only the PriceUsd attribute from each item
          const itemsWithPriceUsd = response.Items.map(item => item.PriceUsd.N);

          return itemsWithPriceUsd;
        }
        catch (error) {
          console.error('Error fetching data from table:', error);
          throw error;
        }
      }
