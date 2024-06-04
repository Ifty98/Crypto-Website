import { SageMakerRuntimeClient, InvokeEndpointCommand } from "@aws-sdk/client-sagemaker-runtime";
import { DynamoDBClient, ScanCommand, DeleteItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";

// Initialize SageMaker and DynamoDB clients
const client = new SageMakerRuntimeClient({});
const dynamoClient = new DynamoDBClient({});

export const handler = async function(event) {
  try {
    // Define data to be sent to SageMaker endpoint
    const endpointData = {
      "instances": [{
        "start": "2024-04-14 05:00:00",
        "target": [585.7382179522973,
          601.30975720594,
          558.4651755598268,
          559.8839950147596,
          590.4953783454536,
          589.4806923410268,
          587.071805614017,
          603.6374522956338,
          601.9725184685464,
          631.660407910649,
          678.4880292538281,
          634.5152794840232,
          699.1231753320135,
          683.3193677991684,
          713.9457964169695,
          697.5993555080427,
          668.9850276704608,
          677.1146804065178,
          633.9418411446792,
          636.9012225366399,
          652.7077848797961,
          658.282393453198,
          626.6402049465601,
          594.6636020243872,
          613.9299874653681,
          619.3487290428873,
          632.0103801659809,
          618.1315807489212,
          607.4767703265658,
          646.9075382158924,
          649.2823385920487,
          629.6266304072569,
          689.128876980162,
          661.7136732305545,
          686.7976483064631,
          657.875342108903,
          726.6330989187563,
          697.9373016610595,
          715.3859843675217,
          679.803684773775,
          675.8478165883798,
          686.8080647990822,
          698.2637940691121,
          686.2164442743397,
          693.5312102083258,
          671.9872897369967,
          677.4957568502331,
          621.3178766908795,
          614.0175877897482,
          636.9077071316075,
          631.8624392636656,
          641.156482166715,
          631.5483866791719,
          671.5318228414819,
          644.3568921537999,
          703.1191081387726,
          710.0784605667529,
          700.8923870859722,
          717.5697841410014,
          690.946861399195,
          703.7204949681769,
          729.6827791353656,
          741.1434829204803,
          758.8061725249797,
          760.9782660827964,
          685.8286333783007,
          679.8245563272208,
          679.1686427538937,
          685.8318282468562,
          657.0411653209769,
          689.6167806031374,
          669.4126713826469,
          658.5008654462617,
          679.6847566991894,
          684.4811656138953,
          640.0744782029934,
          697.1040666127282,
          669.422528082037,
          694.1906167430338,
          728.8795393544497,
          686.2173890209888,
          705.9766449835406,
          735.5011138839366,
          766.960392729875,
          745.8024394262555,
          717.1860880604199,
          751.7858913686229,
          731.6454784253507,
          764.7671196635134,
          752.5003472774594,
          728.1454977177301,
          726.4890621260813,
          716.9873451382801,
          708.6760753463557,
          714.9111766212609,
          671.0074904333023,
          666.2429232460349,
          680.699800140031,
          715.1562100360348,
          710.714221964388
        ]
      }],
      "configuration": {
        "num_samples": 50,
        "output_types": ["mean", "quantiles", "samples"],
        "quantiles": ["0.1", "0.9"]
      }
    };

    // Invoke SageMaker endpoint
    const response = await invokeEndpoint("SyntheticEndpoint", endpointData);

    let results = JSON.parse(Buffer.from(response.Body).toString('utf8'));
    let meanArray = results.predictions[0].mean;

    await storePredictions(meanArray);

  }
  catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};


//Calls endpoint and logs results
async function invokeEndpoint(name, data) {
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

//Stores predictions in dynamodb 
async function storePredictions(meanArray) {
  try {
    for (const priceUsd of meanArray) {
      const params = {
        TableName: 'SyntheticPredictions',
        Item: {
          'PriceUsd': { N: priceUsd.toString() }
        }
      };

      await dynamoClient.send(new PutItemCommand(params));
      console.log(`Item stored successfully: ${priceUsd}`);
    }
  }
  catch (error) {
    console.error('Error storing predictions:', error);
  }
}