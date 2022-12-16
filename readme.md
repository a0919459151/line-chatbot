1. ngrok 
  brew install --cask ngrok
  ngrok config add-authtoken
  ngrok http 8080

2. 設定 webhook 
  line developer: https://manager.line.biz/account/@001dsxlb/setting/messaging-api
  把 ngrok 的 Forwarding 加上 /webhook 貼上去

3. touch .env
  CHANNEL_SECRET
  CHANNEL_ACCESS_TOKEN

4. pm2 startup
  pm2 start ~/practice/line_chatbot/app.js --name line_chatbot

