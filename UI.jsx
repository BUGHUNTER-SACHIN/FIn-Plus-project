// import React, { useState, useEffect } from "react";
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// // ====== Configure ======
// const DEFAULT_CRYPTOS = ["bitcoin", "ethereum", "ripple"]; // coin ids for CoinGecko
// const DEFAULT_STOCK = "AAPL"; // default stock symbol
// const STOCK_API_KEY = "YOUR_ALPHA_VANTAGE_KEY_HERE"; // <-- replace with your key

// export default function App() {
//   // Crypto state
//   const [cryptoPrices, setCryptoPrices] = useState(null);
//   const [selectedCrypto, setSelectedCrypto] = useState(DEFAULT_CRYPTOS[0]);
//   const [cryptoHistory, setCryptoHistory] = useState(null);
//   const [loadingCrypto, setLoadingCrypto] = useState(false);
//   const [cryptoError, setCryptoError] = useState(null);

//   // Stock state
//   const [stockSymbol, setStockSymbol] = useState(DEFAULT_STOCK);
//   const [stockQuote, setStockQuote] = useState(null);
//   const [stockHistory, setStockHistory] = useState(null);
//   const [loadingStock, setLoadingStock] = useState(false);
//   const [stockError, setStockError] = useState(null);

//   // Fetch simple prices for default crypto list
//   useEffect(() => {
//     async function fetchCryptoPrices() {
//       setLoadingCrypto(true);
//       setCryptoError(null);
//       try {
//         const ids = DEFAULT_CRYPTOS.join(%22,%22);
//         const url = https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true;
//         const res = await fetch(url);
//         const data = await res.json();
//         setCryptoPrices(data);
//       } catch (e) {
//         setCryptoError("Failed to load crypto prices");
//       } finally {
//         setLoadingCrypto(false);
//       }
//     }
//     fetchCryptoPrices();
//   }, []);

//   // Fetch crypto history for selectedCrypto (last 7 days)
//   useEffect(() => {
//     async function fetchCryptoHistory() {
//       setCryptoHistory(null);
//       setCryptoError(null);
//       setLoadingCrypto(true);
//       try {
//         const url = https://api.coingecko.com/api/v3/coins/${selectedCrypto}/market_chart?vs_currency=usd&days=7;
//         const res = await fetch(url);
//         const data = await res.json();
//         // data.prices is [[timestamp, price], ...]
//         setCryptoHistory(data.prices || null);
//       } catch (e) {
//         setCryptoError("Failed to load crypto history");
//       } finally {
//         setLoadingCrypto(false);
//       }
//     }
//     fetchCryptoHistory();
//   }, [selectedCrypto]);

//   // Fetch stock quote + history
//   async function fetchStockData(symbol) {
//     setLoadingStock(true);
//     setStockError(null);
//     setStockQuote(null);
//     setStockHistory(null);
//     try {
//       if (!STOCK_API_KEY || STOCK_API_KEY === "YOUR_ALPHA_VANTAGE_KEY_HERE") {
//         setStockError("Please add your Alpha Vantage API key in the code (STOCK_API_KEY)");
//         setLoadingStock(false);
//         return;
//       }
//       // Quote (latest price)
//       const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
//         symbol
//       )}&apikey=${STOCK_API_KEY}`;
//       const qres = await fetch(quoteUrl);
//       const qdata = await qres.json();
//       const quote = qdata["Global Quote"] || null;
//       setStockQuote(quote);

//       // Daily history (last 30 days)
//       const histUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(
//         symbol
//       )}&outputsize=compact&apikey=${STOCK_API_KEY}`;
//       const hres = await fetch(histUrl);
//       const hdata = await hres.json();
//       const series = hdata["Time Series (Daily)"] || null;
//       if (series) {
//         // convert to array sorted by date asc
//         const arr = Object.keys(series)
//           .slice(0, 60) // take recent up to 60 days, we will reverse later
//           .map((date) => ({ date, close: parseFloat(series[date]["4. close"]) }))
//           .reverse();
//         setStockHistory(arr);
//       }
//     } catch (e) {
//       setStockError("Failed to load stock data");
//     } finally {
//       setLoadingStock(false);
//     }
//   }

