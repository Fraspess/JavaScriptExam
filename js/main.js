
const apiKey = "ebd75f3c664c82b3f294cc712d4c5333";
const searchInput = document.getElementById("searchInput");


async function fetchCurrentWeatherData(lat, lon, city) {
    let url;
    if (typeof city === 'string' && city.length > 0) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    }
    if (typeof lat === 'number' && typeof lon === 'number') {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Error fetching weather data");
            const weatherContent = document.getElementById("weatherContent");
            weatherContent.innerHTML = `<img src="/img/error.webp"; class="error-image" alt="Error Image">`;
            return null;
        }
        const json = await response.json();
        console.log(json);
        return json;
    }
    catch (error) {
        console.error("Error", error);
        return null;
    }
}


async function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const weatherData = await fetchCurrentWeatherData(lat, lon);
            displayCurrentWeatherData(weatherData);

            const dailyForecast = await fetchDailyForecast(lat, lon);
            if (dailyForecast) {
                const todayForecasts = getTodayForecasts(dailyForecast);
                displayFullDailyForecast(todayForecasts);
            }

        }, async error => {
            const defaultcity = "Rivne";
            const weatherData = await fetchCurrentWeatherData(null, null, defaultcity);
            displayCurrentWeatherData(weatherData);

            const dailyForecast = await fetchDailyForecast(null, null, defaultcity);
            if(dailyForecast)
            {
                const todayForecasts = getTodayForecasts(dailyForecast);
                displayFullDailyForecast(todayForecasts);
            }
            console.error("Error getting location", error);
        })


    } else {
            const weatherContent = document.getElementById("weatherContent");
            weatherContent.innerHTML = `<img src="img/error.webp; class="error-image" alt="Error Image">`;
            console.error("Geolocation is not supported by this browser");
    }
}


