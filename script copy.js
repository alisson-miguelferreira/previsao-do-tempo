/*
 * script.js
 * Lógica principal do frontend para o app de previsão do tempo:
 * - busca geocoding, tempo atual e previsão na API OpenWeather
 * - renderiza sugestões, cartão do tempo atual, previsão e favoritos
 * - gerencia estado da UI (carregamento, erros, unidades)
 * - mapeia condições meteorológicas para ícones SVG coloridos
 * Observação: a chave de API está embutida no cliente (recomenda-se mover para um proxy no servidor).
 */
const API_KEY = 'f7fc4ccec2e0cc8d47fa3f418178de34';

// Estado e configurações atuais
// `unit` controla 'metric' vs 'imperial'. `selectedLocation` guarda o último local selecionado.
// Estrutura de selectedLocation: { name, lat, lon, state, country }
let unit = 'metric';
let selectedLocation = null;

// Exibe uma mensagem de erro persistente na UI (role=alert)
// Entrada: msg (string) - texto a ser exibido para o usuário
function showError(msg) {
    const err = document.getElementById('error');
    if (!err) return;
    err.textContent = msg;
    err.classList.remove('hidden');
}

// Limpa qualquer mensagem de erro visível
function clearError() {
    const err = document.getElementById('error');
    if (!err) return;
    err.textContent = '';
    err.classList.add('hidden');
}

// Alterna o estado global de carregamento na UI (spinner + desabilita botão de busca)
// Entrada: on (boolean) - true para mostrar carregamento, false para ocultar
function setLoading(on) {
    const loading = document.getElementById('loading');
    const searchBtn = document.getElementById('searchButton');
    if (on) {
        loading.classList.remove('hidden');
        loading.setAttribute('aria-hidden', 'false');
        if (searchBtn) searchBtn.disabled = true;
    } else {
        loading.classList.add('hidden');
        loading.setAttribute('aria-hidden', 'true');
        if (searchBtn) searchBtn.disabled = false;
    }
}

// Wrapper em torno de fetch() que valida o status HTTP e retorna JSON.
// Lança erro em respostas não 2xx para que o chamador trate a exceção.
async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    return res.json();
}

