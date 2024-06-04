import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const s3Client = new S3Client({});


export const handler = async function(event) {
    try {
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
           let bucketName;
           switch (cryptoName) {
             case 'Bitcoin':
               bucketName = 'bitcoin-data';
               break;
             case 'Ethereum':
               bucketName = 'ethereum-files';
               break;
             case 'Binance-coin':
               bucketName = 'binance-coin-data';
               break;
             case 'Solana':
               bucketName = 'solana-files';
               break;
             case 'Tether':
               bucketName = 'tether-data';
               break;
             default:
               bucketName = 'default-bucket';
               break;
            }
            await storeNewData(cryptoName, bucketName);
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data stored successfully.' })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error processing event.' })
        };
    }
};

async function storeNewData(cryptoName, bucketName) {
    try {
    const params = {
      TableName: 'CryptoData',
      KeyConditionExpression: 'CryptoName = :crypto',
      ExpressionAttributeValues: {
          ':crypto': cryptoName
      },
      ScanIndexForward: true // Ascending order
    };

    // Use QueryCommand to perform the query
    const data = await docClient.send(new QueryCommand(params));

    console.log('Items retrieved successfully:', data.Items);

    const firstItem = data.Items[0];
    const timeStamp = new Date(firstItem.TimeStamp);
      
    // Format the timestamp
    const formattedTimeStamp = timeStamp.toISOString().replace('T', ' ').slice(0, -5);
    // Extract the PriceUSD attributes of all items and format them into an array
    const priceUSDArray1 = data.Items.map(item => parseFloat(item.PriceUsd));
    const priceUSDArray2 = data.Items.slice(0, 300).map(item => parseFloat(item.PriceUsd));
    
    // Create a JSON object with the formatted data
    const formattedData1 = {
      start: formattedTimeStamp,
      target: priceUSDArray1
    };
    
    const formattedData2 = {
      start: formattedTimeStamp,
      target: priceUSDArray2
    };
    
    const jsonData1 = JSON.stringify(formattedData1);
    const jsonData2 = JSON.stringify(formattedData2);
    
    const s3Params1 = {
      Bucket: bucketName,
      Key: 'full_data.json',
      Body: jsonData1,
      ContentType: 'application/json'
    };
    
    const s3Params2 = {
      Bucket: bucketName,
      Key: 'train_data.json',
      Body: jsonData2,
      ContentType: 'application/json'
    };
    
    await s3Client.send(new PutObjectCommand(s3Params1));
    await s3Client.send(new PutObjectCommand(s3Params2));

    console.log('JSON file uploaded successfully.');
    
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
}