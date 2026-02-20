================================================================
  QUESTMIRROR — STATUS DO PROJETO + ROADMAP COMPLETO
  Atualizado em: Fevereiro 2026
================================================================


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  VISÃO GERAL DO SISTEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Um sistema completo para espelhar telas de até 6 Meta Quest 3
  em uma TV (via Chromecast ou qualquer dispositivo Android),
  com gerenciamento centralizado via painel Admin.

  COMPONENTES:
  ┌─────────────────┐     ┌──────────────────────────────────┐
  │  Admin Panel    │────▶│         Firebase                 │
  │  (Web)          │     │  Firestore + Auth + Hosting      │
  └─────────────────┘     └──────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
             ┌────────────┐  ┌────────────┐  ┌────────────┐
             │ QuestMirror│  │ QuestMirror│  │ QuestMirror│
             │    APK     │  │    APK     │  │    APK     │
             │ (Sender)   │  │ (Sender)   │  │ (Receiver) │
             │ Meta Quest │  │ Meta Quest │  │  TV/Quest  │
             └────────────┘  └────────────┘  └────────────┘
                    │               │               │
                    └───────────────┴───────────────┘
                              WebRTC P2P
                         (vídeo direto, sem servidor)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  O QUE JÁ ESTÁ PRONTO ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ ADMIN PANEL (admin_panel.html)
  ─────────────────────────────────
  • Login com Firebase Auth (email + senha)
  • Criar servers com ID único de 6 dígitos
  • Configurar intervalo de rotação (5s, 10s, 15s, 30s, 1min, Manual)
  • Configurar máximo de Quests por server (1 a 4)
  • Ver status em tempo real (online/offline, quests conectados)
  • Copiar ID do server com 1 clique
  • Ativar / Desativar servers
  • Deletar servers
  • Contadores no topo (total, ativos, quests, receivers)
  • Design profissional (dark mode, animações, responsivo)

  ✅ SENDER WEB (sender.html)
  ────────────────────────────
  • Tela de setup: nome + ID do server (6 dígitos)
  • Validação do ID no Firebase
  • Verificação se server está ativo
  • Captura de tela via getDisplayMedia (WebRTC)
  • Transmissão P2P para o Receiver via WebRTC
  • Sinalização via Firestore (sem servidor Node)
  • Registro do sender no banco (aparece no Admin)
  • Salva config no localStorage (reconecta automático)
  • Log de eventos em tempo real
  • Indicador de peers conectados

  ✅ RECEIVER WEB (receiver.html)
  ─────────────────────────────────
  • Tela de setup: só ID do server
  • Conecta a todos os senders do server simultaneamente
  • Exibe 1 stream por vez em fullscreen
  • Alterna automaticamente pelo intervalo configurado no Admin
  • Barra de progresso animada até próxima troca
  • Dots indicando quantos Quests estão conectados
  • HUD (aparece ao toque): nome do Quest + botão sair
  • Flash suave na troca de Quest
  • Reconexão automática se sender cair
  • Salva ID no localStorage (reconecta automático)
  • Usa intervalo de rotação configurado pelo Admin em tempo real

  ✅ FIREBASE CONFIGURADO
  ────────────────────────
  • Projeto: questmirror-server
  • Firestore: ativo com regras corretas
  • Auth: Email/Senha ativo
  • Credenciais já injetadas nos arquivos HTML

  ✅ VERSÃO LOCAL (Node.js) — primeira versão
  ────────────────────────────────────────────
  • server.js (Express + Socket.io)
  • sender.html / viewer.html via rede local Wi-Fi
  • start.bat para Windows
  • Funcionou com sucesso em testes locais


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ESTRUTURA DO FIREBASE (FIRESTORE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /servers/{docId}/
    serverId:         "412947"       ← ID de 6 dígitos
    name:             "Sala A"
    active:           true
    rotationInterval: 10             ← segundos (0 = manual)
    maxSenders:       4              ← até 6 no futuro
    currentSender:    null
    createdAt:        timestamp

  /servers/{docId}/senders/{senderDocId}/
    questName:   "João"
    connected:   true
    lastSeen:    timestamp
    createdAt:   timestamp

  /servers/{docId}/senders/{senderDocId}/signaling/{receiverId}/
    type:        "request" | "offer" | "answer" | "ice-sender" | "ice-receiver"
    offer:       RTCSessionDescription
    answer:      RTCSessionDescription
    candidate:   RTCIceCandidate
    ts:          timestamp


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  O QUE FALTA FAZER 🔧
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  FASE 1 — APK ÚNICO (React Native + Expo)           [PRÓXIMO]
  ─────────────────────────────────────────────────────────────
  Um único .apk instalado no Quest / Android TV que na
  primeira abertura pergunta a função do dispositivo:

  [ Onboarding — Primeira vez ]
    Tela 1: Logo QuestMirror
    Tela 2: "Qual é a função deste dispositivo?"
            ┌──────────────┐  ┌──────────────┐
            │  📡 SENDER   │  │  📺 RECEIVER │
            │  (Quest)     │  │  (TV)        │
            └──────────────┘  └──────────────┘
    Tela 3 (Sender): Nome + ID do Server (6 dígitos)
    Tela 3 (Receiver): ID do Server (6 dígitos)
    → Salva tudo no AsyncStorage
    → Nunca mais pergunta (a não ser que seja resetado pelo admin)

  [ Comportamento após setup ]
    - App fechado → reaberto = reconecta ao mesmo server
    - Device desligado → ligado = reconecta ao mesmo server
    - Admin desativou o server = mostra aviso "server inativo"
    - Admin deletou o server = mostra tela de setup novamente
    - Sempre verifica no Firebase se o server ainda existe

  [ Sender APK ]
    • Captura de tela nativa (Android MediaProjection API)
    • Muito mais estável que via browser
    • Transmite mesmo com o app em background
    • Registra no Firestore como sender conectado
    • Sinalização WebRTC via Firestore
    • Mantém conexão ativa com o Receiver

  [ Receiver APK ]
    • Recebe até 6 streams simultâneos (conexões abertas)
    • Exibe 1 por vez em fullscreen
    • Alterna pelo intervalo do Admin (em tempo real)
    • Se Admin mudar o Quest ativo → troca imediatamente
    • Modo TV: sem UI, só vídeo + dots + barra de progresso

  [ Tecnologias ]
    • React Native 0.73+ com Expo SDK 50+
    • react-native-webrtc (WebRTC nativo Android)
    • @react-native-firebase/firestore
    • @react-native-async-storage/async-storage
    • expo-media-projection (captura de tela nativa)
    • EAS Build para gerar o .apk

  FASE 2 — MELHORIAS NO ADMIN PANEL                  [FUTURO]
  ─────────────────────────────────────────────────────────────
  • Aumentar máximo de Quests por server de 4 para 6
  • Botão para trocar manualmente qual Quest está ativo
  • Ver miniaturas ao vivo de cada Quest no Admin
  • Alterar intervalo de rotação em tempo real (sem recriar server)
  • Histórico de conexões
  • Múltiplos admins (por email)
  • Dashboard com gráficos de uso

  FASE 3 — DEPLOY ONLINE                             [FUTURO]
  ─────────────────────────────────────────────────────────────
  • Admin Panel hospedado no Firebase Hosting
    Comando: firebase deploy
    URL: https://questmirror-server.web.app/admin

  • sender.html e receiver.html também no Firebase Hosting
    Para quem quiser usar só pelo browser sem APK

  • HTTPS automático → getDisplayMedia funciona sem flags

  FASE 4 — POLIMENTO APK                             [FUTURO]
  ─────────────────────────────────────────────────────────────
  • Ícone personalizado (QuestMirror logo)
  • Splash screen animada
  • Modo landscape forçado no Receiver
  • Indicador de qualidade de conexão (latência)
  • Notificação quando Admin troca o Quest ativo
  • Botão "Reportar problema" no APK


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MUDANÇAS PEDIDAS PARA O ADMIN PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  • Aumentar máximo de senders: de 4 → até 6 por server
  • Admin pode trocar qual Quest está ativo manualmente
    (clica no Quest desejado no card do server)
  • Admin pode alterar o número máximo de Quests a qualquer
    hora sem precisar recriar o server
  • Admin pode alterar o intervalo de rotação em tempo real


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  COMO INSTALAR O APK NO META QUEST (quando ficar pronto)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Pré-requisito: Ativar Modo Desenvolvedor
    App Meta no celular → Devices → Quest → Dev Mode → ON

  OPÇÃO A — SideQuest (mais fácil)
    1. Baixar SideQuest: https://sidequestvr.com
    2. Conectar Quest via USB
    3. Arrastar o .apk para o SideQuest
    4. No Quest: Biblioteca → Fontes Desconhecidas → QuestMirror

  OPÇÃO B — ADB (terminal)
    adb connect <IP_DO_QUEST>:5555
    adb install QuestMirror.apk

  Instalar em múltiplos Quests:
    Conectar um por vez via USB e repetir o processo
    (ou via Wi-Fi com adb connect simultâneo)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ARQUIVOS DO PROJETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  VERSÃO WEB (pronta):
    admin_panel.html   → painel de administração
    sender.html        → transmissor (abre no Quest via browser)
    receiver.html      → receptor (abre na TV via browser)

  VERSÃO LOCAL (primeira versão, funcional):
    server.js          → servidor Node.js (Express + Socket.io)
    public/sender.html → transmissor local
    public/viewer.html → receptor local
    start.bat          → iniciar no Windows

  APK (em desenvolvimento):
    QuestMirror.apk    → app único (Sender + Receiver)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FIREBASE — CREDENCIAIS DO PROJETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Projeto:          questmirror-server
  Auth Domain:      questmirror-server.firebaseapp.com
  Hosting URL:      https://questmirror-server.web.app
  Console:          https://console.firebase.google.com
                    → projeto: questmirror-server

  Serviços ativos:
    ✅ Firestore Database (regras configuradas)
    ✅ Authentication (Email/Senha)
    ⬜ Firebase Hosting (ainda não configurado)
    ⬜ Realtime Database (não utilizado)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CUSTO TOTAL DO PROJETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Firebase Spark (gratuito):    $0/mês
  Firebase Hosting:             $0/mês
  EAS Build Expo (gratuito):    $0/mês (15 builds/mês)
  Servidor Node.js:             Não existe (WebRTC P2P)

  CUSTO TOTAL: $0/mês


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PRÓXIMOS PASSOS IMEDIATOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. ✅ Admin Panel — FEITO
  2. ✅ Sender Web — FEITO
  3. ✅ Receiver Web — FEITO
  4. 🔧 Atualizar Admin Panel:
        - Aumentar max senders para 6
        - Botão trocar Quest ativo manualmente
        - Editar intervalo e quantidade sem recriar server
  5. 🔧 Criar APK (React Native + Expo):
        - Instalar ambiente (Node + Expo + EAS)
        - Estrutura do projeto React Native
        - Tela de onboarding (Sender ou Receiver)
        - Tela de setup com ID do server
        - Sender: captura de tela nativa (MediaProjection)
        - Receiver: player WebRTC fullscreen
        - Build .apk via EAS
        - Instalar no Quest via SideQuest/ADB
  6. 🔧 Deploy Firebase Hosting (admin + web)
  7. 🔧 Testes finais com 4-6 Quests simultâneos

================================================================

  ok mas o sender eo receiver será apks e não site , mas deixe os site porem vamos fazer assim será um apk , quando aabre pela primeiravez aparece " sender ou receiver " escolhe qual é ai caso for sender vai fazer a mesma coisa que o site , por o de do server criado no admin , e se for receiver mesma coisa, lembrando que se o app for fechado ou desligado o device , e abri o app, ele sempre estar no mesmo server a não ser que o admin pela page tenha retirado, e tbm quero que admin possa alterar o numero de quest na hora que quiser , e tbm pode mudar de quest para device e a quantidade até 6 por server.

================================================================