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
const AWS = __importStar(require("aws-sdk"));
const axios_1 = __importDefault(require("axios"));
AWS.config.update({
    
});
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TableName = 'CryptoData';
const storeCryptoDataInDynamoDB = (cryptoData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const putRequests = cryptoData.map((item) => ({
            PutRequest: {
                Item: {
                    CryptoName: item.cryptoName, // Assuming CryptoName is a string attribute
                    TimeStamp: item.time, // Assuming TimeStamp is a number attribute
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
            const batchWriteParams = {
                RequestItems: {
                    [TableName]: chunk,
                },
            };
            yield dynamoDB.batchWrite(batchWriteParams).promise();
        }
        console.log('Data stored in DynamoDB.');
    }
    catch (error) {
        console.error('Error storing data in DynamoDB: Not Found!!' + error);
    }
});
const fetchCryptoHistory = (cryptoName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://api.coincap.io/v2/assets/${cryptoName.toLowerCase()}/history?interval=d1`);
        const cryptoHistory = response.data.data.map((item) => (Object.assign(Object.assign({}, item), { cryptoName })));
        // Store data in DynamoDB
        //await storeCryptoDataInDynamoDB(cryptoHistory);
    }
    catch (error) {
        console.error(`Error fetching ${cryptoName} history: Not Found!!`);
    }
});
// Call the function to fetch Bitcoin history
fetchCryptoHistory("Bitcoin");
fetchCryptoHistory("Ethereum");
fetchCryptoHistory("Binance-coin");
fetchCryptoHistory("Solana");
fetchCryptoHistory("Tether");
