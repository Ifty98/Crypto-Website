import { syntheticData } from './syntheticData.js';

// Define variables for data
let bitcoin, ethereum, solana, binanceCoin, tether, bitcoinPred, ethereumPred,
    solanaPred, binanceCoinPred, tetherPred, bitcoinSent, ethereumSent, solanaSent,
    binanceCoinSent, tetherSent, syntheticPred;

const selectElement1 = document.getElementById('cryptos');
const selectElement2 = document.getElementById('predictions');
const selectElement3 = document.getElementById('sent');

//Open connection
let connection = new WebSocket("wss://10e0k9xqti.execute-api.us-east-1.amazonaws.com/prod/");

//Log connected response
connection.onopen = function (event) {
    console.log("Connected: " + JSON.stringify(event));
    getAllData();
};

// Handle incoming messages
connection.onmessage = function (event) {
    let receivedData = JSON.parse(event.data);
    // Access the route name and data from the received object
    let routeName = receivedData.route;
    let data = receivedData.data;

        bitcoin = data.bitcoin;
        ethereum = data.ethereum;
        solana = data.solana;
        binanceCoin = data.binanceCoin;
        tether = data.tether;
        bitcoinPred = data.bitcoinPred;
        ethereumPred = data.ethereumPred;
        solanaPred = data.solanaPred;
        binanceCoinPred = data.binanceCoinPred;
        tetherPred = data.tetherPred;
        bitcoinSent = data.bitcoinSent;
        ethereumSent = data.ethereumSent;
        solanaSent = data.solanaSent;
        binanceCoinSent = data.binanceCoinSent;
        tetherSent = data.tetherSent;
        syntheticPred = data.syntheticPred;

        // Show crypto past data
        displayData("bitcoin");
        // Add event listener for the change event
        selectElement1.addEventListener('change', function (event) {
            // Get the selected value
            const selectedCrypto = event.target.value;

            // Call function with the selected value
            displayData(selectedCrypto);
        });

        // Show crypto predictions
        displayPredictions("bitcoin");
        // Add event listener for the change event
        selectElement2.addEventListener('change', function (event) {
            // Get the selected value
            const selectedCrypto = event.target.value;

            // Call function with the selected value
            displayPredictions(selectedCrypto);
        });

        // Show crypto sentiment analysis
        displaySent("bitcoin");
        // Add event listener for the change event
        selectElement3.addEventListener('change', function (event) {
            // Get the selected value
            const selectedCrypto = event.target.value;

            // Call function with the selected value
            displaySent(selectedCrypto);
        });

        // Display synthetic data and predictions
        displaySynthetic();
        displaySynthPred()
    
};

//Log errors
connection.onerror = function (error) {
    console.log("WebSocket Error: " + JSON.stringify(error));
};

// Request all the data to server
function getAllData() {
    //Create message to be sent to server
    let msgObject = {
        action: "getAllData",//Used for routing in API Gateway
        data: "Send data"
    };

    //Send message
    connection.send(JSON.stringify(msgObject));
}

// Function to display crypto data
function displayData(crypto) {
    let name;
    switch (crypto) {
        case 'bitcoin':
            name = bitcoin;
            break;
        case 'ethereum':
            name = ethereum;
            break;
        case 'binanceCoin':
            name = binanceCoin;
            break;
        case 'solana':
            name = solana;
            break;
        case 'tether':
            name = tether;
            break;
    }

    let time = name.map(item => item.timeStamp);
    let values = name.map(item => item.priceUsd);

    // Define trace for the plot
    var trace1 = {
        type: "scatter",
        mode: "lines",
        name: 'AAPL High',
        x: time,
        y: values,
        line: { color: '#00cec9' }
    }

    var data = [trace1];

    // Define layout for the plot
    var layout = {
        title: {
            text: 'Crypto Data Over Time',
            font: {
                color: '#ffffff',
                family: '"Lobster", sans-serif',
                size: 20,
            }
        },
        xaxis: {
            title: {
                text: 'Time (days)',
                font: {
                    color: '#ffffff',
                    family: '"Lobster", sans-serif',
                    size: 18,
                }
            },
            showticklabels: true,
            tickfont: {
                size: 14,
                color: 'white'
            },
        },
        yaxis: {
            title: {
                text: 'Price (USD)',
                font: {
                    color: '#ffffff',
                    family: '"Lobster", sans-serif',
                    size: 18,
                },
            },
            showticklabels: true,
            tickfont: {
                size: 14,
                color: 'white'
            },
        },
        paper_bgcolor: '#353b48',
        plot_bgcolor: '#353b48'
    };

    // Render the plot using Plotly
    Plotly.newPlot('normalData', data, layout);
}