//   // Helper: prepare chart data for crypto or stock history
//   function prepareChartData(pricesArray, label) {
//     if (!pricesArray) return null;
//     const labels = pricesArray.map((p) => {
//       const t = p[0];
//       const d = new Date(t);
//       return ${d.getMonth() + 1}/${d.getDate()};
//     });
//     const data = pricesArray.map((p) => p[1]);
//     return {
//       labels,
//       datasets: [
//         {
//           label,
//           data,
//           tension: 0.3,
//           pointRadius: 2,
//         },
//       ],
//     };
//   }

//   function prepareStockChartData(historyArr, label) {
//     if (!historyArr) return null;
//     const labels = historyArr.map((p) => p.date);
//     const data = historyArr.map((p) => p.close);
//     return {
//       labels,
//       datasets: [
//         {
//           label,
//           data,
//           tension: 0.3,
//           pointRadius: 2,
//         },
//       ],
//     };
//   }

//   return (
//     <div className="min-h-screen p-6 bg-gradient-to-b from-slate-100 to-white">
//       <div className="max-w-4xl mx-auto">
//         <header className="mb-6">
//           <h1 className="text-2xl font-bold">Crypto + Stock Dashboard (Easy)</h1>
//           <p className="text-sm text-slate-600">Simple frontend to view crypto and stock prices.</p>
//         </header>

//         {/* Crypto section */}
//         <section className="bg-white rounded-lg shadow p-4 mb-6">
//           <h2 className="font-semibold">Cryptocurrencies</h2>
//           {loadingCrypto && <p className="text-sm">Loading crypto data...</p>}
//           {cryptoError && <p className="text-red-600">{cryptoError}</p>}

//           <div className="flex gap-4 mt-3 flex-wrap">
//             {cryptoPrices && DEFAULT_CRYPTOS.map((id) => {
//               const info = cryptoPrices[id];
//               if (!info) return null;
//               const price = info.usd;
//               const change = info.usd_24h_change;
//               return (
//                 <div key={id} className="border rounded p-3 w-48">
//                   <div className="font-medium capitalize">{id}</div>
//                   <div className="text-lg">${price?.toLocaleString(undefined, {maximumFractionDigits:2})}</div>
//                   <div className={text-sm ${change >=0 ? 'text-green-600' : 'text-red-600'}}>
//                     {change >=0 ? '+' : ''}{change?.toFixed(2)}% (24h)
//                   </div>
//                   <button
//                     onClick={() => setSelectedCrypto(id)}
//                     className="mt-2 px-2 py-1 text-sm rounded bg-slate-100"
//                   >
//                     View 7-day chart
//                   </button>
//                 </div>
//               );
//             })}
//           </div>

//           <div className="mt-4">
//             <label className="text-sm">Selected crypto:</label>
//             <select
//               value={selectedCrypto}
//               onChange={(e) => setSelectedCrypto(e.target.value)}
//               className="ml-2 border rounded p-1"
//             >
//               {DEFAULT_CRYPTOS.map((c) => (
//                 <option key={c} value={c}>{c}</option>
//               ))}
//             </select>
//           </div>

//           <div className="mt-4">
//             {cryptoHistory ? (
//               <div>
//                 <h3 className="text-sm font-medium">{selectedCrypto} — last 7 days</h3>
//                 <Line data={prepareChartData(cryptoHistory, ${selectedCrypto} price (USD))} />
//               </div>
//             ) : (
//               <p className="text-sm text-slate-500">Chart will appear when history loads.</p>
//             )}
//           </div>
//         </section>

//         {/* Stock section */}
//         <section className="bg-white rounded-lg shadow p-4">
//           <h2 className="font-semibold">Stocks</h2>
//           <p className="text-sm text-slate-600">Enter a stock symbol (e.g. AAPL, MSFT, GOOGL).</p>

//           <div className="mt-3 flex gap-2">
//             <input
//               value={stockSymbol}
//               onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
//               className="border rounded p-2"
//             />
//             <button
//               onClick={() => fetchStockData(stockSymbol)}
//               className="px-3 py-2 rounded bg-slate-200"
//             >
//               Fetch
//             </button>
//           </div>