// Busca sugestões de cidade usando a API de Geocoding da OpenWeather.
// Entrada: query (string) - nome parcial da cidade
// Saída: array de objetos simplificados: { name, lat, lon, state, country }
// Em caso de erro retorna array vazio e registra no console.
async function fetchCitySuggestions(query) {
    if (!query) return [];
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=6&appid=${API_KEY}`;
    try {
        const data = await fetchJson(url);
        return data.map(d => ({ name: d.name, lat: d.lat, lon: d.lon, state: d.state || '', country: d.country }));
    } catch (err) {
        console.error('Erro sugestões:', err);
        return [];
    }
}

// Renderiza o dropdown de sugestões abaixo do campo de busca.
// Recebe `list` como retornado por fetchCitySuggestions.
// Cada sugestão é focalizável por teclado e contém lat/lon em atributos data-*
function renderSuggestions(list) {
    const ul = document.getElementById('suggestions');
    if (!ul) return;
    if (!list.length) {
        ul.classList.add('hidden');
        ul.innerHTML = '';
        return;
    }
    ul.innerHTML = list.map((item, idx) => `
        <li role="option" data-idx="${idx}" data-lat="${item.lat}" data-lon="${item.lon}" class="suggestion-item" tabindex="0">
            <span class="suggestion-name">${item.name}</span><span class="suggestion-details">${item.state ? `- ${item.state}` : ''} (${item.country})</span>
        </li>
    `).join('');
    ul.classList.remove('hidden');
}

// Oculta e limpa a lista de sugestões
function clearSuggestions() {
    const ul = document.getElementById('suggestions');
    if (!ul) return;
    ul.innerHTML = '';
    ul.classList.add('hidden');
}

// Usuário selecionou uma sugestão (clique ou teclado).
// Lê lat/lon do elemento, atualiza `selectedLocation`, preenche o input
// e dispara a busca do tempo para as coordenadas selecionadas.
function selectSuggestion(el) {
    const lat = parseFloat(el.dataset.lat);
    const lon = parseFloat(el.dataset.lon);
    const label = el.querySelector('.suggestion-name')?.textContent || el.textContent;
    const stateText = el.querySelector('.suggestion-details')?.textContent || '';
    selectedLocation = { name: label, lat, lon, state: stateText };
    document.getElementById('cityInput').value = `${label} ${stateText}`.trim();
    clearSuggestions();
    searchWeatherByCoords(lat, lon);
}

// Busca o tempo atual e a previsão (5 dias) para as coordenadas fornecidas e atualiza a UI.
// - Preenche o cartão principal, os cards de previsão e o visual da condição
// - Garante tratamento de estado de carregamento e erros
async function searchWeatherByCoords(lat, lon) {
    clearError();
    setLoading(true);
    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=pt_br`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=pt_br`;
        const [weather, forecast] = await Promise.all([fetchJson(weatherUrl), fetchJson(forecastUrl)]);

        document.getElementById('cityName').textContent = `${weather.name}, ${weather.sys?.country || ''}`;
        document.getElementById('temperature').textContent = Math.round(weather.main.temp);
        document.getElementById('description').textContent = weather.weather[0].description;
        document.getElementById('feelsLike').textContent = Math.round(weather.main.feels_like) + (unit === 'metric' ? '°C' : '°F');
        document.getElementById('humidity').textContent = weather.main.humidity + '%';
        document.getElementById('windSpeed').textContent = formatWind(weather.wind.speed);
        document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;
        document.getElementById('currentWeather').classList.remove('hidden');

        try { renderConditionVisual(weather); } catch (e) { console.error('render visual', e); }

        const cards = [];
        for (let i = 0; i < (forecast.list?.length || 0); i += 8) {
            const item = forecast.list[i];
            if (!item) continue;
            const dateLabel = new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
            cards.push({ dateLabel, icon: item.weather[0].icon, temp: Math.round(item.main.temp), temp_min: Math.round(item.main.temp_min) });
            if (cards.length === 5) break;
        }
        const html = cards.map(c => `
            <div class="forecast-card" tabindex="0">
                <div class="forecast-date">${c.dateLabel}</div>
                <img class="forecast-icon" src="https://openweathermap.org/img/wn/${c.icon}@2x.png" alt=""> 
                <div class="forecast-temp">${c.temp}°</div>
                <div class="forecast-temp-min">Min: ${c.temp_min}°</div>
            </div>
        `).join('');
        document.getElementById('forecastCards').innerHTML = html;
        document.getElementById('forecast').classList.remove('hidden');
    } catch (err) {
        console.error(err);
        showError('Erro ao buscar dados do tempo.');
    } finally {
        setLoading(false);
    }
}

// Mapeamento de condição simples para cor e rótulo localizado.
// Usado por renderConditionVisual para escolher cor e texto do ícone.
const CONDITION_PALETTE = {
    clear: { color: '#FFD54F', label: 'Ensolarado' },
    clouds: { color: '#90A4AE', label: 'Nublado' },
    rain: { color: '#4FC3F7', label: 'Chuvoso' },
    drizzle: { color: '#81D4FA', label: 'Chuvisco' },
    thunderstorm: { color: '#4FC3F7', label: 'Trovoadas' },
    snow: { color: '#B3E5FC', label: 'Nevando' },
    mist: { color: '#cfcfcf', label: 'Neblina' },
    fog: { color: '#cfcfcf', label: 'Neblina' },
    haze: { color: '#cfcfcf', label: 'Neblina' },
    default: { color: '#FFFFFF', label: '' }
};

// Retorna uma string SVG inline (HTML) para um conjunto reduzido de ícones.
// `name` escolhe o formato; `color` tinge a arte SVG.
function svgIcon(name, color) {
    if (name === 'sun') return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs><radialGradient id="g1"><stop offset="0%" stop-color="${color}" stop-opacity="1"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0.25"/></radialGradient></defs>
            <circle cx="32" cy="32" r="14" fill="url(#g1)" />
            <g stroke="${color}" stroke-width="2" stroke-linecap="round">
                <line x1="32" y1="4" x2="32" y2="14" />
                <line x1="32" y1="50" x2="32" y2="60" />
                <line x1="4" y1="32" x2="14" y2="32" />
                <line x1="50" y1="32" x2="60" y2="32" />
                <line x1="12" y1="12" x2="19" y2="19" />
                <line x1="45" y1="45" x2="52" y2="52" />
                <line x1="12" y1="52" x2="19" y2="45" />
                <line x1="45" y1="19" x2="52" y2="12" />
            </g>
        </svg>`;
    if (name === 'cloud') return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M50 40H18a10 10 0 0 1 0-20 14 14 0 0 1 27-3 10 10 0 0 1 5 23z" fill="${color}" opacity="0.95" />
        </svg>`;
    if (name === 'rain') return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M46 28a10 10 0 0 0-19-5 14 14 0 0 0-7 26h28" fill="${color}" opacity="0.9" />
            <g fill="#fff">
                <path d="M22 48c0 3-3 6-3 6s-3-3-3-6 3-6 3-6 3 3 3 6z"/>
                <path d="M34 48c0 3-3 6-3 6s-3-3-3-6 3-6 3-6 3 3 3 6z"/>
                <path d="M46 48c0 3-3 6-3 6s-3-3-3-6 3-6 3-6 3 3 3 6z"/>
            </g>
        </svg>`;
    if (name === 'snow') return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g fill="${color}">
                <circle cx="20" cy="44" r="3" />
                <circle cx="32" cy="48" r="3" />
                <circle cx="44" cy="44" r="3" />
            </g>
        </svg>`;
    if (name === 'fog') return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M10 36h44v4H10z" fill="${color}" opacity="0.9" />
            <path d="M6 44h52v4H6z" fill="${color}" opacity="0.7" />
        </svg>`;
    return '';
}

