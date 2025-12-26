# XPBDTool
用于理解XPBD工程实现的WebApp

```shell
src/
├── components/                 # UI组件
│   ├── panels/                 # 应用面板
│   │   ├── ControlBar.tsx      # [MODULE 4] 顶部控制条
│   │   └── Sidebar.tsx         # [MODULE 4] 左侧参数面板
│   ├── scene/                  # 3D场景组件
│   │   └── SimulationScene.tsx # [MODULE 5] 场景内容(布料/光照)
│   └── ui/                     # 基础组件
│       ├── NumberInput.tsx     # [MODULE 4] 数字输入
│       └── SectionHeader.tsx   # [MODULE 4] 面板标题
│
├── constants/                  # 常量
│   └── index.ts                # [MODULE 3] 默认参数值
│
├── physics/                    # 物理引擎 (无React依赖)
│   └── SoftBodySolver.ts       # [MODULE 2] 核心解算器类
│
├── types/                      # 类型定义
│   └── index.ts                # [MODULE 1] 数据接口定义
│
├── App.tsx                     # [MODULE 6] 主入口与状态组装
└── main.tsx                    # Vite引导文件
```