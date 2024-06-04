import dotenv from 'dotenv';
import * as AWS from 'aws-sdk';
const NewsAPI = require('newsapi');

AWS.config.update({
    
});

//Copy variables in file into environment variables
dotenv.config();

//Define structure of article returned from NewsAPI
interface Article {
    title:string,
    publishedAt:string,
    cryptoName:string
}

//Define structure of data returned from NewsAPI
interface NewsAPIResult { 
    articles:Array<Article>
}

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TableName = 'TextData';

// Pulls and logs data from API
async function getNews(searchQuery: string): Promise<void> {
    try {
      // Create new NewsAPI class
      const newsapi = new NewsAPI(process.env.API_KEY);
  
      // Search API with the provided query
      const result: NewsAPIResult = await newsapi.v2.everything({
        q: searchQuery,
        pageSize: 100,
        language: 'en',
      });
  
      for (let article of result.articles) {
        const date = new Date(article.publishedAt);
        //console.log(`Unix Time: ${date.getTime()}; title: ${article.title}; cryptoName: ${searchQuery}`);
  
        // Store timestamp, headlines, and cryptoName in DynamoDB
        const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
          TableName: TableName,
          Item: {
            TimeStamp: date.getTime(),
            Title: article.title,
            CryptoName: searchQuery,
          },
        };
        // Store data in DynamoDB
        await dynamoDB.put(params).promise();
      }
    } catch (error) {
      console.error(`Error fetching news data or storing in DynamoDB for "${searchQuery}":`, error);
    }
  }

getNews("Bitcoin");
getNews("Ethereum");
getNews("Binance-coin");
getNews("Solana");
getNews("Tether");