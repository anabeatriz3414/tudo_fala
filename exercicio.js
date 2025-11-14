  
    // ---------------- Configuração das 5 atividades (Seg → Sex) -----------------
    const ACTIVITIES = [
      {
        id: 'seg', dia: 'Segunda', titulo: 'Apresentação de 1 minuto',
        descricao: 'Fale por ~60 segundos sobre um tema proposto. Foque em começo-meio-fim e mantenha o ritmo constante.',
        prompts: [
          'Apresente-se para uma nova turma.',
          'Explique por que um hábito mudou sua vida.',
          'Conte sobre um desafio que você superou.',
          'Descreva um hobby seu para iniciantes.',
          'Fale sobre um lugar que marcou sua memória.'
        ]
      },
      {
        id: 'ter', dia: 'Terça', titulo: 'Palavra Surpresa',
        descricao: 'Crie uma fala usando as 3 palavras sorteadas. Criatividade e conexão entre ideias são o foco.',
        prompts: [
          'chuva, trem, amizade', 'energia, escola, futuro', 'café, viagem, paciência', 'tempo, mapa, escolha', 'livro, ponte, coragem'
        ]
      },
      {
        id: 'qua', dia: 'Quarta', titulo: 'Leitura com Emoção',
        descricao: 'Leia o pequeno texto com a emoção pedida. Varie tom e pausas para transmitir a intenção.',
        prompts: [
          'Texto: "Respire fundo. Toda montanha parece alta antes do primeiro passo." Emoção: encorajamento.',
          'Texto: "Eu esperei tanto por este momento!" Emoção: alegria.',
          'Texto: "Isso não é o fim, é um recomeço." Emoção: esperança.',
          'Texto: "Tenho más notícias." Emoção: seriedade.',
          'Texto: "Ei, tá tudo bem aí?" Emoção: empatia.'
        ]
      },
      {
        id: 'qui', dia: 'Quinta', titulo: 'Resumo Relâmpago (30–45s)',
        descricao: 'Resuma rapidamente um tema. Clareza > detalhes. Objetivo: 80–140 palavras por minuto.',
        prompts: [
          'Resuma um filme que você gosta sem spoilers.',
          'Explique o que é um buraco negro para uma criança.',
          'Resuma como funciona reciclagem na sua cidade.',
          'Explique por que dormir bem melhora a aprendizagem.',
          'Resuma seu dia de ontem em 40s.'
        ]
      },
      {
        id: 'sex', dia: 'Sexta', titulo: 'Perguntas Relâmpago (Q&A)',
        descricao: 'Responda com segurança 3 perguntas sorteadas, mantendo frases curtas e objetivas.',
        prompts: [
          'Qual conselho você daria para você mesmo há 5 anos? | Qual seu maior desafio atual? | O que te motiva a continuar?',
          'Se pudesse aprender algo novo em 1 mês, o que seria? | Como você lida com imprevistos? | Como define sucesso?',
          'O que te deixa nervoso ao falar em público? | Como você se prepara? | Qual falha te ensinou mais?'
        ]
      }
    ];

    const STORAGE_KEY = 'tudofala_semana_v1';

    // ---------------- Estado e utilidades -----------------
    const $ = (q, el=document) => el.querySelector(q);
    const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));
    const fmt = (s) => s.toString().padStart(2,'0');

    function loadState(){
      try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} }catch(e){ return {} }
    }
    function saveState(st){ localStorage.setItem(STORAGE_KEY, JSON.stringify(st)); }

    const state = loadState();
    if(!state.days){ state.days = {}; }

    // Inicializa estrutura de cada dia
    for(const a of ACTIVITIES){
      if(!state.days[a.id]){
        state.days[a.id] = {done:false, attempts:[], lastPrompt:null, metrics:null};
      }
    }
    saveState(state);

    // ---------------- UI: montar navegação -----------------
    const navEl = document.getElementById('nav-days');
    const progressEl = document.getElementById('progress');
    const doneCountEl = document.getElementById('done-count');
    const btnWeek = document.getElementById('btnWeek');

    function renderNav(activeId){
      navEl.innerHTML = '';
      const doneCount = ACTIVITIES.filter(a=>state.days[a.id].done).length;
      progressEl.style.width = (doneCount/5*100)+'%';
      doneCountEl.textContent = doneCount;
      btnWeek.disabled = doneCount<5;

      for(const a of ACTIVITIES){
        const day = document.createElement('div');
        day.className = 'day'+(a.id===activeId?' active':'');
        day.innerHTML = `
          <div>📅</div>
          <div>
            <div style="font-weight:700">${a.dia}</div>
            <div style="font-size:12px; opacity:.85">${a.titulo}</div>
          </div>
          <span class="status">${state.days[a.id].done? 'Concluída ✅':'Pendente'}</span>
        `;
        day.addEventListener('click',()=>openActivity(a.id));
        navEl.appendChild(day);
      }
    }

    // ---------------- Áudio: gravação e análise -----------------
    let mediaRecorder = null, audioChunks = [], recordingStartedAt = 0, timerInt = null, analyser, audioCtx, sourceNode;

    async function startRecording(){
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      sourceNode = audioCtx.createMediaStreamSource(stream);
      sourceNode.connect(analyser);

      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
      mediaRecorder.start();
      recordingStartedAt = Date.now();
      startTimer();
    }

    function stopRecording(){
      return new Promise(resolve=>{
        if(!mediaRecorder) return resolve(null);
        mediaRecorder.onstop = async () => {
          const blob = new Blob(audioChunks, {type:'audio/webm'});
          stopTimer();
          resolve(blob);
        };
        mediaRecorder.stop();
        if(sourceNode){try{sourceNode.disconnect();}catch{}}
        if(audioCtx){try{audioCtx.close();}catch{}}
      });
    }

    function startTimer(){
      const timer = document.getElementById('timer');
      timerInt = setInterval(()=>{
        const s = Math.floor((Date.now()-recordingStartedAt)/1000);
        timer.textContent = `⏱️ ${fmt(Math.floor(s/60))}:${fmt(s%60)}`;
      }, 250);
    }
    function stopTimer(){ clearInterval(timerInt); timerInt=null; }

    function getRMS(){
      // mede variação básica de volume durante ~200ms
      if(!analyser) return 0;
      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for(let i=0;i<bufferLength;i++){
        const v = (dataArray[i]-128)/128; sum += v*v;
      }
      return Math.sqrt(sum/bufferLength);
    }

    // Captura amostras de volume para medir variação
    const volumeSamples = [];
    setInterval(()=>{ if(analyser){ volumeSamples.push(getRMS()); if(volumeSamples.length>300) volumeSamples.shift(); } }, 200);

    // ---------------- Lógica de atividade -----------------
    const activityEl = document.getElementById('activity');
    const weekEl = document.getElementById('week');

    function choosePrompt(a){
      const arr = a.prompts; const pick = arr[Math.floor(Math.random()*arr.length)];
      return pick;
    }

    function analyzeTextFromAudioLength(durationSec, transcriptCandidate){
      // Como não fazemos STT aqui, estimamos pela entrada do usuário no campo opcional
      const text = (transcriptCandidate||'').trim();
      const words = text? text.split(/\s+/).length : Math.round(durationSec*2.0); // estimativa ~2 p/s se sem texto
      const wpm = Math.round(words / (durationSec/60));
      const muletasList = ['é','ééé','ah','ahn','tipo','né','então','uuh','hmm'];
      const muletas = text? (text.toLowerCase().match(new RegExp('\\b(' + muletasList.join('|') + ')\\b','g'))||[]).length : 0;
      const volVar = volumeSamples.length? Number((stddev(volumeSamples)*100).toFixed(1)) : 0; // %
      return {words, wpm, muletas, volVar};
    }

    function stddev(arr){
      if(!arr.length) return 0; const m = arr.reduce((a,b)=>a+b,0)/arr.length; const v = arr.reduce((a,b)=>a+(b-m)**2,0)/arr.length; return Math.sqrt(v);
    }

    function scoreHints({dur, wpm, muletas, volVar}){
      const hints = {best:[], improve:[], next:[]};
      // Duração
      if(dur>=55 && dur<=70){ hints.best.push('Boa precisão de tempo (~1 min).'); }
      else if(dur<50){ hints.improve.push('Fale por mais tempo: mire em ~60s.'); }
      else if(dur>75){ hints.improve.push('Encurte um pouco: tente ~60s.'); }

      // Ritmo
      if(wpm>=90 && wpm<=160){ hints.best.push('Ritmo dentro da faixa recomendada (90–160 WPM).'); }
      else if(wpm<90){ hints.improve.push('Acelere um pouco o ritmo (alvo: 90–160 WPM).'); }
      else { hints.improve.push('Fale um pouco mais devagar (alvo: 90–160 WPM).'); }

      // Muletas
      if(muletas===0){ hints.best.push('Sem muletas verbais. Excelente!'); }
      else if(muletas<=2){ hints.next.push('Reduza ainda mais muletas (treine pausas conscientes).'); }
      else { hints.improve.push('Excesso de muletas: pratique pausas em silêncio.'); }

      // Variação de volume
      if(volVar>=2 && volVar<=6){ hints.best.push('Boa variação de volume (natural).'); }
      else if(volVar<2){ hints.next.push('Projete mais a voz e varie a entonação.'); }
      else { hints.next.push('Estabilize o volume para evitar picos grandes.'); }

      return hints;
    }

    async function openActivity(id){
      weekEl.classList.remove('show');
      activityEl.innerHTML = '';

      const a = ACTIVITIES.find(x=>x.id===id);
      const st = state.days[id];

      const node = document.importNode(document.getElementById('tpl-activity').content, true);
      node.querySelector('[data-field="dia"]').textContent = a.dia;
      node.querySelector('[data-field="titulo"]').textContent = a.titulo;
      node.querySelector('[data-field="descricao"]').textContent = a.descricao;

      // prompt atual
      const promptText = st.lastPrompt || choosePrompt(a);
      st.lastPrompt = promptText; saveState(state);
      node.querySelector('[data-field="prompt"]').textContent = promptText;

      // refs
      const btnGen = node.querySelector('[data-act="genPrompt"]');
      const btnStart = node.querySelector('[data-act="startRec"]');
      const btnStop = node.querySelector('[data-act="stopRec"]');
      const btnSave = node.querySelector('[data-act="saveRec"]');
      const btnDone = node.querySelector('[data-act="markDone"]');
      const audioTag = node.querySelector('[data-field="audio"]');
      const durTag = node.querySelector('[data-field="dur"]');
      const wpmTag = node.querySelector('[data-field="wpm"]');
      const mulTag = node.querySelector('[data-field="muletas"]');
      const varTag = node.querySelector('[data-field="var"]');

      
      // Eventos
      btnGen.addEventListener('click',()=>{ st.lastPrompt = choosePrompt(a); saveState(state); openActivity(id); });

      btnStart.addEventListener('click', async ()=>{
        btnStart.disabled = true; btnStop.disabled = false; btnSave.disabled = true; btnDone.disabled = true; audioTag.classList.add('hidden');
        try{ await startRecording(); }catch(err){ alert('Permita o uso do microfone para gravar.'); btnStart.disabled=false; btnStop.disabled=true; }
      });

      btnStop.addEventListener('click', async ()=>{
        btnStop.disabled = true;
        const blob = await stopRecording();
        if(!blob){ btnStart.disabled=false; return; }
        const url = URL.createObjectURL(blob);
        audioTag.src = url; audioTag.classList.remove('hidden');
        btnSave.disabled = false; btnStart.disabled = false;

        // métricas provisórias
        const dur = Math.round((Date.now()-recordingStartedAt)/1000);
        const transcript = $('#transcript')?.value || '';
        const {wpm, muletas, volVar} = analyzeTextFromAudioLength(dur, transcript);
        durTag.textContent = `${fmt(Math.floor(dur/60))}:${fmt(dur%60)}`;
        wpmTag.textContent = `${wpm} wpm`;
        mulTag.textContent = `${muletas} ocorr.`;
        varTag.textContent = `${volVar}%`;

        // salva tentativa temporária
        st.lastBlob = blob; st.lastMetrics = {dur, wpm, muletas, volVar}; saveState(state);
      });

      btnSave.addEventListener('click', ()=>{
        if(!st.lastBlob){ alert('Grave algo antes de salvar.'); return; }
        const attempt = {
          createdAt: new Date().toISOString(),
          prompt: st.lastPrompt,
          metrics: st.lastMetrics
        };
        st.attempts.push(attempt);
        st.metrics = attempt.metrics; // última válida
        delete st.lastBlob; delete st.lastMetrics;
        saveState(state);
        btnDone.disabled = false;
        alert('Tentativa salva! Você já pode marcar como concluída.');
      });

      btnDone.addEventListener('click', ()=>{
        if(!st.metrics){ alert('Salve uma tentativa antes.'); return; }
        const hints = scoreHints({
          dur: st.metrics.dur,
          wpm: st.metrics.wpm,
          muletas: st.metrics.muletas,
          volVar: st.metrics.volVar
        });
        st.done = true; st.hints = hints; saveState(state);
        renderNav(id);
        alert('Atividade marcada como concluída!');
      });

      activityEl.appendChild(node);
      renderNav(id);
    }

    // ---------------- Semana / Resumo -----------------
    btnWeek.addEventListener('click', ()=> openWeek());

    function openWeek(){
      const allDone = ACTIVITIES.every(a=> state.days[a.id].done);
      if(!allDone){ alert('Conclua as 5 atividades para ver o desempenho.'); return; }
      activityEl.innerHTML = '';
      weekEl.innerHTML = '';

      const node = document.importNode(document.getElementById('tpl-week').content, true);

      // Agregar métricas
      const metrics = ACTIVITIES.map(a=> state.days[a.id].metrics);
      const avg = (k)=> Math.round(metrics.reduce((s,m)=> s+(m?.[k]||0),0)/metrics.length);
      const tempoMedio = avg('dur');
      const wpmMedio = avg('wpm');
      const muletasMedio = Math.round(metrics.reduce((s,m)=> s+(m?.muletas||0),0) / (metrics.reduce((s,m)=> s+(m? m.dur:0),0)/60));
      const varMedio = avg('volVar');

      node.querySelector('[data-week="tempo"]').textContent = `${fmt(Math.floor(tempoMedio/60))}:${fmt(tempoMedio%60)}`;
      node.querySelector('[data-week="wpm"]').textContent = `${wpmMedio} wpm`;
      node.querySelector('[data-week="muletas"]').textContent = `${muletasMedio} / min`;
      node.querySelector('[data-week="var"]').textContent = `${varMedio}%`;

      // Pontos fortes / melhorar a partir dos hints diários
      const best = [], improve = [], next = [];
      for(const a of ACTIVITIES){
        const h = state.days[a.id].hints || {best:[], improve:[], next:[]};
        best.push(...h.best); improve.push(...h.improve); next.push(...h.next);
      }
      const uniq = arr => Array.from(new Set(arr));

      const bestList = node.getElementById('best-list');
      const improveList = node.getElementById('improve-list');
      const todoList = node.getElementById('todo-list');
      for(const t of uniq(best)) addLi(bestList, t, 'ok');
      for(const t of uniq(improve)) addLi(improveList, t, 'bad');
      for(const t of uniq(next)) addLi(todoList, t, 'warn');

      node.getElementById('resetWeek').addEventListener('click', ()=>{
        if(confirm('Tem certeza que deseja reiniciar a semana? Isso apagará o progresso.')){
          localStorage.removeItem(STORAGE_KEY); location.reload();
        }
      });

      weekEl.appendChild(node);
      weekEl.classList.add('show');
      renderNav();
    }

    function addLi(ul, text, type){
      const li = document.createElement('li');
      li.textContent = text;
      li.style.margin = '6px 0';
      if(type==='ok') li.style.color = 'var(--ok)';
      if(type==='warn') li.style.color = 'var(--warn)';
      if(type==='bad') li.style.color = 'var(--bad)';
      ul.appendChild(li);
    }

    // ---------------- Inicialização -----------------
    renderNav('seg');
    openActivity('seg');
  