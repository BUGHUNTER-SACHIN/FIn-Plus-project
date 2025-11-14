import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInAnonymously, 
    signInWithCustomToken 
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    onSnapshot, 
    collection, 
    addDoc,
    deleteDoc
} from 'firebase/firestore';
import { Chart, registerables } from 'chart.js/auto';
// --- FIX 1: Added date adapter for time-scale charts ---
// You must install this: npm install chartjs-adapter-date-fns date-fns
import 'chartjs-adapter-date-fns';

// --- Icon Components (inline SVGs) ---
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-user"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="4"/><path d="M12 21.7C17.3 17 20 13 20 10A8 8 0 1 0 4 10c0 3 2.7 7 8 11.7Z"/></svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const StarIcon = ({ filled, onClick }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill={filled ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="lucide lucide-star cursor-pointer"
        onClick={onClick}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-down"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
);

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const LineChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-list"><rect width="7" height="18" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
);

const GridIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
);

const NewspaperIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-newspaper"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h0a2 2 0 0 1 2 2v9Z"/><path d="M18 22h-8v-9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9Z"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
);

// --- Firebase Configuration ---
// This configuration is provided by the environment.
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : { apiKey: "YOUR_FALLBACK_API_KEY", authDomain: "...", projectId: "..." };

// This App ID is provided by the environment.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'finpulse-default';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- API Configuration ---
// --- FIX 2: Emptied API keys for security. ---
// The app will now use mock data, as intended by the fallback logic.
// DO NOT paste sensitive keys here. Use a backend or environment variables.
const COINGECKO_API_KEY = ""; // CoinGecko API Key
const GEMINI_API_KEY = ""; // <-- Leave blank, will be handled by environment
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

// --- Mock API Data ---
// Used as a fallback if API calls fail or are not set up
const makeSeries = (baseValue, step, jitter=1) => {
  const arr = [];
  const now = Date.now();
  for (let i = 0; i < 90; i++) {
    const ts = now - (90 - i) * 24 * 60 * 60 * 1000;
    const value = +(baseValue + i * step + (Math.random() - 0.5) * jitter).toFixed(8);
    arr.push([ts, value]);
  }
  return arr;
};

const mockMarketData = [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 65000, price_change_percentage_24h: 2.5, market_cap: 1300000000000, total_volume: 30000000000 },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 3500, price_change_percentage_24h: -1.2, market_cap: 420000000000, total_volume: 15000000000 },
    { id: 'apple', symbol: 'aapl', name: 'Apple Inc.', image: 'https://placehold.co/64x64/f0f0f0/333333?text=AAPL', current_price: 210.50, price_change_percentage_24h: 0.8, market_cap: 3200000000000, total_volume: 25000000, isStock: true },
    { id: 'tesla', symbol: 'tsla', name: 'Tesla Inc.', image: 'https://placehold.co/64x64/f0f0f0/333333?text=TSLA', current_price: 180.20, price_change_percentage_24h: -0.4, market_cap: 580000000000, total_volume: 35000000, isStock: true },
    { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 150.75, price_change_percentage_24h: 5.1, market_cap: 67000000000, total_volume: 2000000000 },
    { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', current_price: 0.15, price_change_percentage_24h: -3.0, market_cap: 21000000000, total_volume: 800000000 },
];

const mockHistoricalData = {
  bitcoin: makeSeries(60000, 50, 1000),
  ethereum: makeSeries(3000, 5, 500),
  apple: makeSeries(180, 0.3, 20),
  tesla: makeSeries(160, 0.2, 30),
  solana: makeSeries(100, 0.5, 15),
  dogecoin: makeSeries(0.12, 0.0003, 0.05),
};

// --- Helper Functions ---
const formatCurrency = (number) => {
    if (typeof number !== 'number') return number;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(number);
};

const formatLargeNumber = (number) => {
    if (typeof number !== 'number') return String(number);
    if (number >= 1_000_000_000_000) {
        return `${(number / 1_000_000_000_000).toFixed(2)} T`;
    }
    if (number >= 1_000_000_000) {
        return `${(number / 1_000_000_000).toFixed(2)} B`;
    }
    if (number >= 1_000_000) {
        return `${(number / 1_000_000).toFixed(2)} M`;
    }
    return number.toLocaleString();
};