//           {loadingStock && <p className="text-sm">Loading stock data...</p>}
//           {stockError && <p className="text-red-600">{stockError}</p>}

//           {stockQuote && (
//             <div className="mt-3 border p-3 rounded">
//               <div className="font-medium">{stockSymbol} — latest</div>
//               <div>Price: ${parseFloat(stockQuote["05. price"]).toFixed(2)}</div>
//               <div>Change: {stockQuote["10. change percent"]}</div>
//             </div>
//           )}

//           <div className="mt-4">
//             {stockHistory ? (
//               <div>
//                 <h3 className="text-sm font-medium">{stockSymbol} — recent</h3>
//                 <Line data={prepareStockChartData(stockHistory, ${stockSymbol} close)} />
//               </div>
//             ) : (
//               <p className="text-sm text-slate-500">Stock chart will appear after you fetch data (needs your Alpha Vantage key).</p>
//             )}
//           </div>
//         </section>

//         <foote         



import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ====== CONFIG ======
const DEFAULT_CRYPTOS = ["bitcoin", "ethereum", "ripple"];
const DEFAULT_STOCK = "AAPL";
const STOCK_API_KEY = "YOUR_ALPHA_VANTAGE_KEY_HERE"; // ADD YOUR KEY

export default function App() {
  // Crypto state
  const [cryptoPrices, setCryptoPrices] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState(DEFAULT_CRYPTOS[0]);
  const [cryptoHistory, setCryptoHistory] = useState(null);
  const [loadingCrypto, setLoadingCrypto] = useState(false);
  const [cryptoError, setCryptoError] = useState(null);

  // Stock state
  const [stockSymbol, setStockSymbol] = useState(DEFAULT_STOCK);
  const [stockQuote, setStockQuote] = useState(null);
  const [stockHistory, setStockHistory] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [stockError, setStockError] = useState(null);

  // ========== Fetch crypto list prices ========== //
  useEffect(() => {
    async function fetchCryptoPrices() {
      setLoadingCrypto(true);
      setCryptoError(null);
      try {
        const ids = DEFAULT_CRYPTOS.join(",");
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

        const res = await fetch(url);
        const data = await res.json();
        setCryptoPrices(data);
      } catch (e) {
        setCryptoError("Failed to load crypto prices");
      } finally {
        setLoadingCrypto(false);
      }
    }
    fetchCryptoPrices();
  }, []);

  // ========== Fetch crypto history ========== //
  useEffect(() => {
    async function fetchCryptoHistory() {
      setCryptoHistory(null);
      setCryptoError(null);
      setLoadingCrypto(true);

      try {
        const url = `https://api.coingecko.com/api/v3/coins/${selectedCrypto}/market_chart?vs_currency=usd&days=7`;

        const res = await fetch(url);
        const data = await res.json();
        setCryptoHistory(data.prices || null);
      } catch (e) {
        setCryptoError("Failed to load crypto history");
      } finally {
        setLoadingCrypto(false);
      }
    }

    fetchCryptoHistory();
  }, [selectedCrypto]);

  // ========== Fetch Stock Data ========== //
  async function fetchStockData(symbol) {
    setLoadingStock(true);
    setStockError(null);
    setStockQuote(null);
    setStockHistory(null);

    try {
      if (!STOCK_API_KEY || STOCK_API_KEY === "YOUR_ALPHA_VANTAGE_KEY_HERE") {
        setStockError("Add your Alpha Vantage API key (STOCK_API_KEY).");
        setLoadingStock(false);
        return;
      }

      // Quote
      const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${STOCK_API_KEY}`;
      const qres = await fetch(quoteUrl);
      const qdata = await qres.json();
      setStockQuote(qdata["Global Quote"] || null);

      // History
      const histUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${STOCK_API_KEY}`;
      const hres = await fetch(histUrl);
      const hdata = await hres.json();
      const series = hdata["Time Series (Daily)"];

      if (series) {
        const arr = Object.keys(series)
          .slice(0, 60)
          .map((date) => ({
            date,
            close: parseFloat(series[date]["4. close"]),
          }))
          .reverse();

        setStockHistory(arr);
      }
    } catch (e) {
      setStockError("Failed to load stock data");
    } finally {
      setLoadingStock(false);
    }
  }

  // ========== Chart Helpers ========== //
  function prepareCryptoChart(data, label) {
    if (!data) return null;

    return {
      labels: data.map((p) => {
        const d = new Date(p[0]);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }),
      datasets: [
        {
          label,
          data: data.map((p) => p[1]),
          tension: 0.3,
          pointRadius: 2,
          borderColor: "blue",
        },
      ],
    };
  }

  function prepareStockChart(data, label) {
    if (!data) return null;

    return {
      labels: data.map((p) => p.date),
      datasets: [
        {
          label,
          data: data.map((p) => p.close),
          tension: 0.3,
          pointRadius: 2,
          borderColor: "green",
        },
      ],
    };
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-slate-100 to-white">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Crypto + Stock Dashboard</h1>
          <p className="text-sm text-slate-600">
            Simple dashboard to view cryptocurrency and stock prices.
          </p>
        </header>

        {/* ========== CRYPTO SECTION ========== */}
        <section className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-semibold">Cryptocurrencies</h2>

          {loadingCrypto && <p>Loading crypto data…</p>}
          {cryptoError && <p className="text-red-600">{cryptoError}</p>}

          {/* Crypto boxes */}
          <div className="flex gap-4 mt-3 flex-wrap">
            {cryptoPrices &&
              DEFAULT_CRYPTOS.map((id) => {
                const info = cryptoPrices[id];
                if (!info) return null;

                const price = info.usd;
                const change = info.usd_24h_change;

                return (
                  <div key={id} className="border rounded p-3 w-48">
                    <div className="font-medium capitalize">{id}</div>
                    <div className="text-lg">
                      ${price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div
                      className={`text-sm ${
                        change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {change >= 0 ? "+" : ""}
                      {change?.toFixed(2)}% (24h)
                    </div>

                    <button
                      onClick={() => setSelectedCrypto(id)}
                      className="mt-2 px-2 py-1 text-sm rounded bg-slate-100"
                    >
                      View 7-day chart
                    </button>
                  </div>
                );
              })}
          </div>

          {/* Selected crypto dropdown */}
          <div className="mt-4">
            <label className="text-sm">Selected crypto: </label>
            <select
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value)}
              className="border ml-2 p-1 rounded"
            >
              {DEFAULT_CRYPTOS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Crypto Chart */}
          <div className="mt-4">
            {cryptoHistory ? (
              <Line
                data={prepareCryptoChart(
                  cryptoHistory,
                  `${selectedCrypto} price (USD)`
                )}
              />
            ) : (
              <p className="text-sm text-slate-500">
                Chart will appear when history loads.
              </p>
            )}
          </div>
        </section>

        {/* ========== STOCK SECTION ========== */}
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold">Stocks</h2>
          <p className="text-sm text-slate-600">Enter a symbol (AAPL, MSFT, GOOGL…)</p>

          <div className="mt-3 flex gap-2">
            <input
              value={stockSymbol}
              onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
              className="border p-2 rounded"
            />

            <button
              onClick={() => fetchStockData(stockSymbol)}
              className="px-3 py-2 bg-slate-200 rounded"
            >
              Fetch
            </button>
          </div>

          {loadingStock && <p>Loading stock…</p>}
          {stockError && <p className="text-red-600">{stockError}</p>}

          {/* Latest Quote */}
          {stockQuote && (
            <div className="border p-3 rounded mt-3">
              <div className="font-medium">{stockSymbol} — latest</div>
              <div>Price: ${parseFloat(stockQuote["05. price"]).toFixed(2)}</div>
              <div>Change: {stockQuote["10. change percent"]}</div>
            </div>
          )}

          {/* Stock Chart */}
          <div className="mt-4">
            {stockHistory ? (
              <Line
                data={prepareStockChart(stockHistory, `${stockSymbol} closing price`)}
              />
            ) : (
              <p className="text-sm text-slate-500">
                Fetch stock data to view the chart.
              </p>
            )}
          </div>
        </section>

        <footer className="text-sm text-slate-500 mt-6">
          Need more features? Ask me!
        </footer>
      </div>
    </div>
  );
}
