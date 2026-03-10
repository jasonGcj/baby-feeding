"""
最小可运行的路由原型 (Route Prototype)
基于我们设计的 Skill 架构实现自动化路由
"""

import json
import os
import re
from pathlib import Path

SKILLS_DIR = Path("skills")
CURRENT_SKILL = "Notetaker"  # 默认从速记员开始


class Skill:
    def __init__(self, name, content, keywords):
        self.name = name
        self.content = content
        self.keywords = keywords

    def match(self, user_input):
        for keyword in self.keywords:
            if keyword.lower() in user_input.lower():
                return True
        return False


def load_skills():
    skills = {}
    
    # 硬编码关键词用于演示（从 .md 文件读取的逻辑稍后完善）
    manual_keywords = {
        "Notetaker": ["python", "java", "代码", "编程", "算法", "排序", "健身", "深蹲", "减肥", "疼"],
        "Python Tutor": ["python", "代码", "编程", "算法", "排序", "循环", "死机", "报错"]
    }
    
    for file in SKILLS_DIR.glob("Skill - *.md"):
        name = file.stem.replace("Skill - ", "")
        content = file.read_text(encoding="utf-8")
        
        keywords = manual_keywords.get(name, [])
        
        skills[name] = Skill(name, content, keywords)
    
    return skills


def parse_handoff_response(response_text):
    """
    尝试从响应中解析 JSON 协议
    """
    try:
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
    except:
        pass
    return None


def handle_user_input(user_input, skills, current_skill_name):
    """
    处理用户输入，返回 (响应, 是否需要切换, 目标Skill)
    """
    current_skill = skills.get(current_skill_name)
    
    if current_skill and current_skill.match(user_input):
        response = simulate_skill_response(current_skill_name, user_input)
        
        handoff = parse_handoff_response(response)
        if handoff and handoff.get("status") == "request_handoff":
            target = handoff.get("target_skill_hint", "Notetaker")
            return response, True, target
    
    return f"[{current_skill_name}] 已记录: {user_input}", False, current_skill_name


def simulate_skill_response(skill_name, user_input):
    """
    模拟各 Skill 的响应逻辑
    """
    if skill_name == "Notetaker":
        return json.dumps({
            "status": "request_handoff",
            "summary": f"用户咨询专业问题，关键词：{user_input[:20]}",
            "todo": "需要专业领域解答",
            "user_temp": "50",
            "target_skill_hint": "Python Tutor" if any(k in user_input.lower() for k in ["python", "代码", "编程", "算法", "排序"]) else "Unknown"
        }, ensure_ascii=False)
    
    elif skill_name == "Python Tutor":
        if "排序" in user_input or "快速" in user_input or "算法" in user_input:
            return """作为你的苏格拉底式教练，我不能直接给你写代码。但我可以引导你自己写出它。

【引导提问】
如果我们要对一个数组进行排序（比如 [3, 1, 4, 1, 5]），你能想到的最简单的"原始人思维"是什么？

这种方法叫选择排序。它虽然简单，但如果你有 100 万个数，它会跑得很慢。

快速排序的核心思想，就是不让它像无头苍蝇一样盲目搜索。它会先找一个"中间人"（Pivot，基准点），然后把数组分成两半：比基准点小的放左边，大的放右边。

【思考题】
你觉得，"找到一个好的 Pivot"是不是快速排序最难的部分？"""
        return "这是一个编程问题，你想聊什么具体的？"
    
    return f"[{skill_name}] 收到: {user_input}"


def test_routing():
    skills = load_skills()
    print("=" * 50)
    print("Route Prototype Started")
    print(f"Loaded Skills: {list(skills.keys())}")
    print("=" * 50)
    print()
    
    test_cases = [
        "明天下午三点去北京",
        "写一个快速排序算法",
        "我的Python循环死机了",
        "今晚吃啥"
    ]
    
    current = "Notetaker"
    
    for user_input in test_cases:
        print(f"[{current}] > {user_input}")
        response, should_switch, target = handle_user_input(user_input, skills, current)
        
        print(f"Response: {response[:100]}...")
        
        if should_switch:
            print(f"[System] Switching to {target}")
            current = target
        
        print()


def main():
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_routing()
    else:
        skills = load_skills()
        print("=" * 50)
        print("Route Prototype Started")
        print(f"Loaded Skills: {list(skills.keys())}")
        print("=" * 50)
        print("Type 'quit' to exit")
        print()
        
        current = "Notetaker"
        
        while True:
            user_input = input(f"[{current}] > ").strip()
            
            if user_input.lower() in ["quit", "exit"]:
                print("Bye!")
                break
            
            response, should_switch, target = handle_user_input(user_input, skills, current)
            
            print(f"\n{response}\n")
            
            if should_switch:
                print(f"[System] Switching to {target}...")
                current = target
                print()


if __name__ == "__main__":
    main()
