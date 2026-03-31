# 设计系统规范 (Design System)

为了确保后续新增页面与现有系统风格保持高度一致，请严格遵循以下样式规范：

## 1. 颜色与色彩体系
- **系统背景:** `#0b1730` (深蓝色)
- **组件背景 (输入框/下拉框/文本域):** `bg-[#0f172a]/30`
- **边框颜色:** `#0085D0` (透明度 50%, `border-[#0085D0]/50`)
- **文字颜色:** `text-blue-100`
- **占位符颜色:** `placeholder-blue-300/30`
- **焦点状态:** `focus:border-neon-blue`, `focus:ring-1`, `focus:ring-neon-blue`
- **高亮/强调色:** `#0085D0` (用于边框和图标)

## 2. 组件样式
- **高度:** 所有输入框、下拉框、按钮统一高度 `h-[25px]`。
- **圆角:** 所有输入框、下拉框、按钮统一使用 `rounded-none`。
- **按钮变体:**
    - **Primary:** `bg-[#07596C]/80`, `border-blue-500`, `shadow-[0_0_10px_rgba(7,89,108,0.3)]`
    - **Secondary:** `bg-slate-700/30`, `border-slate-500`
    - **Toolbar (查询/导出):** `bg-[#224D63]`, `border-[#5FBADD]`
    - **Danger (删除):** `bg-red-500/20`, `border-red-500/50`, `text-red-400`
- **输入框/下拉框:**
    - Padding: `px-2 py-0`
    - Text Size: `text-sm`

## 3. 模态窗口 (Modals)
- **背景:** `#0b1730`
- **边框:** `border border-blue-500/30`
- **阴影:** `shadow-[0_0_30px_rgba(0,210,255,0.2)]`
- **动画:** `animate-[fadeIn_0.2s_ease-out]`
- **头部:** `border-b border-blue-500/20`
- **底部:** `border-t border-blue-500/20`

## 4. 排版 (Typography)
- **字体:** 数据值使用 `font-mono`，通用UI文本使用 `font-sans`。
- **字号:** 表格数据和标签通常使用 `text-xs` 或 `text-sm`。
