"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/app/lib/auth/AuthContext";
import { getKarlsruheTemperature } from "@/app/lib/weather-service";

import styles from "./page.module.css";

export default function Home() {
  const { user } = useAuth();
  const [temperature, setTemperature] = useState<number | null>(null);
  const [weatherError, setWeatherError] = useState(false);

  useEffect(() => {
    async function loadWeather() {
      try {
        const currentTemperature = await getKarlsruheTemperature();
        setTemperature(currentTemperature);
      } catch {
        setWeatherError(true);
      }
    }

    loadWeather();
  }, []);

  const name = user?.displayname || user?.username || "there";

  return (
    <main className={styles.page}>
      <section className={styles.welcome}>
        <h1>{getGreeting()}, {name}!</h1>

        <div className={styles.weather}>
          {weatherError ? (
            <p>It is always perfect weather to learn something.</p>
          ) : temperature === null ? (
            <p>Checking the weather in Karlsruhe...</p>
          ) : (
            <p>
              Karlsruhe: <strong>{Math.round(temperature)}°C</strong> — always perfect weather to learn something.
            </p>
          )}

          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Weather by Open-Meteo
          </a>
        </div>
      </section>
    </main>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
