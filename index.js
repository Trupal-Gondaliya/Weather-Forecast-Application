let API_KEY = "2fd75fafb09e29b30b7702e6890a269c";
let searchbar = document.getElementById("searchbar");
let searchIcon = document.getElementById("searchIcon");
let CurrentLocation = document.getElementById("CurrentLocation");
let historyIcon = document.getElementById("historyIcon");
let historyDropdown = document.getElementById("historyDropdown");
let logo = document.getElementById("logo");

let celsius = document.getElementById("celsius");
let dayNightIcon = document.getElementById("dayNightIcon");
let dayNightText = document.getElementById("dayNightText");
let weatherSituation = document.getElementById("weatherSituation");
let wind = document.getElementById("wind");
let humidity = document.getElementById("humidity");
let forecastContainer = document.getElementById("nextFiveDayHistory");

// Get history from localStorage
let searchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory")) || [];

// Show history icon if history exists
if (searchHistory.length > 0) {
  historyIcon.classList.remove("hidden");
}

// Fetch Weather API
async function fetchWeather(city) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if (!res.ok) {
      if (res.status === 401) throw new Error("Invalid API key. Please check your API key.");
      if (res.status === 404) throw new Error("City not found. Please enter a valid city name.");
      throw new Error("Unable to fetch weather data. Please try again later.");
    }
    const data = await res.json();
    updateTodayWeather(data);
    saveHistory(city);
    renderHistory();
    fetchForecast(city);
  }
  catch (error) {
    showError(error.message);
  }
}

// Determine Day or Night
function getDayOrNight(data) {
  const timezoneOffset = data.timezone; // in seconds
  const localTime = (data.dt + timezoneOffset) * 1000;
  const sunrise = (data.sys.sunrise + timezoneOffset) * 1000;
  const sunset = (data.sys.sunset + timezoneOffset) * 1000;

  if (localTime >= sunrise && localTime < sunset) {
    // Daytime
    dayNightIcon.className = "fa-solid fa-sun text-yellow-400";
    dayNightText.textContent = "Day";
  } else {
    // Nighttime
    dayNightIcon.className = "fa-solid fa-moon text-blue-500";
    dayNightText.textContent = "Night";
  }
}

// Update Today's Weather
function updateTodayWeather(data) {
  celsius.textContent = `${Math.round(data.main.temp)}°C`;
  getDayOrNight(data);
  weatherSituation.textContent = data.weather[0].description;
  wind.textContent = `${data.wind.speed} km/h`;
  humidity.textContent = `${data.main.humidity}%`;

  currentTemp = data.main.temp;

  // Change background based on weather
  let desc = data.weather[0].description.toLowerCase();

  if (desc.includes("cloud")) {
    setBackground("Weather-Background.jpg");
  } else if (desc.includes("rain")) {
    setBackground("rain.jpg");
  } else if (desc.includes("thunderstorm")) {
    setBackground("Thunderstorm.jpg");
  } else if (desc.includes("snow")) {
    setBackground("snow.jpg");
  } else if (desc.includes("mist")) {
    setBackground("Mist.jpg");
  } else if (desc.includes("clear")) {
    setBackground("clearSky.jpg");
  } else {
    setBackground("sun.jpg");
  }

  // Extreme temperature alert
  if (data.main.temp > 40) {
    alert("Extreme Heat Alert: Stay Hydrated!");
  }

  // Add city name in header(logo)
  logo.textContent = `Weather Forecast - ${data.name}`;
}

// To add Default background if any url not work
function setBackground(imageUrl) {
  let img = new Image();
  img.src = imageUrl;

  img.onload = function () {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
  };

  img.onerror = function () {
    // fallback default image
    document.body.style.backgroundImage = "url('Weather-Background.jpg')";
  };
}

// Save search history
function saveHistory(city) {
  if (!searchHistory.includes(city)) {
    searchHistory.unshift(city);
    if (searchHistory.length > 5) searchHistory.pop();
    localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
    historyIcon.classList.remove("hidden"); // show icon if hidden
  }
}

// Render History Dropdown
function renderHistory() {
  historyDropdown.innerHTML = "";
  searchHistory.forEach(city => {
    const li = document.createElement("li");
    li.className = "px-3 py-1 hover:bg-gray-200 cursor-pointer";
    li.textContent = city;
    li.onclick = () => fetchWeather(city);
    historyDropdown.appendChild(li);
  });
}

// Toggle history dropdown
historyIcon.addEventListener("click", () => {
  historyDropdown.classList.toggle("hidden");
  renderHistory();
});

