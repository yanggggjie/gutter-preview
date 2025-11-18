# Data URI 支持修复总结

## 🐛 问题描述

### 问题 1: 无引号 data URI 无法识别
```css
/* ❌ 无法识别 */
mask-image: url(data:image/svg+xml,%3Csvg...);
```

### 问题 2: 双重编码导致数据损坏
已经 URL 编码的 data URI 被重复编码：
- `%3C` → `%253C` ❌

### 问题 3: Hover 预览不显示
- ✅ Gutter 图标正常显示
- ❌ Hover 悬停预览不显示

## ✅ 修复方案

### 1. 识别器增强 (`src/recognizers/dataurlrecognizer.ts`)

#### 修复前
```typescript
// 只支持带引号的格式
/url\('(data:image.*)'\)/
/url\("(data:image.*)"\)/
```

#### 修复后
```typescript
// 新增无引号格式支持
/url\((data:image[^)]*)\)/

// 支持的格式：
url('data:image...')  ✅
url("data:image...")  ✅
url(data:image...)    ✅ 新增
```

### 2. 编码函数修复 (`src/recognizers/dataurlrecognizer.ts`)

#### 修复前
```typescript
// ❌ 错误的条件判断
if (content.indexOf(' ') > 0 || content.indexOf('"') || content.indexOf("'") > 0) {
    // indexOf('"') 返回 -1（truthy），导致总是编码
    return encodeURIComponent(...);
}
```

#### 修复后
```typescript
// ✅ 智能检测
const hasUnescapedSpace = content.indexOf(' ') > -1;
const hasUnescapedQuote = content.indexOf('"') > -1 || content.indexOf("'") > -1;
const isAlreadyEncoded = /%[0-9A-Fa-f]{2}/.test(content);

// 只在需要时编码
if ((hasUnescapedSpace || hasUnescapedQuote) && !isAlreadyEncoded) {
    return encodeURIComponent(...);
}
return content; // 已编码的直接返回
```

### 3. Hover 渲染修复 (`src/decorator.ts`)

#### 问题根源
VS Code 的 Markdown 渲染器对复杂的 SVG data URI 支持有限。

#### 修复前
```typescript
// 使用 Markdown 语法
result += `![${imagePath}](${imagePath}${maxSizeConfig})`;
```

#### 修复后
```typescript
// 对 data URI 使用 HTML 标签
if (imagePath.startsWith('data:image')) {
    const escapedPath = imagePath.replace(/'/g, '%27');
    let sizeAttr = maxWidth > 0 
        ? `width="${maxWidth}"` 
        : `height="${maxHeight || 100}"`;
    imageHtml = `<img src="${escapedPath}" ${sizeAttr} />`;
} else {
    // 普通文件仍用 Markdown
    imageHtml = `![${imagePath}](${imagePath}${maxSizeConfig})`;
}

const contents = new vscode.MarkdownString(result);
contents.isTrusted = true;
contents.supportHtml = true; // ✅ 启用 HTML 支持
```

## 🎯 修复效果

### 支持的所有格式

```css
/* 1. 带双引号 + 已编码 */
url("data:image/svg+xml,%3Csvg%20...%3E")  ✅

/* 2. 带单引号 + 已编码 */
url('data:image/svg+xml,%3Csvg%20...%3E')  ✅

/* 3. 无引号 + 已编码 */
url(data:image/svg+xml,%3Csvg%20...%3E)    ✅

/* 4. 带引号 + 未编码（自动编码） */
url("data:image/svg+xml,<svg ...</svg>")   ✅

/* 5. 带 charset 参数 */
url("data:image/svg+xml;charset=utf-8,%3Csvg...") ✅
```

### 预览效果

- ✅ **Gutter Preview**: 在行号旁显示小图标
- ✅ **Hover Preview**: 鼠标悬停显示大图（使用 HTML 标签渲染）

## 📝 测试方法

### 1. 启动调试
按 `F5` 在 VS Code 中启动扩展调试

### 2. 打开测试文件
```
testfiles/test-datauri.css
```

### 3. 验证功能
- 查看每个 CSS 规则左侧的 gutter 图标
- 鼠标悬停在 `url()` 上查看大图预览

## 🔧 修改的文件

```
src/recognizers/dataurlrecognizer.ts  ✏️  无引号识别 + 编码修复
src/decorator.ts                      ✏️  HTML 渲染支持
src/util/fileutil.ts                  ✏️  类型错误修复
testfiles/test-datauri.css            ➕  测试用例
```

## 🚀 技术要点

### 1. 正则表达式优化
- 使用 `[^)]*` 匹配括号内的任意内容（除了右括号）
- 避免贪婪匹配导致的问题

### 2. 编码检测
- 使用正则 `/%[0-9A-Fa-f]{2}/` 检测是否已 URL 编码
- 避免双重编码破坏数据

### 3. Markdown vs HTML
- **Markdown 语法**: 简单、清晰，但对复杂 data URI 支持有限
- **HTML 标签**: 兼容性更好，需要设置 `supportHtml = true`

### 4. 安全性
- 设置 `contents.isTrusted = true` 允许渲染 data URI
- data URI 本身是安全的（不涉及外部请求）

## 📚 相关文档

- [VS Code MarkdownString API](https://code.visualstudio.com/api/references/vscode-api#MarkdownString)
- [Data URI Scheme](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)
- [CSS url() function](https://developer.mozilla.org/en-US/docs/Web/CSS/url)

## 💡 未来优化建议

1. **性能优化**: 对超大 data URI 进行缓存
2. **错误提示**: 对无效的 data URI 显示友好的错误信息
3. **格式化**: 提供 data URI 格式化/美化功能
4. **预览增强**: 支持更多图片操作（复制、另存为等）

