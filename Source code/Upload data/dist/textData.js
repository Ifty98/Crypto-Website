"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const AWS = __importStar(require("aws-sdk"));
const NewsAPI = require('newsapi');
AWS.config.update({
    
});
//Copy variables in file into environment variables
dotenv_1.default.config();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TableName = 'TextData';
// Pulls and logs data from API
function getNews(searchQuery) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create new NewsAPI class
            const newsapi = new NewsAPI(process.env.API_KEY);
            // Search API with the provided query
            const result = yield newsapi.v2.everything({
                q: searchQuery,
                pageSize: 100,
                language: 'en',
            });
            for (let article of result.articles) {
                const date = new Date(article.publishedAt);
                //console.log(`Unix Time: ${date.getTime()}; title: ${article.title}; cryptoName: ${searchQuery}`);
                // Store timestamp, headlines, and cryptoName in DynamoDB
                const params = {
                    TableName: TableName,
                    Item: {
                        TimeStamp: date.getTime(),
                        Title: article.title,
                        CryptoName: searchQuery,
                    },
                };
                yield dynamoDB.put(params).promise();
            }
        }
        catch (error) {
            console.error(`Error fetching news data or storing in DynamoDB for "${searchQuery}":`, error);
        }
    });
}
getNews("Bitcoin");
getNews("Ethereum");
getNews("Binance-coin");
getNews("Solana");
getNews("Tether");
