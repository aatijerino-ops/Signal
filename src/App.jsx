import { useState, useEffect } from "react";

const SYNTHESIS_SYSTEM = `You are a strengths pattern analyst — not a coach, not a therapist, not a career advisor. Your single job is to read across four sets of responses and identify the underlying pattern that connects them. You are looking for the mechanism beneath the examples, not a summary of the examples themselves.

You will receive a user's responses across four lenses: Effortless Output, Unsolicited Demand, Marginal Production, and Invisible Fluency. Each lens approached their strengths from a different angle. Your task is to identify the single pattern that runs through all four — the capability or orientation that best explains why all of these things showed up together in the same person. Then name it.

THE PATTERN NAME — critical requirements:
- 3 to 5 words only
- Must sound natural when spoken aloud — test it by saying it in the sentence "My pattern is ___"
- Use common words in an uncommon combination — not corporate jargon, not compound nouns that sound like consulting buzzwords
- Should feel like a phrase someone might actually say, not a category label
- Good examples: "making order from nothing", "seeing what others overlook", "building where no map exists"
- Bad examples: "Strategic Ambiguity Navigation", "Systems Optimization Fluency", "Cross-functional Value Creation"

Respond in exactly this format — use these exact headers, nothing else:

PATTERN NAME:
[the 3-5 word name on its own line]

PATTERN STATEMENT:
[3-5 sentences in second person explaining the mechanism — how this capability operates, not what the user is good at. Do not summarize their responses. Explain what drives the behavior across all four lenses.]

EVIDENCE:
[2-3 sentences showing how the pattern appeared differently across the four lenses — name what each lens revealed about the same underlying capability, without quoting the user]

Quality standards — before responding, verify:
- Specific, not generic: would this apply equally to most professionals? If yes, rewrite.
- Mechanistic, not descriptive: does it explain HOW the capability operates? If it just describes what the user does, rewrite.
- Earned, not flattering: is this a precise observation or a compliment? If flattering, rewrite.
- Recognizable: would the user say "yes, that has always been true of me"?

Hard prohibitions — never do any of these:
- No lists of strengths
- No assessment vocabulary: strategic thinker, natural leader, strong communicator, empathetic, detail-oriented, growth mindset
- No mirroring the user's exact language back at them
- No hedging: do not say "it seems", "based on what you shared", "you might be"
- No response longer than 250 words total`;

const SUGGESTIONS_SYSTEM = `You are a career development strategist. You will receive a pattern name and pattern statement describing a professional's core strength mechanism. Generate exactly three specific, actionable directions this person could take their pattern — concrete applications they may not have considered.

Each suggestion must:
- Be specific to this pattern, not generic career advice
- Name a concrete context, role, format, or application
- Be one sentence only
- Start with an action verb

Respond with exactly three numbered items. No preamble, no summary, nothing else.`;

