// ========== CONFIGURAÇÃO E VARIÁVEIS GLOBAIS ==========
const API_KEY = 'f7fc4ccec2e0cc8d47fa3f418178de34';
let currentUnit = 'metric';
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
let currentCityData = null;

// ========== ELEMENTOS DO DOM ==========
const DOM = {
    // Inputs e controles
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    unitToggle: document.getElementById('unitToggle'),

    // Telas principais
    welcomeScreen: document.getElementById('welcomeScreen'),
    weatherDisplay: document.getElementById('weatherDisplay'),

    // Indicadores de estado
    loadingOverlay: document.getElementById('loadingOverlay'),
    errorToast: document.getElementById('errorToast'),
    suggestions: document.getElementById('suggestions'),

    // Header
    headerTemp: document.getElementById('headerTemp'),
    headerLocation: document.getElementById('headerLocation'),
    refreshBtn: document.getElementById('refreshBtn'),

    // Modal de favoritos
    favoritesToggle: document.getElementById('openFavoritesModal'),
    favoritesModal: document.getElementById('favoritesModal'),
    favoritesBackdrop: document.getElementById('favoritesBackdrop'),
    closeFavorites: document.getElementById('closeFavorites'),
    favoritesList: document.getElementById('favoritesList'),
    clearFavorites: document.getElementById('clearFavorites'),

    // Dados do clima - IDs atualizados
    cityName: document.getElementById('cityName'),
    coordinates: document.getElementById('coordinates'),
    mainTemp: document.getElementById('mainTemp'),
    feelsLike: document.getElementById('feelsLike'),
    weatherIcon: document.getElementById('weatherIcon'),
    weatherDescription: document.getElementById('weatherDescription'),
    lastUpdate: document.getElementById('lastUpdate'),
    sunInfo: document.getElementById('sunInfo'),
    addFavorite: document.getElementById('addFavorite'),

    // Detalhes meteorológicos
    windSpeed: document.getElementById('windSpeed'),
    humidity: document.getElementById('humidity'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),

    // Previsão - ID atualizado
    forecastCards: document.getElementById('forecastContainer'),

    // Toast
    closeToast: document.getElementById('closeToast'),

    // Elementos responsivos
    sidebarToggle: document.getElementById('sidebarToggle'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    sidebar: document.querySelector('.sidebar')
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Depuração: verificar se elementos críticos estão presentes
    console.log('Inicializando app. Elementos DOM:', {
        mainTemp: DOM.mainTemp,
        cityName: DOM.cityName,
        weatherIcon: DOM.weatherIcon,
        weatherDescription: DOM.weatherDescription,
        forecastCards: DOM.forecastCards,
        addFavorite: DOM.addFavorite
    });

    showWelcomeScreen();
    loadFavorites();
    setupEventListeners();
    updateHeaderInfo('Selecione uma cidade', '--°');
}

// ========== CONFIGURAÇÃO DE EVENTOS ==========
function setupEventListeners() {
    // Eventos de pesquisa
    DOM.searchBtn.addEventListener('click', handleSearch);
    DOM.cityInput.addEventListener('keypress', handleSearchKeypress);
    DOM.cityInput.addEventListener('input', handleCityInput);
    DOM.locationBtn.addEventListener('click', getCurrentLocation);

    // Controles de unidade
    DOM.unitToggle.addEventListener('click', toggleUnit);

    // Header
    DOM.refreshBtn.addEventListener('click', refreshWeather);

    // Modal de favoritos
    DOM.favoritesToggle.addEventListener('click', toggleFavoritesModal);
    DOM.closeFavorites.addEventListener('click', closeFavoritesModal);
    DOM.favoritesBackdrop.addEventListener('click', closeFavoritesModal);
    DOM.clearFavorites.addEventListener('click', clearAllFavorites);

    // Favoritos
    if (DOM.addFavorite) {
        DOM.addFavorite.addEventListener('click', addCurrentCityToFavorites);
        console.log('Botão de favoritos configurado com sucesso');
    } else {
        console.error('Botão addFavorite não encontrado no DOM');
    }

    // Toast de erro
    if (DOM.closeToast) {
        DOM.closeToast.addEventListener('click', hideErrorToast);
    }

    // Sidebar responsiva
    if (DOM.sidebarToggle) {
        DOM.sidebarToggle.addEventListener('click', toggleSidebar);
    }

    if (DOM.sidebarOverlay) {
        DOM.sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Fechar sugestões ao clicar fora
    document.addEventListener('click', (e) => {
        if (!DOM.cityInput.contains(e.target) && !DOM.suggestions.contains(e.target)) {
            hideSuggestions();
        }
    });
}

// ========== FUNÇÕES DE CONTROLE DE TELA ==========
function showWelcomeScreen() {
    DOM.welcomeScreen.classList.remove('hidden');
    DOM.weatherDisplay.classList.add('hidden');
}

function hideWelcomeScreen() {
    DOM.welcomeScreen.classList.add('hidden');
    DOM.weatherDisplay.classList.remove('hidden');
}

function showLoading() {
    DOM.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    DOM.loadingOverlay.classList.add('hidden');
}

function showErrorToast(message) {
    const toastMessage = DOM.errorToast.querySelector('.toast-message');
    if (toastMessage) {
        toastMessage.textContent = message;
    }
    DOM.errorToast.classList.remove('hidden');

    // Ocultar automaticamente após 5 segundos
    setTimeout(() => {
        hideErrorToast();
    }, 5000);
}

function hideErrorToast() {
    DOM.errorToast.classList.add('hidden');
}

// ========== FUNÇÕES DE PESQUISA ==========
function handleSearch() {
    const city = DOM.cityInput.value.trim();
    if (city) {
        searchWeather(city);
        hideSuggestions();
    }
}

function handleSearchKeypress(e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
}

async function searchWeather(city) {
    if (!city || typeof city !== 'string') {
        showErrorToast('Nome da cidade inválido');
        return;
    }

    try {
        showLoading();
        console.log('Buscando clima para:', city);

        const [weatherData, forecastData] = await Promise.all([
            fetchWeatherData(city),
            fetchForecastData(city)
        ]);

        currentCityData = weatherData;
        displayWeather(weatherData);
        displayForecast(forecastData);
        hideWelcomeScreen();
        hideLoading();

        // Atualizar header
        updateHeaderInfo(weatherData.name, Math.round(weatherData.main.temp));

        // Preencher input com nome correto da cidade
        DOM.cityInput.value = weatherData.name;

        // Fechar sidebar em mobile após pesquisa
        handleMobileSearch();

        console.log('Pesquisa concluída com sucesso:', weatherData.name);

    } catch (error) {
        hideLoading();
        const errorMessage = error.message || 'Erro ao buscar dados do clima';
        showErrorToast(errorMessage);
        console.error('Erro na pesquisa:', error);

        // Manter tela de boas-vindas se não houver dados anteriores
        if (!currentCityData) {
            showWelcomeScreen();
        }
    }
}

async function getCurrentLocation() {
    if (!navigator.geolocation) {
        showErrorToast('Geolocalização não suportada pelo navegador');
        return;
    }

    showLoading();

    const options = {
        enableHighAccuracy: true,
        timeout: 30000, // Timeout ainda maior para melhor precisão
        maximumAge: 0, // Sempre buscar localização atual
        desiredAccuracy: 100 // Precisão desejada em metros
    };

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude, accuracy } = position.coords;
                console.log('Localização obtida:', { latitude, longitude, accuracy });

                // Verificar precisão - se muito imprecisa, tentar novamente
                if (accuracy > 1000) {
                    console.warn('Precisão baixa (', accuracy, 'm), tentando novamente...');
                    setTimeout(() => getCurrentLocation(), 2000);
                    return;
                }

                // Buscar dados do clima pela coordenada
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${currentUnit}&lang=pt_br`;
                const weatherResponse = await fetch(weatherUrl);

                if (!weatherResponse.ok) {
                    throw new Error('Não foi possível obter dados para esta localização');
                }

                const weatherData = await weatherResponse.json();
                console.log('Dados da API OpenWeather:', weatherData);

                // Múltiplas tentativas de geocodificação reversa
                let resolvedLocation = await reverseGeocode(latitude, longitude);

                // Se a primeira geocodificação reversa falhar, tentar com coordenadas ligeiramente ajustadas
                if (!resolvedLocation || !resolvedLocation.name) {
                    console.log('Primeira tentativa de geocodificação reversa falhou, tentando ajustada...');
                    resolvedLocation = await reverseGeocode(latitude + 0.001, longitude + 0.001) ||
                        await reverseGeocode(latitude - 0.001, longitude - 0.001);
                }

                console.log('Geocodificação reversa resultado final:', resolvedLocation);

                // Determinar o melhor nome para a cidade
                let cityName = null;
                let displayName = null;

                // PRIORIDADE 1: Geocodificação reversa com localização precisa
                if (resolvedLocation && resolvedLocation.name && resolvedLocation.name.length > 1) {
                    console.log('✓ Usando geocodificação reversa:', resolvedLocation.fullName || resolvedLocation.name);
                    cityName = resolvedLocation.name;
                    displayName = resolvedLocation.fullName || resolvedLocation.name;

                    // Validar se o nome faz sentido (não é só números ou caracteres estranhos)
                    if (!/^[\d\.,\s°-]+$/.test(cityName)) {
                        weatherData.fullLocationName = displayName;
                    } else {
                        resolvedLocation = null; // Invalidar se nome não faz sentido
                    }
                }

                // PRIORIDADE 2: Nome da interface OpenWeather (se geocodificação reversa falhou)
                if (!cityName && weatherData.name && weatherData.name.length > 1 && !/^[\d\.,\s°-]+$/.test(weatherData.name)) {
                    console.log('✓ Usando API OpenWeather:', weatherData.name);
                    cityName = weatherData.name;
                    displayName = weatherData.name;

                    // Tentar melhorar com informações do país se disponível
                    if (weatherData.sys && weatherData.sys.country) {
                        const countryNames = {
                            'BR': 'Brasil', 'US': 'Estados Unidos', 'CA': 'Canadá', 'MX': 'México',
                            'AR': 'Argentina', 'CL': 'Chile', 'CO': 'Colômbia', 'PE': 'Peru'
                        };
                        const countryName = countryNames[weatherData.sys.country] || weatherData.sys.country;
                        displayName += ` - ${countryName}`;
                    }
                }

                // PRIORIDADE 3: Fallback para coordenadas (último recurso)
                if (!cityName) {
                    console.log('⚠ Usando coordenadas como fallback');
                    const latStr = latitude.toFixed(3);
                    const lonStr = longitude.toFixed(3);
                    cityName = `Localização Atual`;
                    displayName = `${latStr}°, ${lonStr}°`;
                }

                // Atualizar o objeto com o melhor nome encontrado
                weatherData.name = displayName;
                weatherData.cityKey = cityName; // Chave para comparações

                // Buscar previsão do tempo
                const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${currentUnit}&lang=pt_br`;
                const forecastResponse = await fetch(forecastUrl);
                const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;

                // Processar e exibir dados
                currentCityData = weatherData;
                displayWeather(weatherData);

                if (forecastData) {
                    displayForecast(forecastData);
                }

                hideWelcomeScreen();
                hideLoading();

                // Atualizar interface
                updateHeaderInfo(weatherData.name, Math.round(weatherData.main.temp));
                DOM.cityInput.value = weatherData.name;

                console.log('Localização processada com sucesso:', weatherData.name);

            } catch (error) {
                hideLoading();
                showErrorToast('Erro ao obter localização: ' + (error.message || 'Erro desconhecido'));
                console.error('Erro de localização:', error);
            }
        },
        (error) => {
            hideLoading();
            let errorMessage = 'Erro ao acessar localização';

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Permissão de localização negada';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Localização indisponível';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Tempo esgotado para obter localização';
                    break;
            }

            showErrorToast(errorMessage);
            console.error('Erro de geolocalização:', error);
        },
        options
    );
}

