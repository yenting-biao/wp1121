# Run the project

1. Install dependencies

   ```bash
   yarn
   ```
2. Get Pusher credentials
   Please refer to the [Pusher Setup](#pusher-setup) section for more details.
3. Get Github OAuth credentials
   Please refer to the [NextAuth Setup](#nextauth-setup) section for more details.
4. Check `.env.example`, and copy it as `.env.local` and fill in the following content:

   ```text
   PUSHER_ID=
   NEXT_PUBLIC_PUSHER_KEY=
   PUSHER_SECRET=
   NEXT_PUBLIC_PUSHER_CLUSTER=

   AUTH_SECRET=<this can be any random string>
   AUTH_GITHUB_ID=
   AUTH_GITHUB_SECRET=
   ```
5. Start the database by docker, or you can use other method to set up the postgresql database, just make sure that your set up is correct.

   ```bash
   docker compose up -d
   ```
6. Run migrations

   ```bash
   yarn migrate
   ```
7. Start the development server

   ```bash
   yarn dev
   ```
8. Open http://localhost:3000 in your browser

# Setup Guide

## Prettier and ESLint

Run the following commands in the hw4 directory.

```bash
yarn lint
```

# Note

* The two perfect requests I implemented are:
  **傳送連結** ：自動辨識訊息中文字是否為連結。若是連結，則可以透過該連結開啟新視窗。
  **自動滾動** ：當出現新訊息時，聊天紀錄需自動滾動至最下方。
* 若使用者 A 跟 B 有一個聊天室，而使用者 A 刪除與 B 的聊天室時，使用者 B 需要重新整理瀏覽器（建議是先到 /chatrooms 的 path 後再重新整理）才能發現聊天室被刪除。（spec 沒有寫刪除跟新增聊天室要推播所以不要因此扣我分QQ，這作業真的好難）
