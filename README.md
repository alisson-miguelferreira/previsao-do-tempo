# 🌤️ TempNow - Previsão do Tempo Inteligente

Uma aplicação web moderna e responsiva para consulta de previsão do tempo com design elegante e funcionalidades avançadas.

## 📸 Preview do Projeto

![TempNow - Previsão do Tempo Inteligente](./assets/previsao%20do%20tempo%20inteligente.png)
*Screenshot da aplicação TempNow - Previsão do Tempo Inteligente em funcionamento*

> **💡 Screenshot atualizado:**
> ✅ Imagem adicionada: `previsao do tempo inteligente.png`
> ✅ Localização: `./assets/`
> ✅ Mostra a interface completa da aplicação

## 🎯 Características Principais

- **Design Moderno**: Interface glassmorphism com tema Arctic Blue
- **Responsivo**: Otimizado para todos os dispositivos (mobile, tablet, desktop)
- **Localização Inteligente**: GPS com reverse geocoding para máxima precisão
- **Favoritos**: Sistema de cidades favoritas com persistência local
- **Previsão Estendida**: Clima atual + previsão de 5 dias
- **Emojis Contextuais**: Ícones que mudam conforme horário local e clima
- **Múltiplas Unidades**: Suporte para Celsius e Fahrenheit
- **Interface Intuitiva**: Sidebar organizada com busca, favoritos e configurações

- **Emojis Contextuais**: Ícones que mudam conforme horário local e clima- Favoritos com persistência (localStorage) e reorder via drag & drop.

- **Múltiplas Unidades**: Suporte para Celsius e Fahrenheit- Ícones SVG mapeados e coloridos por condição (ensolarado, nublado, chuva, neve, névoa).

- **Interface Intuitiva**: Sidebar organizada com busca, favoritos e configurações- Tema por condição (classes CSS trocadas conforme tempo).



## 🚀 Funcionalidades## Tecnologias



### 🔍 Busca de Localização- HTML5

- **Busca por texto**: Digite qualquer cidade do mundo- CSS3 (variáveis -> temas)

- **Localização GPS**: Detecta automaticamente sua posição- JavaScript (ES6+, fetch, async/await)

- **Reverse Geocoding**: Nomes precisos em português- OpenWeather APIs (Geocoding, Current Weather, Forecast)

- **Sugestões automáticas**: Busca inteligente com autocompletar

## Estrutura de arquivos

### ⭐ Sistema de Favoritos

- **Adicionar/Remover**: Um clique para gerenciar favoritos- `index.html` — estrutura da aplicação e marcação principal.

- **Persistência**: Dados salvos no navegador
- **Acesso rápido**: Lista na sidebar para navegação fácil
- **Visual feedback**: Indicação clara do status de favorito

## Como usar (desenvolvimento / local)

### 🌡️ Dados Meteorológicos

- **Temperatura atual**: Com sensação térmica
- **Umidade e vento**: Dados completos do clima
- **Previsão 5 dias**: Máximas, mínimas e condições
- **Horário contextual**: Emojis de dia/noite baseados no fuso horário local

### 📱 Design Responsivo

