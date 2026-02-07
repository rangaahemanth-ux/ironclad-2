// REPLACE the API call section (around line 450) with:

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

    // Call BACKEND instead of Anthropic directly
    const res=await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        messages:apiMsgs,
        useSearch:useSearch,
        mode:mode
      })
    });

    if(!res.ok)throw new Error("API request failed");

    setLoading(false);
    setStreaming(true);

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
    
    setChats(p=>p.map(c=>c.id===chatId?{
      ...c,
      messages:[...c.messages,{
        role:"assistant",
        content:"Connection error. Please try again."
      }]
    }:c));
  }
},[active,chats,loading,streaming,mode]);