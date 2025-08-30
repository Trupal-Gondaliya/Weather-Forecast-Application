# Weather-Forecast-Application
A weather forecast web application built using HTML, TailwindCSS, Vanilla CSS and JavaScript.  

# Overview
A weather forecast web application fetches real-time weather data from the OpenWeatherMap API and provides:
- Current weather
- Location-based forecasts
- 5-day extended forecast
- Search history with dropdown
- Weather condition icons
- Extreme temperature alerts
- Current loaction feature

# Features
- Search by city name
- Detect current location
- Dropdown for recently searched cities
- Dynamic background changes (rainy, sunny, etc.)
- Temperature, humidity, wind speed
- Extended 5-day forecast
- celsius to Fahrenheit 
- Day/Night detection
- Error handling
- Responsive Design

# Tech Stack
- HTMl
- Tailwind CSS
- Vanilla CSS
- JavaScript
- FontAwesome (icons)
- OpenWeatherMap API

# Setup Instructions
- clone this repo : git clone https://github.com/Trupal-Gondaliya/Weather-Forecast-Application.git
- Get an API Key : Sign up at OpenWeatherMap (https://openweathermap.org/api) and Generate an API key
- Insert API key : Open index.js and replace API_KEY
- Run the project : Simply open index.html in your browser

# API Reference
- Weather API:
    https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric

- 5-Day Forecast Weather Data API:
    https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric

- Current Location Weather API:
    https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric
