# 🌤️ TempNow - Previsão do Tempo Inteligente

Um site para consultar a previsão do tempo de qualquer cidade do mundo. Interface bonita e fácil de usar em qualquer dispositivo.

## 📸 Preview do Projeto

![TempNow - Previsão do Tempo Inteligente](./assets/PREVISAO%20DO%20TEMPO%20INTELIGENTE.png)
*Screenshot da aplicação TempNow - Previsão do Tempo Inteligente em funcionamento*

<div align="center">

**🚀 [VER PROJETO AO VIVO](https://alisson-miguelferreira.github.io/previsao-do-tempo/) 🚀**

[![Visualizar Projeto](https://img.shields.io/badge/🌤️_Ver_Demo_Online-0a1a2e?style=for-the-badge&logo=github&logoColor=00d4ff)](https://alisson-miguelferreira.github.io/previsao-do-tempo/)

</div>

> **💡 Screenshot atualizado:**
> ✅ Imagem adicionada: `previsao do tempo inteligente.png`
> ✅ Localização: `./assets/`
> ✅ Mostra a interface completa da aplicação

## 🎯 O que o App Oferece

- **Visual Bonito**: Interface moderna com cores azuis elegantes
- **Funciona em Qualquer Tela**: Celular, tablet ou computador
- **Encontra Sua Localização**: Usa o GPS para mostrar o tempo da sua cidade
- **Cidades Favoritas**: Salve suas cidades preferidas para acesso rápido
- **Previsão Completa**: Tempo atual + próximos 5 dias
- **Ícones Inteligentes**: Emojis diferentes para dia e noite
- **Celsius ou Fahrenheit**: Escolha a temperatura que preferir
- **Fácil de Usar**: Menu lateral organizado com busca e favoritos

## 🚀 Como Funciona

### 🔍 Encontrar Sua Cidade

- **Digite o nome**: Escreva qualquer cidade do mundo
- **Use o GPS**: Clique no botão de localização para pegar sua posição
- **Busca inteligente**: O app sugere cidades enquanto você digita

### ⭐ Salvar Favoritos

- **Um clique**: Clique na estrela para adicionar aos favoritos
- **Fica salvo**: Suas cidades ficam guardadas no navegador
- **Acesso rápido**: Veja todas na barra lateral
- **Visual claro**: Ícone mostra se a cidade já está nos favoritos

### 🌡️ Informações do Tempo

- **Temperatura atual**: Com sensação térmica
- **Detalhes completos**: Umidade, vento e pressão
- **5 dias**: Temperaturas máximas e mínimas
- **Horário certo**: Ícones mudam conforme dia/noite da cidade

### 📱 Funciona em Tudo

- **Celular**: Otimizado para smartphones
- **Menu adaptável**: Sidebar se esconde em telas pequenas
- **Toque amigável**: Botões grandes e fáceis de tocar
- **Carrega rápido**: Funciona bem até em internet lenta

## �️ Como Foi Feito

### Tecnologias Usadas

- **HTML5**: Estrutura das páginas
- **CSS3**: Visual e animações bonitas
- **JavaScript**: Lógica e funcionamento do app
- **Design Responsivo**: Se adapta a qualquer tela

### Serviços Externos

- **OpenWeatherMap**: Dados do tempo em tempo real
- **Sistema de Busca**: Encontra cidades pelo nome
- **GPS do Navegador**: Pega sua localização automaticamente
- **Armazenamento Local**: Guarda seus favoritos no navegador

## 📋 Requisitos para Usar

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexão com internet
- Permite localização (opcional, para GPS)

## 🚀 Como Usar o App

### Para Usuários

1. **Acesse o site**: [Ver projeto ao vivo](https://alisson-miguelferreira.github.io/previsao-do-tempo/)
2. **Primeira vez**: Leia as instruções na tela de boas-vindas
3. **Buscar cidade**: Digite o nome na barra de pesquisa ou use o GPS
4. **Adicionar favoritos**: Clique na estrela ⭐ ao lado da cidade
5. **Gerenciar**: Use o menu lateral para ver favoritos e configurações

### Para Desenvolvedores

Se você quer baixar e modificar o código:

```bash
# 1. Baixar o projeto
git clone https://github.com/alisson-miguelferreira/previsao-do-tempo.git
cd previsao-do-tempo

# 2. Abrir no navegador
# Opção 1: Duplo clique no arquivo index.html

# Opção 2: Servidor local (recomendado)
python -m http.server 8080
# Acesse: http://localhost:8080

# Opção 3: Extensão Live Server no VS Code
# Instale a extensão Live Server e clique em "Go Live"
```

## 📁 Arquivos do Projeto

```
previsao-do-tempo/
│
├── index.html          # Página principal
├── styles.css          # Visual e cores
├── script.js           # Funcionamento
├── README.md           # Este arquivo
├── .gitignore          # Arquivos ignorados pelo Git
└── assets/             # Imagens e recursos
    └── screenshot.png  # Imagem do projeto
```

## � Configurar sua Própria Chave da API

O projeto já vem com uma chave de demonstração, mas para uso pessoal:

1. **Cadastre-se grátis** em [OpenWeatherMap](https://openweathermap.org/api)
2. **Pegue sua chave** na área de usuário
3. **Abra o arquivo** `script.js`
4. **Substitua** a linha que tem `API_KEY = '...'` pela sua chave

```javascript
// Troque esta linha:
const API_KEY = 'f7fc4ccec2e0cc8d47fa3f418178de34';

// Por esta (com sua chave):
const API_KEY = 'SUA_CHAVE_AQUI';
```

> **💡 Dica**: Para sites públicos, é melhor usar um servidor para esconder a chave da API.

## 📱 Funciona em Quais Dispositivos?

### Navegadores Compatíveis
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Tamanhos de Tela
- ✅ Celular (320px+)
- ✅ Tablet (768px+)
- ✅ Computador (1024px+)
- ✅ Telas grandes (4K)

## 🎯 Principais Funcionalidades

### Sistema Inteligente de Localização
- **Várias tentativas**: Se a localização não for precisa, tenta de novo
- **Sistema de backup**: Usa diferentes formas de encontrar sua cidade
- **Validação automática**: Rejeita nomes de cidade inválidos
- **Otimização**: Evita fazer muitas consultas desnecessárias

### Ícones que Mudam Sozinhos
- **Horário certo**: Mostra sol de dia e lua de noite
- **Fuso horário real**: Considera o horário da cidade pesquisada
- **Nascer/pôr do sol**: Usa dados reais para saber se é dia ou noite
- **Clima correspondente**: Ícones combinam com a condição do tempo

### Experiência do Usuário
- **Feedback visual**: Mostra quando está carregando
- **Mensagens claras**: Erros explicados de forma simples
- **Funciona offline**: Detecta quando perde internet
- **Animações suaves**: Transições bonitas entre telas

## 🤝 Quer Contribuir?

Se você sabe programar e quer melhorar o projeto:

1. **Fork** o repositório no GitHub
2. **Crie uma branch** para sua nova funcionalidade
3. **Faça as mudanças** e teste bem
4. **Envie um Pull Request** explicando o que mudou

### Regras para Contribuir
- Mantenha o código organizado
- Adicione comentários em português
- Teste em celular e computador
- Atualize esta documentação se necessário

## 📄 Licença

Este projeto é open source com licença MIT - você pode usar e modificar livremente.

## 👨‍💻 Criador

**Alisson Miguel Ferreira**
- GitHub: [@alisson-miguelferreira](https://github.com/alisson-miguelferreira)

## 🙏 Agradecimentos

- [OpenWeatherMap](https://openweathermap.org/) - Dados meteorológicos
- [Google Fonts](https://fonts.google.com/) - Fonte Inter
- Comunidade de desenvolvedores pelas ideias e feedback

## 📊 Status do Projeto

🚀 **Funcionando** - Versão 1.0.0

### Próximas Melhorias Planejadas
- [ ] App para celular (PWA)
- [ ] Notificações de alertas meteorológicos
- [ ] Gráficos de temperatura
- [ ] Mais idiomas
- [ ] Tema escuro
- [ ] Mapas interativos
- [ ] Histórico de pesquisas

---

**⭐ Gostou do projeto? Dê uma estrela no GitHub!**

*Feito com ❤️ e muito ☕ por Alisson Miguel Ferreira*
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