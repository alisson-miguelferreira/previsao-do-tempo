// ========== CONFIGURAÇÃO E VARIÁVEIS GLOBAIS ==========
const API_KEY = 'f7fc4ccec2e0cc8d47fa3f418178de34';
let currentUnit = 'metric';
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
let currentCityData = null;

// Helper: aplica metadados de localização (bairro, cidade, estado) ao objeto de clima
function applyLocationMetadata(target, loc) {
    if (!target || !loc) return;
    if (loc.neighborhood) target.neighborhood = loc.neighborhood;
    if (loc.city) target.city = loc.city;
    if (loc.state) target.state = loc.state;
    if (loc.country) target.country = loc.country;
    if (loc.fullName) target.fullLocationName = loc.fullName;
    if (loc.displayShort) target.displayShort = loc.displayShort;
    if (!target.name && loc.displayShort) target.name = loc.displayShort;
}

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
    sidebar: document.querySelector('.sidebar'),

    // Elementos adicionais
    lastUpdate: document.getElementById('lastUpdate')
};

// Timer para debounce das sugestões
let suggestTimer = null;

// ========== FUNÇÕES BÁSICAS DE INTERFACE (Consolidadas) ==========
function showWelcomeScreen() {
    if (DOM.welcomeScreen) DOM.welcomeScreen.classList.remove('hidden');
    if (DOM.weatherDisplay) DOM.weatherDisplay.classList.add('hidden');
}

function showWeatherDisplay() {
    if (DOM.welcomeScreen) DOM.welcomeScreen.classList.add('hidden');
    if (DOM.weatherDisplay) DOM.weatherDisplay.classList.remove('hidden');
}

function showLoading() {
    if (DOM.loadingOverlay) DOM.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    if (DOM.loadingOverlay) DOM.loadingOverlay.classList.add('hidden');
}

function showErrorToast(message) {
    if (!DOM.errorToast) return;
    const toastMessage = DOM.errorToast.querySelector('.toast-message');
    if (toastMessage) toastMessage.textContent = message || 'Ocorreu um erro';
    DOM.errorToast.classList.remove('hidden');
    clearTimeout(showErrorToast._timeout);
    showErrorToast._timeout = setTimeout(() => hideErrorToast(), 5000);
}

function hideErrorToast() {
    if (DOM.errorToast) DOM.errorToast.classList.add('hidden');
}

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
    // Substitui binding simples por binding seguro (debounce para mobile)
    const safeBind = (el, handler) => {
        if (!el) return;
        let last = 0;
        const wrapped = (e) => {
            const now = Date.now();
            if (now - last < 300) return; // evita duplo clique/toque
            last = now;
            handler(e);
        };
        el.addEventListener('click', wrapped);
        el.addEventListener('touchend', wrapped, { passive: true });
    };

    safeBind(DOM.searchBtn, handleSearch);
    safeBind(DOM.locationBtn, getCurrentLocation);
    DOM.cityInput.addEventListener('keypress', handleSearchKeypress);
    DOM.cityInput.addEventListener('input', handleCityInput);

    DOM.unitToggle.addEventListener('click', toggleUnit);
    DOM.refreshBtn.addEventListener('click', refreshWeather);
    DOM.favoritesToggle.addEventListener('click', toggleFavoritesModal);
    DOM.closeFavorites.addEventListener('click', closeFavoritesModal);
    DOM.favoritesBackdrop.addEventListener('click', closeFavoritesModal);
    DOM.clearFavorites.addEventListener('click', clearAllFavorites);

    if (DOM.addFavorite) {
        DOM.addFavorite.addEventListener('click', () => { addCurrentCityToFavorites(); handleMobileSearch(true); });
    }
    if (DOM.closeToast) DOM.closeToast.addEventListener('click', hideErrorToast);
    if (DOM.sidebarToggle) DOM.sidebarToggle.addEventListener('click', toggleSidebar);
    if (DOM.sidebarOverlay) DOM.sidebarOverlay.addEventListener('click', closeSidebar);

    document.addEventListener('click', (e) => {
        if (DOM.cityInput && DOM.suggestions && !DOM.cityInput.contains(e.target) && !DOM.suggestions.contains(e.target)) {
            hideSuggestions();
        }
    });
}

