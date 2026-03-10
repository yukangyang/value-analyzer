# 付出价值分析器

一个基于 React Native + Expo 的现值性价比分析工具，用于量化评估付出与回报的关系。

## 核心算法

### 付出计算公式
```
加权付出 = ∑(金额 × γ^i × f(年龄))
```
- γ: 时间衰减系数 (0.95)
- i: 记录索引
- f(年龄): 年龄权重函数 = 1 + (年龄/100)

### 回报计算公式
```
加权回报 = ∑(价值 × 5^((当前时间-记录时间)/365))
```
- 使用指数增长模型，越早的回报价值越低

### 性价比得分
```
现值性价比 = (加权回报 / 加权付出) × 100
```

## 功能特性

- 记录付出和回报
- 实时计算性价比
- 时间加权分析
- 年龄因素考量
- 直观的可视化展示

## 快速开始

### 安装依赖
```bash
cd value-analyzer
npm install
```

### 运行项目
```bash
# 启动开发服务器
npm start

# 运行 Android
npm run android

# 运行 iOS (需要 macOS)
npm run ios

# 运行 Web
npm run web
```

## 打包部署

### 构建 APK (Android)
```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
eas login

# 配置构建
eas build:configure

# 构建 APK
eas build --platform android --profile preview
```

### 部署到 Vercel (Web)
```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel
```

或者直接在 Vercel 网站导入 GitHub 仓库。

## 项目结构

```
value-analyzer/
├── src/
│   ├── components/
│   │   ├── AnalysisDisplay.tsx  # 分析结果展示
│   │   └── RecordInput.tsx      # 记录输入表单
│   ├── types/
│   │   └── index.ts             # 类型定义
│   └── utils/
│       └── calculator.ts        # 核心算法
├── App.tsx                      # 主应用
└── package.json
```

## 使用说明

1. 输入当前年龄
2. 点击"记录付出"添加付出项目
3. 点击"记录回报"添加回报项目
4. 系统自动计算并显示性价比得分

### 得分解读

- **150+**: 超值 - 回报远超付出
- **100-150**: 值得 - 回报大于付出
- **50-100**: 一般 - 回报接近付出
- **<50**: 亏损 - 付出大于回报

## 技术栈

- React Native 0.83
- Expo 55
- TypeScript 5.9
- React 19

## License

MIT
