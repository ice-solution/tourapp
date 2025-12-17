# 環境變數設置說明

## 環境變數文件

前端支持多個環境變數文件：

- `.env` - 開發環境（默認）
- `.env.prod` - 生產環境
- `.env.uat` - UAT 環境
- `.env.production` - 生產構建環境（用於 `npm run build:production`）

## 設置步驟

### 1. 開發環境

```bash
# 複製範例文件
cp .env.example .env

# 編輯 .env 文件，設置你的開發環境變數
# VITE_API_BASE_URL=http://localhost:5111/api
# VITE_CLIENT_URL=http://localhost:5173
```

### 2. 生產環境

```bash
# 複製範例文件
cp .env.production.example .env.production

# 編輯 .env.production 文件，設置你的生產環境變數
# VITE_API_BASE_URL=https://api.yourdomain.com/api
# VITE_CLIENT_URL=https://yourdomain.com
```

### 3. UAT 環境

```bash
# 複製範例文件
cp .env.uat.example .env.uat

# 編輯 .env.uat 文件，設置你的 UAT 環境變數
# VITE_API_BASE_URL=https://api-uat.yourdomain.com/api
# VITE_CLIENT_URL=https://uat.yourdomain.com
```

## 構建命令

- `npm run dev` - 使用 `.env` 文件
- `npm run build:production` - 使用 `.env.production` 文件
- `npm run build:uat` - 使用 `.env.uat` 文件
- `npm run build:prod` - 使用 `.env.prod` 文件

## 環境變數說明

### VITE_API_BASE_URL
後端 API 的基礎 URL。例如：
- 開發環境：`http://localhost:5111/api`
- 生產環境：`https://api.yourdomain.com/api`

### VITE_CLIENT_URL
前端應用的 URL。例如：
- 開發環境：`http://localhost:5173`
- 生產環境：`https://yourdomain.com`

## 注意事項

1. 所有環境變數必須以 `VITE_` 前綴開頭，才能在客戶端代碼中使用
2. 修改環境變數後，需要重啟開發服務器
3. 構建時，環境變數會被內嵌到構建產物中
4. 不要在環境變數文件中提交敏感信息（如 API keys、密碼等）