// ========== FUNÇÕES DE CONTROLE DE TELA ==========
// (Mantido apenas um bloco destas funções mais abaixo para evitar duplicação)

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

        // Buscar clima primeiro
        const weatherData = await fetchWeatherData(city, { context: 'search' });
        currentCityData = weatherData;
        displayWeather(weatherData);
        hideWelcomeScreen();
        hideErrorToast();

        // Buscar previsão depois, sem derrubar a tela caso falhe
        try {
            const forecastData = await fetchForecastData(city);
            displayForecast(forecastData);
        } catch (fErr) {
            console.warn('Previsão indisponível:', fErr);
            // Não mostrar toast para não confundir o usuário quando clima atual está ok
        }

        hideLoading();

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
    // Aviso: geolocalização precisa requer contexto seguro (HTTPS ou http://localhost)
    try {
        const insecure = !window.isSecureContext && (location.protocol !== 'http:' || (location.protocol === 'http:' && location.hostname !== 'localhost'));
        const isFile = location.protocol === 'file:';
        if (insecure || isFile) {
            showErrorToast('Para localização EXATA (GPS), abra pelo Live Server (http://localhost) ou HTTPS. Abrir arquivo diretamente (file://) limita o GPS.');
            console.warn('Contexto inseguro detectado para geolocalização:', { protocol: location.protocol, host: location.host });
        }
    } catch (e) {
        console.warn('Não foi possível verificar contexto seguro:', e);
    }
    if (!navigator.geolocation) {
        showErrorToast('Geolocalização não suportada pelo navegador');
        return;
    }

    showLoading();

    const options = {
        enableHighAccuracy: true,
        timeout: 45000, // Timeout mais longo para GPS preciso
        maximumAge: 5000, // Cache de 5 segundos
        desiredAccuracy: 50 // Precisão desejada em metros (mais rigorosa)
    };

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            let weatherOk = false;
            try {
                const { latitude, longitude, accuracy } = position.coords;
                console.log('Localização obtida:', { latitude, longitude, accuracy });

                // Aceitar qualquer precisão para evitar loops infinitos
                if (accuracy > 2000) {
                    console.warn('Precisão baixa (', accuracy, 'm), mas prosseguindo...');
                }

                // Buscar dados do clima pela coordenada
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${currentUnit}&lang=pt_br`;
                const weatherResponse = await fetch(weatherUrl);
                if (!weatherResponse.ok) {
                    throw new Error('Não foi possível obter dados para esta localização');
                }
                const weatherData = await weatherResponse.json();
                console.log('Dados da API OpenWeather:', weatherData);
                weatherOk = true;

                // Usar nome da cidade diretamente do OpenWeather - mais confiável
                console.log('� Usando dados do OpenWeather:', weatherData.name);

                // SISTEMA COMPLETO: Buscar bairro + cidade através de geocodificação EXATA
                try {
                    console.log('🎯 Iniciando geocodificação para:', weatherData.coord);
                    const geoData = await reverseGeocode(weatherData.coord.lat, weatherData.coord.lon);

                    if (geoData && geoData.neighborhood && geoData.city) {
                        // SUCESSO: Bairro + Cidade encontrados
                        weatherData.displayShort = geoData.displayShort; // "Bairro, Cidade"
                        weatherData.fullLocationName = geoData.fullName;
                        weatherData.neighborhood = geoData.neighborhood;
                        weatherData.city = geoData.city;
                        weatherData.geoSource = geoData.source;

                        console.log('✅ BAIRRO + CIDADE ENCONTRADOS:', {
                            bairro: geoData.neighborhood,
                            cidade: geoData.city,
                            exibição: geoData.displayShort,
                            fonte: geoData.source
                        });
                    } else {
                        console.log('⚠️ Bairro não encontrado, usando nome básico:', weatherData.name);
                        weatherData.displayShort = weatherData.name;
                        weatherData.fullLocationName = weatherData.name;
                        weatherData.neighborhood = '';
                        weatherData.city = weatherData.name;
                    }
                } catch (geoError) {
                    console.error('❌ ERRO na geocodificação:', geoError);
                    weatherData.displayShort = weatherData.name;
                    weatherData.fullLocationName = weatherData.name;
                    weatherData.neighborhood = '';
                    weatherData.city = weatherData.name;
                }                // Buscar previsão do tempo
                let forecastData = null;
                try {
                    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${currentUnit}&lang=pt_br`;
                    const forecastResponse = await fetch(forecastUrl);
                    forecastData = forecastResponse.ok ? await forecastResponse.json() : null;
                } catch (e) {
                    console.warn('Previsão não pôde ser carregada (não fatal):', e);
                }

                // Processar e exibir dados
                currentCityData = weatherData;
                displayWeather(weatherData);

                // Tentar refinar automaticamente com uma segunda leitura mais precisa (se necessário)
                try {
                    const { latitude: lat0, longitude: lon0, accuracy: acc0 } = position.coords;
                    refineLocationIfNeeded(lat0, lon0, acc0);
                } catch (e) {
                    console.warn('Refino automático não pôde ser iniciado:', e);
                }

                // Iniciar um watch curto para capturar uma leitura ainda mais precisa
                try {
                    startAccuracyWatch(position.coords);
                } catch (e) {
                    console.warn('Watch de precisão não pôde ser iniciado:', e);
                }

                if (forecastData) {
                    displayForecast(forecastData);
                }

                hideWelcomeScreen();
                hideLoading();
                hideErrorToast();

                // Atualizar interface
                DOM.cityInput.value = weatherData.name;

                // Fechar sidebar automaticamente em mobile após usar geolocalização
                handleMobileSearch();

                console.log('Localização processada com sucesso:', weatherData.name);

            } catch (error) {
                hideLoading();
                if (weatherOk) {
                    console.warn('Ocorreram erros não fatais após o clima carregar:', error);
                } else {
                    showErrorToast('Erro ao obter localização: ' + (error.message || 'Erro desconhecido'));
                    console.error('Erro de localização:', error);
                }
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
async function fetchWeatherData(city, opts = {}) {
    // Aviso de contexto inseguro também no fluxo de busca manual
    try {
        const insecure = !window.isSecureContext && (location.protocol !== 'http:' || (location.protocol === 'http:' && location.hostname !== 'localhost'));
        const isFile = location.protocol === 'file:';
        if (insecure || isFile) {
            console.warn('Contexto inseguro (sem HTTPS/localhost) detectado. Precisão de GPS pode estar limitada.');
        }
    } catch { }
    const context = opts.context || 'generic'; // 'search' | 'generic'
    // Montar URL priorizando cidades brasileiras quando apropriado
    const internationalCities = ['nova york', 'londres', 'paris', 'tóquio', 'pequim', 'madrid', 'roma', 'berlim', 'moscou', 'mumbai', 'buenos aires', 'mexico city', 'toronto', 'sydney', 'melbourne'];
    const cityLower = city.toLowerCase();
    const needsBR = !city.includes(',') && !internationalCities.some(intCity => cityLower.includes(intCity));

    let url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(needsBR ? `${city},BR` : city)}&appid=${API_KEY}&units=${currentUnit}&lang=pt_br`;

    console.log('Buscando dados do clima para:', city);

    let response = await fetch(url);

    // Se falhar com ,BR, tentar novamente sem especificar país
    if (!response.ok && needsBR) {
        console.log('Tentativa com ,BR falhou, tentando sem especificar país...');
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}&lang=pt_br`;
        response = await fetch(url);
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Cidade não encontrada');
    }

    const data = await response.json();

    if (!data.main || !data.weather || !data.weather[0]) {
        throw new Error('Dados meteorológicos incompletos');
    }

    // Enriquecer com localização exata quando possível
    if (data.coord && typeof data.coord.lat === 'number' && typeof data.coord.lon === 'number') {
        try {
            const geoData = await reverseGeocode(data.coord.lat, data.coord.lon);
            if (geoData) {
                // Usar dados enriquecidos mantendo nome base
                data.displayShort = geoData.displayShort || data.name;
                data.fullLocationName = geoData.fullName || data.name;
                data.neighborhood = geoData.neighborhood || '';
                data.city = geoData.city || data.name;
                data.geoSource = geoData.source;

                console.log('✨ Dados enriquecidos:', {
                    original: data.name,
                    display: data.displayShort,
                    neighborhood: data.neighborhood,
                    source: data.geoSource
                });
            } else {
                // Fallback para dados básicos
                data.displayShort = data.name;
                data.fullLocationName = data.name;
                data.neighborhood = '';
                data.city = data.name;
            }
        } catch (e) {
            console.warn('Geocodificação falhou, usando dados básicos:', e.message);
            data.displayShort = data.name;
            data.fullLocationName = data.name;
            data.neighborhood = '';
            data.city = data.name;
        }
    } else {
        // Sem coordenadas - usar dados básicos
        data.displayShort = data.name;
        data.fullLocationName = data.name;
        data.neighborhood = '';
        data.city = data.name;
    }

    console.log('Dados do clima obtidos para:', data.name);
    return data;
}

