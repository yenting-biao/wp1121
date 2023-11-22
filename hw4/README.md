# Run the project

1. Install dependencies

   ```bash
   yarn
   ```
2. Get Pusher credentials
   Please refer to the Pusher Setup section in TA's code README.
3. Get Github OAuth credentials
   Please refer to the NextAuth Section section in TA's code README.
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
   **Note that my database name is `messenger-clone`!**

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
   Note that when you enter this page first time, it is likely that you have to refresh once to sign in or sign up if your action is too fast. (他 compile page 就很慢QQ)

# ESLint

Run the following commands in the hw4 directory.

```bash
yarn lint
```

# Note

* The two perfect requests I implemented are:
  **傳送連結** ：自動辨識訊息中文字是否為連結。若是連結，則可以透過該連結開啟新視窗。
  **自動滾動** ：當出現新訊息時，聊天紀錄需自動滾動至最下方。
* Please make sure your Internet is ok. Pusher may have some problems if your Internet is not stable. (點一個按鈕或送出訊息後可能要等比較久，這點請見諒qq)
* To delete a chatroom, click the more info icon on the chatroom page and it will show a dialog.
* Although the spec says "進入本頁時，預設開啟最新的聊天室以及聊天紀錄," I think that it is better to leave the user to click the chatroom they want to enter (When I open Messenger in my iPad, it does not show the newest chatroom but an empty page instead. Moreover, if a user has no chatrooms, it must be directed to /chatrooms) so I did not implement like this for better user experience.
* I use username and password together to ensure security.
