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

