const API_KEY = 'f7fc4ccec2e0cc8d47fa3f418178de34';

function searchWeather() {
    const cidade = document.getElementById('cityInput').value;
    
    // Tempo atual
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === '404') {
                alert('Cidade não encontrada!');
                return;
            }
            document.getElementById('cityName').textContent = data.name;
            document.getElementById('temperature').textContent = Math.round(data.main.temp);
            document.getElementById('description').textContent = data.weather[0].description;
            document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like) + '°C';
            document.getElementById('humidity').textContent = data.main.humidity + '%';
            document.getElementById('windSpeed').textContent = data.wind.speed + ' km/h';
            document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
            document.getElementById('currentWeather').classList.remove('hidden');
        })
        .catch(() => alert('Erro ao buscar cidade!'));
    
    // Previsão 5 dias
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`)
        .then(response => response.json())
        .then(data => {
            let html = '';
            for (let i = 0; i < 5; i++) {
                const item = data.list[i * 8];
                const dia = new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
                html += `
                    <div class="forecast-card">
                        <div class="forecast-date">${dia}</div>
                        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png">
                        <div class="forecast-temp">${Math.round(item.main.temp)}°C</div>
                        <div class="forecast-temp-min">Min: ${Math.round(item.main.temp_min)}°C</div>
                    </div>
                `;
            }
            document.getElementById('forecastCards').innerHTML = html;
            document.getElementById('forecast').classList.remove('hidden');
        });
}