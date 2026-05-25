# app.v4.wxss 与 app.v5.wxss 产物差异报告

## 结论

`app.v5.wxss` 不是单纯的格式化重排。它在 `weapp-tailwindcss@4` 产物基础上引入了新的根节点变量注入、平台条件媒体查询、默认 `.container` 规则，并移除了部分 v4 中实际存在的工具类/组件类输出。

对运行时最值得关注的是这几类：

- `v5` 多了 `:host`、`.tw-root`、`wx-root-portal-content` 的运行时窗口变量兜底。
- `v5` 把 `ifdef`/`ifndef`/`wx:` 类放进了 `weapp-tw-platform` 媒体查询里。
- `v5` 新增了 `.container` 的默认响应式规则。
- `v5` 缺少 `v4` 中的 `.raw-btn`，以及若干任意值/常规工具类。
- `v5` 的 `.bg-clip-text` 少了 `-webkit-background-clip: text`。

## 文件规模

| 文件 | 行数 | 字节数 |
| --- | ---: | ---: |
| `app.v4.wxss` | 1147 | 44645 |
| `app.v5.wxss` | 1180 | 43356 |

`v5` 行数更多但字节数更少，主要是因为整体格式更规整，同时部分规则被删除或改写。

## 主要差异

### 1. Preflight 基础层拆分

`v4` 开头是两段：

```css
::before,::after {
    --tw-content: ""}
view,text,::before,::after {
    ...
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
    border-color: currentColor}
```

`v5` 改成两组 `view,text,:before,:after`：

```css
view,
text,
:before,
:after {
  --tw-content: "";
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
view,
text,
:before,
:after {
  ...
}
```

影响：

- `v5` 把 `--tw-content` 也挂到了 `view` 和 `text` 上，而 `v4` 只在伪元素上单独初始化。
- `v5` 使用 `:before`/`:after` 单冒号形式，`v4` 使用 `::before`/`::after`。
- `v5` 将 box model reset 和 Tailwind 变量 reset 拆成两段，语义基本一致，但级联顺序更清晰。

### 2. 根节点变量注入范围扩大

`v4` 的窗口变量在文件末尾压缩输出，只作用于 `page`：

```css
page{--status-bar-height:25px;--top-window-height:0px;--window-top:0px;--window-bottom:0px;--window-left:0px;--window-right:0px;--window-magin:0px}
```

`v5` 在文件头部单独输出：

```css
:host,
page,
.tw-root,
wx-root-portal-content {
  --status-bar-height: 25px;
  --top-window-height: 0px;
  --window-top: 0px;
  --window-bottom: 0px;
  --window-left: 0px;
  --window-right: 0px;
  --window-magin: 0px;
}
```

影响：

- `v5` 明显增强了变量注入范围，覆盖组件宿主、`.tw-root` 和根 portal 内容。
- 对依赖这些变量的组件样式更友好，尤其是组件隔离、portal、root wrapper 场景。
- `--window-magin` 拼写仍是 `magin`，两个版本都保持一致。

### 3. `.raw-btn` 在 v5 中消失

`v4` 有：

```css
.raw-btn { ... }
.raw-btn::after { ... }
```

`v5` 中没有对应规则，只保留 `.btn`。

影响：

- 如果源码或模板里仍使用 `raw-btn`，升级到 v5 产物后该类会完全失效。
- 这不是格式差异，是实际样式缺失。

### 4. v5 新增 `.fixed` 和 `.capitalize`

`v5` 新增：

```css
.fixed {
  position: fixed;
}
.capitalize {
  text-transform: capitalize;
}
```

`v4` 中没有这两个工具类。

影响：

- 说明 v5 的扫描结果或生成逻辑包含了新的工具类。
- 如果这是同一份源码生成的结果，需确认是不是 v5 的提取覆盖面变化，或构建输入实际不同。

### 5. v5 新增默认 `.container`

`v5` 文件末尾新增：

```css
.container {
  width: 100%;
}
@media (min-width: 40rem) { .container { max-width: 1280rpx; } }
@media (min-width: 48rem) { .container { max-width: 1536rpx; } }
@media (min-width: 64rem) { .container { max-width: 2048rpx; } }
@media (min-width: 80rem) { .container { max-width: 2560rpx; } }
@media (min-width: 96rem) { .container { max-width: 3072rpx; } }
```

`v4` 没有 `.container` 输出。

影响：

- 使用 `.container` 的节点在 v5 中会开始获得宽度和断点最大宽度。
- 断点单位是 `rem`，输出尺寸转换为 `rpx`，这和普通 `sm/md/lg` 断点继续使用 `px` 媒体查询不同。

### 6. 平台条件类被媒体查询包裹

`v4` 直接输出：

```css
.ifdef-_bMP-WEIXIN_B_cbg-blue-500 { ... }
.wx_cbg-blue-500 { ... }
```

`v5` 改为：

```css
@media (weapp-tw-platform: "MP-WEIXIN") {
  .ifdef-_bMP-WEIXIN_B_cbg-blue-500 { ... }
}
@media not screen and (weapp-tw-platform: "MP-WEIXIN") {
  .ifndef-_bMP-WEIXIN_B_cbg-red-500 { ... }
}
@media (weapp-tw-platform: "MP-WEIXIN") {
  .wx_cbg-blue-500 { ... }
}
```

