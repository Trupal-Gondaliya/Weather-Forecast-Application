let API_KEY = "2fd75fafb09e29b30b7702e6890a269c"; 
let searchbar = document.getElementById("searchbar");
let searchIcon = document.getElementById("searchIcon");
let CurrentLocation = document.getElementById("CurrentLocation");
let historyIcon = document.getElementById("historyIcon");
let historyDropdown = document.getElementById("historyDropdown");

let celsius = document.getElementById("celsius");
let dayNight = document.getElementById("day-night");
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

  if(localTime >= sunrise && localTime < sunset) {
    dayNight.className = "fa-solid fa-moon",
    dayNight.textContent ="Day";
  }
  else{
    dayNight.className = "fa-solid fa-sun",
    dayNight.textContent ="Night";
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
        { document.body.style.backgroundImage = "url('Weather-Background.jpg')"; } 
    else if(data.weather[0].description.toLowerCase().includes("Thunderstorm")) 
        { document.body.style.backgroundImage = "url('Weather-Background.jpg')"; } 
    else if(data.weather[0].description.toLowerCase().includes("Snow")) 
        { document.body.style.backgroundImage = "url('Weather-Background.jpg')"; } 
    else if(data.weather[0].description.toLowerCase().includes("Mist")) 
        { document.body.style.backgroundImage = "url('Weather-Background.jpg')"; }
    else { document.body.style.backgroundImage = "url('Weather-Background.jpg')"; }

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
searchIcon.addEventListener("click", () => fetchWeather(searchbar.value));
searchbar.addEventListener("keypress", e => {
  if (e.key === "Enter") fetchWeather(searchbar.value);
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
  });
});