const LENSES = [
  {
    id: 0,
    name: "Effortless output",
    subtitle: "What you produce when you're barely trying",
    frame: "Most people have things they produce quickly and naturally that others find genuinely difficult. Not because they're smarter or more talented — but because something in how they're wired makes certain kinds of output almost effortless. This lens is looking for that. Not your biggest achievement. Not what you worked hardest for. What you make when you're barely trying.",
    prompt: "Think of a time someone thanked you, asked how you did something, or seemed surprised by what you produced. What had you made or done — and what felt unremarkable to you about it?",
    probes: ["What do you finish in a fraction of the time it seems to take others?","What have you explained to someone and watched them look genuinely relieved — like you'd made something complicated simple?","What do people ask you to do again — not because you offered, but because they remembered you did it well?","If a colleague needed something done in the next hour and thought of you first — what would that thing be?"]
  },
  {
    id: 1,
    name: "Unsolicited demand",
    subtitle: "What people pull from you without asking",
    frame: "People don't ask for things randomly. When someone comes to you — without you offering, without it being your job — they're responding to something they've seen or experienced in you. They're telling you something true about your strengths that you may never have said out loud yourself. This lens is about finding those asks.",
    prompt: "What do people come to you for — at work, in your field, or even in your personal life — that you never advertised or offered? What gets pulled from you rather than pushed by you?",
    probes: ["What do colleagues ask your opinion on before making a decision — even when it's not your area?","What do people contact you about outside of normal working hours or outside your formal role?","What does your manager or team seem to assume you'll just handle — without it ever being formally assigned?","What have you been asked to do more than once by people who had no way of knowing the others had asked?"]
  },
  {
    id: 2,
    name: "Marginal production",
    subtitle: "What you make without permission",
    frame: "Some of the most revealing things about how you're wired aren't in your job description — they're in what you make when nobody asked you to. The document you built because the gap bothered you. The system you designed because the existing one was broken. The thing you created in the margins of your real work that nobody assigned and nobody evaluated. This lens is looking for exactly that. What you make without permission is often more true to your strengths than what you make on request.",
    prompt: "What have you built, written, designed, or started that nobody assigned to you — something that came from your own instinct that something was missing, broken, or worth creating?",
    probes: ["What do you find yourself doing with spare time at work that isn't technically your job — but that you keep doing anyway?","What projects, tools, or resources have you created that outlasted your involvement — things still being used after you moved on?","What have you built outside of work — volunteer roles, side projects, personal frameworks — that uses the same muscles as your professional work?","What gap have you filled that nobody else seemed to notice or care about — but that clearly needed filling?"]
  },
  {
    id: 3,
    name: "Invisible fluency",
    subtitle: "What you do so naturally you stopped seeing it",
    frame: "The most powerful skills are often the ones you've stopped noticing. Not because they're small — but because you've had them so long they feel like common sense. Everyone can do this, you think. Except they can't. This lens approaches your strengths from the outside in — not what you think you're good at, but what others visibly struggle with that you find straightforward. The gap between your ease and their difficulty is where your invisible fluency lives.",
    prompt: "What do you watch others struggle with — not because they're incompetent, but because something that seems obvious to you genuinely isn't obvious to them? What do you find yourself thinking 'how do they not see this' about?",
    probes: ["What skill do you have that you've never put on a resume because it didn't seem like a real or nameable skill?","What have you explained to someone and been surprised by how much it helped — as if you'd given them something they'd been missing for years?","What do you do in the first five minutes of a situation — reading a room, diagnosing a problem, organizing chaos — that others seem to reach for much later if at all?","What would a close colleague say you make look easy that they personally find hard?"]
  }
];

const TRANSITIONS = [
  "Good. What you just described is a piece of the picture — something you produce with ease. Now let's look at it from a different angle. Instead of what you make, we're going to look at what others come to you for.",
  "You've named what others seek from you. Now we go somewhere even less obvious — not what you're asked for, but what you make entirely on your own terms, without assignment or permission.",
  "You've looked at what you make without being asked. This last lens goes deeper still — into what you do so naturally you may have stopped seeing it as a skill at all."
];

const CLOSING = "You've just done something most people never do — looked at your strengths from four distinct angles, each one revealing something the others can't. What you've shared across these four lenses contains a pattern. A thread that connects the effortless, the in-demand, the self-initiated, and the invisible. Signal is going to name that pattern now. It may confirm something you already sensed. It may surface something you've never quite articulated. Either way, it's yours.";


function parseSynthesis(text) {
  const nameMatch = text.match(/PATTERN NAME:\s*\n([^\n]+)/i);
  const statMatch = text.match(/PATTERN STATEMENT:\s*\n([\s\S]+?)(?=\nEVIDENCE:|\nPATTERN NAME:|$)/i);
  const evidMatch = text.match(/EVIDENCE:\s*\n([\s\S]+?)(?=\nPATTERN NAME:|\nPATTERN STATEMENT:|$)/i);
  const name = nameMatch ? nameMatch[1].trim() : text.split("\n").filter(l => l.trim())[0] || "";
  const statement = statMatch ? statMatch[1].trim() : "";
  const evidence = evidMatch ? evidMatch[1].trim() : "";
  return { name, statement, evidence };
}