function displayCurrentWeatherData(data) {
    if (!data) {
        console.error("No weather data");
        const weatherContent = document.getElementById("weatherContent");
        weatherContent.innerHTML = `<img src="/img/error.webp; class="error-image" alt="Error Image">`;
        return;
    }
    document.getElementById("mainDiv").style.display = "block";
    const tempCelsius = Math.round(data.main.temp);
    const iconCode = data.weather[0].icon;
    const description = data.weather[0].description;
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    const durationMs = sunset - sunrise;
    const durationHours = Math.floor(durationMs / 3600000);
    const durationMinutes = Math.floor((durationMs % 3600000) / 60000);
    const realFeel = Math.round(data.main.feels_like);
    searchInput.value = `${data.name}, ${data.sys.country}`;
    const weatherContent = document.getElementById("weatherContent");

    weatherContent.innerHTML = `


    
    <div class="currentWeather">
    
    <p style="text-align: left; color:#00A3A3; padding: 20px; font-weight: bold;">CURRENT WEATHER</p>
    <div class="currentWeatherContent"> 
    <div class="currentWeatherLeft">
    <img id="currentWeatherImage" src="${`https://openweathermap.org/img/wn/${iconCode}@2x.png`}" alt="Weather Icon">
    <p id="currentWeatherDescription">${description}</p>
    </div>
    
    <div class="currentWeatherCenter">
    <p id="currentWeatherTemp" style="font-size: 35px;">${tempCelsius}°</p>
    <p style="color: gray;" id="currentWeatherRealTemp">Real feel ${realFeel}°</p>
    </div>
    
    <div class="currentWeatherRight">
    <p id="sunriseTime">Sunrise: ${sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    <p id="sunSetTime">Sun set: ${sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    <p id="durationTime">Duration: ${durationHours}h ${durationMinutes}m</p>
    </div>
    
    </div>
    </div>
    
    
    <div style="height: 15px;">
    
    </div>
    
    `
}

// https://openweathermap.org/img/wn/${iconCode}@2x.png


async function fetchDailyForecast(lat, lon,city) {
    let url;
    if (typeof city === 'string') {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    }
    if (typeof lat === 'number' && typeof lon === 'number') {
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Error fetching daily forecast data");
            return null;
        }
        const json = await response.json();
        return json;
    } catch (error) {
        console.error("Error", error);
        const weatherContent = document.getElementById("weatherContent");
        weatherContent.innerHTML = `<img src="/img/error.webp; class="error-image" alt="Error Image">`;
        return null;
    }
}



function getTodayForecasts(data) {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    return data.list.filter(item => {
        const itemDate = new Date(item.dt * 1000);

        return itemDate.getFullYear() === todayYear &&
            itemDate.getMonth() === todayMonth &&
            itemDate.getDate() === todayDate;
    });
}




function displayFullDailyForecast(data) {
    console.log(data);
    const weatherContent = document.getElementById("weatherContent");


    const oldTodayWeather = document.querySelector(".todayWeather");
    if (oldTodayWeather) oldTodayWeather.remove();

    const todayWeather = document.createElement("div");
    todayWeather.className = "todayWeather";

    const table = document.createElement("div");
    table.className = "hourlyForecastTable";

    const labelRow = document.createElement("div");
    labelRow.className = "hourlyRow";
    labelRow.innerHTML = `<div class="hourlyCell label">TODAY</div>`;
    table.appendChild(labelRow);

    const timeRow = document.createElement("div");
    timeRow.className = "hourlyRow";
    timeRow.innerHTML = `<div class="hourlyCell label"></div>`;

    const iconRow = document.createElement("div");
    iconRow.className = "hourlyRow";
    iconRow.innerHTML = `<div class="hourlyCell label"></div>`;

    const forecastRow = document.createElement("div");
    forecastRow.className = "hourlyRow";
    forecastRow.innerHTML = `<div class="hourlyCell label">Forecast</div>`;

    const tempRow = document.createElement("div");
    tempRow.className = "hourlyRow";
    tempRow.innerHTML = `<div class="hourlyCell label">Temp (°C)</div>`;

    const feelRow = document.createElement("div");
    feelRow.className = "hourlyRow";
    feelRow.innerHTML = `<div class="hourlyCell label">RealFeel</div>`;

    const windRow = document.createElement("div");
    windRow.className = "hourlyRow";
    windRow.innerHTML = `<div class="hourlyCell label">Wind (km/h)</div>`;

    data.forEach((item) => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: 'numeric' });
        const icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
        const desc = item.weather[0].main;
        const temp = `${Math.round(item.main.temp)}°`;
        const feels = `${Math.round(item.main.feels_like)}°`;
        const wind = `${(item.wind.speed).toFixed(0)} m/s`;

        timeRow.innerHTML += `<div class="hourlyCell">${time}</div>`;
        iconRow.innerHTML += `<div class="hourlyCell"><img src="${icon}" height="30"></div>`;
        forecastRow.innerHTML += `<div class="hourlyCell">${desc}</div>`;
        tempRow.innerHTML += `<div class="hourlyCell">${temp}</div>`;
        feelRow.innerHTML += `<div class="hourlyCell">${feels}</div>`;
        windRow.innerHTML += `<div class="hourlyCell">${wind}</div>`;
    });

    table.appendChild(timeRow);
    table.appendChild(iconRow);
    table.appendChild(forecastRow);
    table.appendChild(tempRow);
    table.appendChild(feelRow);
    table.appendChild(windRow);

    todayWeather.appendChild(table);
    weatherContent.appendChild(todayWeather);
    const lastDiv = document.createElement("div");
    lastDiv.style.height = "15px";
    weatherContent.appendChild(lastDiv);
}

document.getElementById("todayTab").addEventListener("click", () => {
    const searchQuery = searchInput.value.trim();

    if (searchQuery) { 
        fetchCurrentWeatherData(undefined,undefined,searchQuery)
            .then(data =>
                {
                if (data) 
                {
                    displayCurrentWeatherData(data);
                    return fetchDailyForecast(data.coord.lat, data.coord.lon);
                }
            })
            .then(dailyForecast => 
            {
                if (dailyForecast) {
                    const todayForecasts = getTodayForecasts(dailyForecast);
                    displayFullDailyForecast(todayForecasts);
                    setActiveTab("todayTab");
                }
            })
            .catch(error => console.error("Error fetching weather data", error));
    } 
    else
    {
        getLocation();
    }
});

searchInput.addEventListener("keypress", function (event) 
{
    if (event.key === "Enter") {
        console.log("Enter key pressed");
        event.preventDefault();
        const searchQuery = searchInput.value.trim();
        if (searchQuery) {
            fetchCurrentWeatherData(searchQuery)
                .then(data => {
                    if (data)
                    {
                        displayCurrentWeatherData(data);
                        return fetchDailyForecast(data.coord.lat, data.coord.lon);
                    }
                })
                .then(dailyForecast => {
                    if (dailyForecast) {
                        const todayForecasts = getTodayForecasts(dailyForecast);
                        displayFullDailyForecast(todayForecasts);
                    }
                })
                .catch(error => console.error("Error fetching weather data", error));
        }
    }
});


searchInput.addEventListener('focus', () => {
      searchInput.value = "";
    });


getLocation();


