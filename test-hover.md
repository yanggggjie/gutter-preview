# Data URI Hover 测试

## 修复前的问题

你的 CSS 代码：
```css
mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E...");
```

问题：单引号 `'` 在 Markdown 的 `(url)` 中会导致解析失败。

## 修复逻辑

**修改前 (decorator.ts 第 167 行)：**
```typescript
result += `![${imagePath}](${imagePath}${maxSizeConfig})`;
```

生成的 Markdown：
```markdown
![data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://...](data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://...)
                                                   ↑ 这个单引号导致解析失败
```

**修改后 (decorator.ts 第 168-175 行)：**
```typescript
// 对于 data URI，需要特殊处理以确保 Markdown 渲染正确
let displayImagePath = imagePath;
if (imagePath.startsWith('data:image')) {
    // 将单引号替换为 %27 避免 Markdown 解析问题
    displayImagePath = imagePath.replace(/'/g, '%27');
}

result += `![${displayImagePath}](${displayImagePath}${maxSizeConfig})`;
```

生成的 Markdown：
```markdown
![data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://...](data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://...)
                                                   ↑ 转义后可以正常解析
```

## 测试示例

将下面的 CSS 粘贴到 `.css` 文件中测试：

```css
.test-icon {
  mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 0'/%3E%3C/svg%3E");
}

.test-icon-2 {
  mask-image: url(data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12%200%22%2F%3E%3C%2Fsvg%3E);
}
```

**预期结果：**
- ✅ Gutter 显示图标
- ✅ Hover 显示预览（修复后）

