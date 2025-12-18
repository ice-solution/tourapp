# Apache2 VirtualHost 設置說明

## 適用於 Cloudflare Flexible SSL

### 1. 安裝必要的 Apache 模組

```bash
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod remoteip
sudo a2enmod deflate
sudo a2enmod expires
sudo systemctl restart apache2
```

### 2. 配置 Cloudflare IP 範圍（用於 mod_remoteip）

編輯 `/etc/apache2/apache2.conf`，在文件末尾添加：

```apache
# Cloudflare IP 範圍
RemoteIPHeader CF-Connecting-IP
RemoteIPTrustedProxy 173.245.48.0/20
RemoteIPTrustedProxy 103.21.244.0/22
RemoteIPTrustedProxy 103.22.200.0/22
RemoteIPTrustedProxy 103.31.4.0/22
RemoteIPTrustedProxy 141.101.64.0/18
RemoteIPTrustedProxy 108.162.192.0/18
RemoteIPTrustedProxy 190.93.240.0/20
RemoteIPTrustedProxy 188.114.96.0/20
RemoteIPTrustedProxy 197.234.240.0/22
RemoteIPTrustedProxy 198.41.128.0/17
RemoteIPTrustedProxy 162.158.0.0/15
RemoteIPTrustedProxy 104.16.0.0/13
RemoteIPTrustedProxy 104.24.0.0/14
RemoteIPTrustedProxy 172.64.0.0/13
RemoteIPTrustedProxy 131.0.72.0/22
RemoteIPTrustedProxy 2400:cb00::/32
RemoteIPTrustedProxy 2606:4700::/32
RemoteIPTrustedProxy 2803:f800::/32
RemoteIPTrustedProxy 2405:b500::/32
RemoteIPTrustedProxy 2405:8100::/32
RemoteIPTrustedProxy 2a06:98c0::/29
RemoteIPTrustedProxy 2c0f:f248::/32
```

### 3. 複製配置文件

```bash
# 複製配置文件到 Apache sites-available
sudo cp apache-tourapp.conf /etc/apache2/sites-available/tourapp.conf

# 編輯配置文件，替換域名和路徑
sudo nano /etc/apache2/sites-available/tourapp.conf
```

### 4. 修改配置文件中的路徑和域名

在 `tourapp.conf` 中修改以下內容：

- `ServerName`: 您的域名
- `ServerAlias`: www 子域名
- `ServerAdmin`: 管理員郵箱
- `DocumentRoot`: 前端構建目錄的實際路徑（例如：`/var/www/tourapp/frontend/dist`）
- `Directory`: 與 DocumentRoot 相同的路徑
- `ProxyPass`: 後端服務地址（默認 `http://127.0.0.1:5111`）

### 5. 設置文件權限

```bash
# 設置前端構建目錄權限
sudo chown -R www-data:www-data /var/www/tourapp/frontend/dist
sudo chmod -R 755 /var/www/tourapp/frontend/dist
```

### 6. 啟用站點

```bash
# 啟用站點
sudo a2ensite tourapp.conf
f
# 禁用默認站點（可選）
sudo a2dissite 000-default.conf

# 測試配置
sudo apache2ctl configtest

# 重啟 Apache
sudo systemctl restart apache2
```

### 7. 確保後端服務運行

```bash
# 使用 PM2 或其他進程管理器運行後端
cd /var/www/tourapp/backend
pm2 start src/server.js --name tourapp-backend
pm2 save
```

### 8. Cloudflare 設置

在 Cloudflare 控制台中：

1. **SSL/TLS 設置**：
   - 選擇 "Flexible" 模式
   - 這意味著 Cloudflare 到用戶是 HTTPS，Cloudflare 到服務器是 HTTP

2. **DNS 設置**：
   - 確保 A 記錄指向您的服務器 IP
   - 確保 CNAME 記錄（www）也正確設置

3. **頁面規則**（可選）：
   - 可以設置緩存規則來優化性能

### 9. 測試

```bash
# 檢查 Apache 狀態
sudo systemctl status apache2

# 檢查後端服務
pm2 status

# 測試前端
curl http://yourdomain.com

# 測試 API
curl http://yourdomain.com/api/health
```

### 10. 故障排除

如果遇到問題：

1. **檢查 Apache 錯誤日誌**：
   ```bash
   sudo tail -f /var/log/apache2/tourapp-error.log
   ```

2. **檢查訪問日誌**：
   ```bash
   sudo tail -f /var/log/apache2/tourapp-access.log
   ```

3. **檢查後端日誌**：
   ```bash
   pm2 logs tourapp-backend
   ```

4. **檢查端口是否被占用**：
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :5111
   ```

### 注意事項

- Cloudflare Flexible SSL 模式下，服務器只監聽 HTTP（80端口）
- 確保防火牆允許 80 端口（HTTP）和 443 端口（如果將來升級到 Full SSL）
- 定期更新 Cloudflare IP 範圍列表
- 建議使用 PM2 或 systemd 來管理後端服務，確保服務自動重啟


