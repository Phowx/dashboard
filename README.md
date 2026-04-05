# Private Server Dashboard

一个用于查看私人服务器状态的轻量面板，包含系统监控、Docker 容器管理和自定义快捷方式。

## 功能

- 查看 CPU、内存、磁盘和网络状态
- 实时监控 CPU 与内存变化
- 可选采集高占用进程
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

### 2. 使用脚本安装 systemd 服务

仓库里提供了启动脚本 [scripts/run-dashboard.sh](scripts/run-dashboard.sh) 和一键安装脚本 [scripts/setup-systemd.sh](scripts/setup-systemd.sh)。

最简单的方式：

```bash
./scripts/setup-systemd.sh --install-dir /opt/dashboard --service-user root --service-group root
```

这个脚本会自动：

- 检查当前系统是不是 Linux + systemd
- 检查 `node`、`npm`、`systemctl`
- 输出 Node、npm、systemd、部署目录等环境信息
- 检查 Docker socket 是否存在，以及服务用户是否大概率有 Docker 权限
- 安装依赖
- 构建前端
- 生成 `/etc/systemd/system/dashboard.service`
- 自动执行 `daemon-reload`、`enable` 和 `start`

常用参数：

```bash
./scripts/setup-systemd.sh --service-name dashboard
./scripts/setup-systemd.sh --install-dir /opt/dashboard --service-user mars
./scripts/setup-systemd.sh --skip-install --skip-build
./scripts/setup-systemd.sh --write-only
```

如果你更喜欢手动方式，也可以参考示例 unit 文件 [deploy/systemd/dashboard.service](deploy/systemd/dashboard.service)。

### 3. 常用命令

```bash
sudo systemctl status dashboard
sudo systemctl restart dashboard
sudo journalctl -u dashboard -f
```

### 4. 注意事项

- `scripts/run-dashboard.sh` 会检查 `frontend/dist` 是否存在，如果没有先构建会直接退出。
- `scripts/setup-systemd.sh` 默认会调用 `npm run install:all` 和 `npm run build`。
- 如果你用 Docker 套接字读取容器状态，运行该服务的用户需要有 Docker 权限。
- 安装脚本会把当前 `node` 的绝对路径写进 systemd 环境里，尽量避免 PATH 问题。
- 如果你不需要后端采集 Top 进程，可以在服务环境里设置 `ENABLE_PROCESS_TOP=false`，这样会跳过 `systeminformation.processes()` 这部分采集逻辑。