// ========== GEOCODIFICAÇÃO REVERSA ==========

function refreshWeather() {
    if (currentCityData && currentCityData.name) {
        searchWeather(currentCityData.name);
    } else {
        showErrorToast('Nenhuma cidade selecionada para atualizar');
    }
}

// ========== FUNÇÕES DE INTERFACE DE PROGRAMAÇÃO ==========
async function fetchWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}&lang=pt_br`;
    console.log('Buscando dados do clima para:', city);

    const response = await fetch(url);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Cidade não encontrada');
    }

    const data = await response.json();

    if (!data.main || !data.weather || !data.weather[0]) {
        throw new Error('Dados meteorológicos incompletos');
    }

    // Validar e melhorar o nome da cidade
    if (data.name && data.coord) {
        // Tentar obter nome mais preciso via geocodificação reversa se disponível
        try {
            const betterLocation = await reverseGeocode(data.coord.lat, data.coord.lon);
            if (betterLocation && betterLocation.fullName && betterLocation.fullName.length > data.name.length) {
                console.log('Melhorando nome da cidade:', data.name, '->', betterLocation.fullName);
                data.name = betterLocation.fullName;
                data.cityKey = betterLocation.name;
            }
        } catch (error) {
            console.warn('Erro ao melhorar nome da cidade:', error);
        }
    }

    console.log('Dados do clima obtidos para:', data.name);
    return data;
}

async function fetchForecastData(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}&lang=pt_br`;

    const response = await fetch(url);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao buscar previsão');
    }

    const data = await response.json();

    if (!data.list || !Array.isArray(data.list)) {
        throw new Error('Dados de previsão indisponíveis');
    }

    return data;
}