export default function Signal() {
  const [screen, setScreen] = useState("welcome");
  const [lensIndex, setLensIndex] = useState(0);
  const [showProbes, setShowProbes] = useState(false);
  const [answers, setAnswers] = useState(["","","",""]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [showTransition, setShowTransition] = useState(false);
  const [showClosing, setShowClosing] = useState(false);
  const [patternName, setPatternName] = useState("");
  const [patternStatement, setPatternStatement] = useState("");
  const [patternEvidence, setPatternEvidence] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [screen, lensIndex, showTransition, showClosing]);

  const lens = LENSES[lensIndex];

  function saveAndContinue() {
    const updated = [...answers];
    updated[lensIndex] = currentAnswer;
    setAnswers(updated);
    if (lensIndex < 3) { setShowTransition(true); setShowProbes(false); }
    else { setShowClosing(true); setShowProbes(false); }
  }

  function proceedFromTransition() {
    setShowTransition(false);
    setLensIndex(i => i + 1);
    setCurrentAnswer("");
    setShowProbes(false);
  }

  async function runSynthesis() {
    setScreen("loading");
    const userInput = LENSES.map((l, i) => `${l.name}:\n${answers[i] || "(no response)"}`).join("\n\n");
    try {
      const sr = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYNTHESIS_SYSTEM, messages: [{ role: "user", content: userInput }] })
      });
      const sd = await sr.json();
      const { name, statement, evidence } = parseSynthesis(sd.content[0].text);
      setPatternName(name); setPatternStatement(statement); setPatternEvidence(evidence);

      const sugR = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 400, system: SUGGESTIONS_SYSTEM, messages: [{ role: "user", content: `Pattern name: ${name}\n\nPattern statement: ${statement}` }] })
      });
      const sugD = await sugR.json();
      const sugs = sugD.content[0].text.trim().split("\n").filter(l => l.trim()).map(l => l.replace(/^[1-3]\.\s*/, "").trim()).filter(l => l.length > 10).slice(0, 3);
      setSuggestions(sugs);
      setScreen("result");
    } catch { setScreen("error"); }
  }

  function reset() {
    setScreen("welcome"); setLensIndex(0); setAnswers(["","","",""]); setCurrentAnswer("");
    setShowProbes(false); setShowTransition(false); setShowClosing(false);
    setPatternName(""); setPatternStatement(""); setPatternEvidence(""); setSuggestions([]);
  }

  const fade = { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.4s ease, transform 0.4s ease" };

  return (
    <div style={{ minHeight: "100vh", background: "#080807", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.5rem 1.5rem", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .sig-ta { width:100%; min-height:130px; background:#0d0c0a; border:1px solid #252320; border-radius:5px; color:#ddd8d0; font-family:'DM Sans',sans-serif; font-size:15px; line-height:1.75; padding:.9rem 1rem; resize:vertical; outline:none; box-sizing:border-box; margin-bottom:1rem; }
        .sig-ta:focus { border-color:#3a3830; }
        .sig-ta::placeholder { color:#3a3830; }
        .sig-btn { background:#c8b98a; color:#080807; border:none; border-radius:3px; padding:.8rem 1.8rem; font-family:'DM Sans',sans-serif; font-size:12px; letter-spacing:.1em; text-transform:uppercase; font-weight:500; cursor:pointer; }
        .sig-btn:hover { opacity:.82; }
        .sig-btn:disabled { opacity:.3; cursor:not-allowed; }
        .sig-ghost { background:transparent; color:#4a4840; border:1px solid #252320; border-radius:3px; padding:.65rem 1.3rem; font-family:'DM Sans',sans-serif; font-size:11px; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; margin-top:.75rem; display:block; }
        .sig-ghost:hover { color:#7a7468; border-color:#3a3830; }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{ position: "fixed", top: "-25%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "450px", background: "radial-gradient(ellipse, rgba(200,185,138,0.045) 0%, transparent 68%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "600px", width: "100%", ...fade }}>

        {screen === "welcome" && <>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: ".35em", textTransform: "uppercase", color: "#c8b98a", marginBottom: "3rem" }}>Signal</div>
          <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "clamp(1.85rem,4.5vw,2.75rem)", fontWeight: 400, lineHeight: 1.25, color: "#e2ddd5", margin: "0 0 1.25rem" }}>Do I actually know what I'm good at, independent of any role I've had up to this point?</h1>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", lineHeight: 1.8, color: "#b0a89e", margin: "0 0 2.5rem", fontWeight: 300 }}>What am I missing — and what does it mean for me moving forward?</p>
          <div style={{ height: "1px", background: "#1c1a17", margin: "0 0 2rem" }} />
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", lineHeight: 1.8, color: "#6a6460", margin: "0 0 2rem" }}>Four lenses. One pattern. Something you've always known but never quite named.</p>
          <button className="sig-btn" onClick={() => setScreen("lens")}>Begin</button>
        </>}

        {screen === "lens" && showTransition && <>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: ".35em", textTransform: "uppercase", color: "#c8b98a", marginBottom: "2.5rem" }}>Signal</div>
          <div style={{ display: "flex", gap: "5px", marginBottom: "2.25rem" }}>{LENSES.map((_, i) => <div key={i} style={{ width: "22px", height: "2px", borderRadius: "1px", background: i <= lensIndex ? "#c8b98a" : "#242220", transition: "background .3s" }} />)}</div>
          <div style={{ background: "#0d0c0a", border: "1px solid #1c1a17", borderRadius: "6px", padding: "1.75rem", marginBottom: "1.5rem" }}><p style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "1.1rem", lineHeight: 1.7, color: "#9a9488", margin: 0 }}>{TRANSITIONS[lensIndex]}</p></div>
          <button className="sig-btn" onClick={proceedFromTransition}>Continue</button>
        </>}

        {screen === "lens" && showClosing && <>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: ".35em", textTransform: "uppercase", color: "#c8b98a", marginBottom: "2.5rem" }}>Signal</div>
          <div style={{ display: "flex", gap: "5px", marginBottom: "2.25rem" }}>{LENSES.map((_, i) => <div key={i} style={{ width: "22px", height: "2px", borderRadius: "1px", background: "#c8b98a" }} />)}</div>
          <div style={{ background: "#0d0c0a", border: "1px solid #1c1a17", borderRadius: "6px", padding: "1.75rem", marginBottom: "1.5rem" }}><p style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "1.1rem", lineHeight: 1.7, color: "#9a9488", margin: 0 }}>{CLOSING}</p></div>
          <button className="sig-btn" onClick={runSynthesis}>Find my pattern</button>
        </>}

        {screen === "lens" && !showTransition && !showClosing && <>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: ".35em", textTransform: "uppercase", color: "#c8b98a", marginBottom: "2.5rem" }}>Signal</div>
          <div style={{ display: "flex", gap: "5px", marginBottom: "2.25rem" }}>{LENSES.map((_, i) => <div key={i} style={{ width: "22px", height: "2px", borderRadius: "1px", background: i < lensIndex ? "#c8b98a" : i === lensIndex ? "#5a5448" : "#242220", transition: "background .3s" }} />)}</div>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: ".22em", textTransform: "uppercase", color: "#4a4840", marginBottom: ".6rem", display: "block" }}>Lens {lensIndex + 1} of 4 — {lens.name}</span>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "#3e3c38", marginBottom: "1.5rem", lineHeight: 1.6 }}>{lens.subtitle}</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", lineHeight: 1.85, color: "#6a6460", margin: "0 0 1.75rem", fontStyle: "italic", borderLeft: "1px solid #1c1a17", paddingLeft: "1.1rem" }}>{lens.frame}</p>
          <p style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "clamp(1.05rem,2.2vw,1.28rem)", lineHeight: 1.65, color: "#ccc8be", margin: "0 0 1.5rem" }}>{lens.prompt}</p>
          {showProbes && <ul style={{ margin: "0 0 1.5rem", padding: 0, listStyle: "none" }}>{lens.probes.map((p, i) => <li key={i} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", lineHeight: 1.75, color: "#6a6460", padding: ".55rem 0", borderBottom: "1px solid #161412", display: "flex", gap: ".75rem", alignItems: "flex-start" }}><span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#3a3830", flexShrink: 0, marginTop: "9px" }} /><span>{p}</span></li>)}</ul>}
          <textarea className="sig-ta" value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)} placeholder="Take your time. There are no wrong answers here." />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <button className="sig-btn" disabled={currentAnswer.trim().length < 10} onClick={saveAndContinue}>{lensIndex < 3 ? "Next lens" : "See my pattern"}</button>
            {!showProbes && <button className="sig-ghost" onClick={() => setShowProbes(true)}>Show follow-up questions</button>}
          </div>
        </>}

        {screen === "loading" && <div style={{ textAlign: "center" }}>
          <div style={{ width: "28px", height: "28px", border: "1px solid #242220", borderTop: "1px solid #c8b98a", borderRadius: "50%", animation: "spin 1.2s linear infinite", margin: "0 auto" }} />
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", color: "#4a4840", marginTop: "1.25rem" }}>Finding your pattern</p>
        </div>}

        {screen === "error" && <>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: ".35em", textTransform: "uppercase", color: "#c8b98a", marginBottom: "2.5rem" }}>Signal</div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", color: "#9a9488", lineHeight: 1.8, marginBottom: "2rem" }}>Something went wrong generating your synthesis. This is usually temporary.</p>
          <button className="sig-btn" onClick={() => { setScreen("lens"); setShowClosing(true); }}>Try again</button>
        </>}

        {screen === "result" && <>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: ".35em", textTransform: "uppercase", color: "#c8b98a", marginBottom: "2.5rem" }}>Signal</div>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: ".22em", textTransform: "uppercase", color: "#4a4840", marginBottom: ".6rem", display: "block" }}>Your pattern</span>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "clamp(1.7rem,4vw,2.4rem)", fontWeight: 400, color: "#c8b98a", margin: "0 0 1.5rem", lineHeight: 1.2 }}>{patternName}</h2>
          <div style={{ height: "1px", background: "#1c1a17", margin: "0 0 1.5rem" }} />
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "15px", lineHeight: 1.85, color: "#9a9488", margin: "0 0 1rem" }}>{patternStatement}</p>
          {patternEvidence && patternEvidence.trim() !== patternStatement.trim() && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", lineHeight: 1.8, color: "#6a6460", margin: "0 0 1.5rem", fontStyle: "italic" }}>{patternEvidence}</p>}
          {suggestions.length > 0 && <>
            <div style={{ height: "1px", background: "#1c1a17", margin: "0 0 1.5rem" }} />
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: ".22em", textTransform: "uppercase", color: "#4a4840", marginBottom: ".75rem", display: "block" }}>Where to take it</span>
            <ul style={{ margin: "0 0 2rem", padding: 0, listStyle: "none" }}>
              {suggestions.map((s, i) => <li key={i} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", lineHeight: 1.75, color: "#7a7468", padding: ".85rem 0", borderBottom: "1px solid #161412", display: "flex", gap: "1rem", alignItems: "flex-start" }}><span style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "15px", color: "#2e2c28", flexShrink: 0, marginTop: "2px" }}>{i + 1}</span><span>{s}</span></li>)}
            </ul>
          </>}
          <div style={{ height: "1px", background: "#1c1a17", margin: "0 0 1.5rem" }} />
          <button className="sig-ghost" onClick={reset}>Start again</button>
        </>}
      </div>
    </div>
  );
}