// Cria e insere um pequeno ícone SVG colorido + rótulo em #weatherVisual
// `weather` é o objeto de tempo atual da OpenWeather; analisamos weather[0].main
function renderConditionVisual(weather) {
    const root = document.getElementById('weatherVisual');
    if (!root) return;
    root.innerHTML = '';
    const main = (weather.weather && weather.weather[0] && weather.weather[0].main) ? weather.weather[0].main.toLowerCase() : '';
    let key = 'default';
    if (main.includes('clear')) key = 'clear';
    else if (main.includes('cloud')) key = 'clouds';
    else if (main.includes('rain')) key = 'rain';
    else if (main.includes('drizzle')) key = 'drizzle';
    else if (main.includes('thunder')) key = 'thunderstorm';
    else if (main.includes('snow') || main.includes('sleet')) key = 'snow';
    else if (main.includes('mist') || main.includes('fog') || main.includes('haze')) key = 'fog';

    const palette = CONDITION_PALETTE[key] || CONDITION_PALETTE.default;
    const iconName = (key === 'clear') ? 'sun' : (key === 'clouds' ? 'cloud' : (key === 'rain' || key === 'drizzle' || key === 'thunderstorm') ? 'rain' : (key === 'snow' ? 'snow' : 'fog'));
    const wrapper = document.createElement('div');
    wrapper.className = 'condition-icon';
    wrapper.innerHTML = svgIcon(iconName, palette.color) + `<div class="condition-label">${palette.label}</div>`;
    root.appendChild(wrapper);
}

// Formata a velocidade do vento para exibição. Converte m/s para km/h no modo métrico.
// Retorna uma string como '12.3 km/h' ou '7.8 mph'.
function formatWind(speed) {
    if (!speed && speed !== 0) return '-';
    const val = unit === 'metric' ? (speed * 3.6) : speed; // m/s -> km/h
    return unit === 'metric' ? `${val.toFixed(1)} km/h` : `${val.toFixed(1)} mph`;
}

// Gerenciamento de favoritos usando localStorage.
// Cada favorito é um objeto de local simplificado (mesma estrutura usada no app).
function loadFavorites() {
    try {
        const raw = localStorage.getItem('weather_favs') || '[]';
        return JSON.parse(raw);
    } catch { return []; }
}

function saveFavorites(list) {
    localStorage.setItem('weather_favs', JSON.stringify(list));
}

