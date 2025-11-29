function setActiveTab(activeId) {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.remove("active");
  });
  document.getElementById(activeId).classList.add("active");
}



document.getElementById("forecastTab").addEventListener("click", () => {
  setActiveTab("forecastTab");
  show5DayForecast();
});


async function show5DayForecast() {
  const weatherContent = document.getElementById("weatherContent");
  const searchQuery = document.getElementById("searchInput").value.trim();

  let forecastData;

  if (searchQuery) {
    forecastData = await fetchDailyForecast(undefined,undefined,searchQuery);
  } else {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        forecastData = await fetchDailyForecast(lat, lon);
      } catch (error) {
            const defaultcity = "Rivne";
            const weatherData = await fetchCurrentWeatherData(null, null, defaultcity);
            displayCurrentWeatherData(weatherData);

            const dailyForecast = await fetchDailyForecast(null, null, defaultcity);
        
        return;
      }
    }
  }

  if (!forecastData) {
    weatherContent.innerHTML = `<img src="img/error.webp" class="error-image" alt="Error Image">`;
    return;
  }

  display5DayForecast(forecastData);
}

function display5DayForecast(data) {
  const weatherContent = document.getElementById("weatherContent");
  weatherContent.innerHTML = "";

  const dailyForecasts = {};

  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();

    if (!dailyForecasts[dayKey]) {
      dailyForecasts[dayKey] = [];
    }
    dailyForecasts[dayKey].push(item);
  });

  const days = Object.keys(dailyForecasts).slice(0, 5);

  const forecastContainer = document.createElement("div");
  forecastContainer.className = "forecast-container";

  const title = document.createElement("h2");
  title.textContent = "5-DAY FORECAST";
  title.className = "cyanColor";
  title.style.padding = "20px";
  title.style.margin = "50px 50px 0 50px";

  const forecastGrid = document.createElement("div");
  forecastGrid.className = "forecastDiv";
  forecastGrid.style.margin = "20px 50px 50px 50px";

  days.forEach((dayKey, index) => {
    const dayForecasts = dailyForecasts[dayKey];
    const date = new Date(dayKey);

    let mainForecast = dayForecasts.find(f => {
      const hour = new Date(f.dt * 1000).getHours();
      return hour >= 12 && hour <= 15;
    }) || dayForecasts[0];

    const temps = dayForecasts.map(f => f.main.temp);
    const minTemp = Math.round(Math.min(...temps));
    const maxTemp = Math.round(Math.max(...temps));

    const dayCard = document.createElement("div");
    dayCard.className = "day-card";

    const dayName = document.createElement("div");
    dayName.className = "day-name";
    if (index === 0) {
      dayName.textContent = "TODAY";
    } else {
      dayName.textContent = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    }

    const dateDiv = document.createElement("div");
    dateDiv.className = "day-date";
    dateDiv.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const iconDiv = document.createElement("div");
    iconDiv.className = "day-icon";
    const icon = document.createElement("img");
    icon.src = `https://openweathermap.org/img/wn/${mainForecast.weather[0].icon}@2x.png`;
    icon.alt = mainForecast.weather[0].description;
    iconDiv.appendChild(icon);

    const tempDiv = document.createElement("div");
    tempDiv.className = "day-temp";
    tempDiv.innerHTML = `<strong>${maxTemp}°C</strong>`;

    const descDiv = document.createElement("div");
    descDiv.className = "day-desc";
    descDiv.textContent = mainForecast.weather[0].description;

    const minTempDiv = document.createElement("div");
    minTempDiv.className = "day-min-temp";
    minTempDiv.textContent = `${minTemp}°C`;

    dayCard.appendChild(dayName);
    dayCard.appendChild(dateDiv);
    dayCard.appendChild(iconDiv);
    dayCard.appendChild(tempDiv);
    dayCard.appendChild(descDiv);
    dayCard.appendChild(minTempDiv);

    dayCard.addEventListener('click', () => {
      displayDetailedDayForecast(dayForecasts, dayKey);
    });
    dayCard.style.cursor = 'pointer';

    forecastGrid.appendChild(dayCard);
  });

  forecastContainer.appendChild(title);
  forecastContainer.appendChild(forecastGrid);
  weatherContent.appendChild(forecastContainer);
}

function displayDetailedDayForecast(dayForecasts, dayKey) {
  const weatherContent = document.getElementById("weatherContent");

  const existingDetailedForecast = document.querySelector(".detailed-day-forecast");
  if (existingDetailedForecast) {
    existingDetailedForecast.remove();
  }

  const date = new Date(dayKey);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dateString = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const detailedForecast = document.createElement("div");
  detailedForecast.className = "detailed-day-forecast todayWeather";

  const table = document.createElement("div");
  table.className = "hourlyForecastTable";

  const labelRow = document.createElement("div");
  labelRow.className = "hourlyRow";
  labelRow.innerHTML = `<div class="hourlyCell label">${dayName.toUpperCase()} - ${dateString}</div>`;
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

  dayForecasts.forEach((item) => {
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

  detailedForecast.appendChild(table);

  const forecastContainer = document.querySelector(".forecast-container");
  if (forecastContainer) {
    forecastContainer.insertAdjacentElement('afterend', detailedForecast);
  } else {
    weatherContent.appendChild(detailedForecast);
  }

  const lastDiv = document.createElement("div");
  lastDiv.style.height = "15px";
  if (forecastContainer) {
    detailedForecast.insertAdjacentElement('afterend', lastDiv);
  } else {
    weatherContent.appendChild(lastDiv);
  }
}






