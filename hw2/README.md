# HW2 WP Music

## Run the app

Follow the instructions in this section to run the app locally. The set up is the same to the reference code, `trello-clone`.

### 1. setup backend `.env`

Start by copying the `.env.example` file to `.env`.

```bash
cd backend
cp .env.example .env
```

Then, fill in the `MONGO_URL` field in `.env` with your MongoDB connection string and fill in the `PORT` field with the port you want to use. After that, you're `.env` file should look like this. If you don't want to use MongoDB Atlas, you can also run a local MongoDB server with Docker. You can find the instructions [here](https://hub.docker.com/_/mongo).

```bash
PORT=8000
MONGO_URL="mongodb+srv://<username>:<password>@<cluster>.example.mongodb.net/?retryWrites=true&w=majority"
```

### 2. setup frontend `.env`

Start by copying the `.env.example` file to `.env`.

```bash
cd frontend
cp .env.example .env
```

Then, fill in the `VITE_API_URL` field in `.env` with the url of your backend server. After that, you're `.env` file should look like this. Note that the port should be the same as the one you set in the backend `.env` file.

```bash
VITE_API_URL="http://localhost:8000/api"
```

### 3. start the backend server

```bash
cd backend
yarn dev
```

### 4. start the frontend server

```bash
cd frontend
yarn dev
```

Visit `http://localhost:5173` to see the app in action. That's it, you're done!

## eslint and prettier

Please run the following commands.

```bash
cd frontend && yarn lint
cd ..
cd backend && yarn lint
```

## The two items perfect requests I do

1. **使用者提示**：當使用者未輸入資訊或是進行錯誤操作時，給予適當提示。例如使用者新增或編輯清單時，未輸入標題，以彈窗提示「請輸入標題」。
2. **搜尋**：在首頁實作搜尋功能，透過輸入關鍵字尋找相對應之清單。

## Explanation about the app

##### Home page

* Click the ADD button to create a new playlist.
* Click the DELETE button, and click the trash can on the top-right corner of the playlist, to delete the playlist. When you finish deleting, click the DONE button.
* Type something in the search bar and press enter to filter the search the playlist. After that, if you want to show all the playlist, please clear the input in the search bar and press enter again.

##### Playlist page

* Click the playlist title to edit it. Click the playlist description to edit it.
* Click ADD button to create a new song; you can also choose the playlist you want to add it in.
* Select the checkbox of the songs you want to delete and click the DELETE button.
* Click the link, which is blue and underlined, to open the link in the new tab.
* Click *"**the name of the song or the singer"* to edit this song. You can also not modify the song name, the singer, and the link, but just change the playlist, to add it into another playlist (but it will still remain at this playlist).

---

---
