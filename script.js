const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const weatherDataContainer = document.getElementById("weatherDataContainer");
const autocompleteContainer = document.querySelector(".autocomplete-container");
const API_KEY = "9706b82ecdfb4e61855115741231711";

// Function to get weather data
const getWeatherData = (name) => {
    const WEATHER_API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${name}&days=3&aqi=no&alerts=no`;
    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        const currentWeather = data.current;
        const forecastWeather = data.forecast.forecastday;
        const location = data.location;
        const currentWeatherHTML = `
            <div class="current-weather__top">
                <div class="current-weather__top-left">
                    <h2 class="current-weather__city">${location.name}</h2>
                    <p class="current-weather__description">${currentWeather.condition.text}</p>
                </div>
                <div class="current-weather__top-right">
                    <img src="${currentWeather.condition.icon}" alt="${currentWeather.condition.text}" class="current-weather__icon">
                    <p class="current-weather__temp">${currentWeather.temp_c}°C</p>
                </div>
            </div>
        `;
        const forecastWeatherHTML = forecastWeather.map(day => {
            return `
                <div class="weather-card">
                    <p class="weather-card__date">${day.date}</p>
                    <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" class="weather-card__icon">
                    <p class="weather-card__temp">${day.day.avgtemp_c}°C</p>
                </div>
            `;
        }).join("");
        currentWeatherDiv.innerHTML = currentWeatherHTML;
        weatherCardsDiv.innerHTML = forecastWeatherHTML;

    });
}

// Function to get city coordinates
const getCityCoordinates = async () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") {
        alert("Please enter a city name");
        return;
    }
    const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&aqi=no&alerts=no`;
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const name = data.location.name;
        const temp = data.current.temp_c;
        getWeatherData(name, temp);
        weatherDataContainer.style.display = "block";
    } catch (error) {
        console.error("An error occurred while fetching data:", error);
    }
};

// Function to get user location
const userLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&aqi=no&alerts=no`;

            fetch(API_URL).then(response => response.json()).then(data => {
                const name = data.location.name;
                const temp = data.current.temp_c;
                getWeatherData(name, temp);
                weatherDataContainer.style.display = "block";
            });
        });
    } else {
        alert("Your browser doesn't support geolocation!");
    }
};

// Function to get autocomplete data
const autoComplete = async () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") {
        clearAutocomplete();
        return;
    }
    try {
        const API_URL = `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${cityName}&aqi=no`;
        const response = await fetch(API_URL);
        const data = await response.json();
        const cities = data.map(city => city.name);
        showAutocomplete(cities);
        autocompleteContainer.style.display = "block";
    } catch (error) {
        console.error("An error occurred while fetching autocomplete data:", error);
    }
};

// Function to show autocomplete data
const showAutocomplete = (cities) => {
    clearAutocomplete();
    cities.forEach(city => {
        const option = document.createElement("div");
        option.className = "autocomplete-item";
        option.textContent = city;
        option.addEventListener("click", () => {
            cityInput.value = city;
            clearAutocomplete();
            getCityCoordinates();
        });
        autocompleteContainer.appendChild(option);
    });
    if (cities.length > 0) {
        autocompleteContainer.style.display = "block";
    } else {
        autocompleteContainer.style.display = "none";
    }
};

// Function to clear autocomplete data
const clearAutocomplete = () => {
    autocompleteContainer.innerHTML = "";
};

// Function to debounce autocomplete
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const debouncedAutoComplete = debounce(autoComplete, 500);

// Event listeners
cityInput.addEventListener("keyup", debouncedAutoComplete);
searchButton.addEventListener("click", debounce(getCityCoordinates, 300));
cityInput.addEventListener("keyup", e => e.key === "Enter" && debouncedAutoComplete());
locationButton.addEventListener("click", userLocation);