async function fetchForecastData(city) {
    // Usar a mesma lógica de priorização brasileira
    let url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}&lang=pt_br`;

    const internationalCities = ['nova york', 'londres', 'paris', 'tóquio', 'pequim', 'madrid', 'roma', 'berlim', 'moscou', 'mumbai', 'buenos aires', 'mexico city', 'toronto', 'sydney', 'melbourne'];
    const cityLower = city.toLowerCase();

    if (!city.includes(',') && !internationalCities.some(intCity => cityLower.includes(intCity))) {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},BR&appid=${API_KEY}&units=${currentUnit}&lang=pt_br`;
    }

    let response = await fetch(url);

    // Se falhar com ,BR, tentar sem o país
    if (!response.ok && url.includes(',BR')) {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}&lang=pt_br`;
        response = await fetch(url);
    }

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

// Cache robusto para geocodificação
const geoCache = new Map();

// Sistema de geocodificação reversa com bairro exato
async function reverseGeocode(lat, lon) {
    try {
        const precision = 6; // Máxima precisão para localização exata
        const roundedLat = parseFloat(lat.toFixed(precision));
        const roundedLon = parseFloat(lon.toFixed(precision));

        console.log('🎯 INICIANDO GEOCODIFICAÇÃO REVERSA:', {
            lat: roundedLat,
            lon: roundedLon,
            timestamp: new Date().toLocaleTimeString()
        });
        const cacheKey = `${roundedLat},${roundedLon}`;

        if (geoCache.has(cacheKey)) {
            const cached = geoCache.get(cacheKey);
            console.log('⚡ CACHE HIT - Usando localização em cache:', cached);
            return cached;
        }

        let finalResult = null;

        // FASE 1: Obter bairro preciso via Nominatim (melhor para bairros brasileiros)
        try {
            console.log('🔍 FASE 1: Buscando bairro via Nominatim...');
            const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${roundedLat}&lon=${roundedLon}&zoom=19&addressdetails=1&accept-language=pt-BR,pt&namedetails=1&extratags=1`;
            console.log('🌐 URL Nominatim:', nominatimUrl);

            const nominatimResponse = await fetch(nominatimUrl, {
                headers: { 'User-Agent': 'TempNow-Weather-App/1.0' }
            });

            console.log('📡 Nominatim Response Status:', nominatimResponse.status, nominatimResponse.statusText);

            if (nominatimResponse.ok) {
                const nominatimData = await nominatimResponse.json();
                console.log('📍 NOMINATIM RESULTADO COMPLETO:', JSON.stringify(nominatimData, null, 2));

                if (nominatimData?.address) {
                    const addr = nominatimData.address;
                    console.log('🏠 Address components:', addr);

                    // Buscar bairro com prioridade alta e sem duplicações
                    const neighborhood =
                        addr.suburb ||
                        addr.neighbourhood ||
                        addr.quarter ||
                        addr.residential ||
                        addr.locality ||
                        addr.city_district ||
                        addr.village ||
                        addr.hamlet || '';

                    // Buscar cidade com prioridade típica no Brasil
                    const city =
                        addr.city ||
                        addr.municipality ||
                        addr.town ||
                        addr.county || '';

                    const state = addr.state || '';

                    console.log('🏘️ Extracted:', {
                        neighborhood: neighborhood,
                        city: city,
                        state: state,
                        country: addr.country_code
                    });

                    // Verificar se encontrou bairro E cidade (e são diferentes)
                    if (neighborhood && city && neighborhood.toLowerCase() !== city.toLowerCase()) {
                        finalResult = {
                            name: city,
                            fullName: state ? `${neighborhood}, ${city}, ${state}` : `${neighborhood}, ${city}`,
                            neighborhood: neighborhood,
                            city: city,
                            state: state,
                            country: addr.country_code?.toUpperCase() || 'BR',
                            displayShort: `${neighborhood}, ${city}`,
                            coordinates: { lat: roundedLat, lon: roundedLon },
                            source: 'Nominatim-Exact'
                        };
                        console.log('✅ SUCESSO NOMINATIM - BAIRRO + CIDADE ENCONTRADOS:', finalResult);
                    } else {
                        console.log('⚠️ Nominatim: Bairro ou cidade não encontrados ou são iguais');
                    }
                } else {
                    console.log('❌ Nominatim: Nenhum address encontrado');
                }
            }
        } catch (error) {
            console.warn('⚠️ Nominatim falhou:', error.message);
        }

        // FASE 2: Se não encontrou bairro, tentar via OpenWeather + complementar
        if (!finalResult) {
            console.log('🔍 FASE 2: Buscando via OpenWeather (Nominatim falhou)...');
            try {
                const owUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${roundedLat}&lon=${roundedLon}&limit=1&appid=${API_KEY}`;
                console.log('🌐 URL OpenWeather:', owUrl);
                const owResponse = await fetch(owUrl);

                console.log('📡 OpenWeather Response Status:', owResponse.status);

                if (owResponse.ok) {
                    const owData = await owResponse.json();
                    console.log('📍 OPENWEATHER RESULTADO COMPLETO:', JSON.stringify(owData, null, 2));

                    if (Array.isArray(owData) && owData.length > 0) {
                        const location = owData[0];
                        const cityName = location.local_names?.pt || location.local_names?.['pt-BR'] || location.name;

                        if (cityName) {
                            // Tentar complementar com bairro via BigDataCloud
                            let neighborhood = '';
                            try {
                                console.log('🔍 FASE 2B: Complementando com bairro via BigDataCloud...');
                                const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${roundedLat}&longitude=${roundedLon}&localityLanguage=pt`;
                                console.log('🌐 URL BigDataCloud:', bdcUrl);
                                const bdcResponse = await fetch(bdcUrl);

                                console.log('📡 BigDataCloud Response Status:', bdcResponse.status);

                                if (bdcResponse.ok) {
                                    const bdcData = await bdcResponse.json();
                                    console.log('📍 BIGDATACLOUD RESULTADO COMPLETO:', JSON.stringify(bdcData, null, 2));

                                    // Múltiplas estratégias para encontrar bairro (evitar estado/UF)
                                    const admin = (bdcData.localityInfo && Array.isArray(bdcData.localityInfo.administrative)) ? bdcData.localityInfo.administrative : [];
                                    const info = (bdcData.localityInfo && Array.isArray(bdcData.localityInfo.informative)) ? bdcData.localityInfo.informative : [];
                                    const adminNeighborhood = admin.find(a => ['neighbourhood', 'suburb', 'city_district', 'quarter', 'residential', 'locality'].includes((a.description || '').toLowerCase()));
                                    const infoNeighborhood = info.find(i => ['neighbourhood', 'suburb', 'city_district', 'quarter', 'residential', 'locality'].includes((i.description || '').toLowerCase()));
                                    neighborhood =
                                        bdcData.locality ||
                                        (infoNeighborhood && infoNeighborhood.name) ||
                                        (adminNeighborhood && adminNeighborhood.name) ||
                                        '';

                                    // Evitar valores iguais à cidade/estado
                                    if (neighborhood && (neighborhood.toLowerCase() === (cityName || '').toLowerCase() || neighborhood === bdcData.principalSubdivision)) {
                                        neighborhood = '';
                                    }

                                    console.log('🏘️ Bairro extraído do BigDataCloud:', neighborhood);
                                }
                            } catch (e) {
                                console.error('❌ BigDataCloud falhou:', e.message);
                            }

                            const displayName = neighborhood && neighborhood.toLowerCase() !== cityName.toLowerCase()
                                ? `${neighborhood}, ${cityName}`
                                : cityName;

                            finalResult = {
                                name: cityName,
                                fullName: location.state ? `${displayName}, ${location.state}` : displayName,
                                neighborhood: neighborhood,
                                city: cityName,
                                state: location.state || '',
                                country: location.country || 'BR',
                                displayShort: displayName,
                                coordinates: { lat: roundedLat, lon: roundedLon },
                                source: neighborhood ? 'OpenWeather+BDC' : 'OpenWeather'
                            };
                            console.log('✅ Resultado final:', finalResult);
                        }
                    }
                }
            } catch (error) {
                console.warn('⚠️ OpenWeather falhou:', error.message);
            }
        }

        // FASE 3: Estratégia final - usar uma API adicional para localidades brasileiras
        if (!finalResult) {
            console.log('🔍 FASE 3: Última tentativa com API adicional...');
            try {
                // Usar PostmonAPI (brasileiro) como última tentativa
                const postmonUrl = `https://api.postmon.com.br/v1/geo/${roundedLat}/${roundedLon}`;
                console.log('🌐 URL Postmon:', postmonUrl);
                const postmonResponse = await fetch(postmonUrl);

                if (postmonResponse.ok) {
                    const postmonData = await postmonResponse.json();
                    console.log('📍 POSTMON RESULTADO:', JSON.stringify(postmonData, null, 2));

                    if (postmonData && postmonData.city) {
                        const neighborhood = postmonData.district || '';
                        const city = postmonData.city;
                        const state = postmonData.state;

                        if (neighborhood && city && neighborhood.toLowerCase() !== city.toLowerCase()) {
                            finalResult = {
                                name: city,
                                fullName: state ? `${neighborhood}, ${city}, ${state}` : `${neighborhood}, ${city}`,
                                neighborhood: neighborhood,
                                city: city,
                                state: state,
                                country: 'BR',
                                displayShort: `${neighborhood}, ${city}`,
                                coordinates: { lat: roundedLat, lon: roundedLon },
                                source: 'Postmon-BR'
                            };
                            console.log('✅ SUCESSO POSTMON - BAIRRO + CIDADE BRASILEIROS:', finalResult);
                        }
                    }
                }
            } catch (e) {
                console.warn('⚠️ Postmon falhou:', e.message);
            }
        }

        // Cache o resultado se encontrou algo válido
        if (finalResult) {
            geoCache.set(cacheKey, finalResult);
            console.log('💾 Resultado cacheado com sucesso - Fonte:', finalResult.source);
            return finalResult;
        }

        console.warn('❌ TODAS AS FASES FALHARAM - Nenhuma localização válida encontrada');
        return null;

    } catch (error) {
        console.error('💥 Erro crítico na geocodificação:', error);
        return null;
    }
}// Função simplificada para obter localização
async function getDetailedLocation(lat, lon) {
    try {
        console.log('Obtendo localização...');

        const location = await reverseGeocode(lat, lon);

        if (location && location.name) {
            return {
                searchQuery: location.name,
                displayName: location.fullName || location.name,
                isDetailed: false // Simplificado - sem bairro
            };
        }

        return null;
    } catch (error) {
        console.error('Erro ao obter localização:', error);
        return null;
    }
}// Refinamento automático: tenta uma segunda leitura de alta precisão e atualiza apenas o rótulo (bairro/cidade)
async function refineLocationIfNeeded(prevLat, prevLon, prevAccuracy) {
    try {
        if (!navigator.geolocation) return;
        if (typeof prevAccuracy === 'number' && prevAccuracy <= 300) return; // mais rígido para refinar

        const refineOptions = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                const latDiff = Math.abs(latitude - prevLat);
                const lonDiff = Math.abs(longitude - prevLon);
                const improvedAccuracy = typeof accuracy === 'number' && (!prevAccuracy || (typeof prevAccuracy === 'number' && accuracy < (prevAccuracy - 100)));
                const significantlyDifferent = latDiff > 0.0002 || lonDiff > 0.0002 || improvedAccuracy; // ~20-25m

                if (!significantlyDifferent) return;

                // Atualizar apenas a parte de localização (bairro/cidade) usando geocodificação reversa
                const resolved = await reverseGeocode(latitude, longitude);
                if (resolved && currentCityData) {
                    applyLocationMetadata(currentCityData, resolved);
                    currentCityData.name = resolved.displayShort || resolved.fullName || resolved.name || currentCityData.name;
                    // Atualizar apenas a interface textual; não refetech de clima para evitar atraso
                    displayWeather(currentCityData);
                    if (DOM.cityInput) DOM.cityInput.value = currentCityData.name;
                    console.log('📍 Local refinado automaticamente:', {
                        accuracy,
                        name: currentCityData.name
                    });
                }
            },
            (err) => {
                console.warn('Refino de localização falhou:', err);
            },
            refineOptions
        );
    } catch (e) {
        console.warn('Erro no refinamento de localização:', e);
    }
}