影响：

- `v5` 的平台条件表达更完整，`ifndef` 规则也进入产物。
- 这些规则是否生效取决于后续 `weapp-tailwindcss` 对自定义 `weapp-tw-platform` 媒体查询的转换/裁剪。
- 如果最终进入小程序运行时的 WXSS 仍保留这种自定义媒体查询，需要进一步验证目标平台是否接受。

### 7. v4 存在但 v5 缺失的工具类

从产物中可直接观察到，`v4` 有而 `v5` 没有的代表性规则包括：

| 类名 | v4 输出效果 |
| --- | --- |
| `.h-_b100px_B` | `height: 100px` |
| `.w-_b222_d222px_B` | `width: 222.222px` |
| `.rounded` | `border-radius: 8rpx` |
| `.rounded-_b40px_B` | `border-radius: 40px` |
| `.px-2` | `padding-left/right: 16rpx` |
| `.bg-_b_h123456_B` | `background-color: rgba(18, 52, 86, ...)` |
| `.bg-opacity-_b0_d54_B` | `--tw-bg-opacity: 0.54` |
| `.bg-_burl_p_d_d_d_P_B` | `background-image: url(...)` |
| `.to-blue-500` | `--tw-gradient-to: #3b82f6 ...` |
| `.text-_b_hffffff_B` | `color: rgba(255, 255, 255, ...)` |

影响：

- 如果这些类来自同一份源码，v5 的类提取或任意值处理存在明显行为差异。
- 其中 `.rounded`、`.px-2`、`.to-blue-500` 是常规 Tailwind 类，缺失风险高于纯测试用任意值类。
- `.btn` 里仍内联了 `px-2`、`from-[#9e58e9]`、`to-blue-500` 等组合后的声明，所以缺失的是独立工具类，不一定影响 `.btn` 自身。

### 8. `.bg-clip-text` 的前缀声明减少

`v4`：

```css
.bg-clip-text {
    -webkit-background-clip: text;
    background-clip: text
}
```

`v5`：

```css
.bg-clip-text {
  background-clip: text;
}
```

影响：

- `v5` 删除了 `-webkit-background-clip: text`。
- 如果小程序目标环境依赖 WebKit 前缀才能实现文字渐变裁剪，v5 这里可能出现视觉退化。

### 9. `content` 字符串引号从单引号变双引号

例子：

```css
/* v4 */
--tw-content: '父元素';

/* v5 */
--tw-content: "父元素";
```

影响：

- 对 CSS 语义通常无影响。
- 但这会影响快照测试、字符串 diff 和某些后处理器的严格匹配。

### 10. 数值格式和空格规范化

多处颜色、阴影、渐变输出从紧凑格式变为带空格格式：

```css
/* v4 */
rgba(15,23,42,0.08)
radial-gradient(circle at top,#22d3ee,#0f172a)

/* v5 */
rgba(15, 23, 42, 0.08)
radial-gradient(circle at top, #22d3ee, #0f172a)
```

影响：

- 多数情况下只是格式差异，不改变 CSS 计算结果。
- 会显著放大文本 diff，因此比较两个产物时需要先排除格式化噪音。

### 11. 末尾隐藏规则位置和格式变化

`v4` 把 `[data-c-h="true"]` 压在末尾同一行：

```css
[data-c-h="true"]{display: none !important;}
```

`v5` 单独格式化输出：

```css
[data-c-h="true"] {
  display: none !important;
}
```

影响：

- 语义一致。
- `v5` 可读性更好，也避免和前一个 `page{...}` 压缩在同一行。

## 风险判断

高风险差异：

- `.raw-btn` 缺失：若模板使用该类，按钮基础样式和 `::after` reset 会丢。
- 常规工具类缺失：`.rounded`、`.px-2`、`.to-blue-500` 等如果独立使用，会直接丢样式。
- `.bg-clip-text` 缺少 WebKit 前缀：可能影响文字渐变裁剪效果。

中风险差异：

- 平台条件媒体查询改写：需要确认最终小程序 WXSS 是否经过正确转换。
- `.container` 新增：使用 `.container` 的页面布局会发生变化。
- 根变量注入范围扩大：通常是正向变化，但可能改变组件隔离/portal 内变量继承结果。

低风险差异：

- 缩进、分号、选择器换行。
- `rgba()`、`gradient()` 内部空格。
- `content` 字符串单引号/双引号差异。

## 建议验证点

1. 全仓搜索是否仍使用 `raw-btn`、`.rounded`、`.px-2`、`.to-blue-500`、`.bg-clip-text`。
2. 在微信开发者工具里确认 `@media (weapp-tw-platform: "MP-WEIXIN")` 是否已被最终转换，不应以原样进入运行时导致规则不生效。
3. 对使用 `.container` 的页面做一次布局截图比对，确认 v5 新增默认容器宽度是否符合预期。
4. 对文字渐变场景检查 `.bg-clip-text` 在目标小程序基础库中的实际效果。

