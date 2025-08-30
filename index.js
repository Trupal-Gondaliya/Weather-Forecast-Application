let API_KEY = "2fd75fafb09e29b30b7702e6890a269c"; 
let searchbar = document.getElementById("searchbar");
let searchIcon = document.getElementById("searchIcon");
let CurrentLocation = document.getElementById("CurrentLocation");
let historyIcon = document.getElementById("historyIcon");
let historyDropdown = document.getElementById("historyDropdown");

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
async function fetchWeather(city){
    try{
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if(!res.ok){
            throw new Error("City not found");
        }
        const data = await res.json();
        updateTodayWeather(data);
        saveHistory(city);
        renderHistory(); 
        fetchForecast(city);
    }
    catch(error){
        alert(error.message);
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
    dayNightIcon.className = "fa-solid fa-moon text-blue-400"; 
    dayNightText.textContent = "Night"; 
  }
}

// Update Today's Weather
function updateTodayWeather(data){
    celsius.textContent = `${Math.round(data.main.temp)}°C`;
    getDayOrNight(data);
    weatherSituation.textContent = data.weather[0].description;
    wind.textContent = `${data.wind.speed} km/h`;
    humidity.textContent = `${data.main.humidity}%`;

    // Change background based on weather
    if (data.weather[0].description.toLowerCase().includes("cloud")) 
        { document.body.style.backgroundImage = "url('Weather-Background.jpg')"; } 
    else if(data.weather[0].description.toLowerCase().includes("rain")) 
        { document.body.style.backgroundImage = "url('rain.jpg')"; } 
    else if(data.weather[0].description.toLowerCase().includes("Thunderstorm")) 
        { document.body.style.backgroundImage = "url('Thunderstorm.jpg')"; } 
    else if(data.weather[0].description.toLowerCase().includes("Snow")) 
        { document.body.style.backgroundImage = "url('snow.jpg')"; } 
    else if(data.weather[0].description.toLowerCase().includes("Mist")) 
        { document.body.style.backgroundImage = "url('Mist.jpg')"; }
    else if(data.weather[0].description.toLowerCase().includes("clear")) 
        { document.body.style.backgroundImage = "url('clearSky.jpg')"; }
    else { document.body.style.backgroundImage = "url('sun.jpg')"; }

    // Extreme temperature alert
    if (data.main.temp > 40) {
        alert("Extreme Heat Alert: Stay Hydrated!");
    }
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
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
    const data = await res.json();
    updateTodayWeather(data);
  });
});

// On page load, get current location weather
document.addEventListener("DOMContentLoaded", () => {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
    const data = await res.json();
    updateTodayWeather(data);
    fetchForecast(data.name);
  });
});

// Fetch 5-day forecast weather
async function fetchForecast(city) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
  const data = await res.json();

  forecastContainer.innerHTML = "";
  const daily = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date]) daily[date] = item;
  });

  Object.values(daily).slice(0, 5).forEach(item => {
    const card = document.createElement("div");
    card.className = "bg-black/40 p-3 rounded-xl text-center";
    card.innerHTML = `
      <h3 class="text-xl font-bold">${Math.round(item.main.temp)}°C</h3>
      <i class="fa-solid fa-${getWeatherIcon(item.weather[0].main)} text-2xl"></i>
      <div class="mt-2">
        <p><i class="fa-solid fa-wind"></i> ${item.wind.speed} km/h</p>
        <p><i class="fa-solid fa-droplet"></i> ${item.main.humidity}%</p>
        <p>${new Date(item.dt_txt).toLocaleDateString("en-US", { weekday: "long" })}</p>
        <p>${new Date(item.dt_txt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</p>
      </div>`;
    forecastContainer.appendChild(card);
  });
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