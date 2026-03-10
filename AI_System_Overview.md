# 🎯 个人 AI 知识体系架构文档

> 构建日期：2026-03-03
> 架构师：Guchaojie
> 核心方法论：苏格拉底式提问 + 模块化 Skill 设计

---

## 📁 目录结构

```
daily/
├── skills/                          # Skill 知识库
│   ├── AI Orchestrator.md           # 全局调度员（大脑）
│   ├── Socratic Coach.md            # 苏格拉底教练（教学法）
│   ├── Language Specialist.md        # 语言翻译（原有）
│   ├── Skill - Notetaker.md         # 极简速记员（入口）
│   └── Skill - Python Tutor.md      # Python 导师（专业技能）
│
└── route_prototype.py              # 最小可运行路由原型
```

---

## 🧠 核心架构设计

### 1. 双层调度系统 (Two-stage Dispatching)

```
用户输入
    │
    ▼
[外部调度员 Orchestrator]
    │
    ├── 意图扫描 (关键词匹配)
    │
    ▼
[当前活跃 Skill] ←─── 交接协议 (JSON)
    │
    ├── 若触发边界 → 输出 request_handoff
    │
    ▼
[切换到目标 Skill]
```

### 2. 通信协议 (Handoff Protocol)

所有 Skill 之间使用统一的 JSON 格式进行交接：

```json
{
  "status": "request_handoff",
  "summary": "用户从速记转入具体咨询，关键词为：排序算法",
  "todo": "需要专业领域解答/分析",
  "user_temp": "45",
  "target_skill_hint": "Python Tutor"
}
```

**字段说明：**
| 字段 | 含义 | 作用 |
|------|------|------|
| `status` | 状态标识 | 告诉调度员"我要换人" |
| `summary` | 历史摘要 | 让下一个 Skill 快速了解上下文 |
| `todo` | 待办事项 | 明确当前对话的目标 |
| `user_temp` | 用户温度 (1-100) | 感知用户情绪，调整回答风格 |
| `target_skill_hint` | 目标 Skill 建议 | 精准定位下一个处理者 |

### 3. 记忆管理策略

- **切换时总结**：当 Skill A 切换到 Skill B 时，A 必须生成一份结构化摘要
- **上下文注入**：调度员将摘要作为 B 的初始化上下文
- **情感传递**：`user_temp` 让每个 Skill 都能感知用户的紧迫程度

---

## 📝 Skill 定义规范

### 通用模板

每个 Skill 必须包含以下部分：

1. **核心定位 (Role)**：一句话说明这个 Skill 是谁
2. **执行准则 (Principles)**：这个 Skill 的行为边界
3. **关键词列表 (Keywords)**：触发这个 Skill 的索引词
4. **输出协议 (Handoff JSON)**：超纲时必须输出的格式

### 示例：极简速记员 (Notetaker)

```markdown
## 角色
你是用户的第一个接触点，负责记录灵感并拦截专业话题。

## 边界关键词
- 编程类：Python, Java, 代码, 报错
- 健康类：健身, 深蹲, 减肥

## 输出协议
遇到边界触发时，输出 JSON 并请求切换。
```

---

## 🚀 路由原型技术细节

### 核心逻辑 (Python)

```python
def handle_user_input(user_input, skills, current_skill):
    # 1. 关键词匹配
    if current_skill.match(user_input):
        # 2. 获取响应（可能包含 JSON 协议）
        response = simulate_skill_response(current_skill, user_input)

        # 3. 解析协议
        handoff = parse_handoff_response(response)
        if handoff and handoff["status"] == "request_handoff":
            return response, True, handoff["target_skill_hint"]

    # 4. 默认行为
    return f"[{current_skill}] 已记录: {user_input}", False, current_skill
```

### 测试结果

| 用户输入          | 匹配关键词      | 结果                 |
| ------------- | ---------- | ------------------ |
| 明天下午三点去北京     | 无          | ✅ 已记录              |
| 写一个快速排序算法     | **排序**     | ✅ 切换到 Python Tutor |
| 我的Python循环死机了 | Python, 循环 | ✅ 切换到 Python Tutor |

---

## 🎓 苏格拉底式教学法应用

### 核心原则

1. **禁绝直给**：不直接给答案，而是通过提问引导
2. **由浅入深**：将复杂问题拆解为逻辑关联的小问题
3. **反向质询**：验证学生是否真正理解，而非机械记忆

### 提问模板

```
【引导提问】：当前最核心的启发性问题
【思路火花】：一个微小的线索或类比
【学习进度】：当前已达成的认知节点 + 下一个目标
```

---

## 📋 现有 Skill 清单

| Skill 名称            | 功能描述      | 状态    |
| ------------------- | --------- | ----- |
| AI Orchestrator     | 全局调度与路由管理 | ✅ 已完成 |
| Notetaker           | 入口拦截与日常记录 | ✅ 已完成 |
| Python Tutor        | 启发式编程教学   | ✅ 已完成 |
| Socratic Coach      | 元学习方法指导   | ✅ 已完成 |
| Language Specialist | 跨语言翻译     | ✅ 原有  |
| Java Tutor          | (待开发)     | ⏳ 待建  |
| Fitness Master      | (待开发)     | ⏳ 待建  |

---

## 🔜 下一步优化方向

1. **自动关键词提取**：从 .md 文件自动读取，而非硬编码
2. **真实 LLM 接入**：让每个 Skill 调用 GPT/API 进行回答
3. **记忆持久化**：实现本地文件存储历史摘要
4. **多轮对话上下文**：支持更长的对话链

---

## 💡 核心洞见总结

> **AI 编程的本质**：不是写代码，而是设计规则。
> 
> **程序员的角色转变**：从"逻辑编写者"变为"系统架构师"。
> 
> **模块化思维**：每个 Skill 就像一个专业科室，调度员是医院前台，协议是转诊单。

---

*文档生成时间：2026-03-03*
*基于苏格拉底式对话共创*
