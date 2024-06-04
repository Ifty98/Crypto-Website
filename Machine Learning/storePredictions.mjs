import { DynamoDBClient, ScanCommand, DeleteItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { SageMakerRuntimeClient, InvokeEndpointCommand } from "@aws-sdk/client-sagemaker-runtime";

// Initialize DynamoDB and SageMaker clients
const dynamoDbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDbClient);
const client = new SageMakerRuntimeClient({});

export const handler = async function(event) {
  try {
    // Set to store unique crypto names
    const cryptoNamesSet = new Set();
    const processRecord = async function(record) {
      if (record.eventName === 'INSERT') {
        const newImage = record.dynamodb.NewImage;
        const cryptoName = newImage.CryptoName.S;
        cryptoNamesSet.add(cryptoName);
      }
    };

    // Call storeNewData for each cryptoName in the set
    for (const cryptoName of cryptoNamesSet) {
      let endpointName;
      // Determine endpoint name based on crypto name
      switch (cryptoName) {
        case 'Bitcoin':
          endpointName = "BitcoinEndpoint";
          break;
        case 'Ethereum':
          endpointName = "EthereumEndpoint";
          break;
        case 'Binance-coin':
          endpointName = "BinanceCoinEndpoint";
          break;
        case 'Solana':
          endpointName = "SolanaEndpoint";
          break;
        case 'Tether':
          endpointName = "TetherEndpoint";
          break;
        default:
          endpointName = "nothing";
          break;
      }
      // Fetch data and invoke SageMaker endpoint
      let data = await getData(cryptoName);
      let response = await invokeEndpoint(endpointName, data);
      await runAllFunctions(response, cryptoName);
    }
  }
  catch (error) {
    // Handle errors
    console.error('Error fetching items: ', error);
    throw error;
  }
};

// Retrieves historical price data for a specified cryptocurrency
async function getData(cryptoName) {
  try {
    const params = {
      TableName: 'CryptoData',
      KeyConditionExpression: 'CryptoName = :crypto',
      ExpressionAttributeValues: {
        ':crypto': cryptoName
      },
      Limit: 206, // Limit to get the last 206 items
      ScanIndexForward: false // Descending order to get the latest items first
    };

    // Use QueryCommand to get the data
    const data = await docClient.send(new QueryCommand(params));

    // Extract the PriceUsd attributes from the items
    const priceUsdArray = data.Items.map(item => item.PriceUsd);

    return priceUsdArray;
  }
  catch (error) {
    console.error('Error getting data:', error);
    throw error;
  }
}

//Calls endpoint and logs results
async function invokeEndpoint(name, data) {

  const endpointData = {
    "instances": [{
      "start": "2023-08-11 00:00:00",
      "target": data
    }],
    "configuration": {
      "num_samples": 50,
      "output_types": ["mean", "quantiles", "samples"],
      "quantiles": ["0.1", "0.9"]
    }
  };

  try {

    //Create and send command with data
    const command = new InvokeEndpointCommand({
      EndpointName: name,
      Body: JSON.stringify(endpointData),
      ContentType: "application/json",
      Accept: "application/json"
    });
    const response = await client.send(command);

    return response;

  }
  catch (error) {
    console.error("Error sending data to endpoint", error);
  }
}

// Deletes all items from the specified DynamoDB table
async function deleteAllPredictions(table) {
  const params = {
    TableName: table
  };

  try {
    // Use ScanCommand to fetch all items from the table
    const data = await dynamoDbClient.send(new ScanCommand(params));

    // Iterate over each item and delete it
    for (const item of data.Items) {
      await deleteItem(item, table);
    }
  }
  catch (error) {
    console.error('Error deleting items:', error);
    throw error; // Rethrow the error to handle it in the caller function
  }
}

// Deletes a specific item from the specified DynamoDB table
async function deleteItem(item, table) {
  const params = {
    TableName: table,
    Key: {
      'PriceUsd': item.PriceUsd
    }
  };

  try {
    // Use DeleteItemCommand to delete the item
    await dynamoDbClient.send(new DeleteItemCommand(params));
  }
  catch (error) {
    console.error('Error deleting item:', error);
    throw error; // Rethrow the error to handle it in the caller function
  }
}

// Stores predictions in the specified DynamoDB table
async function storePredictions(meanArray) {
  try {
    for (const priceUsd of meanArray) {
      const params = {
        TableName: 'BitcoinPredictions',
        Item: {
          'PriceUsd': { N: priceUsd.toString() }
        }
      };

      await dynamoDbClient.send(new PutItemCommand(params));
      console.log(`Item stored successfully: ${priceUsd}`);
    }
  }
  catch (error) {
    console.error('Error storing predictions:', error);
  }
}

// Runs all necessary functions after receiving a response from the SageMaker endpoint
async function runAllFunctions(response, table) {
  try {
    let results = JSON.parse(Buffer.from(response.Body).toString('utf8'));
    let meanArray = results.predictions[0].mean;

    await deleteAllPredictions(table);

    await storePredictions(meanArray);
  }
  catch (error) {
    console.error('Error running functions:', error);
  }
}
