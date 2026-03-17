document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "7a4d79c651cd5e151391075462e9bfaf";

  const cityInput = document.getElementById("city");
  const searchBtn = document.getElementById("searchBtn");
  const locationBtn = document.getElementById("locationBtn");

  // ================= CLOCK =================
  function updateClock() {
    const now = new Date();
    document.getElementById("clock").innerText =
      now.toLocaleTimeString("vi-VN");
  }
  setInterval(updateClock, 1000);

  // ================= WEATHER =================
  async function getWeather(city) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},VN&appid=${apiKey}&units=metric&lang=vi`
      );
      const data = await res.json();

      displayWeather(data);
      getForecast(city);
    } catch {
      alert("Lỗi tải dữ liệu!");
    }
  }

  function displayWeather(data) {
    if (data.cod !== 200) {
      alert("Không tìm thấy thành phố!");
      return;
    }

    document.getElementById("name").innerText = data.name;
    document.getElementById("temp").innerText =
      Math.round(data.main.temp) + "°C";
    document.getElementById("desc").innerText =
      data.weather[0].description;
    document.getElementById("feels").innerText =
      "Feels like: " + Math.round(data.main.feels_like) + "°C";

    const iconCode = data.weather[0].icon;
    const weather = data.weather[0].main.toLowerCase();
    const isNight = iconCode.includes("n");

    setWeatherUI(weather, isNight);
  }

  // ================= UI =================
  function setWeatherUI(weather, isNight) {
    const icon = document.getElementById("icon");
    const body = document.body;

    body.className = "";
    removeRain();

    if (weather.includes("clear")) {
      icon.src = isNight
        ? "https://img.icons8.com/fluency/96/full-moon.png"
        : "https://img.icons8.com/fluency/96/sun.png";
      body.classList.add(isNight ? "night" : "sunny");
    } else if (weather.includes("cloud")) {
      icon.src = "https://img.icons8.com/fluency/96/cloud.png";
      body.classList.add("cloudy");
    } else if (weather.includes("rain")) {
      icon.src = "https://img.icons8.com/fluency/96/rain.png";
      body.classList.add("rainy");
      createRain();
    } else if (weather.includes("thunder")) {
      icon.src = "https://img.icons8.com/fluency/96/storm.png";
      body.classList.add("storm");
      createRain();
    } else {
      icon.src =
        "https://img.icons8.com/fluency/96/partly-cloudy-day.png";
    }
  }

  // ================= FORECAST PRO =================
  async function getForecast(city) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city},VN&appid=${apiKey}&units=metric&lang=vi`
      );
      const data = await res.json();

      if (data.cod !== "200") return;

      const forecastEl = document.getElementById("forecast");
      forecastEl.innerHTML = "";

      const list = data.list.filter((item, i) => i % 2 === 0);

      list.slice(0, 8).forEach(item => {
        const date = new Date(item.dt_txt);

        const time = date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit"
        });

        const day = date.toLocaleDateString("vi-VN", {
          weekday: "short"
        });

        const icon = item.weather[0].icon;
        const temp = Math.round(item.main.temp);

        forecastEl.innerHTML += `
          <div class="forecast-item">
            <p>${day}</p>
            <p class="time">${time}</p>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png"/>
            <p class="temp">${temp}°</p>
          </div>
        `;
      });
    } catch {
      console.log("Forecast lỗi");
    }
  }

  // ================= RAIN EFFECT =================
  function createRain() {
    if (document.querySelector(".rain-effect")) return;

    const rain = document.createElement("div");
    rain.classList.add("rain-effect");
    document.body.appendChild(rain);
  }

  function removeRain() {
    const rain = document.querySelector(".rain-effect");
    if (rain) rain.remove();
  }

  // ================= EVENTS =================
  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) getWeather(city);
  });

  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchBtn.click();
  });

  locationBtn.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=vi`
      );
      const data = await res.json();

      displayWeather(data);
      getForecast(data.name);
    });
  });

  document.querySelectorAll(".city-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const city = btn.getAttribute("data-city");
      getWeather(city);
    });
  });

  getWeather("Hanoi");
});
document.querySelectorAll(".city-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".city-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
  });
});