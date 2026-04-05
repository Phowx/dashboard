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
