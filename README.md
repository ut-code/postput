# PostPut

送信したメッセージを後からチャンネル(タグ)に割り振ることができるチャットツールです。
Slackの代替として使えるようにすることを目指しています。<!-- ほんまか...? -->

![screenshot](image/image.png)

## Features

* slackのチャンネル機能の代わりとして、タグでメッセージを振り分けることができます
* 1つのメッセージに複数のタグをつける(=複数のチャンネルに送信する)ことができます
* すでに送ったメッセージのタグをつけ直すことができます (間違ったチャンネルに話題を送ってしまっても訂正できる)
* タグを検索し、選んだタグのついたメッセージのみ表示できます
* ユーザーごとに頻繁に見るタグをサイドバーに登録しておくことができます(=チャンネルにスターをつける機能)
* ユーザーごとに後で確認したいメッセージを保存しておくことができます(=ブックマーク機能)


## Try

* https://postput-test-server.onrender.com/ にデプロイしてあります
* 一度も使われていないユーザー名であれば任意のパスワードでログイン(サインアップ)できます

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

`.env`というファイルを作成し、以下の内容にしてください
```
DATABASE_URL="postgres://..."
```
実際のurlはここには書かないのでslackを見て

その後
```bash
npm run update-db
npm run server
```
で起動します

## WebSocket
App.jsxを編集するとき以下を参考にしてください

フロントエンド側はsocket.jsxに実装されている。App.jsxからは
```js
const socket = useSocket();
```
で使える(すでに書いてあるのでok)

(サーバー側はsocket.jsに実装されており、データベースとのやり取りはdatabase.js)

* (ログイン)
	* login.jsx に実装
	* http: http://localhost:3000/login/password にjsonで
	```json
	{"username": "a", "password": "a"}
	```
	をPOST -> `{"status": "success", "sid": sid}`を取得
* (WebSocketに接続する)
	* App.jsx: `socket.setSid(sid);` & `socket.connect();`
	* WebSocket: `ws://localhost:3000/?sid=${sid}`に接続
* 自分のユーザー名, ユーザーid
	* App.jsx: `socket.username` -> `"a"`, `socket.userId` -> 0
	* WebSocket: `{type: "user", userId: 0, username: "a"}`
	* database.js: `getUser("a");`, `getUserById(0);`
* メッセージの送信
	* App.jsx: `socket.send({text: "a", tags["a", "b"]});`
	* WebSocket: `{type: "createMessage", text: "a", tags:["a", "b"]}`
	* database.js: `createMessage({userId: 0, text: "a", tags: ["a", "b"]}, onError);`
* メッセージの取得
	* 現在見ているタグをsubscribeするとそのタグのメッセージが得られる、という形になっている
	* 1. subscribe
		* App.jsx: `socket.subscribe(["a", "b", ...]);`
			* useEffectで`currentTags`が更新されたとき自動で`subscribe`するようにしてあるのであまり気にする必要はない
		* WebSocket: `{type: "subscribe", tags: ["a", "b", ...]}`
	* 2. メッセージ取得
		* App.jsx: `socket.messages` -> subscribeしたタグに該当するメッセージのみが以下の形で得られる
		```json
		[
			{
				"id": 0,
				"user": {"username": "a"},
				"text": "a",
				"sendTime": "date",
				"updateTime": "date",
				"tags": ["a", "b"],
				"replyNum": 5,
			},
		]
		```
		* WebSocket:
			* 初回 `{type: "messageAll", messages: [...]}`
			* 新規メッセージ追加時 `{type:"messageAdd", message: {...}}`
		* database.js: 
			* 初回 `getMessageAll(onError);`
			* 新規メッセージ追加時 `createMessage`の戻り値
* メッセージにタグを追加・削除
	* App.jsx: `socket.updateMessage(メッセージid, ["a", ...]);`
	* WebSocket: `{type: "updateMessage", mid: メッセージid, tags: ["a", ...]}`
	* database.js: `updateMessage(mid, tags, onError);`
* 全タグの一覧
	* 消しました
* 全タグを最近更新された順に一覧
	* App.jsx: `socket.recentTags` -> `[{id: 0, name: "a", createTime: "date", updateTime: "date"}, ...]`
	* WebSocket: `{type: "tagRecentUpdate", tags: [...]}`
	* database.js: `getTagRecentUpdate(onError);`
* ユーザーの固定タグ
	* App.jsx: `socket.favoriteTags` -> `[{name: "a"}, ...]`
	* WebSocket: `{type: "tagFavorite", favoriteTags: [...]}`
	* database.js: userと同じ
* 固定タグを設定
	* App.jsx: `socket.setFavoriteTags(["a", "b", ...])` または `socket.setFavoriteTags([{name: "a"}, {name: "b"}, ...])`
		* なんでfavoriteTagsの取得と仕様違うんだ
		* ちなみにsocket.jsx内では名前被りを解決するためfavoriteTagsのセッター関数が`setFavoriteTagsLocal`になっているのもややこしい
	* WebSocket: `{type: "setFavoriteTags", favoriteTags: [...]}`
		* なんでこっちはsetTagFavoriteじゃないんだ
	* database.js: `updateFavoriteTags(userId, favoriteTags);`
		* なんでこれだけsetじゃなくてupdateなんだ
* 保留メッセージの数(`#.keep-${userId}`のメッセージ数)
	* App.jsx: `socket.keepNum` -> 0
	* WebSocket: `{type: "keepNum", keepNum: 0}`
	* database.js: getMessageAllからfilterする
* 保留メッセージの設定
	* updateMessageでやる

## タグ
* 各メッセージに1つまたは複数のタグがつく
* タグは #aaa のような形式
* `#`を除いた部分がタグ名
* `.`で始まるタグ名(`#.`ではじまるタグ)は使用できない&非表示
	* `#.keep-${userId}`: そのユーザーの保留メッセージ
		* 他のユーザーは見れない
	* `#.reply-${messageId}`: そのメッセージへの返信スレッド
