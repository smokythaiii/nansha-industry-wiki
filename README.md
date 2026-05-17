# 南沙产业知识图谱

一个面向黑客松场景的 LLM 产业 Wiki 原型项目。项目聚焦南沙“8+2+3”现代化产业 Wiki，尝试把分散在政策文件、企业资料、园区项目和产业动态中的信息，组织成可搜索、可浏览、可对话的产业知识网络。

# 项目网址
https://nansha-industry-wiki-iaj7.vercel.app/
<img width="2548" height="1660" alt="image" src="https://github.com/user-attachments/assets/a9b1dc49-2e4b-4281-a5d3-e2376e672b35" />

## 项目背景

南沙产业信息通常分布在政策文本、企业名录、招商材料、项目公告和新闻动态中。传统产业门户更偏展示，难以快速回答“某个产业有哪些关键节点”“政策支持什么方向”“哪些企业或项目值得关注”等问题。

本项目用 LLM Wiki 的方式自动编译产业资料，形成结构化页面、知识图谱、引用来源和问答入口。

## 核心功能

- **Landing Page**  
  展示“南沙产业知识图谱”的产品定位、重点产业 Wiki、LLM Wiki 技术能力和产业问答场景。

- **搜索页**  
  支持搜索产业、企业、政策、项目或技术路线。当前版本基于本地 JSON 数据做前端关键词匹配。
<img width="2488" height="1552" alt="image" src="https://github.com/user-attachments/assets/2596c2d5-0f03-4cc7-a6db-dc56dc1cdabe" />


- **产业 Wiki 详情页**  
  以“低空经济”为样例，展示产业概览、产业链节点、政策支持、代表企业与项目线索、LLM Wiki 生成机制和引用来源。

  <img width="2522" height="1736" alt="image" src="https://github.com/user-attachments/assets/ff60fc35-ed34-45d6-8fcc-725eabc8f240" />


- **数据驱动 Wiki**  
  搜索结果和详情页内容从 `data/*.json` 读取，后续可以通过新增数据文件扩展更多产业。

- **本地模拟 Chat**  
  在详情页中打开 Chat 面板后，可以围绕当前产业 Wiki 提问。当前为本地模拟逻辑，会根据问题关键词匹配 Wiki 章节并返回回答和引用标签。

## 技术方案

当前版本是一个无后端的静态前端原型，方便黑客松快速演示。

- HTML / CSS / JavaScript
- 本地 JSON 数据驱动
- 前端关键词搜索
- Wiki 模板动态渲染
- 本地模拟 RAG/Chat 交互

核心数据文件：

- `data/industries.json`：搜索页产业与能力索引
- `data/wiki-low-altitude-economy.json`：低空经济 Wiki 详情数据

核心页面：

- `index.html`：Landing Page
- `search/index.html`：搜索页
- `wiki/low-altitude-economy/index.html`：低空经济 Wiki 详情页

## 运行方式

在项目根目录启动本地静态服务：

```bash
python3 -m http.server 8000
```

然后访问：

```text
http://localhost:8000/
```

示例页面：

```text
http://localhost:8000/search?q=低空经济
http://localhost:8000/wiki/low-altitude-economy/
```

## 当前搜索逻辑

搜索页会读取 `data/industries.json`，并匹配以下字段：

- `title`
- `type`
- `summary`
- `keywords`
- `meta`

当前匹配方式是简单的包含匹配，适合原型演示。后续可以升级为：

- 中文分词
- 模糊搜索
- 向量检索
- RAG 检索增强生成
- 真实 LLM 问答

## LLM Wiki 设想

后续完整版本可以支持以下流程：

```text
导入政策、企业、项目、新闻资料
-> 文本切分与清洗
-> LLM 抽取实体和关系
-> 构建产业知识图谱
-> 生成产业 Wiki 页面
-> 建立语义索引
-> 支持 RAG 问答与引用溯源
```

目标是让产业资料从“文件集合”变成“可搜索、可追问、可验证的知识系统”。

## 黑客松演示路径

建议演示顺序：

1. 打开首页，介绍项目定位：南沙产业 LLM Wiki。
2. 在搜索框输入“低空经济”。
3. 进入搜索结果页，点击“低空经济”。
4. 展示产业 Wiki 详情页，包括图谱、表格、政策和来源。
5. 点击右上角 Chat，输入“有哪些政策支持？”。
6. 展示本地模拟回答和引用章节标签。

## 后续规划

- 接入真实南沙产业数据源
- 增加更多产业 Wiki 页面
- 引入真实 LLM 生成与 RAG 检索
- 支持引用来源跳转与原文高亮
- 支持图谱节点点击、展开和筛选
- 增加后台数据导入与 Wiki 自动更新流程

## 项目价值

本项目希望证明：产业知识不应只停留在静态展示页中，而可以通过 LLM、知识图谱和 Wiki 化组织，成为面向招商、产业研究、企业服务和政策匹配的智能知识底座。
