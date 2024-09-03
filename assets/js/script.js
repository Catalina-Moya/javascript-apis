
const button = document.querySelector("#btn");
const resultElement = document.querySelector("#result");
const chartCanvas = document.querySelector("#chart");
let chart = null;

button.addEventListener('click', async () => {
    const amount = parseFloat(document.querySelector("#inputPesos").value);
    const selectedCurrency = document.querySelector("#monedaSelector").value;

    if (isNaN(amount) || amount <= 0) {
        resultElement.textContent = 'ingresa un monto.';
        return;
    }

    try {

        const response = await fetch('https://mindicador.cl/api');
        const data = await response.json();

        let exchangeRate;
        switch (selectedCurrency) {
            case 'Dolar':
                exchangeRate = data.dolar.valor;
                break;
            case 'Euro':
                exchangeRate = data.euro.valor;
                break;
            default:
                resultElement.textContent = 'Moneda no válida.';
                return;
        }

        const result = amount / exchangeRate;
        resultElement.textContent = result.toFixed(2) + ' ' + selectedCurrency;


        await displayHistoricalData(selectedCurrency);

    } catch (error) {
        resultElement.textContent = 'Error al obtener los datos.';
        console.error('Error:', error);
    }
});

async function displayHistoricalData(currency) {
    try {

        const response = await fetch(`https://mindicador.cl/api/${currency.toLowerCase()}`);
        const data = await response.json();


        if (!data.serie || data.serie.length === 0) {
            throw new Error('No hay datos históricos disponibles.');
        }


        const series = data.serie.slice(-10);


        const labels = series.map(entry => entry.fecha);
        const values = series.map(entry => entry.valor);


        if (chart) {
            chart.destroy();
        }


        const config = {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: `${currency.toUpperCase()} Historical Data`,
                    borderColor: "rgb(255, 99, 132)",
                    data: values,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return `Value: ${tooltipItem.raw}`;
                            }
                        }
                    }
                }
            }
        };

        const ctx = chartCanvas.getContext('2d');
        chart = new Chart(ctx, config);
    } catch (error) {
        console.error('Error al obtener datos históricos:', error);
    }
}
