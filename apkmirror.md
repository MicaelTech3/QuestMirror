================================================================
  QUESTMIRROR APK — GUIA COMPLETO DE BUILD E INSTALAÇÃO
================================================================


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PRÉ-REQUISITOS (instalar uma vez)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Node.js 18+ → https://nodejs.org (versão LTS)

  2. Expo CLI + EAS CLI:
     npm install -g expo-cli eas-cli

  3. Conta no Expo (gratuita):
     → https://expo.dev → Sign Up
     → Depois: eas login (no terminal)

  4. IMPORTANTE — google-services.json real:
     O arquivo google-services.json incluído é um placeholder.
     Você precisa baixar o real do Firebase:

     Firebase Console → questmirror-server
     → Project Settings → Your Apps
     → Clique no ícone Android (🤖)
     → Se não tiver app Android: "Add app" → Android
       Package name: com.questmirror.app
     → Baixe o google-services.json
     → Substitua o arquivo na pasta QuestMirrorApp/


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PASSO A PASSO — BUILD DO APK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Abra o PowerShell e entre na pasta:
     cd C:\QuestMirrorApp

  2. Instale as dependências:
     npm install

  3. Faça login no EAS (se ainda não fez):
     eas login

  4. Configure o projeto EAS (apenas 1ª vez):
     eas build:configure
     → Aceite as opções padrão

  5. Gere o APK:
     eas build --platform android --profile preview

     → O build roda na nuvem (EAS Build)
     → Aguarde 5-15 minutos
     → Ao final aparece um link para baixar o .apk

  6. Baixe o .apk do link fornecido


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INSTALAÇÃO NO META QUEST 3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  PASSO 1 — Ativar Modo Desenvolvedor
    → App Meta no celular
    → Devices → selecione seu Quest
    → Developer Mode → ON
    → Reinicie o Quest se pedido

  PASSO 2 — Instalar via SideQuest (mais fácil)
    → Baixe: https://sidequestvr.com/setup-howto
    → Instale o SideQuest Advanced no PC
    → Conecte o Quest via USB
    → No Quest: autorize o PC quando aparecer a pergunta
    → No SideQuest: arraste o .apk para a janela
    → Aguarde a instalação

  PASSO 3 — Abrir no Quest
    → No Quest: Biblioteca → aba "Unknown Sources"
    → Procure "QuestMirror"
    → Abra o app

  OU via ADB (terminal):
    adb devices                          ← ver devices
    adb install QuestMirror.apk          ← instalar

  INSTALAR EM MÚLTIPLOS QUESTS:
    Conecte um por vez via USB e repita o processo
    Ou via Wi-Fi:
      adb connect 192.168.1.XXX:5555     ← IP do Quest
      adb install QuestMirror.apk


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PRIMEIRO USO DO APP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Ao abrir pela primeira vez:

  1. Tela de seleção:
     ┌──────────────┐  ┌──────────────┐
     │  📡 SENDER   │  │  📺 RECEIVER │
     └──────────────┘  └──────────────┘

  2. Para Quests que vão transmitir → SENDER
     - Digite seu nome (ex: "João", "Quest 1")
     - Digite o ID de 6 dígitos do server (criado no Admin Panel)
     - Toque em "Conectar e Transmitir"
     - Autorize a captura de tela quando aparecer o popup

  3. Para a TV/dispositivo que vai exibir → RECEIVER
     - Digite o ID de 6 dígitos do server
     - Toque em "Conectar"
     - A tela vai para fullscreen automaticamente

  4. Da próxima vez:
     - App abre e conecta automaticamente
     - Não precisa digitar nada

  5. Se o Admin deletar o server:
     - O app mostra um aviso
     - Volta para a tela de setup


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FUNCIONALIDADES DO ADMIN PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  • Criar servers com ID único de 6 dígitos
  • Definir até 6 Quests por server
  • Definir intervalo de rotação (5s, 10s, 15s, 30s, 1min, Manual)
  • Alterar intervalo e quantidade SEM recriar o server
    (dropdowns inline em cada card)
  • Trocar manualmente qual Quest está sendo exibido
    (botão "Exibir" em cada Quest conectado)
  • Ver quais Quests estão conectados em tempo real
  • Ativar / Desativar / Deletar servers
  • Copiar ID com 1 clique


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ESTRUTURA DE ARQUIVOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  QuestMirrorApp/
  ├── App.js                         ← entrada + auto-login
  ├── index.js                       ← entry point Expo
  ├── app.json                       ← config Expo
  ├── eas.json                       ← config build APK
  ├── package.json                   ← dependências
  ├── google-services.json           ← ⚠️ substituir pelo real
  └── src/
      ├── screens/
      │   ├── OnboardingScreen.js    ← seleção role + setup
      │   ├── SenderScreen.js        ← captura e transmite tela
      │   └── ReceiverScreen.js      ← exibe streams fullscreen
      └── services/
          ├── firebase.js            ← Firestore (sinalização)
          └── storage.js             ← AsyncStorage (config local)

  Arquivos web (browser, sem APK):
  ├── admin_panel.html               ← painel admin
  ├── sender.html                    ← sender via browser
  └── receiver.html                  ← receiver via browser


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SOLUÇÃO DE PROBLEMAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  "Build failed - google-services.json"
  → Baixe o arquivo real do Firebase Console e substitua

  "eas: command not found"
  → npm install -g eas-cli

  "App não aparece no Quest"
  → Biblioteca → aba "Unknown Sources" (não em "Apps")

  "Tela preta no Receiver"
  → Aguarde o Sender conectar primeiro
  → Toque na tela para ver o HUD com status

  "Server não encontrado"
  → Verifique se digitou os 6 dígitos corretos
  → Verifique se o server está ativo no Admin Panel

  Quest não aparece no Admin Panel
  → Certifique-se que escolheu SENDER no app
  → Verifique se autorizou a captura de tela

================================================================