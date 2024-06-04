import { SageMakerRuntimeClient, InvokeEndpointCommand } from "@aws-sdk/client-sagemaker-runtime"; 
import { DynamoDBClient, ScanCommand, DeleteItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new SageMakerRuntimeClient({});
const dynamoClient = new DynamoDBClient({});

export const handler = async function(event) {
    try {
      const endpointData = {
    "instances":
      [
        {
          "start":"2023-08-11 00:00:00",
          "target": [29397.48215898467,
                29425.95877461085,
                29408.991226716214,
                29386.53922276063,
                29321.70980580782,
                29112.522295496467,
                28196.22696215382,
                26325.87367291567,
                26040.455501175693,
                26169.668313066417,
                26086.870846762446,
                25996.167855869022,
                26182.397438627915,
                26300.197318664224,
                26066.138155721055,
                26061.57805122584,
                26103.978767105866,
                26047.43010312445,
                26708.73882161075,
                27362.30577668219,
                26887.817636100175,
                25912.030347117678,
                25878.385810549586,
                25969.55023601206,
                25908.67677576743,
                25733.272292563153,
                25727.001214472337,
                25839.015823169528,
                26030.24780727644,
                25898.289260945734,
                25858.694403060927,
                25511.775275063825,
                25879.17683482886,
                26096.87886280153,
                26446.33629292976,
                26510.431435171628,
                26577.192234003025,
                26555.032194126965,
                26864.217294582046,
                27054.384755836123,
                27132.73868529258,
                26783.639029186994,
                26624.862568072185,
                26614.369469726218,
                26617.39117353389,
                26217.435890587716,
                26248.019356210694,
                26321.93613219094,
                26670.837709345826,
                26962.02687565163,
                26986.288135184837,
                27186.357657040662,
                28052.2728035314,
                27487.872201561917,
                27521.170496416664,
                27646.422524206846,
                27723.426718984538,
                27974.03681623555,
                27977.071301278887,
                27705.078687491507,
                27546.937341025234,
                27039.878617797094,
                26781.297767138043,
                26829.77863533956,
                26905.395092440045,
                26978.44307445885,
                27920.0497840546,
                28406.50700621753,
                28425.93903847884,
                28501.621205109524,
                29441.776038282278,
                29809.06780673726,
                29932.512032361563,
                30903.001737065286,
                34091.93832463646,
                34343.047111754946,
                34350.93922146596,
                33985.14722644572,
                34123.272285098064,
                34354.8022947672,
                34471.32752463221,
                34413.30705547059,
                34607.06773551809,
                35177.383245801226,
                34563.55324655711,
                34826.454637463554,
                35110.821710384334,
                35040.07420178952,
                34994.8558604561,
                35415.11340404325,
                36619.79699799135,
                36956.06559291448,
                37121.57869487293,
                37125.92401589405,
                36908.286422419726,
                36251.009719525246,
                36287.79567099259,
                36969.480861970864,
                36391.598430055106,
                36557.96077213887,
                36725.44162973429,
                37331.28317035529,
                37167.264826681356,
                36682.488892850495,
                37337.993386221184,
                37666.16284690661,
                37789.37019964843,
                37630.627540139234,
                37189.32504537758,
                37460.903592616465,
                37969.44098051009,
                37802.66282640193,
                38421.58980693087,
                38922.40317174202,
                39555.53805398946,
                41426.61371486471,
                42395.445551719684,
                43890.296079864456,
                43576.42240689055,
                43676.234025580605,
                44063.22247936695,
                43867.33536921024,
                41962.51249079822,
                41553.54977181301,
                41635.00490929467,
                42880.07368684009,
                42506.960072025526,
                42324.92627403994,
                41986.79677391399,
                41423.46869757516,
                42723.59460568354,
                43187.19257762926,
                43746.60200743298,
                43835.871814242506,
                43745.376661951625,
                43694.1889016889,
                43390.68813610748,
                42756.76840543386,
                42872.32733773448,
                42975.6724065153,
                42476.73885213883,
                42186.16455400817,
                42508.998722588636,
                42882.024132451275,
                45295.37937610983,
                43982.97584035695,
                43541.285364934934,
                43824.23283534158,
                43904.42090837373,
                44154.020768980066,
                44899.6724598853,
                46672.60444662416,
                45846.97689822836,
                46600.252008855256,
                45135.59076556117,
                42920.97441508259,
                42835.464116824,
                42642.977318274694,
                42954.15774202454,
                42734.1413839471,
                42249.76894934553,
                41292.945646461754,
                41644.209242028606,
                41752.70361633571,
                40750.551116992756,
                39426.28887975897,
                39923.07790320581,
                39959.22518891172,
                40944.02303676326,
                41869.64347223588,
                42308.22633560555,
                42501.13527175021,
                43433.55390519861,
                42929.74975136122,
                42449.506145584666,
                43068.416556214055,
                43119.77289503753,
                42921.89819104962,
                42777.971595579555,
                42945.81709175545,
                43269.36462386412,
                44888.88945715152,
                46754.94759594141,
                47333.90407420046,
                48113.86175337972,
                48749.67339125886,
                49622.370785279,
                50836.5301554887,
                52093.35437346584,
                52056.76185276308,
                51666.650449224624,
                51783.74914397053,
                52150.02061453206,
                51895.21671375752,
                51502.88860605675,
                51599.69703113767,
                51116.48746782348,
                51214.12604073647,
                51698.238915670976,
                52328.373136686205,
                56480.03409652223,
                59281.75587981872,
                62076.961309917795,
                61884.40003391597,
                62041.61460656907,
                62254.48471934088]
        }
      ],
      "configuration":
         {
           "num_samples": 50,
            "output_types":["mean","quantiles","samples"],
            "quantiles":["0.1","0.9"]
         }
    };
    
    const response = await invokeEndpoint("BitcoinEndpoint", endpointData);
    
    let results = JSON.parse(Buffer.from(response.Body).toString('utf8'));
    let meanArray = results.predictions[0].mean;
    
    await deleteAllBitcoinPredictions();
    
    await storePredictions(meanArray);
    
    } catch(error) {
      console.error('Error fetching items:', error);
      throw error;
    }
};


//Calls endpoint and logs results
async function invokeEndpoint (name, data) {
    //Create and send command with data
    const command = new InvokeEndpointCommand({
        EndpointName: name,
        Body: JSON.stringify(data),
        ContentType: "application/json",
        Accept: "application/json"
    });
    const response = await client.send(command);

    return response;
}


async function deleteAllBitcoinPredictions() {
    const params = {
        TableName: 'BitcoinPredictions'
    };

    try {
        // Use ScanCommand to fetch all items from the table
        const data = await dynamoClient.send(new ScanCommand(params));

        // Iterate over each item and delete it
        for (const item of data.Items) {
            await deleteItem(item);
        }
    } catch (error) {
        console.error('Error deleting items:', error);
        throw error; // Rethrow the error to handle it in the caller function
    }
}

async function deleteItem(item) {
    const params = {
        TableName: 'BitcoinPredictions',
        Key: {
            'PriceUsd': item.PriceUsd
        }
    };

    try {
        // Use DeleteItemCommand to delete the item
        await dynamoClient.send(new DeleteItemCommand(params));
    } catch (error) {
        console.error('Error deleting item:', error);
        throw error; // Rethrow the error to handle it in the caller function
    }
}

async function storePredictions(meanArray) {
    try {
        for (const priceUsd of meanArray) {
            const params = {
                TableName: 'BitcoinPredictions',
                Item: {
                    'PriceUsd': { N: priceUsd.toString() } // Assuming the PriceUsd attribute is of type Number
                }
            };

            await dynamoClient.send(new PutItemCommand(params));
            console.log(`Item stored successfully: ${priceUsd}`);
        }
    } catch (error) {
        console.error('Error storing predictions:', error);
    }
}