// Watch curto para melhorar a precisão e atualizar apenas o rótulo (bairro/cidade)
let accuracyWatchId = null;
function startAccuracyWatch(initial) {
    if (!navigator.geolocation) return;
    // Evitar múltiplos watches
    if (accuracyWatchId !== null) return;

    const startTime = Date.now();
    const timeoutMs = 15000; // até 15s para refinar
    const minGain = 100; // precisa melhorar pelo menos 100m de precisão
    const baseAccuracy = typeof initial.accuracy === 'number' ? initial.accuracy : 10000;

    const options = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: timeoutMs
    };

    accuracyWatchId = navigator.geolocation.watchPosition(async (pos) => {
        try {
            const { latitude, longitude, accuracy } = pos.coords;
            const improved = typeof accuracy === 'number' && accuracy + minGain < baseAccuracy;
            const stillTime = (Date.now() - startTime) < timeoutMs;
            if (!improved && stillTime) return;

            // Obter novo rótulo de localização com coordenadas mais precisas
            const resolved = await reverseGeocode(latitude, longitude);
            if (resolved && currentCityData) {
                applyLocationMetadata(currentCityData, resolved);
                currentCityData.name = resolved.displayShort || resolved.fullName || resolved.name || currentCityData.name;
                displayWeather(currentCityData);
                if (DOM.cityInput) DOM.cityInput.value = currentCityData.name;
                console.log('📍 Watch: localização refinada', { accuracy, name: currentCityData.name });
            }
        } catch (e) {
            console.warn('Watch de precisão falhou:', e);
        } finally {
            // Encerrar o watch após um update útil ou timeout
            stopAccuracyWatch();
        }
    }, (err) => {
        console.warn('watchPosition erro:', err);
        stopAccuracyWatch();
    }, options);
}