Opções rápidas para servir localmente (recomendado — evita problemas com CORS ao abrir via file://):

- Com Node (recomendado):

```bash
# servidor estático simples via npx

- **Mobile First**: Otimizado para smartphonesnpx http-server -c-1

- **Sidebar adaptativa**: Colapsa automaticamente em telas pequenas```

- **Touch friendly**: Botões e interações otimizadas para touch

- **Performance**: Carregamento rápido em todas as conexões- Usando a extensão Live Server no VS Code:



## 🛠️ Tecnologias Utilizadas1. Instale a extensão Live Server (ritwickdey ou similar).

2. Abra a pasta do projeto no VS Code e clique em "Go Live" no canto inferior direito.

### Frontend

- **HTML5**: Estrutura semântica modernaDepois abra no navegador o endereço mostrado pelo servidor (por exemplo `http://127.0.0.1:8080`).

- **CSS3**: Glassmorphism, Grid, Flexbox, Animações

- **JavaScript ES6+**: Async/await, Modules, ClassesObservação: o projeto é client-side e faz chamadas diretas à API OpenWeather. A chave da API está atualmente definida em `script.js` como `API_KEY`. Para ambientes de produção, mova essa chave para um backend/proxy para não expô-la ao cliente.

- **Responsive Design**: Mobile-first approach

## Configurar a chave da API

### APIs Integradas

- **OpenWeatherMap**: Dados meteorológicos em tempo real- Editar o arquivo `script.js` e substituir o valor de `API_KEY` por sua chave pessoal da OpenWeather.

- **Geocoding API**: Busca e localização de cidades- Alternativa mais segura: criar um endpoint no servidor que faça as chamadas à OpenWeather e retorne apenas os dados necessários para o cliente.

- **Reverse Geocoding**: Conversão de coordenadas para nomes

- **Browser Geolocation**: GPS nativo do dispositivoExemplo (Node/Express) rápido do proxy (opcional):



### Recursos Avançados```js

- **LocalStorage**: Persistência de favoritos e configurações// server.js (exemplo simples)

- **Service Worker Ready**: Preparado para PWAconst express = require('express');

- **Cross-browser**: Compatível com navegadores modernosconst fetch = require('node-fetch');

- **SEO Optimized**: Meta tags e estrutura otimizadaconst app = express();

const KEY = process.env.OPENWEATHER_KEY; // carregue da variável de ambiente

## 📋 Pré-requisitos

app.get('/api/weather', async (req, res) => {

- Navegador web moderno (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${req.query.lat}&lon=${req.query.lon}&appid=${KEY}&units=${req.query.units || 'metric'}`;

- Conexão com internet  const r = await fetch(url);

- API Key da OpenWeatherMap (incluída no projeto)  const json = await r.json();

  res.json(json);

## ⚡ Instalação e Uso});



### 1. Clone ou Downloadapp.listen(3000);

```bash```

git clone https://github.com/seu-usuario/tempnow-weather-app.git

cd tempnow-weather-app## Observações de segurança

```

- Não deixe `API_KEY` pública em repositórios públicos. Use variáveis de ambiente no servidor.

### 2. Abrir no Navegador- Limite chamadas desnecessárias e implemente caching no servidor se necessário.

```bash

# Método 1: Duplo clique no arquivo## Sugestões futuras

index.html

- Mover chamadas sensíveis (API_KEY) para um backend/proxy.

# Método 2: Servidor local (recomendado)- Adicionar testes unitários para funções utilitárias.

python -m http.server 8080- Melhorar acessibilidade (mais roles/labels) e animações leves nos ícones SVG.

# Acesse: http://localhost:8080

## Licença

# Método 3: Live Server (VS Code)

# Instale a extensão Live Server e clique em "Go Live"Repositório sem licença explícita — adicione uma licença apropriada (por exemplo, MIT) se pretende abrir o código.

```

---

### 3. Uso da Aplicação

1. **Primeira vez**: Tela de boas-vindas com instruçõesSe quiser, eu adiciono instruções para criar o proxy Node/Express com passos completos e um `package.json` minimal.

2. **Buscar cidade**: Digite na barra de pesquisa ou use GPS
3. **Adicionar favoritos**: Clique na estrela ⭐ no header
4. **Gerenciar**: Use a sidebar para acessar favoritos e configurações

## 🎨 Estrutura do Projeto

```
tempnow-weather-app/
│
├── index.html          # Página principal
├── styles.css          # Estilos CSS completos
├── script.js           # Lógica JavaScript
├── README.md           # Documentação
└── .git/               # Controle de versão Git
```

### Arquitetura CSS
- **CSS Variables**: Sistema de cores e espaçamentos centralizados
- **Mobile First**: Breakpoints responsivos organizados
- **Component Based**: Estilos modulares por componente
- **BEM Methodology**: Nomenclatura consistente de classes

### Arquitetura JavaScript
- **Modular**: Funções organizadas por responsabilidade
- **Async/Await**: Todas as APIs usando programação assíncrona
- **Error Handling**: Tratamento robusto de erros
- **DOM Caching**: Elementos DOM cachados para performance

## 🔧 Configuração da API

O projeto usa a API gratuita da OpenWeatherMap. A chave atual está incluída para demonstração:

```javascript
const API_KEY = 'f7fc4ccec2e0cc8d47fa3f418178de34';
```

### Para uso em produção:
1. Registre-se em [OpenWeatherMap](https://openweathermap.org/api)
2. Obtenha sua API key gratuita
3. Substitua a constante `API_KEY` no arquivo `script.js`

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Opera 47+

### Dispositivos Testados
- ✅ iPhone (iOS 12+)
- ✅ Android (API 21+)
- ✅ iPad/Tablets
- ✅ Desktop (Windows, macOS, Linux)

### Resoluções Suportadas
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+
- **4K**: Otimizado para alta resolução

## 🎯 Funcionalidades Avançadas

### Detecção Inteligente de Localização
- **Múltiplas tentativas**: Retry automático se precisão baixa
- **Fallback system**: OpenWeather → Reverse Geocoding → Coordenadas
- **Validação rigorosa**: Rejeita nomes inválidos automaticamente
- **Cache inteligente**: Otimização de requisições

### Sistema de Emojis Contextuais
- **Baseado no horário**: Emojis diferentes para dia/noite
- **Fuso horário real**: Considera o horário local da cidade
- **Sunrise/Sunset**: Usa dados reais de nascer/pôr do sol
- **Condições climáticas**: Matching inteligente com condições meteorológicas

### Performance e UX
- **Loading states**: Feedback visual durante carregamento
- **Error handling**: Mensagens amigáveis de erro
- **Offline detection**: Detecta perda de conexão
- **Smooth animations**: Transições suaves em todas as interações

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Guidelines de Contribuição
- Mantenha o padrão de código existente
- Adicione comentários para código complexo
- Teste em múltiplos dispositivos
- Atualize a documentação se necessário

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Alisson Miguel Ferreira**
- GitHub: [@alisson-miguelferreira](https://github.com/alisson-miguelferreira)

## 🙏 Agradecimentos

- [OpenWeatherMap](https://openweathermap.org/) - API de dados meteorológicos
- [Google Fonts](https://fonts.google.com/) - Tipografia Inter
- [Font Awesome](https://fontawesome.com/) - Ícones
- Comunidade de desenvolvedores por feedback e sugestões

## 📊 Status do Projeto

🚀 **Em Produção** - Versão 1.0.0

### Próximas Funcionalidades (Roadmap)
- [ ] PWA (Progressive Web App)
- [ ] Notificações push para alertas meteorológicos
- [ ] Gráficos de temperatura interativos
- [ ] Suporte a múltiplos idiomas
- [ ] Tema escuro/claro
- [ ] Integração com mapas
- [ ] Histórico de pesquisas

---

**⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!**

*Desenvolvido com ❤️ e muito ☕ por Alisson Miguel Ferreira*