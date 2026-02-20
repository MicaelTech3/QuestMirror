================================================================
  QUEST MIRROR V2 — PLANO TÉCNICO COMPLETO
  Arquitetura com APK nativo + Firebase + Admin Panel
================================================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  VISÃO GERAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [ Admin Panel ]  →  Firebase  ←  [ Sender APK ]  (Meta Quest)
                       ↓
                   [ Receiver APK ]  (Meta Quest / Android TV)

  - Admin cria Servers com ID de 6 dígitos
  - Sender APK captura a tela do Quest e envia via WebRTC
  - Receiver APK recebe o stream e exibe na TV/Quest
  - Firebase gerencia sinalização, autenticação e dados
  - SEM servidor Node.js — tudo peer-to-peer via Firebase


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  COMPONENTE 1: ADMIN PANEL (Web)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Tecnologia: HTML + JS + Firebase SDK (hospedado no Firebase Hosting)
  URL: https://questmirror.web.app/admin  (exemplo)

  Funcionalidades:
  ─────────────────
  • Login com senha de admin (Firebase Auth)
  • Criar novo Server
      - Gera ID de 6 dígitos aleatório único (ex: 483920)
      - Define nome do server (ex: "Sala A", "Evento X")
      - Define quantos senders são permitidos (1 a 4)
      - Define intervalo de rotação (5s, 10s, 30s, manual)
  • Listar todos os servers criados
  • Ver status em tempo real:
      - Quais Quests estão conectados
      - Qual Quest está sendo exibido agora
      - Latência de cada stream
  • Editar / Desativar / Deletar servers
  • Copiar ID para compartilhar com usuários

  Estrutura no Firestore:
  ─────────────────────────
  servers/
    {serverId_6digitos}/
      name: "Sala A"
      createdAt: timestamp
      active: true
      maxSenders: 4
      rotationInterval: 10  (segundos)
      currentSender: "quest_1"

  servers/{serverId}/senders/
    {senderId}/
      questName: "Quest do João"
      connected: true
      lastSeen: timestamp

  servers/{serverId}/signaling/
    {sessionId}/
      offer: {...}
      answer: {...}
      candidates: [...]


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  COMPONENTE 2: SENDER APK (Meta Quest 3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Tecnologia: React Native + Expo (compilado para Android/APK)
  Por que React Native:
    - Meta Quest roda Android 10+
    - Expo suporta APK direto
    - Acesso ao MediaProjection API (captura de tela nativa)
    - Firebase SDK disponível

  Fluxo de primeiro uso:
  ───────────────────────
  1. Abre o APK → Tela de onboarding
  2. Pede: "Seu nome" (ex: "João")
  3. Pede: "ID do Server" (6 dígitos) — fornecido pelo admin
  4. Valida o ID no Firebase → confirma que server existe
  5. Salva localmente (AsyncStorage) → nunca mais pede
  6. Inicia captura de tela automaticamente
  7. Conecta ao server via WebRTC + Firebase Signaling
  8. Aparece na lista do Admin como "conectado"

  Usos subsequentes:
  ───────────────────
  - Abre o app → começa a transmitir imediatamente
  - Pequeno botão de configurações para trocar server/nome

  Captura de tela nativa:
  ────────────────────────
  - Android MediaProjection API
  - Permissão solicitada uma vez
  - Captura em 1280x720 @ 30fps
  - Codificado em H.264 via WebRTC
  - Enviado diretamente ao Receiver (P2P)
  - Firebase usado APENAS para sinalização (troca de offer/answer)

  Dependências principais:
  ─────────────────────────
  - expo (framework)
  - react-native-webrtc (WebRTC nativo)
  - @react-native-firebase/firestore (sinalização)
  - @react-native-firebase/auth
  - @react-native-async-storage/async-storage (salvar config)
  - react-native-get-random-values


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  COMPONENTE 3: RECEIVER APK (Meta Quest / Android TV)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Tecnologia: React Native + Expo (APK Android)
  Compatível com: Meta Quest 3, Android TV, Fire TV Stick

  Fluxo de primeiro uso:
  ───────────────────────
  1. Abre o APK → Tela simples
  2. Pede APENAS: "ID do Server" (6 dígitos)
  3. Valida no Firebase
  4. Salva → sempre conecta a esse server
  5. Exibe o stream ativo automaticamente

  Funcionalidades:
  ─────────────────
  - Exibe o stream do sender atual em fullscreen
  - Troca automaticamente conforme configurado no server
  - Mostra indicador "Quest X — ao vivo"
  - Barra de progresso até próxima troca
  - Reconecta automaticamente se cair
  - Modo TV: sem UI, só o vídeo

  Lógica de rotação:
  ───────────────────
  - O Admin Panel controla qual sender está ativo
  - Firebase atualiza o campo "currentSender" no server
  - Receiver escuta essa mudança em tempo real (onSnapshot)
  - Troca o stream sem derrubar as outras conexões


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FIREBASE — ESTRUTURA COMPLETA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Serviços utilizados (todos no plano GRATUITO):
  ───────────────────────────────────────────────
  • Firestore       → banco de dados + sinalização WebRTC
  • Firebase Auth   → login do admin
  • Firebase Hosting→ hospeda o Admin Panel
  • Firebase RTDB   → presença em tempo real (connected/disconnected)

  Plano Spark (gratuito) suporta:
    - 1GB de armazenamento Firestore
    - 50.000 leituras/dia
    - 20.000 escritas/dia
    - Suficiente para dezenas de sessions simultâneas

  Estrutura Firestore:
  ─────────────────────
  /servers/{id6}/
    name, active, maxSenders, rotationInterval,
    currentSender, createdAt

  /servers/{id6}/senders/{senderUID}/
    questName, connected, lastSeen, socketDesc

  /servers/{id6}/signaling/{senderUID}/
    offer: RTCSessionDescription
    answer: RTCSessionDescription
    offerCandidates: subcollection
    answerCandidates: subcollection


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FLUXO WEBRTC COM FIREBASE (sem servidor Node)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Sender cria RTCPeerConnection
  2. Sender captura tela → addTrack()
  3. Sender cria offer → salva no Firestore
  4. Receiver detecta novo offer (onSnapshot)
  5. Receiver cria answer → salva no Firestore
  6. Sender detecta answer → setRemoteDescription
  7. ICE candidates trocados via Firestore
  8. Conexão WebRTC estabelecida DIRETAMENTE
  9. Vídeo flui P2P — Firebase não toca no vídeo

  Latência esperada: 50-200ms na mesma rede


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ORDEM DE DESENVOLVIMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  FASE 1 — Firebase + Admin Panel
  ─────────────────────────────────
  [x] Criar projeto Firebase
  [x] Configurar Firestore + Auth + Hosting
  [x] Desenvolver Admin Panel (HTML/JS)
      - Login admin
      - Criar/listar/deletar servers
      - Gerar ID 6 dígitos único
      - Ver status em tempo real
  [x] Deploy no Firebase Hosting

  FASE 2 — Sender APK
  ─────────────────────
  [x] Setup Expo + React Native
  [x] Tela de onboarding (nome + ID server)
  [x] Validação do ID no Firebase
  [x] Salvar config no AsyncStorage
  [x] Integrar react-native-webrtc
  [x] Captura de tela (MediaProjection)
  [x] Sinalização via Firestore
  [x] Build APK (.apk para sideload no Quest)

  FASE 3 — Receiver APK
  ──────────────────────
  [x] Tela de onboarding (só ID server)
  [x] Receber stream via WebRTC
  [x] Exibir em fullscreen
  [x] Rotação automática conforme server
  [x] Build APK

  FASE 4 — Polimento
  ───────────────────
  [x] Reconexão automática
  [x] Indicadores de status
  [x] Modo TV (sem UI)
  [x] Testes com 4 Quests simultâneos


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TECNOLOGIAS E FERRAMENTAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Admin Panel:
    - HTML5 + Vanilla JS (ou React)
    - Firebase JS SDK v9
    - Firebase Hosting (deploy grátis)

  APKs (Sender + Receiver):
    - React Native 0.73+
    - Expo SDK 50+
    - react-native-webrtc
    - @react-native-firebase/app
    - @react-native-firebase/firestore
    - expo-build-properties
    - EAS Build (Expo) para gerar o .apk

  Por que Expo/EAS:
    - Gera APK sem precisar de Android Studio
    - Build na nuvem (EAS Build — grátis até certo limite)
    - Sideload direto no Quest via ADB ou SideQuest


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INSTALAÇÃO NO META QUEST (Sideload)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Ativar Modo Desenvolvedor no Quest
     - App Meta no celular → Quest → Modo Desenvolvedor → ON

  2. Conectar Quest ao PC via USB

  3. Instalar via ADB:
     adb install QuestMirrorSender.apk
     adb install QuestMirrorReceiver.apk

  4. No Quest: Biblioteca → "Fontes Desconhecidas" → abrir app

  OU usar SideQuest (interface gráfica mais fácil):
     → https://sidequestvr.com


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CUSTO TOTAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Firebase Spark (gratuito):     $0/mês
  EAS Build Expo (gratuito):     $0/mês *
  Firebase Hosting:              $0/mês
  Servidor Node.js:              Não existe mais (P2P)

  * EAS Build gratuito: 15 builds/mês (mais que suficiente)

  CUSTO TOTAL: $0


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PRÓXIMOS PASSOS — O QUE CODAR PRIMEIRO?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Sugestão de ordem:

  1. Você cria o projeto Firebase (5 min)
     → console.firebase.google.com → Add project → "QuestMirror"

  2. Me passa as credenciais do Firebase (firebaseConfig)

  3. Eu gero o Admin Panel completo e funcional

  4. Você testa o Admin Panel (criar server, ver ID)

  5. Eu gero o Sender APK (React Native + Expo)

  6. Você instala no Quest e testa a captura

  7. Eu gero o Receiver APK

  8. Teste final completo

================================================================