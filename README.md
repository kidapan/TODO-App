# TODO-App

TypeScript + Express + MySQL で構築されたTODO管理APIです。Docker環境で動作し、AWS ECSへの自動デプロイに対応しています。

## 🚀 機能

- ✅ TODO の作成、取得、更新、削除（CRUD操作）
- 🔍 TODO のキーワード検索（タイトル・内容）
- 📝 TODO ステータス管理（TODO/DONE）
- 🐳 Docker & Docker Compose 対応
- ☁️ AWS ECS への自動デプロイ

## 🛠 技術スタック

- **言語**: TypeScript
- **フレームワーク**: Express.js
- **データベース**: MySQL 8.4
- **インフラ**
  - Docker & Docker Compose
  - AWS ECS/ECR
- **CI/CD**: GitHub Actions
- **API ドキュメント**: OpenAPI 3.0.3 + Swagger UI

## 📁 プロジェクト構成

```
TODO-App/
├── src/
│   └── index.ts              # メインアプリケーション
├── .github/
│   └── workflows/
│       └── aws.yml           # AWS ECS デプロイワークフロー
├── api-spec.yaml             # OpenAPI仕様書
├── index.html               # Swagger UI
├── package.json             # 依存関係
├── tsconfig.json            # TypeScript設定
├── Dockerfile               # 本番用Dockerfile
├── Dockerfile.dev           # 開発用Dockerfile
├── compose.yml              # Docker Compose設定
├── nodemon.json             # nodemon設定
└── README.md               # このファイル
```

## 🚀 クイックスタート

### 前提条件

- Docker & Docker Compose
- Node.js 22+ （ローカル開発の場合）

### Docker Compose での起動

```bash
# リポジトリをクローン
git clone <repository-url>
cd TODO-App

# Docker Compose で起動
docker-compose up

# バックグラウンドで起動する場合
docker-compose up -d
```

サービスが起動すると
- API: http://localhost:3000
- MySQL: localhost:3306
- Swagger UI: http://localhost:3000/ （index.htmlを開く）

### 初回セットアップ（データベーステーブル作成）

初回起動時は、MySQLにテーブルを作成する必要があります

```bash
# Docker Composeでサービスを起動
docker-compose up -d

# MySQLコンテナでテーブルを作成
docker-compose exec db mysql -u root -ppassword todo_db -e "
CREATE TABLE IF NOT EXISTS todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  status ENUM('TODO', 'DONE') DEFAULT 'TODO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);"

# テーブルが作成されたか確認
docker-compose exec db mysql -u root -ppassword todo_db -e "SHOW TABLES;"
```

または、MySQLコンテナに直接接続してテーブルを作成

```bash
# MySQLコンテナに接続
docker-compose exec db mysql -u root -ppassword todo_db

# SQLコマンドを実行
CREATE TABLE IF NOT EXISTS todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  status ENUM('TODO', 'DONE') DEFAULT 'TODO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

# 接続を終了
exit
```

## 📖 API仕様

### エンドポイント

| メソッド | URL | 説明 |
|---------|-----|------|
| GET | `/` | ヘルスチェック |
| GET | `/post` | 全てのTODOを取得 |
| GET | `/post/search` | TODOを検索（タイトルまたは内容） |
| POST | `/post` | 新しいTODOを作成 |
| PUT | `/post/:id` | TODOのステータスを更新 |
| DELETE | `/post/:id` | TODOを削除 |

### データモデル

#### TODO

```json
{
  "id": 1,
  "title": "サンプルタスク",
  "content": "タスクの詳細内容",
  "status": "TODO",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### ステータス

- `TODO`: 未完了
- `DONE`: 完了

### 使用例

#### TODO作成

```bash
curl -X POST http://localhost:3000/post \
  -H "Content-Type: application/json" \
  -d '{
    "title": "買い物",
    "content": "牛乳とパンを買う"
  }'
```

#### TODO一覧取得

```bash
curl http://localhost:3000/post
```

#### TODO検索

```bash
# キーワードで検索
curl "http://localhost:3000/post/search?word=買い物"

# 検索条件なし（全件取得）
curl http://localhost:3000/post/search
```

#### TODOステータス更新

```bash
curl -X PUT http://localhost:3000/post/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "DONE"}'
```

#### TODO削除

```bash
curl -X DELETE http://localhost:3000/post/1
```

## 🗄 データベース設定

### 環境変数

以下の環境変数を設定してください

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=todo_db
```

### テーブル構成

```sql
CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  status ENUM('TODO', 'DONE') DEFAULT 'TODO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## ☁️ AWS デプロイ

GitHub Actions を使用して AWS ECS への自動デプロイに対応しています。

### 前提条件

1. AWS ECS クラスター設定
2. ECR リポジトリ作成
3. ECS タスク定義とサービス設定

### GitHub Secrets 設定

以下のシークレットを GitHub リポジトリに設定してください：

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### デプロイフロー

1. `main` ブランチへのプッシュ
2. Docker イメージビルド
3. ECR へプッシュ
4. ECS タスク定義更新
5. ECS サービス更新

## 🔍 API ドキュメント

Swagger UI で API仕様を確認できます

1. アプリケーションを起動
2. ブラウザで `index.html` を開く
3. OpenAPI仕様（`api-spec.yaml`）が自動で読み込まれます