const calculateSMA = (data, period) => {
    if (!Array.isArray(data)) return [];
    let sma = [];
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val[1], 0);
        sma.push([data[i][0], sum / period]);
    }
    return sma;
};

// --- React Components ---
const App = () => {
    const [darkMode, setDarkMode] = useState(true);
    const [view, setView] = useState('dashboard'); // 'dashboard' or 'asset_detail'
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [marketData, setMarketData] = useState(mockMarketData);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null); // For alerts
    const [userId, setUserId] = useState(null);
    // --- FIX 3: Corrected comment for clarity ---
    const [portfolio, setPortfolio] = useState([]); // List of asset objects from Firestore
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Toggle dark mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // --- Firebase Auth & Data ---
    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                if (token) {
                    await signInWithCustomToken(auth, token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase Auth Error:", error);
                setMessage({ type: 'error', text: 'Authentication failed. Please refresh.' });
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
            setIsAuthReady(true);
        });

        initAuth();
        return () => unsubscribe();
    }, []);

    // Effect to fetch/subscribe to portfolio data AFTER auth is ready
    useEffect(() => {
        if (!isAuthReady || !userId) return;

        const portfolioCollectionPath = `/artifacts/${appId}/users/${userId}/portfolio`;
        const portfolioCollection = collection(db, portfolioCollectionPath);

        const unsubscribe = onSnapshot(portfolioCollection, (snapshot) => {
            const userPortfolio = snapshot.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
            setPortfolio(userPortfolio);
        }, (error) => {
            console.error("Firestore Snapshot Error:", error);
            setMessage({ type: 'error', text: 'Could not load portfolio.' });
        });

        return () => unsubscribe();

    }, [isAuthReady, userId]);

    const handleTogglePortfolio = async (asset) => {
        if (!userId) {
            setMessage({ type: 'error', text: 'Please log in to manage your portfolio.' });
            return;
        }

        const portfolioPath = `/artifacts/${appId}/users/${userId}/portfolio`;
        const assetInPortfolio = portfolio.find(p => p.id === asset.id);

        try {
            if (assetInPortfolio) {
                // Remove from portfolio
                const docRef = doc(db, portfolioPath, assetInPortfolio.firestoreId);
                await deleteDoc(docRef);
                setMessage({ type: 'success', text: `${asset.name} removed from portfolio.` });
            } else {
                // Add to portfolio
                const { id, name, symbol, image, isStock } = asset;
                await addDoc(collection(db, portfolioPath), {
                    id,
                    name,
                    symbol,
                    image,
                    isStock: !!isStock
                });
                setMessage({ type: 'success', text: `${asset.name} added to portfolio.` });
            }
        } catch (error) {
            console.error("Portfolio update error:", error);
            setMessage({ type: 'error', text: 'Failed to update portfolio.' });
        }
    };

    // --- Data Fetching ---
    useEffect(() => {
        const fetchMarketData = async () => {
            setLoading(true);
            try {
                // --- NOTE: Real API calls commented out as keys are (correctly) empty. ---
                // The app will now use mock data by default.
                
                // --- REAL API CALL (CRYPTO) ---
                // if (COINGECKO_API_KEY) {
                //     const cryptoUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&api_key=${COINGECKO_API_KEY}`;
                //     const cryptoRes = await fetch(cryptoUrl);
                //     const cryptoData = await cryptoRes.json();
                //     // ... combine with stock data
                // } else {
                //     setMarketData(mockMarketData);
                // }

                // For this demo, we use mock data
                setMarketData(mockMarketData);
            } catch (error) {
                console.error("Failed to fetch market data:", error);
                setMessage({ type: 'error', text: 'Failed to load market data.' });
                setMarketData(mockMarketData); // Fallback
            }
            setLoading(false);
        };

        fetchMarketData();
    }, []);

    const handleSelectAsset = (asset) => {
        setSelectedAsset(asset);
        setView('asset_detail');
    };

    const handleViewDashboard = () => {
        setSelectedAsset(null);
        setView('dashboard');
    };

    const portfolioAssetIds = useMemo(() => new Set(portfolio.map(p => p.id)), [portfolio]);

    return (
        <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 font-inter`}>
            <Header darkMode={darkMode} setDarkMode={setDarkMode} userId={userId} />
            <Ticker marketData={marketData} onSelectAsset={handleSelectAsset} />

            {message && (
                <MessageBox 
                    type={message.type} 
                    text={message.text} 
                    onDismiss={() => setMessage(null)} 
                />
            )}

            <main className="container mx-auto p-4 lg:p-6 max-w-7xl">
                {view === 'dashboard' && (
                    <Dashboard 
                        marketData={marketData} 
                        portfolio={portfolio}
                        portfolioAssetIds={portfolioAssetIds}
                        onSelectAsset={handleSelectAsset}
                        onTogglePortfolio={handleTogglePortfolio}
                        loading={loading}
                    />
                )}
                {view === 'asset_detail' && selectedAsset && (
                    <AssetDetail 
                        asset={selectedAsset} 
                        onBack={handleViewDashboard} 
                        onTogglePortfolio={handleTogglePortfolio}
                        isinPortfolio={portfolioAssetIds.has(selectedAsset.id)}
                    />
                )}
            </main>
        </div>
    );
};

// --- Header Component ---
const Header = ({ darkMode, setDarkMode, userId }) => {
    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <nav className="container mx-auto p-4 flex justify-between items-center max-w-7xl">
                <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                        FinPulse
                    </div>
                    {/* Optional: User ID display for multi-user context */}
                    {/* {userId && <span className="text-xs text-gray-400 hidden md:block">{userId}</span>} */}
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {darkMode ? <SunIcon /> : <MoonIcon />}
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm font-medium">
                        <span>USD</span>
                        <ChevronDownIcon />
                    </button>
                    <button className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                        <UserIcon />
                        <span>{userId ? 'Account' : 'Login'}</span>
                    </button>
                </div>
            </nav>
        </header>
    );
};

// --- Ticker Component ---
const Ticker = ({ marketData, onSelectAsset }) => {
    const tickerItems = marketData.slice(0, 10); // Show top 10

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="w-full flex animate-ticker">
                {tickerItems.concat(tickerItems).map((item, index) => (
                    <div 
                        key={`${item.id}-${index}`}
                        onClick={() => onSelectAsset(item)}
                        className="flex items-center space-x-2 px-4 py-2 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <img src={item.image} alt={item.name} className="w-5 h-5 rounded-full" />
                        <span className="font-medium text-sm">{item.symbol.toUpperCase()}</span>
                        <span className={`text-sm ${item.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {item.price_change_percentage_24h.toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
            {/* CSS for animation */}
            <style>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-ticker {
                    animation: ticker 40s linear infinite;
                }
            `}</style>
        </div>
    );
};

// --- Dashboard Component ---
const Dashboard = ({ marketData, portfolio, portfolioAssetIds, onSelectAsset, onTogglePortfolio, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'heatmap', 'news'

    const filteredData = useMemo(() => {
        return marketData.filter(asset => 
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [marketData, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-1/2 lg:w-1/3">
                        <input
                            type="text"
                            placeholder="Search Crypto or Stock..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-blue-500 focus:ring-0"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
                    </div>
    
                    <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
                        <TabButton icon={<LineChartIcon />} isActive={activeTab === 'list'} onClick={() => setActiveTab('list')} />
                        <TabButton icon={<GridIcon />} isActive={activeTab === 'heatmap'} onClick={() => setActiveTab('heatmap')} />
                        <TabButton icon={<NewspaperIcon />} isActive={activeTab === 'news'} onClick={() => setActiveTab('news')} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    {activeTab === 'list' && (
                        <MarketList 
                            assets={filteredData} 
                            portfolioAssetIds={portfolioAssetIds}
                            onSelectAsset={onSelectAsset}
                            onTogglePortfolio={onTogglePortfolio}
                            loading={loading}
                        />
                    )}
                    {activeTab === 'heatmap' && <Heatmap assets={filteredData} onSelectAsset={onSelectAsset} />}
                    {activeTab === 'news' && <NewsFeed />}
                </div>

                <div className="lg:col-span-1">
                    <Portfolio portfolio={portfolio} marketData={marketData} onSelectAsset={onSelectAsset} />
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded ${
            isActive 
                ? 'bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
    >
        {icon}
    </button>
);

// --- MarketList Component ---
const MarketList = ({ assets, portfolioAssetIds, onSelectAsset, onTogglePortfolio, loading }) => {
    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
            <table className="w-full min-w-max">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400"></th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Name</th>
                        <th className="p-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Price</th>
                        <th className="p-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400">24h %</th>
                        <th className="p-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Market Cap</th>
                        <th className="p-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400"></th>
                    </tr>
                </thead>
                <tbody>
                    {assets.map((asset, index) => (
                        <tr 
                            key={asset.id} 
                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                        >
                            <td className="p-4">
                                <StarIcon 
                                    filled={portfolioAssetIds.has(asset.id)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTogglePortfolio(asset);
                                    }}
                                />
                            </td>
                            <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                            <td 
                                className="p-4 flex items-center space-x-3 cursor-pointer"
                                onClick={() => onSelectAsset(asset)}
                            >
                                <img src={asset.image} alt={asset.name} className="w-8 h-8 rounded-full" />
                                <div>
                                    <div className="font-medium">{asset.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{asset.symbol.toUpperCase()}</div>
                                </div>
                            </td>
                            <td 
                                className="p-4 text-right font-medium"
                                onClick={() => onSelectAsset(asset)}
                            >
                                {formatCurrency(asset.current_price)}
                            </td>
                            <td 
                                className={`p-4 text-right font-medium ${asset.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
                                onClick={() => onSelectAsset(asset)}
                            >
                                {asset.price_change_percentage_24h.toFixed(2)}%
                            </td>
                            <td 
                                className="p-4 text-right text-sm text-gray-500 dark:text-gray-400"
                                onClick={() => onSelectAsset(asset)}
                            >
                                {formatLargeNumber(asset.market_cap)}
                            </td>
                            <td className="p-4 text-right">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTogglePortfolio(asset);
                                    }}
                                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                                        portfolioAssetIds.has(asset.id) 
                                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {portfolioAssetIds.has(asset.id) ? 'Added' : 'Add'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Heatmap Component ---
const Heatmap = ({ assets, onSelectAsset }) => {
    // Normalize percentages for better color scaling (e.g., clamp between -10% and +10%)
    const getIntensity = (perc) => {
        const clampedPerc = Math.max(-10, Math.min(10, perc)) / 10; // -1 to 1
        return clampedPerc;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Market Heatmap</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {assets.map(asset => {
                    const intensity = getIntensity(asset.price_change_percentage_24h);
                    const isPositive = intensity >= 0;
                    const opacity = Math.abs(intensity) * 0.8 + 0.2; // 0.2 to 1.0
                    const color = isPositive 
                        ? `rgba(16, 185, 129, ${opacity})` // Green
                        : `rgba(239, 68, 68, ${opacity})`; // Red

                    return (
                        <div
                            key={asset.id}
                            onClick={() => onSelectAsset(asset)}
                            style={{ backgroundColor: color }}
                            className="flex flex-col items-center justify-center p-2 rounded-md aspect-square cursor-pointer transition-transform duration-200 hover:scale-105"
                        >
                            <div className="text-sm font-bold text-white text-center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                {asset.symbol.toUpperCase()}
                            </div>
                            <div className="text-xs font-medium text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                {asset.price_change_percentage_24h.toFixed(1)}%
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- NewsFeed Component ---
const NewsFeed = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            const systemPrompt = "Act as a financial news aggregator. Provide exactly 5 recent, summarized headlines for the stock and crypto markets. Each headline must be concise (max 15 words) and followed by a one-sentence summary. Do not include preambles, just the headlines and summaries.";
            const userQuery = "Get the latest 5 headlines for crypto and stock markets, mixing both.";

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                tools: [{ "google_search": {} }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
            };

            try {
                // --- FIX 2 (from above) makes this check work correctly ---
                if (!GEMINI_API_KEY) {
                    // No key configured — use fallback
                    setNews([
                        { title: "Fallback: Market Sees Volatility", summary: "Stocks and crypto experience mixed trading sessions amidst economic uncertainty.", source: "FinPulse News" },
                        { title: "Fallback: Bitcoin Hovers at $65k", summary: "The leading cryptocurrency finds support after a recent dip.", source: "FinPulse News" }
                    ]);
                    setLoading(false);
                    return;
                }

                const response = await fetch(GEMINI_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`Gemini API error: ${response.statusText}`);
                }

                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

                if (text) {
                    // Parse the text into a structured format
                    const parsedNews = text.split('\n')
                        .filter(line => line.trim().length > 0)
                        .reduce((acc, line, index, arr) => {
                            if (index % 2 === 0) { // Headline
                                acc.push({ title: line, summary: arr[index + 1] || '', source: 'Web' });
                            }
                            return acc;
                        }, []);
                    setNews(parsedNews);
                } else {
                    throw new Error("No content found in Gemini response.");
                }

            } catch (error) {
                console.error("Error fetching news:", error);
                setNews([
                    { title: "Fallback: Market Sees Volatility", summary: "Stocks and crypto experience mixed trading sessions amidst economic uncertainty.", source: "FinPulse News" },
                    { title: "Fallback: Bitcoin Hovers at $65k", summary: "The leading cryptocurrency finds support after a recent dip.", source: "FinPulse News" }
                ]);
            }
            setLoading(false);
        };

        fetchNews();
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Market News</h3>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="space-y-4">
                    {news.map((item, index) => (
                        <div key={index} className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                            <h4 className="font-semibold mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{item.summary}</p>
                            <span className="text-xs text-gray-400 dark:text-gray-500">{item.source}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Portfolio Component ---
const Portfolio = ({ portfolio, marketData, onSelectAsset }) => {
    const portfolioData = useMemo(() => {
        return portfolio.map(pAsset => {
            const liveData = marketData.find(mAsset => mAsset.id === pAsset.id);
            return {
                ...pAsset,
                current_price: liveData?.current_price || 'N/A',
                price_change_percentage_24h: liveData?.price_change_percentage_24h || 0,
            };
        }).sort((a, b) => (marketData.find(m => m.id === a.id)?.market_cap || 0) < (marketData.find(m => m.id === b.id)?.market_cap || 0) ? 1 : -1); // Sort by market cap
    }, [portfolio, marketData]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-24">
            <h3 className="text-lg font-semibold mb-4">My Portfolio</h3>
            {portfolioData.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Your portfolio is empty. Add assets from the main list.</p>
            ) : (
                <div className="space-y-4">
                    {portfolioData.map(asset => (
                        <div 
                            key={asset.id} 
                            onClick={() => onSelectAsset(marketData.find(m => m.id === asset.id) || asset)}
                            className="flex justify-between items-center cursor-pointer"
                        >
                            <div className="flex items-center space-x-3">
                                <img src={asset.image} alt={asset.name} className="w-8 h-8 rounded-full" />
                                <div>
                                    <div className="font-medium">{asset.symbol.toUpperCase()}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{asset.name}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">
                                    {typeof asset.current_price === 'number' ? formatCurrency(asset.current_price) : asset.current_price}
                                </div>
                                <div className={`text-sm ${asset.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {asset.price_change_percentage_24h.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- AssetDetail Component ---
const AssetDetail = ({ asset, onBack, onTogglePortfolio, isinPortfolio }) => {
    const [historicalData, setHistoricalData] = useState(null);
    const [trend, setTrend] = useState({ direction: '...', color: 'text-gray-500' });

    useEffect(() => {
        // Using mock data (replace with API call for production)
        const data = mockHistoricalData[asset.id];
        setHistoricalData(data);

        // Calculate Trend Prediction
        const sma20 = calculateSMA(data, 20);
        const sma50 = calculateSMA(data, 50);

        if (sma20.length > 0 && sma50.length > 0) {
            const lastSMA20 = sma20[sma20.length - 1][1];
            const lastSMA50 = sma50[sma50.length - 1][1];
            if (lastSMA20 > lastSMA50) {
                setTrend({ direction: 'UP', color: 'text-green-500' });
            } else {
                setTrend({ direction: 'DOWN', color: 'text-red-500' });
            }
        }
    }, [asset.id]);

    return (
        <div className="space-y-6">
            <button 
                onClick={onBack}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
                &larr; Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                    <img src={asset.image} alt={asset.name} className="w-12 h-12 rounded-full" />
                    <div>
                        <h1 className="text-3xl font-bold">{asset.name}</h1>
                        <span className="text-xl text-gray-500 dark:text-gray-400">{asset.symbol.toUpperCase()}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <div className="text-3xl font-bold">{formatCurrency(asset.current_price)}</div>
                        <div className={`text-lg font-medium ${asset.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {asset.price_change_percentage_24h.toFixed(2)}% (24h)
                        </div>
                    </div>
                    <button
                        onClick={() => onTogglePortfolio(asset)}
                        className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <StarIcon filled={isinPortfolio} />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
                <AssetChart historicalData={historicalData} asset={asset} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Market Cap" value={formatLargeNumber(asset.market_cap)} />
                <StatCard title="Total Volume" value={formatLargeNumber(asset.total_volume)} />
                <StatCard title="Trend (SMA 20/50)" value={trend.direction} trendColor={trend.color} />
                <StatCard 
                    title="24h Change" 
                    value={`${asset.price_change_percentage_24h.toFixed(2)}%`} 
                    trendColor={asset.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}
                />
            </div>

            <PriceAlert asset={asset} />
        </div>
    );
};

// --- AssetChart Component ---
const AssetChart = ({ historicalData, asset }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current || !historicalData) return;

        // Destroy previous chart instance if it exists
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');

        // Calculate SMAs
        const sma20 = calculateSMA(historicalData, 20);
        const sma50 = calculateSMA(historicalData, 50);

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: `${asset.symbol.toUpperCase()} Price`,
                        data: historicalData.map(d => ({ x: d[0], y: d[1] })),
                        borderColor: 'rgb(59, 130, 246)', // blue-500
                        tension: 0.1,
                        pointRadius: 0,
                        borderWidth: 2,
                    },
                    {
                        label: 'SMA 20',
                        data: sma20.map(d => ({ x: d[0], y: d[1] })),
                        borderColor: 'rgb(250, 204, 21)', // yellow-400
                        tension: 0.1,
                        pointRadius: 0,
                        borderWidth: 1.5,
                        borderDash: [5, 5]
                    },
                    {
                        label: 'SMA 50',
                        data: sma50.map(d => ({ x: d[0], y: d[1] })),
                        borderColor: 'rgb(236, 72, 153)', // pink-500
                        tension: 0.1,
                        pointRadius: 0,
                        borderWidth: 1.5,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'MMM dd, yyyy'
                        },
                        grid: {
                            color: 'rgba(128, 128, 128, 0.1)'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(128, 128, 128, 0.1)'
                        },
                        ticks: {
                            callback: (value) => formatCurrency(value)
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
            }
        });

        // Cleanup
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [historicalData, asset]);

    if (!historicalData) {
        return <LoadingSpinner />;
    }

    return <div className="h-64 md:h-96"><canvas ref={chartRef}></canvas></div>;
};

// --- StatCard Component ---
const StatCard = ({ title, value, trendColor = 'text-gray-900 dark:text-gray-100' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h4>
        <div className={`text-2xl font-bold ${trendColor}`}>{value}</div>
    </div>
);

// --- PriceAlert Component (UI Only) ---
const PriceAlert = ({ asset }) => {
    const [price, setPrice] = useState('');
    const [type, setType] = useState('above');

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, this would save to Firebase Cloud Functions
        alert(`Alert set for ${asset.name} when price is ${type} ${formatCurrency(Number(price))}.`);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <BellIcon />
                <span>Set Price Alert</span>
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                <span className="font-medium">Notify me when price is</span>
                <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="p-2 rounded-md bg-gray-100 dark:bg-gray-700"
                >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                </select>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input 
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="pl-6 pr-2 py-2 w-36 rounded-md bg-gray-100 dark:bg-gray-700"
                    />
                </div>
                <button type="submit" className="w-full md:w-auto px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">
                    Set Alert
                </button>
            </form>
        </div>
    );
};

// --- Utility Components ---
const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const MessageBox = ({ type, text, onDismiss }) => {
    const bgColor = type === 'success' 
        ? 'bg-green-100 dark:bg-green-900 border-green-500' 
        : 'bg-red-100 dark:bg-red-900 border-red-500';
    const textColor = type === 'success' 
        ? 'text-green-800 dark:text-green-200' 
        : 'text-red-800 dark:text-red-200';

    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={`fixed top-20 right-4 p-4 rounded-lg border ${bgColor} ${textColor} shadow-lg z-50 flex items-center space-x-4`}>
            <span>{text}</span>
            <button onClick={onDismiss} className="p-1 rounded-full hover:bg-black/10">
                <XIcon />
            </button>
        </div>
    );
};

// Register Chart.js components
Chart.register(...registerables);