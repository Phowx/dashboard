# Private Server Dashboard

一个用于查看私人服务器状态的轻量面板，包含系统监控、Docker 容器管理和自定义快捷方式。

## 功能

- 查看 CPU、内存、磁盘和网络状态
- 实时监控 CPU 与内存变化
- 查看高占用进程
- 管理 Docker 容器的启动、停止、重启和删除
- 维护本地快捷方式入口

## 项目结构

```text
frontend/  React + Vite 面板界面
backend/   Express + WebSocket + systeminformation + dockerode
```

## 本地开发

### 1. 安装依赖

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. 准备快捷方式数据

后端会优先读取 `backend/data/shortcuts.json`。

如果这个文件不存在，服务启动时会自动根据 `backend/data/shortcuts.example.json` 创建一个本地文件。

这个本地文件已加入 `.gitignore`，适合存放你自己的内网服务地址，不会进入 Git 仓库。

### 3. 启动

后端默认运行在 `8888` 端口，前端开发服务器默认运行在 `5173` 端口。

```bash
cd backend && node server.js
cd ../frontend && npm run dev
```

## 生产部署

生产环境使用后端直接托管 `frontend/dist`，所以部署时需要先构建前端，然后只启动后端服务。

### 1. 安装依赖并构建

```bash
npm run install:all
npm run build
```

### 2. 使用 systemd 托管

仓库里提供了示例服务文件 [deploy/systemd/dashboard.service](deploy/systemd/dashboard.service) 和启动脚本 [scripts/run-dashboard.sh](scripts/run-dashboard.sh)。

建议部署目录示例：`/opt/dashboard`

1. 把仓库放到服务器目录，例如 `/opt/dashboard`
2. 根据实际情况修改 `deploy/systemd/dashboard.service` 里的：
   - `User`
   - `Group`
   - `WorkingDirectory`
   - `ExecStart`
3. 复制服务文件到 systemd：

```bash
sudo cp deploy/systemd/dashboard.service /etc/systemd/system/dashboard.service
sudo systemctl daemon-reload
sudo systemctl enable --now dashboard
```

### 3. 常用命令

```bash
sudo systemctl status dashboard
sudo systemctl restart dashboard
sudo journalctl -u dashboard -f
```

### 4. 注意事项

- `scripts/run-dashboard.sh` 会检查 `frontend/dist` 是否存在，如果没有先构建会直接退出。
- 如果你用 Docker 套接字读取容器状态，运行该服务的用户需要有 Docker 权限。
- 如果服务器上的 `node` 不在 systemd 的默认 PATH 里，把 `ExecStart` 改成你的 Node 绝对路径，或者直接在脚本里写死。
