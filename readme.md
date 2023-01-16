# ngrok 
  brew install --cask ngrok
  ngrok config add-authtoken
  ngrok http 8080

  or

  use npm i ngrok

# set webhook 
  line developer: https://manager.line.biz/account/@001dsxlb/setting/messaging-api
  把 ngrok 的 Forwarding 加上 /webhook 貼上去

# set env var
  touch .env

# pm2 startup
  pm2 start ~/practice/line_chatbot/app.js --name line_chatbot
  pm2 save

# line rich meun
  deploy flow
  - create rich menu
  - upload image
  - set default rich menu
  - ./richmenu.txt

# plan
  - redis lock
    
  - line nofity 
    https://notify-bot.line.me/my/
    取得權杖