function renderFavorites() {
    const list = loadFavorites();
    const container = document.getElementById('favoritesList');
    const section = document.getElementById('favoritesSection');
    if (!container || !section) return;
    if (!list.length) {
        section.classList.add('hidden');
        container.innerHTML = '';
        return;
    }
    section.classList.remove('hidden');
    container.innerHTML = list.map((f, idx) => `
        <div class="favorite-card" draggable="true" data-idx="${idx}" tabindex="0">
            <div style="display:flex;align-items:center;gap:8px;width:100%;">
                <span class="drag-handle" aria-hidden="true">☰</span>
                <div style="flex:1">
                    <div class="fav-label">${f.name} ${f.state ? `- ${f.state}` : ''}</div>
                    <div class="fav-meta">${f.country || ''}</div>
                </div>
            </div>
            <div class="fav-actions">
                <button data-idx="${idx}" class="fav-open" title="Abrir">
                    <!-- ícone de abrir -->
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Abrir
                </button>
                <button data-idx="${idx}" class="fav-remove" title="Remover">
                    <!-- ícone de lixeira -->
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Remover
                </button>
            </div>
        </div>
    `).join('');

    // anexa handlers de drag diretamente aos cards (cada card)
    let dragSrcIdx = null;
    container.querySelectorAll('.favorite-card').forEach(card => {
        card.addEventListener('dragstart', (e) => {
            dragSrcIdx = parseInt(card.dataset.idx, 10);
            card.classList.add('dragging');
            try { e.dataTransfer.setData('text/plain', String(dragSrcIdx)); } catch (err) { }
            e.dataTransfer.effectAllowed = 'move';
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            card.classList.add('drag-over');
        });
        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            const src = parseInt(e.dataTransfer.getData('text/plain'), 10);
            const dest = parseInt(card.dataset.idx, 10);
            if (Number.isFinite(src) && Number.isFinite(dest) && src !== dest) {
                const arr = loadFavorites();
                const [item] = arr.splice(src, 1);
                arr.splice(dest, 0, item);
                saveFavorites(arr);
                renderFavorites();
            }
        });
    });
}

function addFavoriteFromCurrent() {
    // Lê o nome da cidade visível e insere selectedLocation nos favoritos.
    const name = document.getElementById('cityName')?.textContent;
    if (!name) return;
    const loc = selectedLocation || { name };
    const list = loadFavorites();
    // avoid duplicates by name
    if (list.find(i => i.name === loc.name)) return;
    list.unshift(loc);
    if (list.length > 8) list.pop();
    saveFavorites(list);
    renderFavorites();
}

function removeFavorite(idx) {
    const list = loadFavorites();
    list.splice(idx, 1);
    saveFavorites(list);
    renderFavorites();
}

function openFavorite(idx) {
    const list = loadFavorites();
    const f = list[idx];
    if (!f) return;
    if (f.lat && f.lon) searchWeatherByCoords(f.lat, f.lon);
}

// Geolocalização (navigator.geolocation)
function locateMe() {
    if (!navigator.geolocation) {
        showError('Geolocalização não suportada pelo navegador.');
        return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        searchWeatherByCoords(latitude, longitude);
    }, (err) => {
        showError('Não foi possível obter sua localização.');
        setLoading(false);
    }, { enableHighAccuracy: true, timeout: 10000 });
}

// Aplica um tema simples baseado na descrição principal do tempo
function applyThemeFromWeather(main) {
    const root = document.documentElement;
    root.classList.remove('theme-clear', 'theme-clouds', 'theme-rain', 'theme-snow');
    if (!main) return;
    const key = main.toLowerCase();
    if (key.includes('clear')) root.classList.add('theme-clear');
    else if (key.includes('cloud')) root.classList.add('theme-clouds');
    else if (key.includes('rain') || key.includes('drizzle') || key.includes('thunder')) root.classList.add('theme-rain');
    else if (key.includes('snow') || key.includes('sleet')) root.classList.add('theme-snow');
}

// --- Animated weather visuals ---
// --- Animated weather visuals removed per user request ---

