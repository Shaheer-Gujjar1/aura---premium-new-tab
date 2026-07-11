import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sun, Cloud, CloudRain, Wind, MapPin, CloudLightning, CloudSnow } from 'lucide-react';
import { useStore } from '../../stores/useStore';

const getWeatherIcon = (code: number) => {
  if (code === 0) return <Sun className="w-6 h-6 text-yellow-400" />;
  if (code <= 3) return <Cloud className="w-6 h-6 text-gray-400" />;
  if (code <= 48) return <Cloud className="w-6 h-6 text-gray-500 opacity-70" />;
  if (code <= 67) return <CloudRain className="w-6 h-6 text-blue-400" />;
  if (code <= 77) return <CloudSnow className="w-6 h-6 text-blue-200" />;
  if (code <= 82) return <CloudRain className="w-6 h-6 text-blue-500" />;
  if (code <= 99) return <CloudLightning className="w-6 h-6 text-purple-400" />;
  return <Sun className="w-6 h-6 text-yellow-400" />;
};

const getWeatherCondition = (code: number) => {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Clear';
};

export const Weather: React.FC = () => {
  const { preferences, setWeatherDetailOpen } = useStore();
  const [weather, setWeather] = useState<{
    temp: number;
    condition: string;
    icon: React.ReactNode;
    windSpeed: number;
    rainChance: number;
  } | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (preferences.lat === undefined || preferences.lon === undefined) return;

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${preferences.lat}&longitude=${preferences.lon}&current_weather=true&hourly=precipitation_probability`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Status: ${response.status}, Body: ${errorText}`);
        }
        const data = await response.json();
        const current = data.current_weather;
        const currentHour = new Date().getHours();
        const rainChance = data.hourly?.precipitation_probability?.[currentHour] !== undefined
          ? data.hourly.precipitation_probability[currentHour]
          : 0;
        
        if (current) {
          setWeather({
            temp: Math.round(current.temperature),
            condition: getWeatherCondition(current.weathercode),
            icon: getWeatherIcon(current.weathercode),
            windSpeed: Math.round(current.windspeed),
            rainChance: rainChance
          });
        }
      } catch (error) {
        console.error(`Failed to fetch weather from ${url}:`, error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Update every 10 mins
    return () => clearInterval(interval);
  }, [preferences.lat, preferences.lon]);

  if (!weather) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => setWeatherDetailOpen(true)}
      className="flex items-center justify-between min-w-[220px] cursor-pointer group"
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-white/60 mb-0.5">
          <MapPin className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {preferences.location}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-display font-bold tracking-tighter">{weather.temp}°</span>
          <div className="flex flex-col">
            <span className="text-xs text-white font-semibold leading-none mb-1">{weather.condition}</span>
            <div className="flex items-center gap-2 text-[10px] text-white/50">
              <div className="flex items-center gap-0.5">
                <Wind className="w-2.5 h-2.5" />
                <span>{weather.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-0.5">
                <CloudRain className="w-2.5 h-2.5 text-blue-400" />
                <span>{weather.rainChance}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-px h-10 bg-white/10 mx-1" />
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {weather.icon}
      </motion.div>
    </motion.div>
  );
};
