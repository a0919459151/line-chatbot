# Line Chat Bot

這個聊天機器人，可以紀錄你的行程，

然後會在該行程當天早上推播通知給妳。

要注意line bot的推波次數一個月是500則，用完就沒有了！

# 指令

- 行事曆 看

- 行事曆 加 <活動名稱>

  範例: 行事曆 加 唱歌 
  ( 活動名稱上限10個字 )

- 行事曆 刪

# 使用到的技術

language: node v16.16.0

api server: express

db: mongo db

orm: mongoose

schedule: cron

proxy: ngrok

# get start

## set env var

cp .env.example .env

## npm install

npm i

## run express

npm run start

## run ngrok

node utils/manualScript/runNgrok.js

## set line bot webhook

line developer 官網: https://manager.line.biz/account/@001dsxlb/setting/messaging-api

把 ngrok 的 url 加上 /webhook 貼上去

ex: https://9c6b-123-50-51-142.ngrok-free.app/webhook

就可以開始使用聊天機器人囉！