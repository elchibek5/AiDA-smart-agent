(function(){
  function qs(s){ return document.querySelector(s); }
  function setStatus(t){ const el = qs('#status'); if(el) el.textContent = t; }
  function push(text, who){
    const log = qs('#log'); if(!log) return;
    const d = document.createElement('div');
    d.className = 'bubble ' + (who==='you'?'you':'bot');
    d.textContent = text;
    log.appendChild(d); log.scrollTop = log.scrollHeight;
  }

  window.addEventListener('DOMContentLoaded', () => {
    const meta = qs('meta[name="aida-backend"]');
    const backendUrl = (meta && meta.content) || 'http://localhost:3001';

    const msg = qs('#msg');
    const sendBtn = qs('#send');
    const pingBtn = qs('#ping');

    setStatus('ready; backend=' + backendUrl);

    async function send(){
      const text = (msg && msg.value || '').trim();
      if(!text){ setStatus('empty'); return; }
      push(text, 'you'); if(msg){ msg.value=''; msg.focus(); }
      if(sendBtn) sendBtn.disabled = true;
      try{
        const res = await fetch(backendUrl + '/chat', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ message: text })
        });
        setStatus('POST /chat → ' + res.status);
        if(!res.ok){ throw new Error('HTTP ' + res.status + ': ' + await res.text()); }
        const data = await res.json();
        push(typeof data.reply==='string' ? data.reply : JSON.stringify(data), 'bot');
      }catch(e){
        push('Error: ' + (e && e.message || e), 'bot');
        setStatus('error: ' + (e && e.message || e));
      }finally{
        if(sendBtn) sendBtn.disabled = false;
      }
    }

    async function ping(){
      try{
        const res = await fetch(backendUrl + '/');
        setStatus('GET / → ' + res.status);
        push('Ping ' + res.status, 'bot');
      }catch(e){
        setStatus('ping error: ' + (e && e.message || e));
        push('Ping error: ' + (e && e.message || e), 'bot');
      }
    }

    if(sendBtn) sendBtn.addEventListener('click', send);
    if(msg) msg.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); send(); }});
    if(pingBtn) pingBtn.addEventListener('click', ping);
    if(msg) msg.focus();
  });
})();
