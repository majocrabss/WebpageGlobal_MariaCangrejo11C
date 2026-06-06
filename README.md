# Hypothesis Testing Tool — G11C Global Economics
**Term 3 · Learning Evidence 4 · C8–C10**
Teacher: Nicolás López Cuéllar · Student: María Cangrejo

## Live Demo
**https://majocrabss.github.io/WebpageGlobal_MariaCangrejo11C/**

## AI Conversation
**https://claude.ai/share/9c0f1139-a6ea-4b25-a15e-164459a63234**

---

## How to Test C9 Mode with the 3 CSV Files

### Dataset 1 — Mean test (Control vs Treatment)
1. Click **C9** tab → upload `dataset_1.csv`
2. Data Type → **Mean** · Group Column → `group` · Value Column → `score`
3. Benchmark → `Control` · Test → `Treatment` · Direction → **Right-tailed** · α = 0.05
4. Click **Run** → Expected: z ≈ 11.88, p < 0.0001 → **Reject H₀**

### Dataset 2 — Proportion test (Method_B vs Method_A)
1. Click **C9** tab → upload `dataset_2.csv`
2. Data Type → **Proportion** · Group Column → `group` · Success Column → `success`
3. Benchmark → `Method_B` · Test → `Method_A` · Direction → **Right-tailed** · α = 0.05
4. Click **Run** → Expected: z ≈ −1.94, p ≈ 0.97 → **Fail to Reject H₀**

### Dataset 3 — Mean test (same as Dataset 1)
1. Click **C9** tab → upload `dataset_3.csv`
2. Data Type → **Mean** · Group Column → `group` · Value Column → `score`
3. Benchmark → `Control` · Test → `Treatment` · Direction → **Right-tailed** · α = 0.05
4. Click **Run** → Expected: z ≈ 11.88, p < 0.0001 → **Reject H₀**

---

## Criteria Covered
| Criterion | Description |
|-----------|-------------|
| **C8** | Manual mode: sliders + input boxes, tail selector, normal curve, p-value, critical values, decision, Type I/II errors |
| **C9** | CSV upload, auto group detection, automatic hypothesis test, normal curve visualization, all 3 datasets validated |
| **C10** | APA report with real sources, screenshots, AI link, PDF download button |
