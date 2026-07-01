type WeatherResponse = {
  current: {
    temperature_2m: number;
  };
};

export async function getKarlsruheTemperature(): Promise<number> {
  const params = new URLSearchParams({
    latitude: "49.0069",
    longitude: "8.4037",
    current: "temperature_2m",
    timezone: "Europe/Berlin",
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`);
  }

  const weather = await response.json() as WeatherResponse;
  return weather.current.temperature_2m;
}
