import { useState, useRef, useEffect, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   IRONCLAD JURIST — OPTIMIZED with PROPER ANIMATIONS
   ══════════════════════════════════════════════════════════════ */

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

const MODES = [
  { id:"research", label:"Research", icon:"🔬", prompt:"", search:false },
  { id:"project", label:"Project", icon:"📄", prompt:"Generate a comprehensive law project in Hyderabad format. Topic: ", search:false },
  { id:"moot", label:"Moot Court", icon:"⚔️", prompt:"Prepare moot court arguments for petitioner and respondent. Topic: ", search:false },
  { id:"exam", label:"Exam Prep", icon:"📝", prompt:"Exam preparation with IRAC answers and key points. Topic: ", search:false },
  { id:"latest", label:"Latest", icon:"📰", prompt:"Search for and analyze the latest judgments on: ", search:true },
];

const JOKES = [
  "Why did the lawyer bring a ladder to court? The case was on another level! 😂",
  "Judge: 'I'll hold you in contempt!' Me: 'Get in line, my mom got there first.' 💀",
  "Law school is like riding a bike. Except the bike is on fire. Everything is on fire. 🔥",
  "My professor said 'ignorance of the law is no excuse.' So I dropped out. Checkmate. 😎",
  "Good lawyer knows the law. Great lawyer knows the judge. 🤝",
  "Law school motto: Sleep is for the acquitted. 😴⚖️",
  "My research method: Google → panic → SCC Online → panic more → cite anyway 📚",
  "Article 21 = Right to Life. My exam schedule violates it. Filing a PIL. 📝",
  "Studying criminal law at 3am makes you feel like you're planning crimes 🕐",
  "Moot strategy: speak confidently, cite aggressively, pray internally 🗣️🙏",
];

const PET_MSGS = [
  "Tan! Drink water NOW! 💧","Eyes need rest! Look far for 20s! 👀","Stretch! Stand up! 🧘‍♀️",
  "Eat a snack, not just stress! 🍪","Sit up straight! 🪑","Have you eaten?? 🍽️",
  "BLINK! Eyes drying! 👁️","3 deep breaths now. 🌬️","Take 5 min break! ⏰",
  "Roll your shoulders! 💆‍♀️","WATER. NOW. 💧💧","Great posture = great grades! 😤",
];

const STIT = ["PROVISION","RATIO DECIDENDI","INDIAN PRECEDENT","FOREIGN PRECEDENT","COMPARATIVE ANALYSIS","DEEP ANALYSIS","PRACTICAL APPLICATION","RECOMMENDED SOURCES"];
const SC = {"PROVISION":"#5A9CD0","RATIO DECIDENDI":"#6AAAD4","INDIAN PRECEDENT":"#5098C0","FOREIGN PRECEDENT":"#48A088","COMPARATIVE ANALYSIS":"#6888C0","DEEP ANALYSIS":"#7098C8","PRACTICAL APPLICATION":"#8098B0","RECOMMENDED SOURCES":"#5890A8"};

function parseSections(t){
  const p=new RegExp(`^(${STIT.join("|")})\\s*$`,"gm");
  const ms=[];let m;
  while((m=p.exec(t))!==null)ms.push({title:m[1],si:m.index+m[0].length});
  if(!ms.length)return null;
  const s=[];
  for(let i=0;i<ms.length;i++){
    const e=i<ms.length-1?ms[i+1].si-ms[i+1].title.length:t.length;
    const c=t.slice(ms[i].si,e).trim();
    if(c)s.push({title:ms[i].title,content:c});
  }
  return s.length?s:null;
}

function extractCases(t){
  const p=/([A-Z][a-zA-Z\s.&']+(?:v\.?\s+|vs\.?\s+)[A-Z][a-zA-Z\s.&']+)/g;
  const cs=new Set();let m;
  while((m=p.exec(t))!==null){
    const n=m[1].trim();
    if(n.length>10&&n.length<90)cs.add(n);
  }
  return[...cs];
}

function genTitle(t){
  const w=t.trim().split(/\s+/).slice(0,6).join(" ");
  return w.length>40?w.slice(0,40)+"...":w;
}

function generatePDF(content){
  const w=window.open("","_blank");
  if(!w){alert("Please allow popups to generate PDF");return;}
  const secs=parseSections(content),cases=extractCases(content);
  
  w.document.write(`<!DOCTYPE html><html><head><title>Legal Research</title><style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lora:wght@400;600&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Cormorant Garamond',serif;color:#1a1a2e;padding:50px 60px;line-height:1.9;max-width:780px;margin:0 auto}
    h1{font-size:22px;text-align:center}
    h2{font-size:15px;font-weight:700;color:#2a4a6a;margin:24px 0 10px;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #d0d8e0;padding-bottom:5px}
    p{font-family:'Lora',serif;font-size:13px;margin-bottom:10px;text-align:justify;line-height:1.9}
    .hd{text-align:center;margin-bottom:35px;padding-bottom:20px;border-bottom:2px solid #2a4a6a}
    .tc{margin:20px 0;padding:15px;background:#f8f9fb;border-radius:6px}
    .tc h3{font-size:13px;color:#2a4a6a;margin-bottom:6px}
    .ti{font-size:11px;color:#4a6a8a;padding:2px 0;font-style:italic}
    .ft{margin-top:40px;padding-top:12px;border-top:2px solid #2a4a6a;font-size:9px;color:#888;text-align:center}
    @media print{body{padding:30px 45px}}
  </style></head><body>`);
  
  w.document.write(`<div class="hd"><h1>The Ironclad Jurist</h1><p style="font-size:11px;color:#666;letter-spacing:2px">LEGAL RESEARCH</p><p style="font-size:10px;color:#888;margin-top:8px">${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</p></div>`);
  
  if(cases.length){
    w.document.write(`<div class="tc"><h3>Table of Cases</h3>`);
    cases.forEach((c,i)=>w.document.write(`<div class="ti">${i+1}. ${c}</div>`));
    w.document.write(`</div>`);
  }
  
  if(secs)secs.forEach(s=>{
    w.document.write(`<h2>${s.title}</h2>`);
    s.content.split("\n").forEach(l=>{if(l.trim())w.document.write(`<p>${l}</p>`)});
  });
  else content.split("\n").forEach(l=>{if(l.trim())w.document.write(`<p>${l}</p>`)});
  
  w.document.write(`<div class="ft">The Ironclad Jurist — Verify on SCC Online / Manupatra<br>AI-generated — review before submission</div></body></html>`);
  w.document.close();
  setTimeout(()=>w.print(),400);
}

/* ═══ UI COMPONENTS ═══ */
function SectionBlock({title,content,index}){
  const[open,setOpen]=useState(true);
  const c=SC[title]||"#6AAAD4";
  
  return(
    <div style={{
      marginBottom:6,
      borderLeft:`3px solid ${c}40`,
      background:`${c}06`,
      borderRadius:"0 10px 10px 0",
      animation:`secIn .4s ease ${index*.05}s both`
    }}>
      <button 
        onClick={()=>setOpen(!open)} 
        style={{
          width:"100%",
          display:"flex",
          alignItems:"center",
          gap:8,
          padding:"10px 16px",
          border:"none",
          background:"transparent",
          cursor:"pointer",
          fontSize:13,
          fontWeight:700,
          color:c,
          letterSpacing:".08em",
          textTransform:"uppercase",
          textAlign:"left"
        }}
      >
        <span style={{flex:1}}>{title}</span>
        <span style={{
          fontSize:10,
          opacity:.4,
          transform:open?"rotate(0)":"rotate(-90deg)",
          transition:"transform .3s"
        }}>▾</span>
      </button>
      {open&&<div style={{
        padding:"0 16px 14px 20px",
        fontSize:15,
        lineHeight:2,
        color:"#C8D8E8",
        whiteSpace:"pre-wrap"
      }}>{content}</div>}
    </div>
  );
}

function Msg({msg,onPDF,onAction,isStreaming}){
  if(msg.role==="user")return(
    <div style={{maxWidth:780,margin:"0 auto",padding:"16px 20px",animation:"msgUp .3s ease both"}}>
      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{
          width:32,
          height:32,
          borderRadius:10,
          background:"linear-gradient(135deg,#1A3A5A,#2A5070)",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          fontSize:14,
          flexShrink:0
        }}>T</div>
        <div style={{
          flex:1,
          paddingTop:4,
          fontSize:15,
          lineHeight:1.8,
          color:"#D0E0F0"
        }}>{msg.content}</div>
      </div>
    </div>
  );
  
  const secs=!isStreaming?parseSections(msg.content):null;
  const cases=!isStreaming?extractCases(msg.content):[];
  const ab={
    padding:"5px 12px",
    borderRadius:10,
    border:"1px solid rgba(106,170,212,.08)",
    background:"rgba(106,170,212,.02)",
    fontSize:12,
    color:"#5A90B0",
    cursor:"pointer",
    transition:"all .2s"
  };
  
  return(
    <div style={{maxWidth:780,margin:"0 auto",padding:"16px 20px",animation:"msgUp .35s ease both"}}>
      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{
          width:32,
          height:32,
          borderRadius:10,
          background:"linear-gradient(135deg,#0E2A40,#1A3854)",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          fontSize:14,
          flexShrink:0,
          border:"1px solid rgba(106,170,212,.12)"
        }}>⚖️</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{
            fontSize:11,
            color:"#4A7AA8",
            letterSpacing:".1em",
            textTransform:"uppercase",
            marginBottom:8,
            fontWeight:600
          }}>Ironclad Jurist</div>
          {secs?(
            <div style={{
              background:"rgba(106,170,212,.02)",
              borderRadius:12,
              padding:10,
              border:"1px solid rgba(106,170,212,.03)"
            }}>
              {secs.map((s,i)=><SectionBlock key={i} title={s.title} content={s.content} index={i}/>)}
            </div>
          ):(
            <div style={{
              fontSize:15,
              lineHeight:2,
              color:"#C0D4E8",
              whiteSpace:"pre-wrap"
            }}>
              {msg.content}
              {isStreaming&&<span style={{
                display:"inline-block",
                width:2,
                height:16,
                background:"#6AAAD4",
                marginLeft:2,
                animation:"blink 1s infinite"
              }}/>}
            </div>
          )}
          {cases.length>0&&<CasesPanel cases={cases}/>}
          {!isStreaming&&msg.content.length>50&&(
            <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
              <button 
                onClick={()=>onPDF(msg.content)} 
                style={ab} 
                onMouseEnter={e=>e.currentTarget.style.background="rgba(106,170,212,.08)"} 
                onMouseLeave={e=>e.currentTarget.style.background="rgba(106,170,212,.02)"}
              >📥 PDF</button>
              {[
                {l:"🌍 Foreign Cases",p:"Add 3+ foreign cases from UK, US, Australia, Canada, EU on this topic."},
                {l:"📄 Full Project",p:"Expand into 30-50 page project with chapters and bibliography."},
                {l:"🎓 Simplify",p:"Re-explain simply for a first-year student."},
                {l:"👨‍⚖️ Advanced",p:"Rewrite at Senior Advocate level with deeper analysis."},
                {l:"🔴 Critique",p:"As strict professor, red-flag weaknesses and gaps."},
                {l:"🗣️ Hindi",p:"Explain in Hindi keeping English legal terms."}
              ].map((a,i)=>(
                <button 
                  key={i} 
                  onClick={()=>onAction(a.p)} 
                  style={ab} 
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(106,170,212,.08)"} 
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(106,170,212,.02)"}
                >{a.l}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CasesPanel({cases}){
  const[o,setO]=useState(false);
  return(
    <div style={{marginTop:6}}>
      <button 
        onClick={()=>setO(!o)} 
        style={{
          padding:"5px 12px",
          borderRadius:10,
          border:"1px solid rgba(106,170,212,.1)",
          background:"rgba(106,170,212,.03)",
          fontSize:12,
          color:"#5A9AC0",
          cursor:"pointer"
        }}
      >📋 Cases ({cases.length}) {o?"▴":"▾"}</button>
      {o&&<div style={{
        marginTop:4,
        padding:"8px 12px",
        background:"rgba(106,170,212,.03)",
        borderRadius:10,
        border:"1px solid rgba(106,170,212,.05)"
      }}>
        {cases.map((c,i)=><div key={i} style={{
          fontSize:13,
          color:"#88B0D0",
          padding:"3px 0",
          borderBottom:i<cases.length-1?"1px solid rgba(106,170,212,.04)":"none",
          fontStyle:"italic"
        }}>{i+1}. {c}</div>)}
      </div>}
    </div>
  );
}

/* ═══ IMPROVED PUPPY WITH REAL WALKING ANIMATION ═══ */
function Puppy({name,cw}){
  const[pos,setPos]=useState({x:60,y:200});
  const[toy,setToy]=useState({x:40,y:350});
  const[flip,setFlip]=useState(false);
  const[st,setSt]=useState("idle");
  const[fr,setFr]=useState(0);
  const[care,setCare]=useState("");
  const[showC,setShowC]=useState(false);
  const[hearts,setHearts]=useState([]);
  const[step,setStep]=useState(0); // Walking step counter
  const tgt=useRef({x:60,y:300});
  const tk=useRef(0);

  useEffect(()=>{
    const id=setInterval(()=>{
      setFr(f=>f+1);
      if(st==="walking"||st==="chasing")setStep(s=>(s+1)%4);
    },60);
    return()=>clearInterval(id);
  },[st]);
  
  useEffect(()=>{
    const pop=()=>{
      setCare(PET_MSGS[Math.floor(Math.random()*PET_MSGS.length)]);
      setShowC(true);
      setTimeout(()=>setShowC(false),5000);
    };
    const t=setTimeout(pop,15000);
    const iv=setInterval(pop,100000+Math.random()*80000);
    return()=>{clearTimeout(t);clearInterval(iv)};
  },[]);
  
  useEffect(()=>{
    const iv=setInterval(()=>{
      setToy({
        x:Math.random()>.5?cw-60-Math.random()*50:20+Math.random()*50,
        y:100+Math.random()*350
      });
    },5000+Math.random()*3000);
    return()=>clearInterval(iv);
  },[cw]);

  useEffect(()=>{
    let id;
    const tick=()=>{
      tk.current++;
      setPos(p=>{
        const dx=toy.x-p.x,dy=toy.y-p.y,d=Math.sqrt(dx*dx+dy*dy);
        let nx=p.x,ny=p.y,ns=st;
        
        if(d<20){
          ns="playing";
          nx+=Math.sin(tk.current*.1)*1.2;
          ny+=Math.cos(tk.current*.1)*1.2;
        }
        else if(d<300){
          ns="chasing";
          const sp=.8+Math.sin(tk.current*.04)*.2;
          nx+=(dx/d)*sp;
          ny+=(dy/d)*sp;
          if(dx>0)setFlip(false);else setFlip(true);
        }
        else{
          if(tk.current%180===0)tgt.current={
            x:Math.random()>.5?20+Math.random()*70:cw-80+Math.random()*40,
            y:100+Math.random()*350
          };
          const tx=tgt.current.x-p.x,ty=tgt.current.y-p.y,td=Math.sqrt(tx*tx+ty*ty);
          
          if(td>5){
            ns="walking";
            nx+=(tx/td)*.5;
            ny+=(ty/td)*.5;
            if(tx>0)setFlip(false);else setFlip(true);
          }else{
            ns=tk.current%500>430?"sleeping":"idle";
          }
        }
        
        ny=Math.max(80,Math.min(520,ny));
        const mid=cw/2;
        if(nx>110&&nx<cw-110)nx=nx<mid?100:cw-100;
        
        if(ns!==st)setSt(ns);
        return{x:nx,y:ny};
      });
      id=requestAnimationFrame(tick);
    };
    id=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(id);
  },[st,toy,cw]);

  useEffect(()=>{
    if(hearts.length){
      const t=setTimeout(()=>setHearts(h=>h.slice(1)),1200);
      return()=>clearTimeout(t);
    }
  },[hearts]);
  
  const feed=()=>setHearts(h=>[...h,{id:Date.now(),x:Math.random()*20-10}]);
  
  // IMPROVED ANIMATIONS
  const wag=Math.sin(fr*.08)*(st==="playing"?30:st==="chasing"?22:st==="walking"?15:10);
  const ear=Math.sin(fr*.1)*(st==="playing"?10:4);
  const hp=st==="playing"||st==="chasing";
  const bn=hp?Math.abs(Math.sin(fr*.12))*4:st==="walking"?Math.abs(Math.sin(fr*.2))*2:0;
  
  // WALKING LEG ANIMATION - actual leg movement!
  const legCycle=step/4*Math.PI*2;
  const frontLeft=st==="walking"||st==="chasing"?Math.sin(legCycle)*4:0;
  const frontRight=st==="walking"||st==="chasing"?Math.sin(legCycle+Math.PI)*4:0;
  const backLeft=st==="walking"||st==="chasing"?Math.sin(legCycle+Math.PI)*4:0;
  const backRight=st==="walking"||st==="chasing"?Math.sin(legCycle)*4:0;

  return(
    <>
      {/* TOY */}
      <div style={{
        position:"fixed",
        left:toy.x-8,
        top:toy.y-8,
        zIndex:49,
        pointerEvents:"none",
        transition:"left 2s,top 2s"
      }}>
        <svg width="20" height="20" viewBox="0 0 30 30">
          <ellipse cx="15" cy="16" rx="7" ry="5" fill="#777"/>
          <circle cx="15" cy="12" r="4.5" fill="#888"/>
          <circle cx="12" cy="11" r=".8" fill="#222"/>
          <circle cx="18" cy="11" r=".8" fill="#222"/>
          <ellipse cx="15" cy="13" rx="1.2" ry=".8" fill="#E09090"/>
          <circle cx="10" cy="8" r="2.5" fill="#999"/>
          <circle cx="20" cy="8" r="2.5" fill="#999"/>
          <path d="M22 15Q26 13 24 18" stroke="#777" strokeWidth="1.2" fill="none"/>
        </svg>
      </div>
      
      {/* PUPPY */}
      <div 
        onClick={feed} 
        style={{
          position:"fixed",
          left:pos.x-25,
          top:pos.y-25,
          zIndex:50,
          cursor:"pointer",
          transform:`scaleX(${flip?-1:1}) translateY(${-bn}px)`,
          transition:"transform .08s"
        }} 
        title={`Click ${name}!`}
      >
        {hearts.map(h=><div key={h.id} style={{
          position:"absolute",
          top:-12,
          left:`calc(50% + ${h.x}px)`,
          fontSize:13,
          animation:"heartFloat 1.2s ease-out forwards",
          pointerEvents:"none"
        }}>💙</div>)}
        
        <svg width="50" height="50" viewBox="0 0 80 80">
          {/* Body */}
          <ellipse cx="40" cy="48" rx="17" ry="11" fill="#F0E4D4"/>
          {/* Head */}
          <circle cx="40" cy="30" r="12" fill="#F5EDE0"/>
          {/* Ears */}
          <ellipse cx="30" cy="22" rx="5" ry="9" fill="#E0D0BC" transform={`rotate(${-16+ear} 30 22)`}/>
          <ellipse cx="50" cy="22" rx="5" ry="9" fill="#E0D0BC" transform={`rotate(${16-ear} 50 22)`}/>
          
          {/* Eyes */}
          {st==="sleeping"?
            <>
              <line x1="34" y1="28" x2="38" y2="28" stroke="#5A4A3A" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="42" y1="28" x2="46" y2="28" stroke="#5A4A3A" strokeWidth="1.6" strokeLinecap="round"/>
            </>:
            hp?
            <>
              <path d="M34 28Q36 25 38 28" stroke="#5A4A3A" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
              <path d="M42 28Q44 25 46 28" stroke="#5A4A3A" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
            </>:
            <>
              <circle cx="36" cy="28" r="2" fill="#4A3A2A"/>
              <circle cx="44" cy="28" r="2" fill="#4A3A2A"/>
              <circle cx="36.7" cy="27.3" r=".6" fill="white"/>
              <circle cx="44.7" cy="27.3" r=".6" fill="white"/>
            </>
          }
          
          {/* Nose */}
          <ellipse cx="40" cy="33" rx="2.3" ry="1.8" fill="#5A4A3A"/>
          
          {/* Mouth */}
          {hp?
            <>
              <path d="M36 35Q40 40 44 35" stroke="#5A4A3A" strokeWidth=".9" fill="none" strokeLinecap="round"/>
              <ellipse cx="40" cy="38" rx="1.8" ry="2.8" fill="#E89898"/>
            </>:
            st==="sleeping"?
            <path d="M38 35Q40 36 42 35" stroke="#7A6A5A" strokeWidth=".7" fill="none"/>:
            <path d="M37 35Q40 37 43 35" stroke="#6A5A4A" strokeWidth=".7" fill="none"/>
          }
          
          {/* LEGS - ANIMATED WALKING! */}
          <rect x="28" y={55+frontLeft} width="5.5" height="10" rx="2.8" fill="#E8DCC8"/>
          <rect x="34" y={55+frontRight} width="5.5" height="10" rx="2.8" fill="#E8DCC8"/>
          <rect x="41" y={55+backLeft} width="5.5" height="10" rx="2.8" fill="#E8DCC8"/>
          <rect x="47" y={55+backRight} width="5.5" height="10" rx="2.8" fill="#E8DCC8"/>
          
          {/* Tail */}
          <path d={`M57 43Q${64+wag} ${33} ${61+wag} ${25}`} stroke="#E0D0BC" strokeWidth="3" fill="none" strokeLinecap="round"/>
          
          {/* Sleeping Z's */}
          {st==="sleeping"&&<text x="52" y={17-Math.sin(fr*.03)*3} fontSize="10" fill="#6AAAD4" opacity=".5">z z</text>}
        </svg>
        
        {/* Status badge */}
        <div style={{
          position:"absolute",
          bottom:-2,
          left:"50%",
          transform:`translateX(-50%) scaleX(${flip?-1:1})`,
          background:"rgba(6,12,22,.85)",
          padding:"1px 7px",
          borderRadius:6,
          border:"1px solid rgba(106,170,212,.1)",
          fontSize:8,
          color:"#5A90B0",
          whiteSpace:"nowrap"
        }}>
          {name} {st==="chasing"?"🏃":st==="playing"?"🎉":st==="sleeping"?"😴":st==="walking"?"🚶":"🐾"}
        </div>
      </div>
      
      {/* Care message */}
      {showC&&<div style={{
        position:"fixed",
        left:Math.max(10,Math.min(pos.x-80,window.innerWidth-210)),
        top:pos.y-55,
        zIndex:51,
        background:"linear-gradient(135deg,#1A3050,#142840)",
        border:"1px solid rgba(106,170,212,.15)",
        borderRadius:12,
        padding:"8px 14px",
        maxWidth:200,
        fontSize:12,
        color:"#90C0E0",
        lineHeight:1.5,
        textAlign:"center",
        animation:"msgUp .3s ease both",
        boxShadow:"0 6px 20px rgba(0,0,0,.4)",
        pointerEvents:"none"
      }}>{care}</div>}
    </>
  );
}

/* ═══ QUIZ ═══ */
const QZ=[
  {q:"BNS 2023 replaced?",o:["IPC 1860","CrPC 1973","IEA 1872","CPC 1908"],a:0},
  {q:"Right to Life — Article?",o:["14","19","21","32"],a:2},
  {q:"BNSS replaced?",o:["IPC","CrPC 1973","Evidence Act","Contract Act"],a:1},
  {q:"Kesavananda established?",o:["Privacy","Basic Structure","Due Process","Equality"],a:1},
  {q:"BSA replaced?",o:["IPC","CrPC","Evidence Act 1872","Sale of Goods"],a:2},
  {q:"Habeas Corpus means?",o:["We command","Certify","Have the body","By what authority"],a:2},
  {q:"Vishaka relates to?",o:["Child rights","Sexual harassment","Environment","Property"],a:1},
  {q:"Maneka Gandhi expanded?",o:["Art. 14","Art. 19","Art. 21","All three"],a:3},
  {q:"Art. 32 grants?",o:["Equality","Free speech","Constitutional remedies","Education"],a:2},
  {q:"Ratio vs Obiter — binds?",o:["Both","Neither","Only Ratio","Only Obiter"],a:2},
];

function Quiz({onClose}){
  const[qs]=useState(()=>{
    const s=[...QZ];
    for(let i=s.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [s[i],s[j]]=[s[j],s[i]];
    }
    return s.slice(0,8);
  });
  const[idx,setIdx]=useState(0);
  const[sc,setSc]=useState(0);
  const[sel,setSel]=useState(null);
  const[done,setDone]=useState(false);
  const[sh,setSh]=useState(false);
  
  const pick=i=>{
    if(sh)return;
    setSel(i);
    setSh(true);
    if(i===qs[idx].a)setSc(s=>s+1);
    setTimeout(()=>{
      if(idx<qs.length-1){
        setIdx(x=>x+1);
        setSel(null);
        setSh(false);
      }else{
        setDone(true);
      }
    },800);
  };
  
  const ov={
    position:"fixed",
    inset:0,
    zIndex:1000,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    background:"rgba(4,8,16,.85)",
    backdropFilter:"blur(12px)"
  };
  
  if(done)return(
    <div style={ov}>
      <div style={{
        background:"linear-gradient(155deg,#0C1822,#101A28)",
        borderRadius:18,
        padding:34,
        textAlign:"center",
        maxWidth:340,
        border:"1px solid rgba(106,170,212,.08)"
      }}>
        <div style={{fontSize:40,marginBottom:8}}>
          {sc>=6?"🌟":sc>=4?"✨":"📚"}
        </div>
        <h3 style={{fontSize:20,color:"#A8CCE8",margin:"0 0 4px"}}>
          {sc>=6?"Brilliant, Tan!":sc>=4?"Well done!":"Keep studying!"}
        </h3>
        <p style={{fontSize:28,color:"#6AAAD4",margin:"0 0 16px",fontWeight:700}}>
          {sc}/{qs.length}
        </p>
        <button onClick={onClose} style={{
          padding:"10px 26px",
          borderRadius:14,
          border:"none",
          cursor:"pointer",
          background:"linear-gradient(135deg,#1A3A5A,#2A4A6A)",
          color:"#C0D8F0",
          fontSize:14
        }}>Close</button>
      </div>
    </div>
  );
  
  const q=qs[idx];
  
  return(
    <div style={ov} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{
        background:"linear-gradient(155deg,#0C1822,#101A28)",
        borderRadius:18,
        padding:26,
        maxWidth:400,
        width:"90%",
        border:"1px solid rgba(106,170,212,.08)",
        animation:"scIn .3s ease both"
      }}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
          <span style={{fontSize:12,color:"#5A90B0"}}>Legal Quiz</span>
          <span style={{fontSize:14,color:"#6AAAD4",fontWeight:600}}>
            {idx+1}/{qs.length}
          </span>
        </div>
        <div style={{
          background:"rgba(106,170,212,.04)",
          borderRadius:12,
          padding:14,
          marginBottom:14
        }}>
          <p style={{fontSize:17,color:"#C0D8F0",margin:0,lineHeight:1.5}}>{q.q}</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {q.o.map((o,i)=>{
            let bg="rgba(106,170,212,.03)",bd="rgba(106,170,212,.06)",cl="#90B8D0";
            if(sh){
              if(i===q.a){
                bg="rgba(80,184,128,.08)";
                bd="rgba(80,184,128,.2)";
                cl="#60C898";
              }else if(i===sel&&i!==q.a){
                bg="rgba(200,80,80,.08)";
                bd="rgba(200,80,80,.2)";
                cl="#C87070";
              }
            }
            return<button key={i} onClick={()=>pick(i)} style={{
              padding:"10px 14px",
              borderRadius:10,
              border:`1px solid ${bd}`,
              background:bg,
              cursor:sh?"default":"pointer",
              textAlign:"left",
              fontSize:14,
              color:cl,
              transition:"all .2s"
            }}>{o}</button>;
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══ NAMING ═══ */
function Naming({onName}){
  const[n,setN]=useState("");
  
  return(
    <div style={{
      position:"fixed",
      inset:0,
      zIndex:2000,
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      background:"linear-gradient(165deg,#040810,#081018,#0A1420)"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Lora:wght@0,400;0,500;0,600&display=swap');
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{textAlign:"center",animation:"fadeUp .7s ease both",maxWidth:380,padding:"0 24px"}}>
        <div style={{animation:"bob 3s ease-in-out infinite",marginBottom:16}}>
          <svg width="90" height="90" viewBox="0 0 80 80">
            <ellipse cx="40" cy="48" rx="18" ry="12" fill="#F0E4D4"/>
            <circle cx="40" cy="30" r="12" fill="#F5EDE0"/>
            <ellipse cx="30" cy="22" rx="5" ry="9" fill="#E0D0BC" transform="rotate(-10 30 22)"/>
            <ellipse cx="50" cy="22" rx="5" ry="9" fill="#E0D0BC" transform="rotate(10 50 22)"/>
            <path d="M34 28Q36 25 38 28" stroke="#5A4A3A" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
            <path d="M42 28Q44 25 46 28" stroke="#5A4A3A" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
            <ellipse cx="40" cy="33" rx="2.3" ry="1.8" fill="#5A4A3A"/>
            <path d="M36 35Q40 40 44 35" stroke="#5A4A3A" strokeWidth=".9" fill="none" strokeLinecap="round"/>
            <ellipse cx="40" cy="38" rx="1.8" ry="2.8" fill="#E89898"/>
            <path d="M57 43Q67 33 64 25" stroke="#E0D0BC" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 style={{fontSize:28,fontWeight:300,color:"#A8CCE8",margin:"0 0 6px"}}>
          Ironclad Jurist
        </h1>
        <p style={{fontSize:14,color:"#4A7090",margin:"0 0 6px"}}>Your legal AI, Tan</p>
        <p style={{fontSize:13,color:"#2E5070",margin:"0 0 20px"}}>Name your study buddy first!</p>
        <input 
          value={n} 
          onChange={e=>setN(e.target.value)} 
          onKeyDown={e=>{if(e.key==="Enter"&&n.trim())onName(n.trim())}} 
          placeholder="Name your puppy..." 
          autoFocus
          style={{
            width:"100%",
            padding:"14px 20px",
            borderRadius:14,
            border:"1px solid rgba(106,170,212,.12)",
            background:"rgba(106,170,212,.04)",
            color:"#B8D0E8",
            fontSize:16,
            textAlign:"center",
            outline:"none",
            boxSizing:"border-box"
          }}
        />
        <button 
          onClick={()=>{if(n.trim())onName(n.trim())}} 
          disabled={!n.trim()} 
          style={{
            marginTop:12,
            padding:"12px 36px",
            borderRadius:18,
            border:"none",
            cursor:n.trim()?"pointer":"default",
            background:n.trim()?"linear-gradient(135deg,#1A3A5A,#2A5070)":"rgba(106,170,212,.08)",
            color:n.trim()?"#C8E0F8":"#2A4A6A",
            fontSize:15
          }}
        >Start</button>
      </div>
    </div>
  );
}

/* ═══ SIDEBAR ═══ */
function Sidebar({chats,activeId,onSelect,onNew,onDelete,petName,onQuiz,onJoke,open}){
  return(
    <div style={{
      width:open?260:0,
      minWidth:open?260:0,
      height:"100%",
      background:"#080C14",
      borderRight:"1px solid rgba(106,170,212,.04)",
      display:"flex",
      flexDirection:"column",
      overflow:"hidden",
      transition:"width .25s,min-width .25s"
    }}>
      <div style={{padding:"16px 16px 12px",borderBottom:"1px solid rgba(106,170,212,.04)"}}>
        <div style={{fontSize:16,color:"#6AAAD4",fontWeight:600}}>⚖️ Ironclad Jurist</div>
        <div style={{fontSize:10,color:"#2A4868",letterSpacing:".1em"}}>FOR TAN · LEGAL AI</div>
      </div>
      <div style={{padding:"10px 12px"}}>
        <button onClick={onNew} style={{
          width:"100%",
          padding:"10px 14px",
          borderRadius:10,
          border:"1px solid rgba(106,170,212,.1)",
          background:"rgba(106,170,212,.04)",
          color:"#7AB0D0",
          fontSize:13,
          cursor:"pointer",
          display:"flex",
          alignItems:"center",
          gap:8,
          transition:"all .2s"
        }}
        onMouseEnter={e=>e.currentTarget.style.background="rgba(106,170,212,.1)"} 
        onMouseLeave={e=>e.currentTarget.style.background="rgba(106,170,212,.04)"}>
          <span style={{fontSize:16}}>+</span> New Chat
        </button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 8px"}}>
        <div style={{
          fontSize:10,
          color:"#2A4A6A",
          padding:"8px 8px 4px",
          letterSpacing:".08em",
          textTransform:"uppercase"
        }}>Recent</div>
        {chats.map(c=>(
          <div 
            key={c.id} 
            onClick={()=>onSelect(c.id)} 
            style={{
              padding:"9px 10px",
              borderRadius:8,
              marginBottom:2,
              cursor:"pointer",
              background:c.id===activeId?"rgba(106,170,212,.08)":"transparent",
              display:"flex",
              alignItems:"center",
              justifyContent:"space-between",
              transition:"background .2s"
            }}
            onMouseEnter={e=>{if(c.id!==activeId)e.currentTarget.style.background="rgba(106,170,212,.04)"}} 
            onMouseLeave={e=>{if(c.id!==activeId)e.currentTarget.style.background="transparent"}}
          >
            <span style={{
              fontSize:13,
              color:c.id===activeId?"#90C0E0":"#4A7898",
              overflow:"hidden",
              textOverflow:"ellipsis",
              whiteSpace:"nowrap",
              flex:1
            }}>{c.title}</span>
            <button 
              onClick={e=>{e.stopPropagation();onDelete(c.id)}} 
              style={{
                background:"none",
                border:"none",
                fontSize:11,
                color:"#2A4A6A",
                cursor:"pointer",
                padding:"2px 4px",
                opacity:.5
              }}
            >×</button>
          </div>
        ))}
      </div>
      <div style={{
        padding:"10px 12px",
        borderTop:"1px solid rgba(106,170,212,.04)",
        display:"flex",
        flexDirection:"column",
        gap:4
      }}>
        <button onClick={onQuiz} style={{
          width:"100%",
          padding:"8px 12px",
          borderRadius:8,
          border:"1px solid rgba(106,170,212,.06)",
          background:"transparent",
          color:"#4A7898",
          fontSize:12,
          cursor:"pointer",
          textAlign:"left"
        }}
        onMouseEnter={e=>e.currentTarget.style.background="rgba(106,170,212,.04)"} 
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          🎮 Legal Quiz
        </button>
        <button onClick={onJoke} style={{
          width:"100%",
          padding:"8px 12px",
          borderRadius:8,
          border:"1px solid rgba(106,170,212,.06)",
          background:"transparent",
          color:"#4A7898",
          fontSize:12,
          cursor:"pointer",
          textAlign:"left"
        }}
        onMouseEnter={e=>e.currentTarget.style.background="rgba(106,170,212,.04)"} 
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          😂 Make Tan Laugh
        </button>
        <div style={{fontSize:10,color:"#1A3040",textAlign:"center",paddingTop:4}}>
          {petName} is watching! 🐾
        </div>
      </div>
    </div>
  );
}

/* ═══ MAIN APP ═══ */
function App(){
  const[pet,setPet]=useState(null);
  const[chats,setChats]=useState([]);
  const[active,setActive]=useState(null);
  const[loading,setLoading]=useState(false);
  const[streaming,setStreaming]=useState(false);
  const[input,setInput]=useState("");
  const[mode,setMode]=useState("research");
  const[quiz,setQuiz]=useState(false);
  const[joke,setJoke]=useState("");
  const[showJ,setShowJ]=useState(false);
  const[sbOpen,setSbOpen]=useState(true);
  const[cw,setCw]=useState(1200);
  const endRef=useRef(null);
  const inputRef=useRef(null);

  const msgs=(chats.find(c=>c.id===active)?.messages)||[];

  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior:"smooth"});
  },[chats,active,loading,streaming]);
  
  useEffect(()=>{
    const u=()=>setCw(window.innerWidth);
    u();
    window.addEventListener("resize",u);
    return()=>window.removeEventListener("resize",u);
  },[]);

  const newChat=useCallback(()=>{
    const id=Date.now().toString();
    setChats(p=>[{id,title:"New chat",messages:[]},...p]);
    setActive(id);
    setInput("");
    setTimeout(()=>inputRef.current?.focus(),100);
    return id;
  },[]);

  const delChat=useCallback(id=>{
    setChats(p=>p.filter(c=>c.id!==id));
    if(active===id){
      const r=chats.filter(c=>c.id!==id);
      setActive(r.length?r[0].id:null);
    }
  },[active,chats]);

  /* ═══ OPTIMIZED STREAMING SEND ═══ */
  const send=useCallback(async(text,extraPrompt)=>{
    if(!text.trim()||loading||streaming)return;
    
    let chatId=active;
    if(!chatId){
      chatId=Date.now().toString();
      setChats(p=>[{id:chatId,title:genTitle(text),messages:[]},...p]);
      setActive(chatId);
    }

    const mp=MODES.find(m=>m.id===mode);
    const content=extraPrompt?`${extraPrompt}\n\nQuery: ${text}`:(mp?.prompt?mp.prompt+text:text);
    const useSearch=mp?.search||false;

    // Add user message immediately
    setChats(p=>p.map(c=>c.id===chatId?{
      ...c,
      title:c.title==="New chat"?genTitle(text):c.title,
      messages:[...c.messages,{role:"user",content:text.trim()}]
    }:c));
    
    setInput("");
    setLoading(true);

    try{
      const prev=chats.find(c=>c.id===chatId)?.messages||[];
      const apiMsgs=[...prev,{role:"user",content:content.trim()}].map(m=>({
        role:m.role,
        content:m.content
      }));

      const body={
        model:"claude-sonnet-4-20250514",
        max_tokens:2000, // Reduced for faster responses
        system:SYS,
        messages:apiMsgs,
        stream:true
      };
      
      if(useSearch)body.tools=[{type:"web_search_20250305",name:"web_search"}];

      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(body)
      });

      if(!res.ok)throw new Error("API request failed");

      setLoading(false);
      setStreaming(true);

      // Add empty assistant message
      setChats(p=>p.map(c=>c.id===chatId?{
        ...c,
        messages:[...c.messages,{role:"assistant",content:""}]
      }:c));

      const reader=res.body.getReader();
      const decoder=new TextDecoder();
      let buffer="";
      let fullText="";

      while(true){
        const{done,value}=await reader.read();
        if(done)break;
        
        buffer+=decoder.decode(value,{stream:true});
        const lines=buffer.split("\n");
        buffer=lines.pop()||"";

        for(const line of lines){
          if(!line.startsWith("data: "))continue;
          const data=line.slice(6);
          if(data==="[DONE]")continue;
          
          try{
            const evt=JSON.parse(data);
            if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta"){
              fullText+=evt.delta.text;
              
              // Update UI with streaming text
              setChats(p=>p.map(c=>{
                if(c.id!==chatId)return c;
                const ms=[...c.messages];
                ms[ms.length-1]={role:"assistant",content:fullText};
                return{...c,messages:ms};
              }));
            }
          }catch{}
        }
      }
      
      setStreaming(false);
      
      // Final update
      if(fullText){
        setChats(p=>p.map(c=>{
          if(c.id!==chatId)return c;
          const ms=[...c.messages];
          ms[ms.length-1]={role:"assistant",content:fullText};
          return{...c,messages:ms};
        }));
      }
    }catch(err){
      console.error("Send error:",err);
      setLoading(false);
      setStreaming(false);
      
      // Add error message
      setChats(p=>p.map(c=>c.id===chatId?{
        ...c,
        messages:[...c.messages,{
          role:"assistant",
          content:"Connection error. Please try again."
        }]
      }:c));
    }
  },[active,chats,loading,streaming,mode]);

  const triggerJoke=()=>{
    setJoke(JOKES[Math.floor(Math.random()*JOKES.length)]);
    setShowJ(true);
    setTimeout(()=>setShowJ(false),10000);
  };

  if(!pet)return<Naming onName={setPet}/>;

  return(
    <div style={{
      width:"100%",
      height:"100vh",
      display:"flex",
      background:"#060A12",
      fontFamily:"'Cormorant Garamond',Georgia,serif",
      overflow:"hidden",
      position:"relative",
      cursor:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Ctext y='22' font-size='20'%3E⚖️%3C/text%3E%3C/svg%3E") 14 14, auto`
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Lora:wght@0,400;0,500;0,600&display=swap');
        @keyframes msgUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes secIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
        @keyframes lilypulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}
        @keyframes scIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        @keyframes heartFloat{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-35px) scale(.4)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        *{box-sizing:border-box;scrollbar-width:thin;scrollbar-color:#1A2A3A #060A12}
        *::-webkit-scrollbar{width:5px}
        *::-webkit-scrollbar-track{background:transparent}
        *::-webkit-scrollbar-thumb{background:#1A2A3A;border-radius:3px}
        textarea:focus,input:focus{outline:none}
        button{font-family:inherit;cursor:pointer}
      `}</style>

      <Puppy name={pet} cw={cw}/>
      {quiz&&<Quiz onClose={()=>setQuiz(false)}/>}

      <Sidebar 
        chats={chats} 
        activeId={active} 
        onSelect={setActive} 
        onNew={newChat} 
        onDelete={delChat} 
        petName={pet} 
        onQuiz={()=>setQuiz(true)} 
        onJoke={triggerJoke} 
        open={sbOpen}
      />

      <div style={{flex:1,display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#080E18,#0A1420)",position:"relative"}}>
        {/* Top bar */}
        <div style={{
          padding:"8px 18px",
          borderBottom:"1px solid rgba(106,170,212,.03)",
          background:"rgba(6,10,18,.95)",
          backdropFilter:"blur(12px)",
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          zIndex:10
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button 
              onClick={()=>setSbOpen(!sbOpen)} 
              style={{
                background:"none",
                border:"none",
                fontSize:18,
                color:"#4A7898",
                padding:"2px 6px"
              }}
            >☰</button>
            <div style={{display:"flex",gap:3}}>
              {MODES.map(m=>(
                <button 
                  key={m.id} 
                  onClick={()=>setMode(m.id)} 
                  style={{
                    padding:"5px 10px",
                    borderRadius:8,
                    fontSize:11,
                    border:mode===m.id?"1px solid rgba(106,170,212,.15)":"1px solid transparent",
                    background:mode===m.id?"rgba(106,170,212,.08)":"transparent",
                    color:mode===m.id?"#90C0E0":"#3A6080",
                    transition:"all .2s"
                  }}
                >{m.icon} {m.label}</button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {streaming&&<span style={{fontSize:11,color:"#6AAAD4",animation:"lilypulse 1.3s infinite"}}>● Streaming</span>}
            <div style={{width:6,height:6,borderRadius:"50%",background:"#50B880"}}/>
            <span style={{fontSize:10,color:"#408868"}}>LIVE</span>
          </div>
        </div>

        {showJ&&<div style={{
          padding:"10px 20px",
          background:"rgba(106,170,212,.04)",
          borderBottom:"1px solid rgba(106,170,212,.04)",
          animation:"msgUp .3s ease both"
        }}>
          <div style={{
            maxWidth:780,
            margin:"0 auto",
            fontSize:14,
            color:"#70A8C8",
            fontStyle:"italic",
            textAlign:"center"
          }}>{joke}</div>
        </div>}

        {/* Chat */}
        <div style={{flex:1,overflowY:"auto",paddingBottom:20}}>
          {(!active||!msgs.length)&&!loading&&!streaming&&(
            <div style={{
              maxWidth:600,
              margin:"0 auto",
              padding:"60px 20px",
              textAlign:"center",
              animation:"slideUp .6s ease both"
            }}>
              <div style={{fontSize:40,marginBottom:12}}>⚖️</div>
              <h1 style={{fontSize:28,fontWeight:300,color:"#88B8D8",margin:"0 0 8px"}}>
                What are you working on, Tan?
              </h1>
              <p style={{fontSize:14,color:"#3A6088",margin:"0 0 30px",lineHeight:1.6}}>
                {pet} is running around! Ask anything.
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxWidth:500,margin:"0 auto"}}>
                {[
                  {q:"Explain Basic Structure doctrine after Kesavananda Bharati",icon:"🏛️"},
                  {q:"Moot court arguments on right to privacy under Article 21",icon:"⚔️"},
                  {q:"Project on cybercrime under IT Act and BNS",icon:"📄"},
                  {q:"Latest SC judgments on environmental protection",icon:"📰"}
                ].map((s,i)=>(
                  <button 
                    key={i} 
                    onClick={()=>{
                      setInput(s.q);
                      if(!active)newChat();
                      setTimeout(()=>inputRef.current?.focus(),150);
                    }}
                    style={{
                      padding:"14px",
                      background:"rgba(106,170,212,.02)",
                      border:"1px solid rgba(106,170,212,.05)",
                      borderRadius:12,
                      textAlign:"left",
                      fontSize:13,
                      color:"#6A9CC0",
                      lineHeight:1.5,
                      transition:"all .25s"
                    }}
                    onMouseEnter={e=>{
                      e.currentTarget.style.background="rgba(106,170,212,.07)";
                      e.currentTarget.style.transform="translateY(-2px)";
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.background="rgba(106,170,212,.02)";
                      e.currentTarget.style.transform="none";
                    }}
                  >
                    <span style={{fontSize:18,display:"block",marginBottom:6}}>{s.icon}</span>
                    {s.q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {msgs.map((m,i)=><Msg 
            key={`${active}-${i}`} 
            msg={m} 
            onPDF={generatePDF} 
            onAction={p=>send(m.content,p)} 
            isStreaming={streaming&&i===msgs.length-1&&m.role==="assistant"}
          />)}
          
          {loading&&(
            <div style={{maxWidth:780,margin:"0 auto",padding:"16px 20px",animation:"msgUp .3s ease both"}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{
                  width:32,
                  height:32,
                  borderRadius:10,
                  background:"linear-gradient(135deg,#0E2A40,#1A3854)",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontSize:14,
                  border:"1px solid rgba(106,170,212,.12)"
                }}>⚖️</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{display:"flex",gap:3}}>
                    {[0,1,2].map(i=><div key={i} style={{
                      width:5,
                      height:5,
                      borderRadius:"50%",
                      background:"#5A90B0",
                      animation:`lilypulse 1.3s ease ${i*.2}s infinite`
                    }}/>)}
                  </div>
                  <span style={{fontSize:13,color:"#5A90B0",fontStyle:"italic"}}>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>

        {/* Input */}
        <div style={{
          padding:"12px 20px 16px",
          borderTop:"1px solid rgba(106,170,212,.03)",
          background:"rgba(6,10,18,.95)",
          backdropFilter:"blur(12px)"
        }}>
          <div style={{maxWidth:780,margin:"0 auto"}}>
            <div style={{
              display:"flex",
              alignItems:"flex-end",
              gap:8,
              background:"rgba(106,170,212,.03)",
              border:"1px solid rgba(106,170,212,.06)",
              borderRadius:16,
              padding:"4px 4px 4px 16px",
              transition:"all .3s"
            }}
            onFocus={e=>{
              e.currentTarget.style.borderColor="rgba(106,170,212,.18)";
              e.currentTarget.style.boxShadow="0 0 20px rgba(106,170,212,.05)";
            }}
            onBlur={e=>{
              e.currentTarget.style.borderColor="rgba(106,170,212,.06)";
              e.currentTarget.style.boxShadow="none";
            }}>
              <textarea 
                ref={inputRef} 
                value={input}
                onChange={e=>{
                  setInput(e.target.value);
                  e.target.style.height="auto";
                  e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";
                }}
                onKeyDown={e=>{
                  if(e.key==="Enter"&&!e.shiftKey){
                    e.preventDefault();
                    if(input.trim()){
                      let cid=active;
                      if(!cid)cid=newChat();
                      setTimeout(()=>send(input),50);
                    }
                  }
                }}
                placeholder="Ask anything, Tan..." 
                rows={1}
                style={{
                  flex:1,
                  border:"none",
                  background:"transparent",
                  color:"#A8C8E0",
                  fontSize:15,
                  lineHeight:1.6,
                  resize:"none",
                  padding:"8px 0",
                  maxHeight:120
                }}
              />
              <button 
                onClick={()=>{
                  if(input.trim()&&!loading&&!streaming){
                    let cid=active;
                    if(!cid)cid=newChat();
                    setTimeout(()=>send(input),50);
                  }
                }} 
                disabled={!input.trim()||loading||streaming}
                style={{
                  width:40,
                  height:40,
                  borderRadius:12,
                  border:"none",
                  background:input.trim()&&!loading&&!streaming?"linear-gradient(135deg,#1A3A5A,#2A5070)":"rgba(106,170,212,.06)",
                  color:input.trim()&&!loading&&!streaming?"#C8E0F8":"#1A3050",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  transition:"all .25s",
                  flexShrink:0
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div style={{textAlign:"center",marginTop:6}}>
              <span style={{fontSize:10,color:"#1A2A3A"}}>
                Ironclad Jurist can make mistakes. Verify on SCC Online / Manupatra.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
