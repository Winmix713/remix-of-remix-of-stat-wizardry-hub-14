# Remix of Remix of stat-wizardry-hub-14

import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Chart.js komponensek regisztrálása
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Eredeti adatok
const matchData = [
  { home: "Getafe", away: "San Sebastian", ht: "0-2", ft: "0-4", btts: "Igen", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "1-1", ft: "2-2", btts: "Igen", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "1-1", ft: "2-1", btts: "Igen", comeback: "Igen" },
  { home: "Getafe", away: "San Sebastian", ht: "1-0", ft: "3-0", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-0", ft: "1-2", btts: "Igen", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-1", ft: "0-2", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "2-0", ft: "2-0", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-1", ft: "2-2", btts: "Igen", comeback: "Igen" },
  { home: "Getafe", away: "San Sebastian", ht: "0-0", ft: "0-3", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-0", ft: "2-0", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-1", ft: "0-2", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-1", ft: "0-2", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-2", ft: "1-2", btts: "Igen", comeback: "Igen" },
  { home: "Getafe", away: "San Sebastian", ht: "3-1", ft: "3-1", btts: "Igen", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-1", ft: "1-2", btts: "Igen", comeback: "Igen" },
  { home: "Getafe", away: "San Sebastian", ht: "0-0", ft: "1-1", btts: "Igen", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-0", ft: "1-1", btts: "Igen", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-1", ft: "1-1", btts: "Igen", comeback: "Igen" },
  { home: "Getafe", away: "San Sebastian", ht: "1-0", ft: "1-2", btts: "Igen", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "1-0", ft: "1-2", btts: "Igen", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-2", ft: "1-2", btts: "Igen", comeback: "Igen" },
  { home: "Getafe", away: "San Sebastian", ht: "0-0", ft: "1-1", btts: "Igen", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-1", ft: "0-2", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "2-2", ft: "2-4", btts: "Igen", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "2-0", ft: "2-0", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "2-0", ft: "2-0", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-2", ft: "1-4", btts: "Igen", comeback: "Igen" },
  { home: "Getafe", away: "San Sebastian", ht: "0-0", ft: "2-1", btts: "Igen", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-0", ft: "0-1", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-1", ft: "0-1", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-1", ft: "1-2", btts: "Igen", comeback: "Igen" },
  { home: "Getafe", away: "San Sebastian", ht: "1-0", ft: "1-0", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-1", ft: "1-2", btts: "Igen", comeback: "Igen" },
  { home: "Getafe", away: "San Sebastian", ht: "1-0", ft: "2-0", btts: "Nem", comeback: "Nem" },
  { home: "Getafe", away: "San Sebastian", ht: "0-1", ft: "0-2", btts: "Nem", comeback: "Nem" },
];

type Match = typeof matchData[0];
type SortKey = keyof Match;

const App = () => {
    // Állapotok (state) a komponensnek
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey | null; direction: 'asc' | 'desc' }>({
        key: null,
        direction: 'asc',
    });

    // Statisztikák kiszámítása a useMemo hook segítségével
    const stats = useMemo(() => {
        const total = matchData.length;
        const home = matchData.filter((match) => {
            const [homeGoals, awayGoals] = match.ft.split("-").map(Number);
            return homeGoals > awayGoals;
        }).length;
        const draw = matchData.filter((match) => {
            const [homeGoals, awayGoals] = match.ft.split("-").map(Number);
            return homeGoals === awayGoals;
        }).length;
        const away = total - home - draw;
        const btts = matchData.filter((match) => match.btts === "Igen").length;
        
        const homePercent = Math.round((home / total) * 100);
        const drawPercent = Math.round((draw / total) * 100);
        const awayPercent = 100 - homePercent - drawPercent;
        const bttsYesPercent = Math.round((btts / total) * 100);
        const bttsNoPercent = 100 - bttsYesPercent;

        return { total, home, draw, away, btts, homePercent, drawPercent, awayPercent, bttsYesPercent, bttsNoPercent };
    }, []); // Üres függőségi lista, mert a matchData nem változik

    // Adatok rendezése
    const sortedData = useMemo(() => {
        let sortableItems = [...matchData];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key!] < b[sortConfig.key!]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key!] > b[sortConfig.key!]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [sortConfig]);

    // Lapozás kezelése
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, itemsPerPage, sortedData]);

    const totalPages = Math.ceil(matchData.length / itemsPerPage);

    // Eseménykezelők
    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1); // Rendezéskor ugorjunk vissza az első oldalra
    };
    
    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const href = e.currentTarget.getAttribute('href');
        if (href) {
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Chart beállítások
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
          y: {
              beginAtZero: true,
              grid: { color: "rgba(255, 255, 255, 0.1)" },
              ticks: { color: "rgba(255, 255, 255, 0.7)" },
          },
          x: {
              grid: { display: false },
              ticks: { color: "rgba(255, 255, 255, 0.7)" },
          },
      },
    };

    const resultsChartData = {
      labels: ["Hazai", "Döntetlen", "Vendég"],
      datasets: [{
          data: [stats.home, stats.draw, stats.away],
          backgroundColor: ["rgba(52, 211, 153, 0.8)", "rgba(251, 191, 36, 0.8)", "rgba(56, 189, 248, 0.8)"],
          borderColor: ["#34d399", "#fbbf24", "#38bdf8"],
          borderWidth: 1,
          borderRadius: 4,
      }],
    };

    const bttsChartData = {
        labels: ["BTTS Igen", "BTTS Nem"],
        datasets: [{
            data: [stats.btts, stats.total - stats.btts],
            backgroundColor: ["rgba(167, 139, 250, 0.8)", "rgba(100, 116, 139, 0.8)"],
            borderColor: ["#a78bfa", "#64748b"],
            borderWidth: 2,
            hoverOffset: 8,
        }],
    };
    
    const bttsChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      cutout: "70%",
    };

    return (
        <>
            {/* Az eredeti <style> blokk tartalma. Jobb megoldás ezt egy globális CSS fájlba (pl. index.css) tenni. */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .gradient-bg { background: linear-gradient(144deg, #6366F1, #4F46E5 50%, #06B6D4); }
                .glass-effect { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
            `}</style>

            <div className="antialiased bg-[#070b14] text-zinc-100 selection:bg-indigo-500/30 selection:text-white min-h-screen">
                {/* Background Effects */}
                <div className="fixed top-0 w-full h-screen -z-10">
                    <div className="absolute top-0 left-0 w-full h-full -z-10">
                        <iframe
                            src="https://my.spline.design/aidatamodelinteraction-mdTL3FktFVHgDvFr5TKtnYDV"
                            className="w-full h-full border-0"
                            title="3D Background">
                        </iframe>
                    </div>
                </div>

                <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-40 -left-28 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(34,52,255,0.35),transparent)] blur-3xl"></div>
                    <div className="absolute -bottom-40 -right-20 h-[580px] w-[580px] rounded-full bg-[radial-gradient(closest-side,rgba(137,217,255,0.28),transparent)] blur-3xl"></div>
                    <div className="absolute top-1/4 left-1/3 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(99,250,142,0.16),transparent)] blur-[110px]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_10%,rgba(18,38,102,0.35),transparent)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_0%_90%,rgba(6,20,45,0.55),transparent)]"></div>
                </div>

                {/* Header */}
                <header className="sticky top-0 z-50 glass-effect bg-[#070b14]/80 border-b border-white/10">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <a href="#" className="group inline-flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 ring-1 ring-white/15">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                        <path d="M12 6v12"></path><path d="m17.196 9 6.804 15"></path><path d="m6.804 9 10.392 6"></path>
                                    </svg>
                                </span>
                                <span className="text-lg font-semibold tracking-tight">WinMix</span>
                            </a>
                            <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/10 px-1.5 py-1.5">
                                <a href="#szurok" onClick={handleSmoothScroll} className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white rounded-full hover:bg-white/5">Szűrők</a>
                                <a href="#statisztika" onClick={handleSmoothScroll} className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white rounded-full hover:bg-white/5">Statisztikák</a>
                                <a href="#eredmenyek" onClick={handleSmoothScroll} className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white rounded-full hover:bg-white/5">Eredmények</a>
                            </nav>
                            <div className="flex items-center gap-2">
                                <button className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-zinc-200 border border-white/10 rounded-md px-3 py-2 hover:bg-white/5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="m19 9-5 5-4-4-3 3"></path>
                                    </svg>
                                    Bővített stat.
                                </button>
                                <a href="#szurok" onClick={handleSmoothScroll} className="group relative inline-flex select-none cursor-pointer focus-visible:outline-none text-white rounded-md p-[1px] items-center justify-center shadow-[0_8px_16px_-6px_rgba(99,102,241,0.35)] hover:shadow-[0_14px_28px_-10px_rgba(99,102,241,0.45)] gradient-bg">
                                    <span className="flex items-center justify-center gap-2 text-[14px] leading-none h-full w-full transition-colors duration-300 group-hover:bg-transparent font-medium bg-[#0a0f1c] rounded-md px-4 py-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m21 21-4.34-4.34"></path><circle cx="12" cy="12" r="10"></circle>
                                        </svg>
                                        Keresés
                                    </span>
                                </a>
                                <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/90">
                                        <path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                        <div className="mx-4 mb-4 rounded-2xl bg-white/5 ring-1 ring-white/10 glass-effect p-4 space-y-2">
                            <a className="block px-3 py-2 rounded-lg text-sm text-zinc-200 hover:bg-white/5" href="#szurok" onClick={handleSmoothScroll}>Szűrők</a>
                            <a className="block px-3 py-2 rounded-lg text-sm text-zinc-200 hover:bg-white/5" href="#statisztika" onClick={handleSmoothScroll}>Statisztikák</a>
                            <a className="block px-3 py-2 rounded-lg text-sm text-zinc-200 hover:bg-white/5" href="#eredmenyek" onClick={handleSmoothScroll}>Eredmények</a>
                            <button className="w-full px-3 py-2 rounded-lg text-sm text-white bg-indigo-600 hover:bg-indigo-500">Bővített stat.</button>
                        </div>
                    </div>
                </header>

                {/* Statistics Section */}
                <section id="statisztika" className="relative">
                    <div className="sm:px-6 lg:px-8 sm:pb-16 max-w-7xl mx-auto pr-4 pb-12 pl-4 translate-y-12 space-y-4">
                        <div className="flex mb-6 items-center justify-between">
                            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Statisztikák</h2>
                            <button className="inline-flex items-center gap-2 text-sm font-medium text-zinc-200 border border-white/10 rounded-full px-4 py-2.5 hover:bg-white/5 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>
                                </svg>
                                Bővített statisztika
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="col-span-2 md:col-span-1 bg-[#0a0f1c]/25 ring-white/10 ring-1 rounded-2xl p-5 glass-effect">
                                <p className="text-xs text-zinc-400 uppercase">Összes mérkőzés</p>
                                <p className="text-3xl font-semibold tracking-tight mt-2">{stats.total}</p>
                            </div>
                            <div className="bg-[#0a0f1c]/25 ring-white/10 ring-1 rounded-2xl p-5 glass-effect">
                                <p className="text-xs text-zinc-400 uppercase">Hazai győzelem</p>
                                <p className="mt-2 text-3xl font-semibold tracking-tight text-emerald-300">{stats.home}</p>
                            </div>
                            <div className="bg-[#0a0f1c]/5 ring-white/10 ring-1 rounded-2xl p-5 glass-effect">
                                <p className="uppercase text-xs text-zinc-400">Döntetlen</p>
                                <p className="text-3xl font-semibold text-amber-300 tracking-tight mt-2">{stats.draw}</p>
                            </div>
                            <div className="bg-[#0a0f1c]/25 ring-white/10 ring-1 rounded-2xl p-5 glass-effect">
                                <p className="text-xs text-zinc-400 uppercase">Vendég győzelem</p>
                                <p className="mt-2 text-3xl font-semibold tracking-tight text-sky-300">{stats.away}</p>
                            </div>
                            <div className="bg-[#0a0f1c]/25 ring-white/10 ring-1 rounded-2xl p-5 glass-effect">
                                <p className="text-xs text-zinc-400 uppercase">BTTS Igen</p>
                                <p className="text-3xl font-semibold text-violet-300 tracking-tight mt-2">{stats.btts}</p>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid md:grid-cols-2 gap-6 mt-8">
                            <div className="relative overflow-hidden bg-[#0a0f1c]/25 ring-white/10 ring-1 rounded-2xl p-6 glass-effect">
                                {/* ... Chart #1 ... */}
                                <div className="mt-4 rounded-lg bg-white/[0.03] ring-1 ring-white/10 p-3">
                                    <div className="relative h-64 sm:h-72">
                                        <Bar options={chartOptions as any} data={resultsChartData} />
                                    </div>
                                    <div className="mt-4">
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 flex">
                                            <div className="h-full bg-emerald-400/80" style={{ width: `${stats.homePercent}%` }}></div>
                                            <div className="h-full bg-amber-300/80" style={{ width: `${stats.drawPercent}%` }}></div>
                                            <div className="h-full bg-sky-400/80" style={{ width: `${stats.awayPercent}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative overflow-hidden bg-[#0a0f1c]/25 ring-white/10 ring-1 rounded-2xl p-6 glass-effect">
                                {/* ... Chart #2 ... */}
                                <div className="mt-4 rounded-lg bg-white/[0.03] ring-1 ring-white/10 p-3">
                                    <div className="relative h-64 sm:h-72">
                                        <Doughnut data={bttsChartData} options={bttsChartOptions} />
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-[12px] uppercase tracking-tight text-zinc-400">BTTS Igen</div>
                                                <div className="text-4xl font-semibold tracking-tight text-violet-200">{stats.bttsYesPercent}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Results Section */}
                <section id="eredmenyek" className="relative">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
                        <div className="overflow-hidden sm:p-2 ring-white/10 ring-1 bg-gradient-to-br from-indigo-500/15 via-indigo-500/10 to-transparent rounded-3xl p-1">
                            <div className="sm:p-8 bg-[#0a0f1c]/75 rounded-2xl p-6">
                                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Listázott eredmények</h2>
                                </div>
                                <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 ring-1 ring-white/10 rounded-lg px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-zinc-200">Oldalanként:</span>
                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="bg-white/10 ring-1 ring-white/20 rounded-md px-2 py-1 text-sm text-zinc-200 border-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="25">25</option>
                                            <option value="50">50</option>
                                            <option value="100">100</option>
                                            <option value="200">200</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-200 border border-white/10 rounded-md hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
                                            Előző
                                        </button>
                                        <span className="px-3 py-1.5 text-sm text-zinc-200 bg-white/10 rounded-md">Oldal {currentPage} / {totalPages}</span>
                                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-200 border border-white/10 rounded-md hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
                                            Következő
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 bg-white/5">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-white/5 text-zinc-300">
                                                <tr className="border-b border-white/10">
                                                    {(['home', 'away', 'ht', 'ft', 'btts', 'comeback'] as const).map(key => (
                                                        <th key={key} onClick={() => handleSort(key)} className="text-left font-medium px-4 py-3 cursor-pointer select-none hover:bg-white/5">
                                                            <span className="inline-flex items-center gap-1 capitalize">
                                                                {key === 'ht' ? 'Félidő' : key === 'ft' ? 'Végeredmény' : key === 'comeback' ? 'Fordítás' : key}
                                                            </span>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="text-zinc-200">
                                                {paginatedData.map((match, index) => (
                                                    <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                                                        <td className="px-4 py-3">{match.home}</td>
                                                        <td className="px-4 py-3">{match.away}</td>
                                                        <td className="px-4 py-3">{match.ht}</td>
                                                        <td className="px-4 py-3">{match.ft}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${match.btts === 'Igen' ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-500/20 text-slate-300'}`}>
                                                                {match.btts}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                           <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${match.comeback === 'Igen' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}`}>
                                                                {match.comeback}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default App;
----------------------------------------------------------------------
# WinMix Design System Documentation
## Version 1.0 - Hungarian Sports Statistics Platform

---

## 🎨 Design Overview

WinMix is a modern Hungarian sports statistics platform featuring a dark theme with purple/violet accents and glassmorphism effects. The design emphasizes data visualization, accessibility, and user experience through clean typography, intuitive navigation, and interactive elements.

---

## 🌈 Color Palette

### Primary Colors
- **Background**: `oklch(0.145 0 0)` - Deep black (#252525)
- **Foreground**: `oklch(0.985 0 0)` - Pure white (#FAFAFA)
- **Primary**: `oklch(0.985 0 0)` - White for primary elements
- **Primary Glow**: `oklch(0.627 0.265 303.9)` - Purple glow effect

### Brand Colors
- **Violet Primary**: `#8B5CF6` - Main brand color
- **Violet Secondary**: `#7C3AED` - Hover states
- **Purple Gradient**: `from-violet-500 to-purple-600`

### Neutral Colors
- **Zinc 100**: `#F4F4F5` - Light text on dark backgrounds
- **Zinc 200**: `#E4E4E7` - Secondary text
- **Zinc 300**: `#D4D4D8` - Muted text
- **Zinc 400**: `#A1A1AA` - Placeholder text
- **Zinc 500**: `#71717A` - Disabled text
- **Zinc 700**: `#3F3F46` - Card backgrounds
- **Zinc 800**: `#27272A` - Component backgrounds
- **Zinc 900**: `#18181B` - Deep backgrounds

### Semantic Colors
- **Success**: `#10B981` - Green for positive states
- **Warning**: `#F59E0B` - Orange for warnings
- **Error**: `#EF4444` - Red for errors
- **Info**: `#3B82F6` - Blue for information

### Chart Colors
- **Chart 1**: `oklch(0.488 0.243 264.376)` - Blue
- **Chart 2**: `oklch(0.696 0.17 162.48)` - Green
- **Chart 3**: `oklch(0.769 0.188 70.08)` - Yellow
- **Chart 4**: `oklch(0.627 0.265 303.9)` - Purple
- **Chart 5**: `oklch(0.645 0.246 16.439)` - Orange

---

## 📝 Typography

### Font Families
- **Primary**: Geist Sans - Modern, clean sans-serif
- **Monospace**: Geist Mono - For code and data display

### Font Weights
- **Light**: 300 - Subtle text elements
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasized text
- **Semibold**: 600 - Headings
- **Bold**: 700 - Strong emphasis

### Typography Scale
- **Hero Title**: `text-4xl font-bold` (36px) - Main page title
- **Section Title**: `text-2xl font-semibold` (24px) - Section headers
- **Card Title**: `text-lg font-medium` (18px) - Card headers
- **Body Large**: `text-base` (16px) - Primary body text
- **Body**: `text-sm` (14px) - Secondary body text
- **Caption**: `text-xs` (12px) - Small labels and captions

### Line Heights
- **Tight**: `leading-tight` (1.25) - Headlines
- **Normal**: `leading-normal` (1.5) - Body text
- **Relaxed**: `leading-relaxed` (1.625) - Long-form content

---

## 🏗️ Layout System

### Container System
- **Max Width**: `container mx-auto` (1280px)
- **Padding**: `px-4` (16px) on mobile, `px-6` (24px) on desktop
- **Responsive**: Mobile-first approach

### Grid System
- **Statistics Cards**: `grid grid-cols-1 md:grid-cols-2 gap-6`
- **Filter Section**: `grid grid-cols-1 lg:grid-cols-3 gap-4`
- **Results Table**: Full-width responsive table

### Spacing Scale
- **xs**: `4px` - Tight spacing
- **sm**: `8px` - Small spacing
- **md**: `16px` - Medium spacing
- **lg**: `24px` - Large spacing
- **xl**: `32px` - Extra large spacing
- **2xl**: `48px` - Section spacing

---

## 🎯 Component Specifications

### Navigation Bar
- **Height**: `64px`
- **Background**: `bg-black/50 backdrop-blur-sm`
- **Border**: `border-b border-white/10`
- **Logo**: Gradient background `from-violet-500 to-purple-600`
- **Active State**: `border-violet-500 text-violet-400`
- **Hover State**: `hover:text-white`

### Statistics Cards
- **Background**: `bg-black/20 backdrop-blur-xl`
- **Border**: `border border-white/10`
- **Padding**: `p-6`
- **Radius**: `rounded-xl`
- **Shadow**: `shadow-2xl`
- **Hover Effect**: `hover:bg-black/30 transition-all duration-300`

### Filter Section
- **Background**: `bg-black/20 backdrop-blur-xl`
- **Dropdowns**: `bg-zinc-800/60 backdrop-blur-sm`
- **Buttons**: `bg-violet-500 hover:bg-violet-600`
- **Reset Button**: `bg-zinc-700/60 hover:bg-zinc-600/60`

### Results Table
- **Background**: `bg-black/20 backdrop-blur-xl`
- **Header**: `bg-zinc-800/50`
- **Rows**: `hover:bg-white/5`
- **Borders**: `border-white/10`

### Progress Bars
- **Background**: `bg-zinc-800/50`
- **Fill**: Gradient colors based on data type
- **Height**: `h-2` (8px)
- **Radius**: `rounded-full`
- **Animation**: `transition-all duration-500 ease-out`

### Circular Charts
- **Size**: `w-24 h-24` (96px)
- **Stroke Width**: `8px`
- **Background**: `stroke-zinc-800`
- **Progress**: Dynamic color based on value
- **Animation**: `transition-all duration-1000 ease-out`

---

## ✨ Visual Effects

### Glassmorphism
- **Background**: `bg-black/20` or `bg-white/5`
- **Backdrop Filter**: `backdrop-blur-xl`
- **Border**: `border border-white/10`
- **Shadow**: `shadow-2xl`

### Gradients
- **Primary**: `from-violet-500 to-purple-600`
- **Background**: `from-purple-900/20 via-black to-black`
- **Text**: `bg-gradient-to-r from-white to-zinc-300`

### Animations
- **Hover Transitions**: `transition-all duration-300`
- **Progress Animations**: `duration-500 ease-out`
- **Chart Animations**: `duration-1000 ease-out`
- **Page Transitions**: `duration-200 ease-in-out`

### Shadows
- **Card Shadow**: `shadow-2xl`
- **Hover Shadow**: `shadow-3xl`
- **Glow Effect**: `shadow-lg shadow-violet-500/25`

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Mobile Adaptations
- **Navigation**: Collapsible menu
- **Statistics**: Single column layout
- **Filters**: Stacked vertically
- **Table**: Horizontal scroll
- **Typography**: Reduced font sizes

### Tablet Adaptations
- **Statistics**: Two-column grid
- **Filters**: Two-column layout
- **Navigation**: Full horizontal layout

---

## 🎮 Interactive Elements

### Buttons
- **Primary**: `bg-violet-500 hover:bg-violet-600`
- **Secondary**: `bg-zinc-700/60 hover:bg-zinc-600/60`
- **Ghost**: `hover:bg-white/10`
- **Disabled**: `opacity-50 cursor-not-allowed`

### Form Elements
- **Input**: `bg-zinc-800/60 border-white/10 focus:border-violet-500`
- **Select**: `bg-zinc-800/60 backdrop-blur-sm`
- **Checkbox**: `accent-violet-500`

### States
- **Hover**: Subtle color changes and shadows
- **Focus**: Violet border and ring
- **Active**: Pressed state with reduced opacity
- **Disabled**: Reduced opacity and no interaction

---

## 🌐 Accessibility

### Contrast Ratios
- **Normal Text**: Minimum 4.5:1
- **Large Text**: Minimum 3:1
- **Interactive Elements**: Minimum 3:1

### Focus Management
- **Visible Focus**: `focus:ring-2 focus:ring-violet-500`
- **Skip Links**: Available for keyboard navigation
- **Tab Order**: Logical and intuitive

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Descriptive labels for interactive elements
- **Alt Text**: Meaningful descriptions for images

---

## 🎨 Design Tokens

### Border Radius
- **Small**: `rounded-sm` (2px)
- **Medium**: `rounded-md` (6px)
- **Large**: `rounded-lg` (8px)
- **Extra Large**: `rounded-xl` (12px)
- **Full**: `rounded-full`

### Opacity Levels
- **Subtle**: `5%` - Very light overlays
- **Light**: `10%` - Light overlays
- **Medium**: `20%` - Standard overlays
- **Strong**: `50%` - Prominent overlays
- **Heavy**: `80%` - Strong backgrounds

---

## 📊 Data Visualization

### Chart Types
- **Circular Progress**: For percentage data
- **Horizontal Bars**: For comparative data
- **Statistics Cards**: For key metrics
- **Table**: For detailed match data

### Color Coding
- **Home Wins**: Green tones
- **Draws**: Orange/yellow tones
- **Away Wins**: Blue tones
- **BTTS Yes**: Green indicators
- **BTTS No**: Red indicators

---

## 🔧 Technical Implementation

### CSS Framework
- **Tailwind CSS v4**: Utility-first framework
- **Custom Properties**: CSS variables for theming
- **PostCSS**: Processing and optimization

### JavaScript Features
- **Interactive Dropdowns**: Custom select components
- **Progress Animations**: CSS transitions with JavaScript triggers
- **Table Sorting**: Dynamic data manipulation
- **Filter System**: Real-time data filtering

### Performance
- **Backdrop Blur**: Hardware-accelerated effects
- **Lazy Loading**: Progressive content loading
- **Optimized Images**: WebP format with fallbacks
- **Minimal JavaScript**: Lightweight interactions

---

## 🎯 Brand Guidelines

### Logo Usage
- **Primary**: White "W" on violet gradient background
- **Minimum Size**: 32px
- **Clear Space**: 8px on all sides
- **Variations**: Light and dark versions

### Voice & Tone
- **Professional**: Serious about sports data
- **Modern**: Contemporary design language
- **Accessible**: Clear and understandable
- **Hungarian**: Native language support

### Imagery
- **Style**: Dark, modern, data-focused
- **Colors**: Consistent with brand palette
- **Quality**: High-resolution, optimized
- **Context**: Sports and statistics themed

---

## 📋 Component Library

### Core Components
- **Navigation**: Top navigation bar
- **Hero Section**: Main title and description
- **Filter Section**: Data filtering controls
- **Statistics Cards**: Key metrics display
- **Results Section**: Data table with pagination
- **Spline Background**: 3D animated background

### UI Components
- **Button**: Various styles and states
- **Input**: Form input fields
- **Select**: Dropdown selection
- **Card**: Content containers
- **Badge**: Status indicators
- **Progress**: Progress bars and circles

---

## 🚀 Future Considerations

### Scalability
- **Component System**: Reusable design components
- **Design Tokens**: Centralized design values
- **Documentation**: Comprehensive usage guidelines

### Enhancements
- **Dark/Light Mode**: Theme switching capability
- **Internationalization**: Multi-language support
- **Advanced Charts**: More visualization types
- **Mobile App**: Native mobile experience

---

*This documentation serves as the complete design reference for the WinMix platform, ensuring consistency and quality across all implementations.*

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/607a8f7e-77fc-4039-b105-90e45e61ff54).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
