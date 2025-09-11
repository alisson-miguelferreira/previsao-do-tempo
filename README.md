# Previsão do Tempo

Aplicação web simples (HTML/CSS/JS) que consulta a API OpenWeather para mostrar o tempo atual e a previsão. O projeto inclui sugestões de cidades (geocoding), alternância de unidades, geolocalização, favoritos persistidos no localStorage e ícones SVG coloridos por condição meteorológica.

## Principais recursos

- Busca por cidade com sugestões (mostra estado/UF quando disponível).
- Exibição do tempo atual (temperatura, sensação, umidade, vento, ícone).
- Previsão (cards) para os próximos dias.
- Alternar unidades (°C / °F).
- Botão de localizar (geolocalização do navegador).
- Favoritos com persistência (localStorage) e reorder via drag & drop.
- Ícones SVG mapeados e coloridos por condição (ensolarado, nublado, chuva, neve, névoa).
- Tema por condição (classes CSS trocadas conforme tempo).

## Tecnologias

- HTML5
- CSS3 (variáveis -> temas)
- JavaScript (ES6+, fetch, async/await)
- OpenWeather APIs (Geocoding, Current Weather, Forecast)

## Estrutura de arquivos

- `index.html` — estrutura da aplicação e marcação principal.
- `styles.css` — estilos, variáveis de tema e responsividade.
- `script.js` — lógica do cliente: sugestões, chamadas à API, renderização, favoritos.

## Como usar (desenvolvimento / local)

Opções rápidas para servir localmente (recomendado — evita problemas com CORS ao abrir via file://):

- Com Node (recomendado):

```bash
# servidor estático simples via npx
npx http-server -c-1
```

- Usando a extensão Live Server no VS Code:

1. Instale a extensão Live Server (ritwickdey ou similar).
2. Abra a pasta do projeto no VS Code e clique em "Go Live" no canto inferior direito.

Depois abra no navegador o endereço mostrado pelo servidor (por exemplo `http://127.0.0.1:8080`).

Observação: o projeto é client-side e faz chamadas diretas à API OpenWeather. A chave da API está atualmente definida em `script.js` como `API_KEY`. Para ambientes de produção, mova essa chave para um backend/proxy para não expô-la ao cliente.

## Configurar a chave da API

- Editar o arquivo `script.js` e substituir o valor de `API_KEY` por sua chave pessoal da OpenWeather.
- Alternativa mais segura: criar um endpoint no servidor que faça as chamadas à OpenWeather e retorne apenas os dados necessários para o cliente.

Exemplo (Node/Express) rápido do proxy (opcional):

```js
// server.js (exemplo simples)
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const KEY = process.env.OPENWEATHER_KEY; // carregue da variável de ambiente

app.get('/api/weather', async (req, res) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${req.query.lat}&lon=${req.query.lon}&appid=${KEY}&units=${req.query.units || 'metric'}`;
  const r = await fetch(url);
  const json = await r.json();
  res.json(json);
});

app.listen(3000);
```

## Observações de segurança

- Não deixe `API_KEY` pública em repositórios públicos. Use variáveis de ambiente no servidor.
- Limite chamadas desnecessárias e implemente caching no servidor se necessário.

## Sugestões futuras

- Mover chamadas sensíveis (API_KEY) para um backend/proxy.
- Adicionar testes unitários para funções utilitárias.
- Melhorar acessibilidade (mais roles/labels) e animações leves nos ícones SVG.

## Licença

Repositório sem licença explícita — adicione uma licença apropriada (por exemplo, MIT) se pretende abrir o código.

---

Se quiser, eu adiciono instruções para criar o proxy Node/Express com passos completos e um `package.json` minimal.