function stopAccuracyWatch() {
    if (accuracyWatchId !== null) {
        try { navigator.geolocation.clearWatch(accuracyWatchId); } catch { }
        accuracyWatchId = null;
    }
}

// ========== EXIBIÇÃO DOS DADOS ==========
function displayWeather(data) {
    if (!data || !data.main || !data.weather || !data.weather[0]) {
        console.warn('Dados meteorológicos inválidos recebidos em displayWeather; suprimindo toast.');
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
    const isMobile = window.innerWidth <= 767;
    const cityName = data.name || 'Local desconhecido';

    // Priorizar exibição de bairro + cidade quando disponível
    let finalDisplay = cityName;

    if (data.displayShort && data.displayShort !== cityName) {
        finalDisplay = data.displayShort;
        console.log('🏘️ Exibindo bairro + cidade:', finalDisplay);
    } else {
        console.log('�️ Exibindo cidade:', finalDisplay);
    }

    // Atualizar elementos da tela principal
    if (DOM.cityName) DOM.cityName.textContent = finalDisplay;
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

    // Atualizar header - em mobile mostrar bairro+cidade completos
    const headerLocation = isMobile ?
        finalDisplay : // Mobile: mostra completo
        (finalDisplay.length > 30 ? finalDisplay.split(',')[0] : finalDisplay); // Desktop: trunca se necessário

    console.log('📱 Header location final (mobile=' + isMobile + '):', headerLocation);
    updateHeaderInfo(headerLocation, Math.round(data.main.temp) + unitSymbol);

    // Verificar se é favorito
    updateFavoriteButton(cityName);

    // Mostrar dashboard e esconder tela de boas-vindas
    showWeatherDisplay();
    // Fechar sidebar em mobile após render completo
    handleMobileSearch();
}

// ========== FUNÇÕES DE INTERFACE ==========
// (Removidas duplicatas de funções de interface)

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
    const isMobile = window.innerWidth <= 767;
    let finalLocation = location;
    if (!isMobile && location.length > 40) {
        finalLocation = location.split(',')[0];
    }
    DOM.headerLocation.textContent = finalLocation;
    DOM.headerTemp.textContent = typeof temperature === 'number' ? `${temperature}${unitSymbol}` : temperature;
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
    if (suggestTimer) clearTimeout(suggestTimer);
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    suggestTimer = setTimeout(() => {
        showSuggestions(query);
    }, 250);
}

