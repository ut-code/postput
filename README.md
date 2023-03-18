# ut-communication(仮)

## 環境構築

まずは Git で管理するためのディレクトリを作成し、VSCode で開きます。ターミナルを開き、次のコマンドを実行しましょう。

```bash
git init
git remote add origin git@github.com:ut-code/ut-communication.git
git switch -c main
git pull origin main
npm install
```

作業するときは作業用のブランチを作りましょう
```bash
git switch -c ブランチ名
```

作業をしたら、
```bash
git add -A
git commit -m コミットメッセージ
git push origin ブランチ名
```
(VSCodeなどでやってもよい)でpushをし、GitHubでPull Requestを作成しましょう

## フロントエンド

```bash
npm run dev
```
をして、表示されるurl(http://localhost:5173/ など)をブラウザで開く

src/ 以下のファイルを編集しましょう

## バックエンド

```bash
npm run server_dev
```
で起動します

## ビルド

デプロイするときは
```bash
npm run build
```
でフロントエンドをビルドし、dist/ 以下に出力

## WebSocket
### フロントエンド側から
socket.jsxに実装されている。App.jsxからは
```js
const socket = useSocket();
```
で使える

サーバー側はsocket.jsに実装されており、データベースとのやり取りはdatabase.js

* ログイン
	* login.jsx に実装
	* http: http://localhost:3000/login/password にjsonで
	```json
	{"username": "a", "password": "a"}
	```
	をPOST -> `{"status": "success", "sid": sid}`を取得
* WebSocketに接続する
	* App.jsx: `socket.setSid(sid);` & `socket.connect();`
	* WebSocket: `ws://localhost:3000/?sid=${sid}`に接続
* 自分のユーザー名
	* App.jsx: `socket.username` -> `"a"`
	* WebSocket: `{type: "user", userId: 0, username: "a", favoriteTags: [{name: "a"}, ...]}`
	* database.js: `getUser("a");`, `getUserById(0);`
* メッセージの送信
	* App.jsx: `socket.send({text: "a", tags["a", "b"]});`
	* WebSocket: `{type: "createMessage", text: "a", tags:["a", "b"]}`
	* database.js: `createMessage({userId: 0, text: "a", tags: ["a", "b"]}, onError);`
* 全メッセージの一覧
	* App.jsx: `socket.messages` ->
	```json
	[
		{
			"id": 0,
			"user": {"username": "a"},
			"text": "a",
			"sendTime": "date",
			"updateTime": "date",
			"tags": ["a", "b"],
		},
	]
	```
	* WebSocket: `{type: "messageAll", messages: [...]}`
	* database.js: `getMessageAll(onError);`
* 全タグの一覧
	* App.jsx: `socket.tags` -> `[{id: 0, name: "a", createTime: "date", updateTime: "date"}, ...]`
	* WebSocket: `{type: "tagAll", tags: [...]}`
	* database.js: `getTagAll(onError);`
* 最近更新されたタグの一覧
	* App.jsx: `socket.recentTags` -> `[{id: 0, name: "a", createTime: "date", updateTime: "date"}, ...]`
	* WebSocket: `{type: "tagRecentUpdate", tags: [...]}`
	* database.js: `getTagRecentUpdate(onError);`
* ユーザーの固定タグ
	* App.jsx: `socket.favoriteTags` -> `[{name: "a"}, ...]`
	* WebSocket: usernameと同じ
	* database.js: userと同じ
