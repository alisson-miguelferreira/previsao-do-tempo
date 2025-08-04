// Chave da API
const API_KEY = 'f7fc4ccec2e0cc8d47fa3f418178de34';

// Função principal - buscar o tempo
function searchWeather() {
    const cidade = document.getElementById('cityInput').value;
    
    if (!cidade) {
        alert('Por favor, digite o nome de uma cidade');
        return;
    }
    
    // Buscar tempo atual
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`)
        .then(response => response.json())
        .then(data => {
            // Mostrar tempo atual
            document.getElementById('cityName').textContent = data.name;
            document.getElementById('temperature').textContent = Math.round(data.main.temp);
            document.getElementById('description').textContent = data.weather[0].description;
            document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like) + '°C';
            document.getElementById('humidity').textContent = data.main.humidity + '%';
            document.getElementById('windSpeed').textContent = data.wind.speed + ' km/h';
            document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
            
            // Mostrar o card
            document.getElementById('currentWeather').classList.remove('hidden');
        })
        .catch(error => {
            alert('Cidade não encontrada!');
        });
    
    // Buscar previsão 5 dias
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`)
        .then(response => response.json())
        .then(data => {
            let cardsHTML = '';
            
            // Pegar 5 previsões (de 8 em 8 horas)
            for (let i = 0; i < 40; i += 8) {
                const previsao = data.list[i];
                const dia = new Date(previsao.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
                
                cardsHTML += `
                    <div class="forecast-card">
                        <div class="forecast-date">${dia}</div>
                        <img src="https://openweathermap.org/img/wn/${previsao.weather[0].icon}@2x.png">
                        <div class="forecast-temp">${Math.round(previsao.main.temp)}°C</div>
                        <div class="forecast-temp-min">Min: ${Math.round(previsao.main.temp_min)}°C</div>
                    </div>
                `;
            }
            
            // Mostrar cards
            document.getElementById('forecastCards').innerHTML = cardsHTML;
            document.getElementById('forecast').classList.remove('hidden');
        });
}

// Buscar ao pressionar Enter
document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchWeather();
    }
});