async function showSuggestions(query) {
    // 1) Tentar sugestões pela API de geocodificação (OpenWeather Direct)
    try {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}&lang=pt_br`;
        const resp = await fetch(url);
        if (resp.ok) {
            const list = await resp.json();
            if (Array.isArray(list) && list.length > 0) {
                const items = [];
                const seen = new Set();
                for (const loc of list) {
                    const city = (loc.local_names && (loc.local_names['pt-BR'] || loc.local_names.pt)) || loc.name;
                    const country = loc.country || '';
                    // Para BR, manter apenas City, BR; para outros, City, CC
                    const label = country ? `${city}, ${country}` : city;
                    if (!seen.has(label)) {
                        seen.add(label);
                        items.push(label);
                    }
                }

                if (items.length > 0) {
                    let html = '';
                    items.forEach(city => {
                        html += `<div class="suggestion-item" onclick="selectCity('${city}')">${city}</div>`;
                    });
                    DOM.suggestions.innerHTML = html;
                    DOM.suggestions.classList.add('visible');
                    return; // sucesso com API
                }
            }
        }
    } catch (e) {
        console.warn('Sugestões via API falharam, usando fallback local:', e);
    }

    // 2) Fallback: lista local de populares, filtrada
    // Lista focada em cidades brasileiras principais
    const popularCities = [
        // Capitais brasileiras
        'Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador', 'Fortaleza',
        'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
        'Goiânia', 'Belém', 'São Luís', 'Maceió', 'Campo Grande',
        'João Pessoa', 'Teresina', 'Aracaju', 'Cuiabá', 'Florianópolis',
        'Vitória', 'Natal', 'Porto Velho', 'Rio Branco', 'Macapá', 'Boa Vista',

        // Região Metropolitana RJ
        'Niterói', 'Nova Iguaçu', 'Duque de Caxias', 'São Gonçalo',
        'Petrópolis', 'Cabo Frio', 'Campos dos Goytacazes', 'Volta Redonda',

        // Região Metropolitana SP  
        'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André',
        'Osasco', 'Sorocaba', 'Ribeirão Preto', 'Santos', 'Jundiaí',

        // Outras cidades importantes
        'Uberlândia', 'Londrina', 'Joinville', 'Juiz de Fora', 'Contagem',
        'Aparecida de Goiânia', 'Caxias do Sul', 'Feira de Santana', 'Chapeco',

        // Cidades internacionais principais
        'Nova York', 'Londres', 'Paris', 'Tóquio', 'Pequim', 'Madrid',
        'Roma', 'Berlim', 'Buenos Aires', 'Toronto', 'Sydney'
    ];

    // Priorizar resultados relevantes de forma genérica (sem viés regional)
    const queryLower = query.toLowerCase();
    let filteredCities = popularCities
        .filter(city => city.toLowerCase().includes(queryLower))
        .sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();

            // Prioridade 2: Correspondência exata no início
            const aStartsWith = aLower.startsWith(queryLower);
            const bStartsWith = bLower.startsWith(queryLower);
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;

            // Prioridade 3: Cidades brasileiras (sem vírgula = capital)
            const aIsBrazilian = !aLower.includes(',') || aLower.includes('brasil');
            const bIsBrazilian = !bLower.includes(',') || bLower.includes('brasil');
            if (aIsBrazilian && !bIsBrazilian) return -1;
            if (!aIsBrazilian && bIsBrazilian) return 1;

            return 0;
        });

    filteredCities = filteredCities.slice(0, 5);

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

function selectCity(city) { DOM.cityInput.value = city; hideSuggestions(); searchWeather(city); handleMobileSearch(true); }
function selectFavoriteCity(city) { DOM.cityInput.value = city; closeFavoritesModal(); searchWeather(city); handleMobileSearch(true); }

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
// (Removidas duplicatas adicionais)

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

// Fechar sidebar automaticamente ao selecionar uma cidade em mobile (versão aprimorada)
function handleMobileSearch(force = false) {
    const shouldClose = window.innerWidth <= 1200 || force; // ampliar threshold
    if (!shouldClose) return;
    // Usar microtask para garantir que DOM já atualizou
    Promise.resolve().then(() => {
        closeSidebar();
        if (DOM.sidebarOverlay) DOM.sidebarOverlay.classList.remove('show');
        if (DOM.cityInput) DOM.cityInput.blur();
        document.body.style.overflow = '';
    });
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
    } else if (country === 'BR') {
        if (state && !normalized.includes(state)) {
            normalized += `, ${state}`;
        }
        // Nunca acrescentar sufixos confusos no Brasil
        // Para o Brasil, adicionar estado apenas se não estiver presente
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