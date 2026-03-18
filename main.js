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

  // ================= BACKGROUND =================
  function setBackground(type) {
  document.body.className = "";
  document.body.classList.add(type);
}

  // ================= UI =================
  function setWeatherUI(iconCode, isNight) {
    removeRain();

    if (iconCode.includes("01")) {
      setBackground(isNight ? "night" : "sunny");
    }
    else if (iconCode.includes("02")) {
      setBackground("partly");
    }
    else if (iconCode.includes("03") || iconCode.includes("04")) {
      setBackground("cloudy");
    }
    else if (iconCode.includes("09") || iconCode.includes("10")) {
      setBackground("rainy");
   
    }
    else if (iconCode.includes("11")) {
      setBackground("storm");
    
    }
    else if (iconCode.includes("50")) {
      setBackground("cloudy");
    }
  }

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

  async function getWeatherByCoords(lat, lon) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`
      );
      const data = await res.json();

      displayWeather(data);
      getForecast(data.name);
    } catch {
      alert("Lỗi vị trí!");
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

// ✅ THÊM DÒNG NÀY ĐÚNG CHỖ
document.getElementById("icon").src =
  `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    // 🔥 FIX ngày / đêm chuẩn theo API
    const isNight = iconCode.includes("n");

    setWeatherUI(iconCode, isNight);
  }

  // ================= FORECAST =================
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
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      getWeatherByCoords(latitude, longitude);
    });
  });

  document.querySelectorAll(".city-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".city-btn")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      const city = btn.getAttribute("data-city");
      getWeather(city);
    });
  });

  // default
  getWeather("Hanoi");
});