import axios from 'axios';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Define DynamoDB table names
const textDataTableName = 'TextData';
const sentimentDataTableName = 'SentimentData';

export const handler = async function(event) {
    try {
        // Process each record in the event
        const processRecord = async function(record) {
            // Check if the event type is INSERT
            if (record.eventName === 'INSERT') {
                const newImage = record.dynamodb.NewImage;
                const cryptoName = newImage.CryptoName.S;
                const timeStamp = parseInt(newImage.TimeStamp.N);
                const title = newImage.Title.S;

                // Perform sentiment analysis on the title
                const sentimentAnalysisResult = await getSentiment(title);

                // Prepare parameters for putting sentiment data into DynamoDB
                const sentimentDataParams = {
                    TableName: sentimentDataTableName,
                    Item: {
                        CryptoName: cryptoName,
                        TimeStamp: timeStamp,
                        Result: sentimentAnalysisResult
                    }
                };

                // Store sentiment data in DynamoDB
                await docClient.send(new PutCommand(sentimentDataParams));

                console.log(`Sentiment analysis completed for ${cryptoName} at ${timeStamp}: ${sentimentAnalysisResult}`);
            }
        };

        if (event && event.Records) {
            for (const record of event.Records) {
                await processRecord(record);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Sentiment analysis completed.' })
        };
    } catch (error) {
        // Handle errors and return error response
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error processing sentiment analysis.' })
        };
    }
};

// Function to perform sentiment analysis using an external API
async function getSentiment(text) {
    const url = 'http://text-processing.com/api/sentiment/';

    const response = await axios.post(url, `text=${text}`, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    return response.data.label;
}