async function reverseGeocode(lat, lon) {
    try {
        // Garantir precisão das coordenadas
        const precision = 6;
        const roundedLat = parseFloat(lat.toFixed(precision));
        const roundedLon = parseFloat(lon.toFixed(precision));

        const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${roundedLat}&lon=${roundedLon}&limit=3&appid=${API_KEY}`;
        console.log('Fazendo geocodificação reversa para:', { lat: roundedLat, lon: roundedLon });

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Resposta do geocodificação reversa:', data);

        if (Array.isArray(data) && data.length > 0) {
            // Tentar encontrar a melhor localização na lista
            let bestLocation = null;

            for (const location of data) {
                // Priorizar localizações com nome em português ou nome mais completo
                const cityName = location.local_names?.pt || location.local_names?.['pt-BR'] || location.name;

                // Validar se o nome é válido (não apenas números/coordenadas)
                if (cityName && cityName.length > 1 && !/^[\d\.,\s°-]+$/.test(cityName)) {
                    // Priorizar localizações brasileiras se coordenadas no Brasil
                    if (location.country === 'BR' && roundedLat > -35 && roundedLat < 6 && roundedLon > -75 && roundedLon < -30) {
                        bestLocation = location;
                        break;
                    } else if (!bestLocation) {
                        bestLocation = location;
                    }
                }
            }

            if (bestLocation) {
                const location = bestLocation;

                // Priorizar nomes em português
                let cityName = location.local_names?.pt || location.local_names?.['pt-BR'] || location.name;

                // Validação final do nome
                if (!cityName || cityName.length < 2 || /^[\d\.,\s°-]+$/.test(cityName)) {
                    console.warn('Nome da cidade inválido no geocodificação reversa:', cityName);
                    return null;
                }

                // Construir nome completo com contexto
                let fullName = cityName;

                if (location.state) {
                    fullName += `, ${location.state}`;
                }

                if (location.country) {
                    // Mapear códigos de país para nomes em português
                    const countryNames = {
                        'BR': 'Brasil', 'US': 'Estados Unidos', 'CA': 'Canadá', 'MX': 'México',
                        'AR': 'Argentina', 'CL': 'Chile', 'CO': 'Colômbia', 'PE': 'Peru',
                        'UY': 'Uruguai', 'PY': 'Paraguai', 'BO': 'Bolívia', 'EC': 'Equador',
                        'VE': 'Venezuela', 'GY': 'Guiana', 'SR': 'Suriname', 'GF': 'Guiana Francesa',
                        'FR': 'França', 'DE': 'Alemanha', 'IT': 'Itália', 'ES': 'Espanha',
                        'PT': 'Portugal', 'GB': 'Reino Unido', 'IE': 'Irlanda', 'NL': 'Países Baixos',
                        'BE': 'Bélgica', 'CH': 'Suíça', 'AT': 'Áustria', 'JP': 'Japão',
                        'CN': 'China', 'IN': 'Índia', 'AU': 'Austrália', 'NZ': 'Nova Zelândia',
                        'ZA': 'África do Sul'
                    };

                    const countryName = countryNames[location.country] || location.country;
                    fullName += ` - ${countryName}`;
                }

                console.log('Geocodificação reversa bem-sucedido:', { cityName, fullName });
                return {
                    name: cityName,
                    fullName: fullName,
                    state: location.state || '',
                    country: location.country || '',
                    coordinates: { lat: roundedLat, lon: roundedLon }
                };
            }
        }

        console.warn('Nenhuma localização válida encontrada no geocodificação reversa');
        return null;
    } catch (error) {
        console.error('Erro no geocodificação reversa:', error);
        return null;
    }
}

// ========== EXIBIÇÃO DOS DADOS ==========
function displayWeather(data) {
    if (!data || !data.main || !data.weather || !data.weather[0]) {
        showErrorToast('Dados meteorológicos inválidos');
        return;
    }

    console.log('Exibindo dados do clima:', data);
    console.log('Verificando elementos DOM:', {
        mainTemp: DOM.mainTemp,
        cityName: DOM.cityName,
        feelsLike: DOM.feelsLike,
        weatherDescription: DOM.weatherDescription,
        weatherIcon: DOM.weatherIcon
    });

    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';

    // Informações principais - priorizar nome da interface do clima
    const cityName = data.name || 'Local desconhecido';
    const cityDisplay = currentCityData?.fullName || cityName;

    // Atualizar elementos da tela principal
    if (DOM.cityName) DOM.cityName.textContent = cityDisplay;
    if (DOM.mainTemp) {
        const tempValue = Math.round(data.main.temp) + unitSymbol;
        console.log('Atualizando temperatura principal:', tempValue);
        DOM.mainTemp.textContent = tempValue;
    } else {
        console.error('Elemento mainTemp não encontrado no DOM!');
    }
    if (DOM.feelsLike) DOM.feelsLike.textContent = `Sensação: ${Math.round(data.main.feels_like)}${unitSymbol}`;
    if (DOM.weatherDescription) {
        const description = data.weather[0].description || 'Condição não disponível';
        console.log('Atualizando descrição do tempo:', description);
        DOM.weatherDescription.textContent = description;
    } else {
        console.error('Elemento weatherDescription não encontrado no DOM!');
    }
    if (DOM.weatherIcon) DOM.weatherIcon.textContent = getWeatherEmoji(
        data.weather[0].main,
        data.timezone,
        data.sys?.sunrise,
        data.sys?.sunset
    );

    // Coordenadas formatadas com símbolos de graus
    if (data.coord && typeof data.coord.lat === 'number' && typeof data.coord.lon === 'number') {
        const lat = data.coord.lat.toFixed(4);
        const lon = data.coord.lon.toFixed(4);
        if (DOM.coordinates) DOM.coordinates.textContent = `${lat}°, ${lon}°`;
    } else {
        if (DOM.coordinates) DOM.coordinates.textContent = 'Coordenadas não disponíveis';
    }

    // Detalhes meteorológicos
    if (DOM.humidity) DOM.humidity.textContent = (data.main.humidity || 0) + '%';
    if (DOM.pressure) DOM.pressure.textContent = (data.main.pressure || 0) + ' hPa';

    // Vento - conversão e formatação correta
    let windSpeed = 'N/A';
    if (data.wind && typeof data.wind.speed === 'number') {
        if (currentUnit === 'metric') {
            // m/s para km/h
            windSpeed = (data.wind.speed * 3.6).toFixed(1) + ' km/h';
        } else {
            // m/s para mph
            windSpeed = (data.wind.speed * 2.237).toFixed(1) + ' mph';
        }
    }
    if (DOM.windSpeed) DOM.windSpeed.textContent = windSpeed;

    // Visibilidade - metros para quilômetros
    const visibility = (data.visibility && typeof data.visibility === 'number') ?
        (data.visibility / 1000).toFixed(1) + ' km' : 'N/A';
    if (DOM.visibility) DOM.visibility.textContent = visibility;

    // Informações adicionais
    const now = new Date();
    if (DOM.lastUpdate) {
        DOM.lastUpdate.textContent = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Nascer e pôr do sol com fuso horário local
    if (data.sys && data.sys.sunrise && data.sys.sunset) {
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        if (DOM.sunInfo) DOM.sunInfo.textContent = `🌅 ${sunrise} | 🌇 ${sunset}`;
    } else {
        if (DOM.sunInfo) DOM.sunInfo.textContent = '🌅 --:-- | 🌇 --:--';
    }

    // Atualizar header com localização encurtada
    const shortLocation = cityName.length > 20 ? cityName.substring(0, 17) + '...' : cityName;
    updateHeaderInfo(shortLocation, Math.round(data.main.temp) + unitSymbol);

    // Verificar se é favorito
    updateFavoriteButton(cityName);

    // Mostrar dashboard e esconder tela de boas-vindas
    showWeatherDisplay();
}

// ========== FUNÇÕES DE INTERFACE ==========
function showWelcomeScreen() {
    if (DOM.welcomeScreen) DOM.welcomeScreen.classList.remove('hidden');
    if (DOM.weatherDisplay) DOM.weatherDisplay.classList.add('hidden');
}

function showWeatherDisplay() {
    if (DOM.welcomeScreen) DOM.welcomeScreen.classList.add('hidden');
    if (DOM.weatherDisplay) DOM.weatherDisplay.classList.remove('hidden');
}

function updateHeaderInfo(location, temperature) {
    if (DOM.headerLocation) DOM.headerLocation.textContent = location;
    if (DOM.headerTemp) DOM.headerTemp.textContent = temperature;
}

function showLoading() {
    if (DOM.loadingOverlay) DOM.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    if (DOM.loadingOverlay) DOM.loadingOverlay.classList.add('hidden');
}

function showErrorToast(message) {
    if (DOM.errorToast) {
        const messageEl = DOM.errorToast.querySelector('.toast-message');
        if (messageEl) messageEl.textContent = message;
        DOM.errorToast.classList.remove('hidden');

        // Ocultar automaticamente após 5 segundos
        setTimeout(() => {
            hideErrorToast();
        }, 5000);
    }
}

function hideErrorToast() {
    if (DOM.errorToast) DOM.errorToast.classList.add('hidden');
}

function displayForecast(data) {
    if (!data || !data.list || !Array.isArray(data.list)) {
        console.warn('Dados de previsão indisponíveis');
        DOM.forecastCards.innerHTML = '<div class="forecast-error">Previsão não disponível</div>';
        return;
    }

    console.log('Exibindo previsão:', data);

    const unitSymbol = currentUnit === 'metric' ? '°' : '°';
    let html = '';

    // Selecionar dados para os próximos 5 dias únicos
    const forecastDays = [];
    const processedDates = new Set();
    const dailyData = new Map(); // Para agrupar dados por dia

    // Primeiro, agrupar todos os dados por dia para calcular min/max corretas
    for (const item of data.list) {
        if (!item || !item.main || !item.weather || !item.weather[0]) continue;

        const date = new Date(item.dt * 1000);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

        if (!dailyData.has(dateKey)) {
            dailyData.set(dateKey, {
                items: [],
                tempMax: item.main.temp_max || item.main.temp,
                tempMin: item.main.temp_min || item.main.temp,
                weather: item.weather[0],
                dt: item.dt,
                date: date
            });
        }

        const dayData = dailyData.get(dateKey);
        dayData.items.push(item);
        dayData.tempMax = Math.max(dayData.tempMax, item.main.temp_max || item.main.temp);
        dayData.tempMin = Math.min(dayData.tempMin, item.main.temp_min || item.main.temp);
    }

    // Selecionar os próximos 5 dias únicos
    const sortedDays = Array.from(dailyData.values())
        .sort((a, b) => a.dt - b.dt)
        .slice(0, 5);

    sortedDays.forEach((dayData, index) => {
        const dayName = dayData.date.toLocaleDateString('pt-BR', { weekday: 'short' });
        const dayNumber = dayData.date.getDate();

        const tempMax = Math.round(dayData.tempMax);
        const tempMin = Math.round(dayData.tempMin);
        const description = dayData.weather.description || 'Condição não disponível';

        // Usar horário atual para determinar se é dia ou noite (não o horário da previsão)
        const forecastTimezone = data.city?.timezone || 0;
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const localCurrentTime = new Date(utc + (forecastTimezone * 1000));
        const currentHour = localCurrentTime.getHours();

        // Determinar se agora é dia ou noite
        const isCurrentlyDaytime = currentHour >= 6 && currentHour < 18;

        const icon = getWeatherEmoji(
            dayData.weather.main,
            forecastTimezone,
            isCurrentlyDaytime ? Date.now() / 1000 : null, // usar horário atual
            isCurrentlyDaytime ? null : Date.now() / 1000  // usar horário atual
        );

        html += `
            <div class="forecast-card" title="${description}">
                <div class="forecast-date">${dayName}, ${dayNumber}</div>
                <div class="forecast-weather-icon">${icon}</div>
                <div class="forecast-temps">
                    <div class="forecast-high">
                        <span class="temp-label">Máx</span>
                        <span class="temp-value">${tempMax}${unitSymbol}</span>
                    </div>
                    <div class="forecast-low">
                        <span class="temp-label">Mín</span>
                        <span class="temp-value">${tempMin}${unitSymbol}</span>
                    </div>
                </div>
                <div class="forecast-description" title="${description}">
                    ${description}
                </div>
            </div>
        `;
    });

    DOM.forecastCards.innerHTML = html || '<div class="forecast-error">Previsão não disponível</div>';
}

function updateHeaderInfo(location, temperature) {
    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';

    // Encurtar nome da localização se muito longo para o header
    let shortLocation = location;
    if (location.length > 30) {
        const parts = location.split(',');
        shortLocation = parts[0]; // Usar apenas o nome da cidade
    }

    DOM.headerLocation.textContent = shortLocation;
    DOM.headerTemp.textContent = typeof temperature === 'number' ?
        `${temperature}${unitSymbol}` : temperature;
}

// ========== SISTEMA DE UNIDADES ==========
function toggleUnit() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';

    // Atualizar interface do botão
    const metricOption = DOM.unitToggle.querySelector('[data-unit="metric"]');
    const imperialOption = DOM.unitToggle.querySelector('[data-unit="imperial"]');

    if (currentUnit === 'metric') {
        metricOption.classList.add('active');
        imperialOption.classList.remove('active');
        DOM.unitToggle.setAttribute('data-unit', 'metric');
    } else {
        imperialOption.classList.add('active');
        metricOption.classList.remove('active');
        DOM.unitToggle.setAttribute('data-unit', 'imperial');
    }

    // Recarregar dados se houver cidade atual
    if (currentCityData) {
        searchWeather(currentCityData.name);
    }
}

// ========== SISTEMA DE SUGESTÕES ==========
function handleCityInput() {
    const query = DOM.cityInput.value.trim();

    if (query.length < 2) {
        hideSuggestions();
        return;
    }

    showSuggestions(query);
}

function showSuggestions(query) {
    // Lista de cidades populares para sugestões
    const popularCities = [
        'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza',
        'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
        'Goiânia', 'Belém', 'Guarulhos', 'Campinas', 'São Luís',
        'Nova York', 'Londres', 'Paris', 'Tóquio', 'Pequim',
        'Madrid', 'Roma', 'Berlim', 'Moscou', 'Mumbai',
        'Buenos Aires', 'Mexico City', 'Toronto', 'Sydney', 'Melbourne'
    ];

    const filteredCities = popularCities.filter(city =>
        city.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    if (filteredCities.length > 0) {
        let html = '';
        filteredCities.forEach(city => {
            html += `<div class="suggestion-item" onclick="selectCity('${city}')">${city}</div>`;
        });

        DOM.suggestions.innerHTML = html;
        DOM.suggestions.classList.add('visible');
    } else {
        hideSuggestions();
    }
}

function hideSuggestions() {
    DOM.suggestions.classList.remove('visible');
    DOM.suggestions.innerHTML = '';
}

function selectCity(city) {
    DOM.cityInput.value = city;
    hideSuggestions();
    searchWeather(city);
}

// ========== SISTEMA DE FAVORITOS ==========
function toggleFavoritesModal() {
    DOM.favoritesModal.classList.toggle('hidden');
    if (!DOM.favoritesModal.classList.contains('hidden')) {
        loadFavorites();
    }
}

function closeFavoritesModal() {
    DOM.favoritesModal.classList.add('hidden');
}

function loadFavorites() {
    if (!DOM.favoritesList) return;

    let html = '';

    if (favorites.length === 0) {
        html = '<div class="no-favorites" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">Nenhuma cidade favorita ainda</div>';
    } else {
        favorites.forEach((city, index) => {
            html += `
                <div class="favorite-item" onclick="selectFavoriteCity('${city}')">
                    <span class="favorite-name">${city}</span>
                    <button class="favorite-remove" onclick="removeFavorite(${index})" title="Remover">×</button>
                </div>
            `;
        });
    }

    DOM.favoritesList.innerHTML = html;
}

function selectFavoriteCity(city) {
    DOM.cityInput.value = city;
    closeFavoritesModal();
    searchWeather(city);
}

function addToFavorites(cityName) {
    if (!favorites.includes(cityName)) {
        favorites.push(cityName);
        localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
        loadFavorites();
        updateFavoriteButton(cityName);
        showTemporaryNotification(`${cityName} adicionada aos favoritos!`);
    }
}

function removeFavorite(index) {
    const cityName = favorites[index];
    favorites.splice(index, 1);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    loadFavorites();

    // Atualizar botão se for a cidade atual
    if (currentCityData && currentCityData.name === cityName) {
        updateFavoriteButton(currentCityData.name);
    }

    showTemporaryNotification(`${cityName} removida dos favoritos`);
}

function addCurrentCityToFavorites() {
    if (currentCityData && currentCityData.name) {
        if (favorites.includes(currentCityData.name)) {
            // Remover se já estiver nos favoritos
            const index = favorites.indexOf(currentCityData.name);
            removeFavorite(index);
        } else {
            // Adicionar aos favoritos
            addToFavorites(currentCityData.name);
        }
    } else {
        showErrorToast('Nenhuma cidade selecionada para favoritar');
    }
}

function clearAllFavorites() {
    if (favorites.length === 0) {
        showErrorToast('Nenhum favorito para limpar');
        return;
    }

    if (confirm('Tem certeza que deseja limpar todos os favoritos?')) {
        favorites = [];
        localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
        loadFavorites();

        // Atualizar botão se houver cidade atual
        if (currentCityData) {
            updateFavoriteButton(currentCityData.name);
        }

        showTemporaryNotification('Todos os favoritos foram removidos');
    }
}

// ========== FUNÇÕES DE INTERFACE ==========
function showWelcomeScreen() {
    if (DOM.welcomeScreen) DOM.welcomeScreen.classList.remove('hidden');
    if (DOM.weatherDisplay) DOM.weatherDisplay.classList.add('hidden');
}

function showWeatherDisplay() {
    if (DOM.welcomeScreen) DOM.welcomeScreen.classList.add('hidden');
    if (DOM.weatherDisplay) DOM.weatherDisplay.classList.remove('hidden');
}

function updateHeaderInfo(location, temperature) {
    if (DOM.headerLocation) DOM.headerLocation.textContent = location;
    if (DOM.headerTemp) DOM.headerTemp.textContent = temperature;
}

function showLoading() {
    if (DOM.loadingOverlay) DOM.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    if (DOM.loadingOverlay) DOM.loadingOverlay.classList.add('hidden');
}

function showErrorToast(message) {
    if (DOM.errorToast) {
        const messageEl = DOM.errorToast.querySelector('.toast-message');
        if (messageEl) messageEl.textContent = message;
        DOM.errorToast.classList.remove('hidden');

        // Ocultar automaticamente após 5 segundos
        setTimeout(() => {
            hideErrorToast();
        }, 5000);
    }
}

function hideErrorToast() {
    if (DOM.errorToast) DOM.errorToast.classList.add('hidden');
}

function updateFavoriteButton(cityName) {
    if (!DOM.addFavorite || !cityName) return;

    const isFavorite = favorites.includes(cityName);

    if (isFavorite) {
        DOM.addFavorite.classList.add('active');
        DOM.addFavorite.title = 'Remover dos favoritos';
    } else {
        DOM.addFavorite.classList.remove('active');
        DOM.addFavorite.title = 'Adicionar aos favoritos';
    }
}

// ========== FUNÇÕES DE RESPONSIVIDADE ==========
function toggleSidebar() {
    if (DOM.sidebar && DOM.sidebarToggle && DOM.sidebarOverlay) {
        const isOpen = DOM.sidebar.classList.contains('show');

        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
}

function openSidebar() {
    if (DOM.sidebar && DOM.sidebarToggle && DOM.sidebarOverlay) {
        DOM.sidebar.classList.add('show');
        DOM.sidebarToggle.classList.add('active');
        DOM.sidebarOverlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevenir scroll do body
    }
}

function closeSidebar() {
    if (DOM.sidebar && DOM.sidebarToggle && DOM.sidebarOverlay) {
        DOM.sidebar.classList.remove('show');
        DOM.sidebarToggle.classList.remove('active');
        DOM.sidebarOverlay.classList.remove('show');
        document.body.style.overflow = ''; // Restaurar scroll do body
    }
}

// Fechar sidebar automaticamente ao selecionar uma cidade em mobile
function handleMobileSearch() {
    if (window.innerWidth <= 1023) {
        closeSidebar();
    }
}

// Ajustar layout quando a tela é redimensionada
function handleResize() {
    if (window.innerWidth > 1023) {
        // Em telas maiores, garantir que a sidebar esteja visível e o overlay oculto
        if (DOM.sidebar) DOM.sidebar.classList.remove('show');
        if (DOM.sidebarToggle) DOM.sidebarToggle.classList.remove('active');
        if (DOM.sidebarOverlay) DOM.sidebarOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Adicionar listener para redimensionamento
window.addEventListener('resize', handleResize);

// ========== FUNÇÕES AUXILIARES DE LOCALIZAÇÃO ==========
function validateCityName(name) {
    if (!name || typeof name !== 'string') return false;

    // Verificar se não é apenas números, coordenadas ou caracteres especiais
    const invalidPatterns = [
        /^[\d\.,\s°-]+$/, // Apenas números e coordenadas
        /^[^a-zA-ZÀ-ÿ]+$/, // Sem letras
        /^.{0,1}$/ // Muito curto
    ];

    return !invalidPatterns.some(pattern => pattern.test(name.trim()));
}

function normalizeCityName(rawName, country, state) {
    if (!validateCityName(rawName)) return null;

    let normalized = rawName.trim();

    // Adicionar contexto geográfico se necessário e disponível
    if (country && country !== 'BR') {
        const countryNames = {
            'US': 'Estados Unidos', 'CA': 'Canadá', 'MX': 'México',
            'AR': 'Argentina', 'CL': 'Chile', 'CO': 'Colômbia', 'PE': 'Peru'
        };
        const countryName = countryNames[country] || country;

        if (state && !normalized.includes(state)) {
            normalized += `, ${state}`;
        }
        if (!normalized.includes(countryName)) {
            normalized += ` - ${countryName}`;
        }
    } else if (state && country === 'BR' && !normalized.includes(state)) {
        // Para o Brasil, adicionar estado apenas se não estiver presente
        normalized += `, ${state}`;
    }

    return normalized;
}

// ========== UTILITÁRIOS ==========
function getWeatherEmoji(weatherMain, timezone = 0, sunrise = null, sunset = null) {
    // Obter horário atual no fuso horário local
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezone * 1000));
    const currentHour = localTime.getHours();

    // Determinar se é dia ou noite baseado no nascer/pôr do sol
    let isDaytime = true;

    if (sunrise && sunset) {
        const sunriseTime = new Date(sunrise * 1000);
        const sunsetTime = new Date(sunset * 1000);
        const currentTime = localTime.getTime();

        isDaytime = currentTime >= sunriseTime.getTime() && currentTime <= sunsetTime.getTime();
    } else {
        // Fallback: considerar dia entre 6h e 18h
        isDaytime = currentHour >= 6 && currentHour < 18;
    }

    // Emojis baseados no clima e horário
    const weatherEmojis = {
        'Clear': { // Céu limpo/ensolarado
            day: '☀️',
            night: '🌙'
        },
        'Clouds': { // Nublado/parcialmente nublado
            day: '⛅',
            night: '☁️'
        },
        'Rain': { // Chuva
            day: '🌧️',
            night: '🌧️'
        },
        'Drizzle': { // Garoa/chuvisco
            day: '🌦️',
            night: '🌧️'
        },
        'Thunderstorm': { // Tempestade com raios
            day: '⛈️',
            night: '⛈️'
        },
        'Snow': { // Neve
            day: '❄️',
            night: '🌨️'            
        },
        'Mist': { // Névoa
            day: '🌫️',
            night: '🌫️'
        },
        'Smoke': { // Fumaça
            day: '🌫️',
            night: '🌫️'
        },
        'Haze': { // Neblina/bruma
            day: '🌫️',
            night: '🌫️'
        },
        'Dust': { // Poeira
            day: '🌫️',
            night: '🌫️'
        },
        'Fog': { // Nevoeiro
            day: '🌫️',
            night: '🌫️'
        },
        'Sand': { // Tempestade de areia
            day: '🌫️',
            night: '🌫️'
        },
        'Ash': { // Cinzas vulcânicas
            day: '🌫️',
            night: '🌫️'
        },
        'Squall': { // Rajada de vento
            day: '💨',
            night: '💨'
        },
        'Tornado': { // Tornado
            day: '🌪️',
            night: '🌪️'
        }
    };

    const weatherData = weatherEmojis[weatherMain];
    if (weatherData) {
        return isDaytime ? weatherData.day : weatherData.night;
    }

    // Fallback baseado no horário
    return isDaytime ? '🌤️' : '🌙';
}

function getTimeContextForForecast(timestamp, timezone = 0) {
    // Converter timestamp para horário local
    const date = new Date(timestamp * 1000);
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezone * 1000));
    const hour = localTime.getHours();

    // Determinar contexto temporal
    if (hour >= 6 && hour < 12) {
        return { period: 'morning', isDaytime: true };
    } else if (hour >= 12 && hour < 18) {
        return { period: 'afternoon', isDaytime: true };
    } else if (hour >= 18 && hour < 21) {
        return { period: 'evening', isDaytime: false };
    } else {
        return { period: 'night', isDaytime: false };
    }
}

function showTemporaryNotification(message) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'temp-notification';
    notification.textContent = message;

    // Estilos inline para a notificação
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-md) var(--space-lg)',
        color: 'var(--text-primary)',
        zIndex: '10000',
        animation: 'fadeInOut 3s ease-in-out',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px var(--shadow-secondary)',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Adicionar estilos CSS para animações das notificações
function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(100%) scale(0.9); }
            15%, 85% { opacity: 1; transform: translateX(0) scale(1); }
            100% { opacity: 0; transform: translateX(100%) scale(0.9); }
        }
    `;
    document.head.appendChild(style);
}

// Inicializar estilos na carga da página
document.addEventListener('DOMContentLoaded', addNotificationStyles);

// ========== FUNCIONALIDADES EXTRAS ==========
// Duplo clique no card do clima adiciona aos favoritos
document.addEventListener('dblclick', (e) => {
    if (e.target.closest('.current-weather-card') && currentCityData) {
        addCurrentCityToFavorites();
    }
});

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K para focar na pesquisa
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        DOM.cityInput.focus();
    }

    // Escape para fechar modais
    if (e.key === 'Escape') {
        closeFavoritesModal();
        hideSuggestions();
        hideErrorToast();
    }

    // F5 ou Ctrl/Cmd + R para atualizar (interceptar e usar nossa função)
    if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
        if (currentCityData) {
            e.preventDefault();
            refreshWeather();
        }
    }
});

// ========== GLOBAL FUNCTIONS (para uso no HTML) ==========
// Estas funções precisam estar no escopo global para serem acessíveis via onclick no HTML
window.selectCity = selectCity;
window.selectFavoriteCity = selectFavoriteCity;
window.removeFavorite = removeFavorite;