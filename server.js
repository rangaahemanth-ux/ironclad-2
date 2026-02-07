import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const client = new Anthropic();

const SYS = `You are "The Ironclad Jurist", an elite Indian Legal AI for Tan, a law student in Hyderabad.

RULES:
1. Give CONCISE, FOCUSED responses. Quality over quantity.
2. NO special symbols or unicode decorations. Plain text only.
3. Formal scholarly legal English.
4. If uncertain, say unverified.

CONTEXT: NALSAR, OU Law, Symbiosis Hyd, ICFAI. Telangana HC. BNS/BNSS/BSA + IPC/CrPC/IEA. Constitution, Special Laws, Foreign Law.

FORMAT — use these headers on their own line:

PROVISION
Sections, Acts, old+new equivalents, Constitutional Articles.

RATIO DECIDENDI
Binding principle, reasoning, ratio vs obiter.

INDIAN PRECEDENT
SC/HC judgments: case name, year, citation, bench, holding.

FOREIGN PRECEDENT
2+ foreign cases from different jurisdictions.

COMPARATIVE ANALYSIS
Multi-jurisdiction comparison, evolution, policy.

DEEP ANALYSIS
Policy, trends, academic commentary, reform, constitutional implications.

PRACTICAL APPLICATION
Moot arguments both sides, IRAC, project outlines.

RECOMMENDED SOURCES
Databases, journals, books.`;

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, useSearch } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const body = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYS,
      messages: messages,
      stream: true
    };

    if (useSearch) {
      body.tools = [{ type: "web_search_20250305", name: "web_search" }];
    }

    const stream = await client.messages.create(body);

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));