// Search events
const cancelBtn = document.createElement("i");
cancelBtn.className = "fa-solid fa-xmark text-black cursor-pointer hidden ml-2";
cancelBtn.style.display = "none";
searchbar.parentElement.appendChild(cancelBtn);

searchbar.addEventListener("input", () => {
  cancelBtn.style.display = searchbar.value ? "block" : "none";
});

cancelBtn.addEventListener("click", () => {
  searchbar.value = "";
  cancelBtn.style.display = "none";
  searchbar.focus();
});

searchIcon.addEventListener("click", () => {
  fetchWeather(searchbar.value);
  searchbar.value = "";
  cancelBtn.style.display = "none";
});
searchbar.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    fetchWeather(searchbar.value);
    searchbar.value = "";
    cancelBtn.style.display = "none";
  }
});

// Current location
CurrentLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
        if (!res.ok) {
          if (res.status === 401) throw new Error("Invalid API key. Please check your API key.");
          if (res.status === 404) throw new Error("Unable to find weather for your location.");
          throw new Error("Unable to fetch weather data. Please try again later.");
        }
        const data = await res.json();
        updateTodayWeather(data);
        fetchForecast(data.name);
      } catch (error) {
        showError(error.message);
      }
    }
  );
});

// On page load, get current location weather
document.addEventListener("DOMContentLoaded", () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser");
    return;
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid API key. Please check your API key.");
        if (res.status === 404) throw new Error("Unable to find weather for your location.");
        throw new Error("Unable to fetch weather data. Please try again later.");
      }

      const data = await res.json();
      updateTodayWeather(data);
      fetchForecast(data.name);
    } catch (error) {
      showError(error.message);
    }
  });
});

// Fetch 5-day forecast weather
async function fetchForecast(city) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    if (!res.ok) {
      if (res.status === 401) throw new Error("Invalid API key. Cannot fetch forecast.");
      if (res.status === 404) throw new Error("City not found. Cannot fetch forecast.");
      throw new Error("Unable to fetch forecast. Please try again later.");
    }
    const data = await res.json();

    forecastContainer.innerHTML = "";
    const daily = {};

    data.list.forEach(item => {
      const date = item.dt_txt.split(" ")[0];
      if (!daily[date]) daily[date] = item;
    });

    Object.values(daily).slice(0, 5).forEach(item => {
      const card = document.createElement("div");
      card.className = "bg-black/40 p-2 rounded-xl text-center forecastCard";
      card.innerHTML = `
        <div class="flex items-center justify-evenly lg:flex-col">
        <div>
          <h3 class="text-xl font-bold">${Math.round(item.main.temp)}°C</h3>
          <i class="fa-solid fa-${getWeatherIcon(item.weather[0].main)} text-2xl"></i>
        </div>
        <div class="mt-2">
          <p><i class="fa-solid fa-wind text-blue-900 text-xl"></i> ${item.wind.speed} km/h</p>
          <p><i class="fa-solid fa-droplet"></i> ${item.main.humidity}%</p>
          <p class="text-yellow-300 text-xl font-bold mt-3">${new Date(item.dt_txt).toLocaleDateString("en-US", { weekday: "long" })}</p>
          <p>${new Date(item.dt_txt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>`;
      forecastContainer.appendChild(card);
    });
  }
  catch (error) {
    showError(error.message);
  }
}

// Get icon based on condition
function getWeatherIcon(condition) {
  condition = condition.toLowerCase();
  if (condition.includes("cloud")) return "cloud";
  if (condition.includes("rain")) return "cloud-showers-heavy";
  if (condition.includes("clear")) return "sun";
  if (condition.includes("snow")) return "snowflake";
  return "smog";
}

// toggle unit 
let isCelsius = true;
let currentTemp = null;

function celsiusToFahrenheit(c) {
  return (c * 9 / 5) + 32;
}

function renderTemperature() {
  if (isCelsius) {
    celsius.textContent = `${Math.round(currentTemp)}°C`;
    toggleUnit.textContent = "Switch to °F";
  } else {
    celsius.textContent = `${Math.round(celsiusToFahrenheit(currentTemp))}°F`;
    toggleUnit.textContent = "Switch to °C";
  }
}

// Toggle button click
toggleUnit.addEventListener("click", () => {
  isCelsius = !isCelsius;
  renderTemperature();
});

const errorMessage = document.getElementById("errorMessage");

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  setTimeout(() => {
    errorMessage.classList.add("hidden");
  }, 4000);
}

