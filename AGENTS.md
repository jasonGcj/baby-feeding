# AGENTS.md - AI 知识体系项目指南

> 本文件供 AI Agent 使用，指导代码开发和项目维护。

## 📁 项目概述

- **项目类型**：Python Skill 路由系统
- **核心功能**：多技能管理与自动路由
- **主要文件**：`route_prototype.py`（172 行）

### 目录结构

```
daily/
├── route_prototype.py          # 核心路由逻辑
├── AI_System_Overview.md       # 系统架构文档
├── AGENTS.md                   # 本文件
├── .agents/skills/             # Agent 技能定义
├── .claude/skills/             # Claude 兼容技能
├── .opencode/skills/           # OpenCode 技能
└── skills/                    # 原始技能文档
```

---

## 🛠️ 运行命令

### 路由原型

```bash
# 交互模式运行
python route_prototype.py

# 测试模式（运行内置测试用例）
python route_prototype.py --test
```

### 测试用例说明

测试模式包含 4 个用例：

1. `"明天下午三点去北京"` → 记录到 Notetaker
2. `"写一个快速排序算法"` → 切换到 Python Tutor
3. `"我的Python循环死机了"` → 切换到 Python Tutor
4. `"今晚吃啥"` → 记录到 Notetaker

---

## 📝 代码风格指南

### 命名规范

| 类型 | 规则 | 示例 |
|------|------|------|
| 函数/变量 | snake_case | `handle_user_input`, `current_skill` |
| 类名 | PascalCase | `Skill` |
| 常量 | UPPER_SNAKE_CASE | `SKILLS_DIR` |
| 文件名 | snake_case | `route_prototype.py` |

### 缩进与格式

- **缩进**：4 空格（禁止 Tab）
- **行长度**：建议不超过 120 字符
- **空行**：函数之间空 2 行，类之间空 2 行

### 导入顺序

```python
# 1. 标准库
import json
import os
import re
from pathlib import Path

# 2. 第三方库（如有）
# import requests

# 3. 本地模块（如有）
# from . import module
```

### 类型提示（推荐）

新代码建议添加类型提示：

```python
def handle_user_input(
    user_input: str,
    skills: dict[str, Skill],
    current_skill_name: str
) -> tuple[str, bool, str]:
    """处理用户输入并返回响应"""
    ...
```

### 错误处理

使用 try/except 模式，捕获具体异常：

```python
def parse_handoff_response(response_text: str) -> dict | None:
    try:
        json_match = re.search(r'{[\s\S]*}', response_text)
        if json_match:
            return json.loads(json_match.group())
    except (json.JSONDecodeError, AttributeError):
        pass
    return None
```

### Docstrings

模块级和函数级 docstrings：

```python
"""
模块功能简述（可选）
"""

def load_skills():
    """加载所有技能并返回字典"""
    ...
```

---

## 🔧 Skill 开发规范

### 文件位置

| 类型 | 路径 |
|------|------|
| OpenCode 技能 | `.opencode/skills/<name>/SKILL.md` |
| Claude 兼容 | `.claude/skills/<name>/SKILL.md` |
| Agent 兼容 | `.agents/skills/<name>/SKILL.md` |

### SKILL.md 结构

```yaml
---
name: <skill-name>
description: 技能描述（1-1024 字符）
---
## 核心定位
...

## 执行准则
...
```

### 技能名称规范

- 长度：1-64 字符
- 字符：小写字母和数字，可用单连字符分隔
- 格式：`^[a-z0-9]+(-[a-z0-9]+)*$`

---

## 🔄 路由协议

### Skill 切换协议

Skill 切换时输出 JSON：

```json
{
  "status": "request_handoff",
  "summary": "用户咨询内容摘要",
  "todo": "待办事项",
  "user_temp": "50",
  "target_skill_hint": "目标技能名"
}
```

### 关键词匹配

```python
def match(self, user_input: str) -> bool:
    for keyword in self.keywords:
        if keyword.lower() in user_input.lower():
            return True
    return False
```

---

## 🧪 开发建议

1. **先测试后提交**：运行 `python route_prototype.py --test` 验证
2. **Skill 更新**：确保 `.agents/`、`.claude/`、`.opencode/` 三处同步
3. **协议兼容**：切换协议字段不可省略，保持 JSON 格式
4. **文档同步**：更新 AI_System_Overview.md 反映系统变更

---

## 📚 参考文档

- [AI_System_Overview.md](./AI_System_Overview.md) - 完整架构设计
- [skills/](./skills/) - 各 Skill 原始定义

---

*最后更新：2026-03-04*