// Function to display crypto data predictions
function displayPredictions(crypto) {
    let name;
    switch (crypto) {
        case 'bitcoin':
            name = bitcoinPred;
            break;
        case 'ethereum':
            name = ethereumPred;
            break;
        case 'binanceCoin':
            name = binanceCoinPred;
            break;
        case 'solana':
            name = solanaPred;
            break;
        case 'tether':
            name = tetherPred;
            break;
    }

    let values = name;
    let time = [];

    for (let i = 0; i < values.length; i++) {
        time.push(i);
    }

    var trace1 = {
        type: "bar",
        name: 'AAPL High',
        x: time,
        y: values,
        line: { color: '#0c7feb' }
    }


    var data = [trace1];

    var layout = {
        title: {
            text: 'Predictions Over Upcoming Days',
            font: {
                color: '#ffffff',
                family: '"Lobster", sans-serif',
                size: 25,
            }
        },
        xaxis: {
            title: {
                text: 'Time (days)',
                font: {
                    color: '#ffffff',
                    family: '"Lobster", sans-serif',
                    size: 18,
                }
            },
            showticklabels: true,
            tickfont: {
                size: 14,
                color: 'white'
            },
        },
        yaxis: {
            title: {
                text: 'Price (USD)',
                font: {
                    color: '#ffffff',
                    family: '"Lobster", sans-serif',
                    size: 18,
                },
            },
            showticklabels: true,
            tickfont: {
                size: 14,
                color: 'white'
            },
        },
        paper_bgcolor: '#353b48',
        plot_bgcolor: '#353b48',
        barcornerradius: 15,
    };

    Plotly.newPlot('predictionsData', data, layout);
}

// Function to count the numbers of positive, negative and neutral messages from the sentiment analysis
function countSentimentValues(sentiments) {
    let countPos = 0;
    let countNeg = 0;
    let countNeutral = 0;

    sentiments.forEach(sentiment => {
        if (sentiment === 'pos') {
            countPos++;
        } else if (sentiment === 'neg') {
            countNeg++;
        } else if (sentiment === 'neutral') {
            countNeutral++;
        }
    });

    return [countPos, countNeg, countNeutral];
}

// Function to display sentiment data
function displaySent(crypto) {
    let name;
    switch (crypto) {
        case 'bitcoin':
            name = countSentimentValues(bitcoinSent);
            break;
        case 'ethereum':
            name = countSentimentValues(ethereumSent);
            break;
        case 'binanceCoin':
            name = countSentimentValues(binanceCoinSent);
            break;
        case 'solana':
            name = countSentimentValues(solanaSent);
            break;
        case 'tether':
            name = countSentimentValues(tetherSent);
            break;
    }

    var data = [{
        type: "pie",
        values: name,
        labels: ["Positive", "Negative", "Neutral"],
        textinfo: "label+percent",
        insidetextorientation: "radial",
    }];

    var layout = {
        paper_bgcolor: '#2d3436',
        title: {
            text: 'Sentiment Analysis',
            font: {
                color: '#ffffff',
                family: '"Lobster", sans-serif',
                size: 25,
            }
        },
        font: {
            color: '#ffffff',
        }
    };

    Plotly.newPlot('sentData', data, layout);
}

// Display synthetic data
function displaySynthetic() {
    let values = syntheticData;
    let time = [];

    // Generate time values for x-axis
    for (let i = 0; i < values.length; i++) {
        time.push(i);
    }

    var options = {
        series: [{
            name: 'Sales',
            data: values
        }],
        chart: {
            type: 'line',
        },
        forecastDataPoints: {
            count: 7
        },
        stroke: {
            width: 5,
            curve: 'smooth'
        },
        xaxis: {
            categories: time,
            tickAmount: 10,
            labels: {
                style: {
                    colors: '#00a8ff'
                }
            }
        },
        title: {
            text: 'Synthetic Data',
            align: 'left',
            style: {
                fontSize: "16px",
                color: '#00a8ff'
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                gradientToColors: ['#FDD835'],
                shadeIntensity: 1,
                type: 'horizontal',
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100, 100, 100]
            },
        },
        yaxis: {
            min: 150,
            max: 850,
            labels: {
                formatter: function (value) {
                    return Math.floor(value);
                },
                style: {
                    colors: '#00a8ff'
                }
            }
        }
    };

    var chart = new ApexCharts(document.querySelector("#syntheticData"), options);
    chart.render();
}

// Display synthetic predictions
function displaySynthPred() {
    let values = syntheticPred;
    let time = [];

    // Generate time values for x-axis
    for (let i = 0; i < values.length; i++) {
        time.push(i);
    }

    var options = {
        series: [{
            name: 'series1',
            data: values
        }],
        title: {
            text: 'Synthetic Data Predictions',
            align: 'left',
            style: {
                fontSize: "16px",
                color: '#00a8ff'
            }
        },
        chart: {
            height: 350,
            type: 'area'
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            categories: time
        },
        yaxis: {
            min: 600,
            max: 850,
            labels: {
                formatter: function (value) {
                    return Math.floor(value);
                },
                style: {
                    colors: '#00a8ff'
                }
            }
        }
    };

    var chart = new ApexCharts(document.querySelector("#syntheticPred"), options);
    chart.render();
}

