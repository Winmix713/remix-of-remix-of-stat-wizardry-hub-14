import { useState } from "react";
import { 
  LineChart, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Settings,
  RefreshCw,
  Maximize2,
  Target,
  Trophy
} from "lucide-react";
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAdvancedAnalytics } from "@/hooks/use-advanced-analytics";
import LoadingSpinner from "./LoadingSpinner";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EnhancedChartSection = () => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30");
  const [chartType, setChartType] = useState("results");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { analytics, loading, error, refetch } = useAdvancedAnalytics();

  if (loading) {
    return (
      <section className="mb-8">
        <Card className="glass-card border-white/10">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <LoadingSpinner />
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (error || !analytics) {
    return (
      <section className="mb-8">
        <Card className="glass-card border-white/10">
          <CardContent className="p-8">
            <div className="text-center text-red-400">
              Hiba az analitika betöltése során: {error}
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  // Most Common Results Chart Data
  const mostCommonResultsData = {
    labels: analytics.mostCommonResults.slice(0, 8).map(r => r.result),
    datasets: [
      {
        label: 'Gyakoriság (%)',
        data: analytics.mostCommonResults.slice(0, 8).map(r => r.percentage),
        backgroundColor: [
          'hsl(262, 83%, 58%)',
          'hsl(158, 64%, 52%)',
          'hsl(43, 96%, 56%)',
          'hsl(213, 94%, 68%)',
          'hsl(316, 73%, 52%)',
          'hsl(198, 93%, 60%)',
          'hsl(24, 95%, 53%)',
          'hsl(295, 72%, 61%)',
        ],
        borderWidth: 0,
        borderRadius: 8,
      }
    ]
  };

  // Goals Trend (Over/Under 2.5) Chart Data
  const goalsTrendData = {
    labels: ['2.5+ gól', '2.5 alatt'],
    datasets: [
      {
        data: [analytics.goalsTrend.over25Percentage, analytics.goalsTrend.under25Percentage],
        backgroundColor: [
          'hsl(158, 64%, 52%)',
          'hsl(213, 94%, 68%)',
        ],
        borderWidth: 0,
        hoverOffset: 10,
      }
    ]
  };

  // BTTS Professional Analysis Chart Data
  const bttsAnalysisData = {
    labels: analytics.bttsAnalysis.monthlyTrend.map(m => m.month),
    datasets: [
      {
        label: 'BTTS arány (%)',
        data: analytics.bttsAnalysis.monthlyTrend.map(m => m.bttsRate),
        borderColor: 'hsl(158, 64%, 52%)',
        backgroundColor: 'hsla(158, 64%, 52%, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  // Weekly Results Chart Data (Mixed Chart - Bar + Line)
  const weeklyResultsData = {
    labels: analytics.weeklyResults.map(w => w.day),
    datasets: [
      {
        label: 'Mérkőzések száma',
        data: analytics.weeklyResults.map(w => w.matches),
        backgroundColor: 'hsla(262, 83%, 58%, 0.8)',
        borderWidth: 0,
        borderRadius: 8,
        yAxisID: 'y',
      }
    ]
  };

  // Separate data for line chart overlay
  const weeklyGoalsData = {
    labels: analytics.weeklyResults.map(w => w.day),
    datasets: [
      {
        label: 'Átlag gólszám',
        data: analytics.weeklyResults.map(w => w.avgGoals),
        borderColor: 'hsl(43, 96%, 56%)',
        backgroundColor: 'hsla(43, 96%, 56%, 0.1)',
        fill: false,
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgba(255,255,255,0.8)',
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17,17,22,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
      }
    },
    scales: chartType !== 'goals' ? {
      x: {
        ticks: { 
          color: 'rgba(255,255,255,0.6)',
          maxTicksLimit: 8 
        },
        grid: { 
          color: 'rgba(255,255,255,0.08)',
          drawBorder: false
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: { 
          color: 'rgba(255,255,255,0.6)',
          maxTicksLimit: 6 
        },
        grid: { 
          color: 'rgba(255,255,255,0.08)',
          drawBorder: false
        }
      }
    } : undefined
  };

  const handleExport = () => {
    toast({
      title: "Grafikon exportálás",
      description: "PNG formátumban letöltés indítása...",
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Adatok frissítése",
      description: "Legfrissebb analitikai adatok betöltése...",
    });
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    toast({
      title: isFullscreen ? "Kilépés teljes képernyőből" : "Teljes képernyő",
      description: isFullscreen ? "Normál nézet visszaállítva" : "Grafikon nagyított nézetben",
    });
  };

  const renderChart = () => {
    switch (chartType) {
      case 'results':
        return <Bar data={mostCommonResultsData} options={chartOptions} />;
      case 'goals':
        return <Doughnut data={goalsTrendData} options={chartOptions} />;
      case 'btts':
        return <Line data={bttsAnalysisData} options={chartOptions} />;
      case 'weekly':
        return <Bar data={weeklyResultsData} options={chartOptions} />;
      default:
        return <Bar data={mostCommonResultsData} options={chartOptions} />;
    }
  };

  return (
    <section className="mb-8">
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/20 grid place-items-center ring-1 ring-primary/30">
                <BarChart3 className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Haladó Analitika</CardTitle>
                <p className="text-sm text-white/60 mt-1">
                  Interaktív grafikonok és részletes elemzések
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-white/70 hover:text-white hover:bg-white/5"
                aria-label="Adatok frissítése"
              >
                <RefreshCw className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullscreen}
                className="text-white/70 hover:text-white hover:bg-white/5"
                aria-label="Teljes képernyő"
              >
                <Maximize2 className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                className="text-white/70 hover:text-white hover:bg-white/5"
                aria-label="Grafikon exportálása"
              >
                <Download className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid-auto-sm">
            {/* Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70 block mb-2">Időtartam</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    <SelectItem value="7">Utolsó 7 nap</SelectItem>
                    <SelectItem value="30">Utolsó 30 nap</SelectItem>
                    <SelectItem value="90">Utolsó 90 nap</SelectItem>
                    <SelectItem value="365">Utolsó év</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-white/70 block mb-2">Analitika típus</label>
                <Tabs value={chartType} onValueChange={setChartType} orientation="vertical">
                  <TabsList className="grid w-full grid-cols-1 bg-white/5 border border-white/10 h-auto p-1">
                    <TabsTrigger 
                      value="results" 
                      className="w-full justify-start data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <BarChart3 className="size-4 mr-2" />
                      Leggyakoribb eredmények
                    </TabsTrigger>
                    <TabsTrigger 
                      value="goals" 
                      className="w-full justify-start data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <Target className="size-4 mr-2" />
                      2.5+ gól trend
                    </TabsTrigger>
                    <TabsTrigger 
                      value="btts" 
                      className="w-full justify-start data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <LineChart className="size-4 mr-2" />
                      BTTS arány profi
                    </TabsTrigger>
                    <TabsTrigger 
                      value="weekly" 
                      className="w-full justify-start data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <Calendar className="size-4 mr-2" />
                      Heti elemzés
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Advanced Analytics Stats */}
              <div className="pt-4 space-y-3">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Leggyakoribb</span>
                    <span className="font-semibold text-primary">
                      {analytics.mostCommonResults[0]?.result || 'N/A'}
                    </span>
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {analytics.mostCommonResults[0]?.percentage || 0}% gyakoriság
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">2.5+ gól</span>
                    <span className="font-semibold text-sports-emerald">
                      {analytics.goalsTrend.over25Percentage}%
                    </span>
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {analytics.goalsTrend.over25Goals} meccsből
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">BTTS arány</span>
                    <span className="font-semibold text-sports-amber">
                      {analytics.bttsAnalysis.bttsPercentage}%
                    </span>
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {analytics.bttsAnalysis.bttsTrue} BTTS meccs
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="lg:col-span-3">
              <div 
                className={`bg-white/5 rounded-xl p-4 border border-white/10 ${
                  isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : 'h-80'
                }`}
              >
                {isFullscreen && (
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Grafikon - Teljes képernyő</h3>
                    <Button
                      variant="ghost"
                      onClick={handleFullscreen}
                      className="text-white/70 hover:text-white"
                    >
                      ✕ Bezárás
                    </Button>
                  </div>
                )}
                <div className={isFullscreen ? 'flex-1' : 'h-full'}>
                  {renderChart()}
                </div>
              </div>
              
              {/* Advanced Chart Insights */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gradient-to-r from-primary/15 to-purple-600/10 rounded-lg p-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-primary" />
                    <span className="text-sm text-white/80">
                      Top eredmény: {analytics.mostCommonResults[0]?.result}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {analytics.mostCommonResults[0]?.count} alkalommal
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-sports-emerald/15 to-green-600/10 rounded-lg p-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2">
                    {analytics.goalsTrend.over25Percentage > 50 ? (
                      <TrendingUp className="size-4 text-sports-emerald" />
                    ) : (
                      <TrendingDown className="size-4 text-blue-400" />
                    )}
                    <span className="text-sm text-white/80">
                      {analytics.goalsTrend.over25Percentage > 50 ? 'Magas' : 'Alacsony'} gólátlag
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {analytics.goalsTrend.over25Percentage}% 2.5+ gól
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-sports-amber/15 to-yellow-600/10 rounded-lg p-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-sports-amber" />
                    <span className="text-sm text-white/80">
                      BTTS trend: {analytics.bttsAnalysis.bttsPercentage}%
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {analytics.bttsAnalysis.monthlyTrend.length > 0 && 
                      analytics.bttsAnalysis.monthlyTrend[analytics.bttsAnalysis.monthlyTrend.length - 1]?.bttsRate
                    }% utóbbi hónapban
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default EnhancedChartSection;