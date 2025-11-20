# VS Code Marketplace 发布配置指南

本项目已配置自动发布到 VS Code Marketplace 的 GitHub Actions workflow。

## 前置条件

在使用自动发布功能之前，需要完成以下配置：

### 1. 创建 VS Code Marketplace Personal Access Token (PAT)

1. 访问 [Azure DevOps](https://dev.azure.com/)
2. 登录你的账号（与 VS Code Marketplace 发布者账号相同）
3. 点击右上角的用户设置图标，选择 "Personal access tokens"
4. 点击 "New Token"
5. 配置 Token：
   - **Name**: `VSCE_PUBLISH_TOKEN`（或其他你喜欢的名字）
   - **Organization**: 选择 "All accessible organizations"
   - **Expiration**: 设置过期时间（建议至少 90 天）
   - **Scopes**: 选择 "Custom defined"，然后勾选 **Marketplace > Manage**
6. 点击 "Create" 并**立即复制生成的 token**（只会显示一次）

### 2. 配置 GitHub Secret

1. 进入你的 GitHub 仓库
2. 点击 "Settings" > "Secrets and variables" > "Actions"
3. 点击 "New repository secret"
4. 配置 Secret：
   - **Name**: `VSCE_PAT`
   - **Value**: 粘贴上一步复制的 Personal Access Token
5. 点击 "Add secret"

## 使用方法

### 自动发布

当你将代码推送或合并到 `release` 分支时，workflow 会自动执行以下操作：

1. 检出代码
2. 安装依赖
3. 构建项目
4. 打包扩展为 `.vsix` 文件
5. 发布到 VS Code Marketplace
6. 上传 `.vsix` 文件作为 GitHub Artifacts

### 触发方式

- **直接推送**: `git push origin release`
- **Pull Request 合并**: 将 PR 合并到 `release` 分支

### 版本管理

发布前请确保：

1. 在 `package.json` 中更新了版本号
2. 版本号遵循语义化版本规范 (Semantic Versioning)
3. 更新了 CHANGELOG 或 README 中的版本说明

### 手动发布

如果需要手动发布，可以在本地执行：

```bash
# 安装 vsce
yarn global add @vscode/vsce

# 登录 (首次使用)
vsce login yanggggjie

# 打包
vsce package

# 发布
vsce publish
```

## 注意事项

- PAT token 需要定期更新（根据你设置的过期时间）
- 确保 `package.json` 中的 `publisher` 字段与你的 Marketplace 发布者 ID 一致
- 每次发布的版本号必须大于当前已发布的版本
- 发布后，扩展可能需要几分钟到几小时才能在 Marketplace 上显示

## 常见问题

### 发布失败：Authentication failed

- 检查 GitHub Secret 中的 `VSCE_PAT` 是否正确配置
- 确认 PAT token 是否过期
- 验证 token 是否有 "Marketplace > Manage" 权限

### 发布失败：Version already exists

- 在 `package.json` 中增加版本号
- 确保新版本号大于 Marketplace 上的当前版本

### 构建失败

- 检查 workflow 日志中的详细错误信息
- 确保本地 `yarn build` 命令可以成功执行
- 检查所有依赖是否正确安装

## 相关链接

- [VS Code 扩展发布文档](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce CLI 文档](https://github.com/microsoft/vscode-vsce)
- [Azure DevOps PAT 管理](https://dev.azure.com/)