async function handleSearch() {
    clearError();
    const input = document.getElementById('cityInput');
    if (!input) return;
    const query = input.value.trim();
    if (!query) {
        showError('Por favor, digite o nome de uma cidade.');
        return;
    }
    setLoading(true);
    try {
        let loc = selectedLocation;
        if (!loc || (loc.name && !query.startsWith(loc.name))) {
            const results = await fetchCitySuggestions(query);
            if (!results || results.length === 0) {
                throw new Error('Cidade não encontrada.');
            }
            loc = results[0];
        }
        await searchWeatherByCoords(loc.lat, loc.lon);
    } catch (err) {
        console.error(err);
        showError(err.message || 'Erro ao buscar dados do tempo.');
    } finally {
        setLoading(false);
    }
}

function toggleUnit() {
    unit = unit === 'metric' ? 'imperial' : 'metric';
    const btn = document.getElementById('unitToggle');
    if (btn) {
        btn.textContent = unit === 'metric' ? '°C' : '°F';
        btn.setAttribute('aria-pressed', unit === 'imperial');
    }
    if (document.getElementById('currentWeather').classList.contains('hidden')) return;
    handleSearch();
}

function setupEvents() {
    // Conecta eventos do DOM para input de busca, botões, sugestões e favoritos.
    // Cobre: sugestões com debounce, navegação por teclado nas sugestões, botão de busca,
    // alternância de unidade, botão de localização, abrir/remover favoritos e render inicial.
    const input = document.getElementById('cityInput');
    const btn = document.getElementById('searchButton');
    const toggle = document.getElementById('unitToggle');
    if (input) {
        let debounceTimeout;
        input.addEventListener('input', async (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(async () => {
                try {
                    const results = await fetchCitySuggestions(input.value);
                    renderSuggestions(results);
                } catch (err) {
                    console.error(err);
                }
            }, 400);
        });

        // keyboard navigation for suggestions
        input.addEventListener('keydown', (e) => {
            const ul = document.getElementById('suggestions');
            if (!ul || ul.classList.contains('hidden')) return;
            const items = Array.from(ul.querySelectorAll('.suggestion-item'));
            const active = ul.querySelector('.active');
            let idx = active ? items.indexOf(active) : -1;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (idx < items.length - 1) idx++;
                items.forEach(it => it.classList.remove('active'));
                items[idx]?.classList.add('active');
                items[idx]?.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (idx > 0) idx--;
                items.forEach(it => it.classList.remove('active'));
                items[idx]?.classList.add('active');
                items[idx]?.focus();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (idx >= 0 && items[idx]) selectSuggestion(items[idx]);
                else handleSearch();
            } else if (e.key === 'Escape') {
                clearSuggestions();
            }
        });
    }
    // delegated click + keyboard activation for suggestion items
    const suggestions = document.getElementById('suggestions');
    if (suggestions) {
        suggestions.addEventListener('click', (e) => {
            const li = e.target.closest('.suggestion-item');
            if (!li) return;
            selectSuggestion(li);
        });
        suggestions.addEventListener('keydown', (e) => {
            const li = e.target.closest('.suggestion-item');
            if (!li) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectSuggestion(li);
            }
        });
    }
    if (btn) btn.addEventListener('click', handleSearch);
    if (toggle) toggle.addEventListener('click', toggleUnit);
    const locate = document.getElementById('locateButton');
    if (locate) locate.addEventListener('click', locateMe);

    // favorites actions
    document.body.addEventListener('click', (e) => {
        const open = e.target.closest('.fav-open');
        const rem = e.target.closest('.fav-remove');
        if (open) {
            const idx = parseInt(open.dataset.idx, 10);
            openFavorite(idx);
        } else if (rem) {
            const idx = parseInt(rem.dataset.idx, 10);
            removeFavorite(idx);
        }
    });

    // add a small favorite button to current weather card
    const current = document.getElementById('currentWeather');
    if (current) {
        const favBtn = document.createElement('button');
        favBtn.textContent = '❤ Favoritar';
        favBtn.style.position = 'absolute';
        favBtn.style.right = '18px';
        favBtn.style.top = '18px';
        favBtn.className = 'unit-toggle';
        favBtn.addEventListener('click', addFavoriteFromCurrent);
        current.appendChild(favBtn);
    }

    // render stored favorites on load
    renderFavorites();
}

window.addEventListener('DOMContentLoaded', setupEvents);
