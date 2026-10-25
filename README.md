# AgentFlight

**Framework-agnostic flight recorder and observability layer for AI agents.**

AgentFlight, AI ajanlarınızın her adımını (LLM çağrıları, araç çağrıları,
hatalar) otomatik olarak kaydeder; token tüketimini ve tahmini maliyeti adım
bazında hesaplar. LangChain, Vercel AI SDK veya ham OpenAI SDK — hangisini
kullanırsanız kullanın, tek satır kodla entegre olur.

## Neden AgentFlight?

- 🔍 **Kara kutu sorununu çözer** — Agent'ınız hata verdiğinde hangi adımda ne
  olduğunu görürsünüz.
- 💰 **Token maliyetini görünür kılar** — Her çağrının prompt/completion
  token'larını ve tahmini USD maliyetini kaydeder.
- 🔌 **Framework'ten bağımsız** — OpenAI SDK, Vercel AI SDK ve daha fazlası için
  hazır sarmalayıcılar.
- 📦 **Sıfır bağımlılık çekirdeği** — `FlightRecorder` sadece Node.js standart
  kütüphanesini kullanır.
- 🗄️ **Basit depolama** — Bellek içi veya JSONL dosya. Kendi depolama
  katmanınızı yazmak için `FlightStorage` arayüzünü uygulayın.

## Kurulum

```bash
npm install agentflight
```
