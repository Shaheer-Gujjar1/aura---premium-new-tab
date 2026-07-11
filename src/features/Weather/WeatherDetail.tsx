import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, MapPin, Wind, Droplets, Thermometer, Sun, Cloud, CloudRain, CloudLightning, CloudSnow } from 'lucide-react';
import { useStore } from '../../stores/useStore';

const getWeatherIcon = (code: number) => {
  if (code === 0) return <Sun className="w-12 h-12 text-yellow-400" />;
  if (code <= 3) return <Cloud className="w-12 h-12 text-gray-400" />;
  if (code <= 48) return <Cloud className="w-12 h-12 text-gray-500 opacity-70" />;
  if (code <= 67) return <CloudRain className="w-12 h-12 text-blue-400" />;
  if (code <= 77) return <CloudSnow className="w-12 h-12 text-blue-200" />;
  if (code <= 82) return <CloudRain className="w-12 h-12 text-blue-500" />;
  if (code <= 99) return <CloudLightning className="w-12 h-12 text-purple-400" />;
  return <Sun className="w-12 h-12 text-yellow-400" />;
};

const getWeatherCondition = (code: number) => {
  if (code === 0) return 'Clear Sky';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Clear Sky';
};

export const WeatherDetail: React.FC = () => {
  const { preferences, setPreferences, isWeatherDetailOpen, setWeatherDetailOpen } = useStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isWeatherDetailOpen) {
      fetchWeather();
    }
  }, [isWeatherDetailOpen, preferences.lat, preferences.lon]);

  const fetchWeather = async () => {
    if (preferences.lat === undefined || preferences.lon === undefined) return;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${preferences.lat}&longitude=${preferences.lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation_probability,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&past_days=1&forecast_days=1&timezone=auto`;
    try {
      setLoading(true);
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Status: ${response.status}, Body: ${errorText}`);
      }
      const data = await response.json();
      if (data.current_weather && data.hourly && data.daily) {
        setWeather(data);
      } else {
        throw new Error('Incomplete weather data received');
      }
    } catch (error) {
      console.error(`Failed to fetch weather details from ${url}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(search)}&count=5&language=en&format=json`
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Geocoding search failed:', error);
    }
  };

  const selectLocation = (result: any) => {
    setPreferences({
      location: result.name,
      lat: result.latitude,
      lon: result.longitude
    });
    setResults([]);
    setSearch('');
  };

  return (
    <AnimatePresence>
      {isWeatherDetailOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          onClick={() => setWeatherDetailOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`${preferences.themeConfig.cardClass} w-full max-w-2xl p-8 relative glass-glow overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
          <button
            onClick={() => setWeatherDetailOpen(false)}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Current Weather & Search */}
            <div className="flex-1 space-y-6">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search location..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                />
                <AnimatePresence>
                  {results.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 glass-card border-white/10 overflow-hidden z-20"
                    >
                      {results.map((res) => (
                        <button
                          key={`${res.id}-${res.name}`}
                          onClick={() => selectLocation(res)}
                          className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                        >
                          <MapPin className="w-4 h-4 text-white/40" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{res.name}</span>
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                              {res.admin1}, {res.country}
                            </span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {weather && !loading ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    {getWeatherIcon(weather.current_weather.weathercode)}
                    <div>
                      <h2 className="text-5xl font-display font-bold tracking-tighter">
                        {Math.round(weather.current_weather.temperature)}°
                      </h2>
                      <p className="text-lg text-white/60 font-medium">
                        {getWeatherCondition(weather.current_weather.weathercode)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-xl">
                        <Droplets className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Humidity</span>
                        <span className="text-sm font-bold">{weather.hourly.relativehumidity_2m[0]}%</span>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
                      <div className="p-2 bg-orange-500/10 rounded-xl">
                        <Thermometer className="w-5 h-5 text-orange-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Feels Like</span>
                        <span className="text-sm font-bold">{Math.round(weather.hourly.apparent_temperature[0])}°</span>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
                      <div className="p-2 bg-green-500/10 rounded-xl">
                        <Wind className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Wind</span>
                        <span className="text-sm font-bold">{Math.round(weather.current_weather.windspeed)} km/h</span>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
                      <div className="p-2 bg-yellow-500/10 rounded-xl">
                        <Sun className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Precipitation</span>
                        <span className="text-sm font-bold">{weather.hourly.precipitation_probability[0]}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Right: Hourly Data (24h) */}
            <div className="w-full md:w-48 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">24-Hour Timeline</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {weather?.hourly.time.map((time: string, i: number) => {
                  const date = new Date(time);
                  const now = new Date();
                  const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
                  
                  // Show only within -12 to +12 hours range (total 24h)
                  if (diffHours < -12 || diffHours > 12) return null;

                  const rainChance = weather.hourly.precipitation_probability[i] || 0;

                  return (
                    <div key={time} className={`flex items-center justify-between bg-white/5 p-3 rounded-xl ${Math.abs(diffHours) < 0.5 ? 'border border-white/20 bg-white/10' : ''}`}>
                      <span className="text-xs font-medium text-white/60 w-16">
                        {date.getHours() === now.getHours() ? 'Now' : date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                      </span>
                      <div className="flex items-center gap-1.5 flex-1 justify-center">
                        {React.cloneElement(getWeatherIcon(weather.hourly.weathercode[i]) as React.ReactElement, { className: 'w-4 h-4' })}
                        {rainChance > 0 && (
                          <span className="text-[10px] font-bold text-blue-400">
                            {rainChance}%
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold w-8 text-right">
                        {Math.round(weather.hourly.temperature_2m[i])}°
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white/40" />
              <span className="text-sm font-medium text-white/70">{preferences.location}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
              Open-Meteo Data
            </p>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
