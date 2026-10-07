/* =========================================================
   PAINEL DA ISABELLE BUENO
   Lê e grava no Supabase (conexão em ../js/banco.js).
   Cada aba é uma função "mostra...()" mais abaixo.
   ========================================================= */
(async function(){
  "use strict";

  /* ---------------------------------------------------------
     0. PRIMEIRA COISA: CONFERIR A SESSÃO
     Sem sessão, vai para o login. A página só aparece depois.
     --------------------------------------------------------- */
  const banco = window.banco;
  if (!banco){
    erroFatal("Não consegui carregar a conexão com o banco. Confira a sua internet e recarregue a página.");
    return;
  }
  let sessao = null;
  try {
    const r = await banco.auth.getSession();
    sessao = r && r.data ? r.data.session : null;
  } catch (e){ sessao = null; }
  if (!sessao){ location.replace("../login/"); return; }

  banco.auth.onAuthStateChange((evento) => {
    if (evento === "SIGNED_OUT") location.replace("../login/");
  });

  document.body.classList.add("pronto");

  function erroFatal(texto){
    document.body.innerHTML = '<div class="erro-fatal"><p>' + texto + '</p><p><a class="btn" href="../login/">Ir para o login</a></p></div>';
    document.body.classList.add("pronto");
  }

  /* ---------------------------------------------------------
     1. AJUDANTES
     --------------------------------------------------------- */
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const num = (x) => { const n = Number(x); return Number.isFinite(n) ? n : 0; };
  const texto = (x) => (x == null ? "" : String(x));
  const moeda = (x) => num(x).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const inteiro = (x) => Math.round(num(x)).toLocaleString("pt-BR");
  const pct = (parte, total) => (num(total) > 0 ? Math.round(num(parte) / num(total) * 100) : 0);

  /* Datas sempre no horário local, no formato aaaa-mm-dd */
  const chaveData = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const lerData = (s) => {
    if (!s) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s));
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  };
  const hojeData = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const diasEntre = (a, b) => Math.round((b - a) / 86400000); // b menos a, em dias
  const dataBR = (s) => { const d = lerData(s); return d ? d.toLocaleDateString("pt-BR") : ""; };
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];

  const ICONES = {
    mais: '<path d="M12 5v14M5 12h14"/>',
    editar: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    lixo: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    olho: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    olhoFechado: '<path d="M17.9 17.9A10.4 10.4 0 0 1 12 20c-7 0-11-8-11-8a19.8 19.8 0 0 1 5.1-5.9M9.9 4.2A10 10 0 0 1 12 4c7 0 11 8 11 8a19.6 19.6 0 0 1-2.2 3.2M1 1l22 22"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/>',
    alca: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
    estrela: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    baixar: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    busca: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    whats: '<path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.3A8.5 8.5 0 1 1 20.5 11.6Z"/>',
    insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>',
    link: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>',
    esquerda: '<path d="M15 18l-6-6 6-6"/>',
    direita: '<path d="M9 18l6-6-6-6"/>',
    fechar: '<path d="M18 6L6 18M6 6l12 12"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    play: '<path d="M6 4v16l14-8z"/>'
  };
  const ic = (nome) => '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + (ICONES[nome] || "") + '</svg>';
  const pilulaExemplo = (linha) => (linha && linha.exemplo ? '<span class="pilula p-exemplo">exemplo</span>' : "");

  let toastTimer = null;
  function toast(msg, tipo){
    let el = $(".toast");
    if (!el){ el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    el.textContent = msg;
    el.className = "toast" + (tipo === "erro" ? " erro" : "");
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, tipo === "erro" ? 6000 : 2600);
  }

  /* ---------------------------------------------------------
     2. DADOS: carregar e salvar, sem quebrar se faltar algo
     --------------------------------------------------------- */
  const dados = { videos: [], marcas: [], calendario: [], campanhas: [], marcados: [], visitas: [], roteiros: [], configuracoes: [] };
  const faltando = {}; // tabela -> texto do aviso

  function explicaErro(tabela, erro){
    const msg = texto(erro && erro.message);
    const codigo = texto(erro && erro.code);
    const col = /'([^']+)' column/.exec(msg) || /column "?([a-z_]+)"? /i.exec(msg);
    if (codigo === "42P01" || codigo === "PGRST205" || /does not exist|Could not find the table/i.test(msg)){
      const arquivo = (tabela === "roteiros" || tabela === "configuracoes") ? "sql-roteiros.sql" : "banco.sql";
      return 'A tabela "' + tabela + '" não existe no banco. Rode o arquivo ' + arquivo + ' no SQL Editor do Supabase.';
    }
    if (codigo === "PGRST204" || codigo === "42703" || col){
      return 'Falta o campo "' + (col ? col[1] : "?") + '" na tabela "' + tabela + '". Rode o banco.sql de novo no Supabase.';
    }
    if (codigo === "42501" || /permission|row-level security|JWT/i.test(msg)){
      return 'Sem permissão na tabela "' + tabela + '". Confira se você entrou com bellevital@icloud.com e se o banco.sql foi rodado.';
    }
    if (/fetch|network|Failed/i.test(msg)){
      return "Sem conexão com o banco agora. Confira a sua internet.";
    }
    return 'Não consegui usar a tabela "' + tabela + '": ' + msg;
  }

  const codigosErro = {}; // tabela -> código técnico do erro (ajuda a descobrir o problema)

  function mostraAvisos(){
    const tabelas = Object.keys(faltando);
    const semTabela = tabelas.filter((t) => /não existe no banco/.test(faltando[t]));
    let html = "";
    if (semTabela.length >= 3){
      /* Faltam várias tabelas: quase sempre é o banco.sql que ainda não foi rodado. Um aviso só. */
      html += '<div class="aviso"><span><strong>O banco ainda não tem as tabelas do painel</strong> (' + semTabela.map(esc).join(", ") + ').<br>' +
        'No Supabase, abra <strong>SQL Editor</strong>, clique em <strong>New query</strong>, cole o arquivo <strong>banco.sql</strong> inteiro e clique em <strong>Run</strong>. ' +
        'Deve aparecer "Success. No rows returned". Se aparecer uma mensagem de erro em vermelho, me mande um print dela.' +
        '<br><span style="font-weight:500;opacity:.8">Código: ' + esc(codigosErro[semTabela[0]] || "?") + '</span></span>' +
        '<button type="button" class="btn pequeno" data-recarregar style="margin-left:auto;font-size:11.5px">Já rodei, tentar de novo</button></div>';
    } else {
      html += semTabela.map((t) => avisoUnico(t)).join("");
    }
    html += tabelas.filter((t) => !semTabela.includes(t)).map((t) => avisoUnico(t)).join("");
    $("#avisos").innerHTML = html;
  }
  function avisoUnico(t){
    return '<div class="aviso" data-tabela="' + esc(t) + '"><span>' + esc(faltando[t]) + ' O resto do painel continua funcionando.' +
      (codigosErro[t] ? ' <span style="font-weight:500;opacity:.8">(código ' + esc(codigosErro[t]) + ')</span>' : "") + '</span>' +
      '<button type="button" data-fechar-aviso aria-label="Fechar aviso">×</button></div>';
  }
  $("#avisos").addEventListener("click", async (e) => {
    if (e.target.closest("[data-recarregar]")){
      $("#avisos").innerHTML = '<div class="aviso leve"><span>Conferindo o banco de novo...</span></div>';
      await carregarTudo();
      trocaAba();
      if (!Object.keys(faltando).length) toast("Tudo certo! O banco está ligado.");
      return;
    }
    const b = e.target.closest("[data-fechar-aviso]");
    if (b) b.closest(".aviso").remove();
  });

  async function carregar(tabela){
    try {
      let linhas = [];
      if (tabela === "visitas"){
        /* Só os últimos 14 dias, em páginas de 1000 */
        const inicio = hojeData(); inicio.setDate(inicio.getDate() - 13);
        for (let de = 0; de < 50000; de += 1000){
          const r = await banco.from("visitas").select("*").gte("data", inicio.toISOString()).range(de, de + 999);
          if (r.error) throw r.error;
          const pagina = r.data || [];
          linhas = linhas.concat(pagina);
          if (pagina.length < 1000) break;
        }
      } else {
        const r = await banco.from(tabela).select("*");
        if (r.error) throw r.error;
        linhas = r.data || [];
      }
      dados[tabela] = Array.isArray(linhas) ? linhas : [];
      delete faltando[tabela];
      delete codigosErro[tabela];
    } catch (erro){
      dados[tabela] = [];
      faltando[tabela] = explicaErro(tabela, erro);
      codigosErro[tabela] = texto(erro && (erro.code || erro.message)).slice(0, 60);
    }
  }

  async function carregarTudo(){
    await Promise.all(Object.keys(dados).map(carregar));
    mostraAvisos();
  }

  /* Limpa os valores do formulário antes de mandar para o banco */
  function limpa(valores){
    const saida = {};
    Object.keys(valores).forEach((k) => {
      let v = valores[k];
      if (typeof v === "string"){ v = v.trim(); if (v === "") v = null; }
      saida[k] = v;
    });
    return saida;
  }

  async function salvar(tabela, valores, id){
    try {
      const q = (id != null)
        ? banco.from(tabela).update(limpa(valores)).eq("id", id).select()
        : banco.from(tabela).insert(limpa(valores)).select();
      const r = await q;
      if (r.error) throw r.error;
      const linha = (r.data && r.data[0]) || null;
      if (linha){
        const i = dados[tabela].findIndex((x) => x.id === linha.id);
        if (i >= 0) dados[tabela][i] = linha; else dados[tabela].push(linha);
      }
      return linha || true;
    } catch (erro){
      toast(explicaErro(tabela, erro), "erro");
      return null;
    }
  }

  async function apagar(tabela, id){
    try {
      const r = await banco.from(tabela).delete().eq("id", id);
      if (r.error) throw r.error;
      dados[tabela] = dados[tabela].filter((x) => x.id !== id);
      return true;
    } catch (erro){
      toast(explicaErro(tabela, erro), "erro");
      return false;
    }
  }

  /* ---------------------------------------------------------
     3. JANELA (modal) E FORMULÁRIO GENÉRICO
     --------------------------------------------------------- */
  let janelaAberta = null;
  function abrirJanela({ titulo, corpo, rodape, larga }){
    fecharJanela();
    const fundo = document.createElement("div");
    fundo.className = "janela-fundo";
    fundo.innerHTML =
      '<div class="janela' + (larga ? " larga" : "") + '" role="dialog" aria-modal="true" aria-labelledby="janela-titulo">' +
        '<div class="janela-topo"><h2 id="janela-titulo">' + titulo + '</h2>' +
          '<button class="btn-icone" type="button" data-fechar aria-label="Fechar">' + ic("fechar") + '</button></div>' +
        '<div class="janela-corpo">' + corpo + '</div>' +
        (rodape ? '<div class="janela-rodape">' + rodape + '</div>' : "") +
      '</div>';
    fundo.addEventListener("click", (e) => { if (e.target === fundo || e.target.closest("[data-fechar]")) fecharJanela(); });
    document.body.appendChild(fundo);
    janelaAberta = { fundo, focoAntes: document.activeElement };
    const primeiro = fundo.querySelector("input, select, textarea, button:not([data-fechar])") || fundo.querySelector("button");
    if (primeiro) primeiro.focus();
    return fundo;
  }
  function fecharJanela(){
    if (!janelaAberta) return;
    janelaAberta.fundo.remove();
    if (janelaAberta.focoAntes && janelaAberta.focoAntes.focus) janelaAberta.focoAntes.focus();
    janelaAberta = null;
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { fecharJanela(); fechaGaveta(); } });

  /* campos: [{ nome, rotulo, tipo: text|email|tel|url|number|date|select|textarea|checkbox, opcoes, obrigatorio, dica, inteira, lista }] */
  function abrirFormulario({ titulo, campos, valores, aoSalvar, aoApagar, aviso }){
    valores = valores || {};
    const html = '<form class="form-grade" novalidate>' + (aviso ? '<div class="aviso-form" role="status">' + esc(aviso) + '</div>' : "") + campos.map((c, i) => {
      const id = "campo-" + c.nome + "-" + i;
      const v = valores[c.nome];
      const obrig = c.obrigatorio ? " required" : "";
      let entrada;
      if (c.tipo === "select"){
        entrada = '<select id="' + id + '" name="' + c.nome + '"' + obrig + '>' +
          c.opcoes.map((o) => {
            const valor = typeof o === "object" ? o.valor : o;
            const rotulo = typeof o === "object" ? o.rotulo : o;
            return '<option value="' + esc(valor) + '"' + (texto(v) === valor ? " selected" : "") + '>' + esc(rotulo) + '</option>';
          }).join("") + '</select>';
      } else if (c.tipo === "textarea"){
        entrada = '<textarea id="' + id + '" name="' + c.nome + '"' + obrig + (c.alto ? ' class="alto"' : "") + '>' + esc(v) + '</textarea>';
      } else if (c.tipo === "checkbox"){
        return '<div class="campo check inteira"><input type="checkbox" id="' + id + '" name="' + c.nome + '"' + (v ? " checked" : "") + '><label for="' + id + '">' + esc(c.rotulo) + '</label></div>';
      } else {
        const lista = c.lista ? ' list="' + id + '-lista"' : "";
        const passo = c.tipo === "number" ? ' step="' + (c.passo || "any") + '" min="0"' : "";
        entrada = '<input type="' + (c.tipo || "text") + '" id="' + id + '" name="' + c.nome + '" value="' + esc(v) + '"' + obrig + lista + passo + '>' +
          (c.lista ? '<datalist id="' + id + '-lista">' + c.lista.map((o) => '<option value="' + esc(o) + '">').join("") + '</datalist>' : "");
      }
      return '<div class="campo' + (c.inteira ? " inteira" : "") + '"><label for="' + id + '">' + esc(c.rotulo) + (c.obrigatorio ? " *" : "") + '</label>' + entrada +
        (c.dica ? '<div class="dica">' + esc(c.dica) + '</div>' : "") + '</div>';
    }).join("") + '<button type="submit" hidden></button></form>';

    const rodape =
      (aoApagar ? '<button class="btn perigo" type="button" data-apagar>' + ic("lixo") + 'Apagar</button>' : "") +
      '<span class="espaco"></span><button class="btn" type="button" data-fechar>Cancelar</button>' +
      '<button class="btn principal-btn" type="button" data-salvar>Salvar</button>';
    const fundo = abrirJanela({ titulo: esc(titulo), corpo: html, rodape });
    const form = $("form", fundo);

    async function enviar(){
      const saida = {};
      for (const c of campos){
        const el = form.elements[c.nome];
        if (!el) continue;
        let v;
        if (c.tipo === "checkbox") v = el.checked;
        else if (c.tipo === "number") v = el.value === "" ? null : num(el.value);
        else v = el.value;
        if (c.obrigatorio && (v == null || String(v).trim() === "")){
          toast('Preencha o campo "' + c.rotulo + '".', "erro"); el.focus(); return;
        }
        saida[c.nome] = v;
      }
      const botao = $("[data-salvar]", fundo);
      botao.disabled = true;
      const ok = await aoSalvar(saida);
      botao.disabled = false;
      if (ok){ fecharJanela(); toast("Salvo."); }
    }
    $("[data-salvar]", fundo).addEventListener("click", enviar);
    form.addEventListener("submit", (e) => { e.preventDefault(); enviar(); });
    if (aoApagar){
      $("[data-apagar]", fundo).addEventListener("click", async () => {
        if (!confirm("Apagar de vez? Isso não tem volta.")) return;
        const ok = await aoApagar();
        if (ok){ fecharJanela(); toast("Apagado."); }
      });
    }
  }

  /* CSV que abre certinho no Excel (com acento): ponto e vírgula + marca BOM */
  function baixarCSV(nomeArquivo, cabecalho, linhas){
    const celula = (v) => '"' + texto(v).replace(/"/g, '""') + '"';
    const corpo = [cabecalho].concat(linhas).map((l) => l.map(celula).join(";")).join("\r\n");
    const blob = new Blob(["﻿" + corpo], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nomeArquivo + "-" + chaveData(new Date()) + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------------------------------------------------------
     4. MENU, ABAS E GAVETA DO CELULAR
     --------------------------------------------------------- */
  const ABAS = {
    portfolio:  { titulo: "Portfólio",  sub: "Visitas do site e os vídeos que aparecem nele", mostra: () => mostraPortfolio() },
    marcas:     { titulo: "Marcas",     sub: "Sua base de contatos de empresa",               mostra: () => mostraMarcas() },
    calendario: { titulo: "Calendário", sub: "O que gravar, editar e postar",                 mostra: () => mostraCalendario() },
    campanhas:  { titulo: "Campanhas",  sub: "Trabalhos fechados, prazos e pagamentos",       mostra: () => mostraCampanhas() },
    checklist:  { titulo: "Checklist",  sub: "Portfólio, referências, roteiros e ideias",     mostra: () => mostraChecklist() },
    roteiros:   { titulo: "📜 Roteiros", sub: "Cole o link de um reel e eu transcrevo. Serve pros seus e pros das outras, com etiqueta pra você separar.", mostra: () => mostraRoteiros() }
  };
  const area = $("#area");

  function abaAtual(){
    const h = location.hash.replace("#", "");
    return ABAS[h] ? h : "portfolio";
  }
  function trocaAba(){
    const aba = abaAtual();
    $$(".item-menu").forEach((a) => {
      if (a.dataset.aba === aba) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    $("#titulo-aba").textContent = ABAS[aba].titulo;
    $("#subtitulo-aba").textContent = ABAS[aba].sub;
    document.title = ABAS[aba].titulo + " | Painel";
    fechaGaveta();
    try { ABAS[aba].mostra(); }
    catch (erro){
      console.error(erro);
      area.innerHTML = '<div class="aviso">Algo deu errado ao montar esta aba. Recarregue a página. Se continuar, confira o banco.sql.</div>';
    }
  }
  window.addEventListener("hashchange", trocaAba);

  function abreGaveta(){ document.body.classList.add("gaveta-aberta"); $("#abrir-menu").setAttribute("aria-expanded", "true"); }
  function fechaGaveta(){ document.body.classList.remove("gaveta-aberta"); $("#abrir-menu").setAttribute("aria-expanded", "false"); }
  $("#abrir-menu").addEventListener("click", abreGaveta);
  $("#fundo-gaveta").addEventListener("click", fechaGaveta);

  $("#email-logado").textContent = (sessao.user && sessao.user.email) || "";
  $("#sair").addEventListener("click", async () => {
    try { await banco.auth.signOut(); } catch (e){ /* segue para o login mesmo assim */ }
    location.replace("../login/");
  });

  /* =========================================================
     5. ABA PORTFÓLIO
     ========================================================= */
  const NICHOS_SITE = ["beleza", "skincare", "moda", "comida", "casa e decoração", "maternidade", "pet", "viagem", "tech"];
  const FORMATOS = ["Vídeo 9:16", "Fotos 4:5", "Unboxing", "Reels", "TikTok", "Shorts"];

  function videosOrdenados(){
    return dados.videos.slice().sort((a, b) => (num(a.ordem) - num(b.ordem)) || (num(a.id) - num(b.id)));
  }

  function maisComum(lista){
    const conta = {};
    lista.forEach((x) => { const k = texto(x).trim(); if (k) conta[k] = (conta[k] || 0) + 1; });
    const ordem = Object.keys(conta).sort((a, b) => conta[b] - conta[a]);
    return ordem.length ? { nome: ordem[0], n: conta[ordem[0]], todos: ordem.map((k) => [k, conta[k]]) } : null;
  }

  function mostraPortfolio(){
    const hoje = hojeData();
    const dias = [];
    for (let i = 13; i >= 0; i--){ const d = new Date(hoje); d.setDate(d.getDate() - i); dias.push(d); }
    const porDia = {};
    dados.visitas.forEach((v) => {
      const d = v && v.data ? new Date(v.data) : null;
      if (d && !isNaN(d)) { const k = chaveData(d); porDia[k] = (porDia[k] || 0) + 1; }
    });
    const contagens = dias.map((d) => porDia[chaveData(d)] || 0);
    const total14 = contagens.reduce((s, n) => s + n, 0);
    const hojeN = contagens[contagens.length - 1];
    const noAr = dados.videos.filter((v) => v.visivel && !v.exemplo);
    const nicho = maisComum(noAr.map((v) => texto(v.nicho).toLowerCase()));
    const origens = maisComum(dados.visitas.map((v) => v.origem || "direto"));
    const inicio14 = dias[0];
    const contatosSite = dados.marcas.filter((m) =>
      /^(Mensagem pelo site|Pediu o mídia kit pelo site)/.test(texto(m.obs)) &&
      m.criado_em && new Date(m.criado_em) >= inicio14).length;

    const faixa =
      '<div class="faixa-numeros" style="--colunas:6">' +
        '<div><small>Visitas em 14 dias</small><strong>' + inteiro(total14) + '</strong></div>' +
        '<div><small>Visitas hoje</small><strong>' + inteiro(hojeN) + '</strong></div>' +
        '<div><small>Vídeos no ar</small><strong>' + inteiro(noAr.length) + '</strong></div>' +
        '<div><small>Nicho mais forte</small><strong>' + (nicho ? esc(nicho.nome) : '<span class="fraco">sem dados</span>') + '</strong></div>' +
        '<div><small>De onde mais vêm</small><strong>' + (origens && total14 > 0 ? esc(origens.nome) : '<span class="fraco">sem dados</span>') + '</strong></div>' +
        '<div><small>Contatos pelo site</small><strong>' + inteiro(contatosSite) + '</strong><em><a href="#marcas">ver em Marcas</a></em></div>' +
      '</div>';

    let grafico;
    if (total14 === 0){
      grafico = '<p class="vazio">Ainda não há visitas registradas. Quando as pessoas começarem a abrir o seu portfólio, aqui aparece uma barra para cada um dos últimos 14 dias, mostrando quantas visitas você teve em cada dia.</p>';
    } else {
      const maximo = Math.max(1, Math.max.apply(null, contagens));
      grafico = '<div class="grafico" role="img" aria-label="Visitas por dia nos últimos 14 dias">' + dias.map((d, i) => {
        const n = contagens[i];
        const altura = Math.max(2, Math.round(n / maximo * 100));
        const rotulo = String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");
        return '<div class="barra' + (i === 13 ? " hoje" : "") + '" title="' + rotulo + ': ' + n + ' visita' + (n === 1 ? "" : "s") + '">' +
          '<span class="valor">' + (n || "") + '</span><span class="coluna" style="height:' + altura + '%"></span><span class="dia">' + rotulo + '</span></div>';
      }).join("") + '</div>';
    }

    let listaOrigens;
    if (!origens || total14 === 0){
      listaOrigens = '<p class="vazio">Aqui vai aparecer de onde as pessoas chegaram no seu site: Instagram, Google, link direto e outros.</p>';
    } else {
      listaOrigens = '<ul class="origens">' + origens.todos.slice(0, 8).map(([nome, n]) =>
        '<li><span>' + esc(nome) + '</span><span class="fraco">' + inteiro(n) + ' (' + pct(n, total14) + '%)</span>' +
        '<span class="trilha"><span style="width:' + pct(n, total14) + '%"></span></span></li>').join("") + '</ul>';
    }

    const lista = videosOrdenados();
    const linhas = lista.length ? lista.map((v) =>
      '<tr data-id="' + esc(v.id) + '" class="' + (v.visivel ? "" : "escondido") + '">' +
        '<td style="width:34px"><button class="btn-icone alca" type="button" aria-label="Arrastar para mudar a ordem (ou use as setas do teclado)">' + ic("alca") + '</button></td>' +
        '<td><strong>' + esc(v.titulo) + '</strong>' + pilulaExemplo(v) +
          (v.link ? ' <a class="btn-icone" href="' + esc(v.link) + '" target="_blank" rel="noopener" aria-label="Abrir vídeo">' + ic("link") + '</a>' : "") + '</td>' +
        '<td>' + esc(v.nicho) + '</td>' +
        '<td class="sem-quebra">' + esc(v.formato) + '</td>' +
        '<td>' + esc(v.marca) + '</td>' +
        '<td class="sem-quebra">' + esc(v.destaque) + '</td>' +
        '<td class="sem-quebra" style="text-align:right">' +
          '<button class="btn-icone ' + (v.visivel ? "ligado" : "apagado") + '" type="button" data-acao="olho" aria-label="' + (v.visivel ? "Esconder do site" : "Mostrar no site") + '" title="' + (v.visivel ? "Aparece no site" : "Escondido do site") + '">' + ic(v.visivel ? "olho" : "olhoFechado") + '</button>' +
          '<button class="btn-icone" type="button" data-acao="editar" aria-label="Editar">' + ic("editar") + '</button>' +
          '<button class="btn-icone" type="button" data-acao="apagar" aria-label="Apagar">' + ic("lixo") + '</button>' +
        '</td>' +
      '</tr>').join("")
      : '<tr><td colspan="7"><p class="vazio">Nenhum vídeo ainda. Clique em "Adicionar vídeo" para colocar o primeiro.</p></td></tr>';

    area.innerHTML = faixa +
      '<div class="duas-colunas">' +
        '<section class="cartao"><h2>Visitas nos últimos 14 dias</h2>' + grafico + '</section>' +
        '<section class="cartao"><h2>Por onde as pessoas chegaram</h2>' + listaOrigens + '</section>' +
      '</div>' +
      (dados.videos.some((v) => !v.exemplo) || faltando.videos ? "" :
        '<div class="aviso leve" style="margin-bottom:12px;align-items:center"><span><strong>Os vídeos que aparecem hoje no seu site ainda não estão aqui.</strong><br>' +
        'Clique no botão para trazer os 3 destaques e os vídeos da galeria para o painel. Depois disso, tudo o que você mudar aqui muda o site.</span>' +
        '<button class="btn principal-btn" type="button" id="importar-site" style="margin-left:auto">Trazer os vídeos do site</button></div>') +
      '<div class="ferramentas"><strong style="font-size:13px">Meus vídeos</strong><span class="fraco">O site mostra os vídeos visíveis, nesta ordem. Com nicho, entram na galeria; com destaque, entram nos 3 cards grandes.</span><span class="espaco"></span>' +
        '<button class="btn principal-btn" type="button" id="novo-video">' + ic("mais") + 'Adicionar vídeo</button></div>' +
      '<div class="tabela-caixa"><table><thead><tr><th></th><th>Título</th><th>Nicho</th><th>Formato</th><th>Marca</th><th>Destaque</th><th></th></tr></thead>' +
      '<tbody id="corpo-videos">' + linhas + '</tbody></table></div>';

    $("#novo-video").addEventListener("click", () => formVideo());
    const importar = $("#importar-site");
    if (importar) importar.addEventListener("click", () => importaVideosDoSite(importar));
    const corpo = $("#corpo-videos");
    corpo.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-acao]");
      if (!b) return;
      const id = num(b.closest("tr").dataset.id);
      const v = dados.videos.find((x) => num(x.id) === id);
      if (!v) return;
      if (b.dataset.acao === "editar") formVideo(v);
      if (b.dataset.acao === "apagar"){
        if (!confirm('Apagar o vídeo "' + texto(v.titulo) + '"?')) return;
        if (await apagar("videos", v.id)){ toast("Vídeo apagado."); mostraPortfolio(); }
      }
      if (b.dataset.acao === "olho"){
        const ok = await salvar("videos", { visivel: !v.visivel }, v.id);
        if (ok){ toast(v.visivel ? "Agora aparece no site." : "Escondido do site."); mostraPortfolio(); }
      }
    });
    ativaArrastar(corpo);
  }

  function formVideo(v){
    abrirFormulario({
      titulo: v ? "Editar vídeo" : "Adicionar vídeo",
      valores: v || { visivel: true },
      campos: [
        { nome: "titulo", rotulo: "Título", obrigatorio: true, inteira: true },
        { nome: "link", rotulo: "Link do vídeo", tipo: "url", inteira: true, dica: "Cole o link do YouTube, Instagram ou TikTok." },
        { nome: "nicho", rotulo: "Nicho", lista: NICHOS_SITE, dica: "Com nicho, o vídeo entra na galeria do site, no filtro desse nicho." },
        { nome: "formato", rotulo: "Formato", lista: FORMATOS },
        { nome: "marca", rotulo: "Marca" },
        { nome: "destaque", rotulo: "Destaque", dica: 'Ex: "2,4M views". Preenchido, o vídeo vai para os cards grandes do site.' },
        { nome: "visivel", rotulo: "Mostrar este vídeo no site", tipo: "checkbox" }
      ],
      aoSalvar: async (valores) => {
        if (!v){ valores.ordem = dados.videos.reduce((m, x) => Math.max(m, num(x.ordem)), 0) + 1; }
        const ok = await salvar("videos", valores, v ? v.id : null);
        if (ok) mostraPortfolio();
        return ok;
      },
      aoApagar: v ? async () => { const ok = await apagar("videos", v.id); if (ok) mostraPortfolio(); return ok; } : null
    });
  }

  /* Lê as listas de vídeos que estão escritas no código do portfólio (index.html)
     e copia para a tabela videos. Assim o painel passa a mostrar o que o site mostra. */
  function extraiLista(codigo, nome){
    const inicio = codigo.indexOf("const " + nome + " = [");
    if (inicio < 0) return [];
    const abre = codigo.indexOf("[", inicio);
    const fecha = codigo.indexOf("\n];", abre);
    if (fecha < 0) return [];
    const trecho = codigo.slice(abre, fecha + 2);
    const lista = new Function('"use strict"; return (' + trecho + ');')();
    return Array.isArray(lista) ? lista : [];
  }

  async function importaVideosDoSite(botao){
    if (!confirm("Trazer para o painel os vídeos que aparecem hoje no seu site?")) return;
    botao.disabled = true; botao.textContent = "Trazendo...";
    try {
      const resposta = await fetch("../index.html", { cache: "no-store" });
      const codigo = await resposta.text();
      const destaques = extraiLista(codigo, "DESTAQUES");
      const trabalhos = extraiLista(codigo, "TRABALHOS");
      const limpaLink = (l) => (l && l !== "#" ? l : null);
      let ordem = dados.videos.reduce((m, x) => Math.max(m, num(x.ordem)), 0);
      const linhas = [];
      destaques.forEach((d) => {
        linhas.push({
          titulo: texto(d.titulo) || "Vídeo de destaque", link: limpaLink(d.link), nicho: null, formato: null, marca: null,
          destaque: [d.numero, d.rotulo].filter(Boolean).join(" ") || null, ordem: ++ordem, visivel: true, exemplo: false
        });
      });
      trabalhos.forEach((t) => {
        linhas.push({
          titulo: texto(t.titulo) || "Trabalho", link: limpaLink(t.link), nicho: t.nicho || null, formato: t.formato || null,
          marca: t.marca || null, destaque: null, ordem: ++ordem, visivel: true, exemplo: false
        });
      });
      if (!linhas.length) throw new Error("Não encontrei vídeos no código do site.");
      /* não duplica o que já estiver no painel com o mesmo título e link */
      const ja = new Set(dados.videos.map((v) => texto(v.titulo) + "|" + texto(v.link)));
      const novas = linhas.filter((l) => !ja.has(texto(l.titulo) + "|" + texto(l.link)));
      const r = await banco.from("videos").insert(novas).select();
      if (r.error) throw r.error;
      await carregar("videos");
      toast(novas.length + " vídeos trazidos do site. Agora o site lê daqui.");
      mostraPortfolio();
    } catch (erro){
      toast(erro && erro.code ? explicaErro("videos", erro) : "Não consegui trazer os vídeos: " + texto(erro && erro.message), "erro");
      botao.disabled = false; botao.textContent = "Trazer os vídeos do site";
    }
  }

  /* Arrastar pela alcinha (mouse e dedo) ou mover com as setas do teclado */
  function ativaArrastar(corpo){
    let linha = null;
    corpo.addEventListener("pointerdown", (e) => {
      const alca = e.target.closest(".alca");
      if (!alca) return;
      e.preventDefault();
      linha = alca.closest("tr");
      linha.classList.add("arrastando");
      alca.setPointerCapture(e.pointerId);
    });
    corpo.addEventListener("pointermove", (e) => {
      if (!linha) return;
      const outras = $$("tr[data-id]", corpo).filter((r) => r !== linha);
      const antes = outras.find((r) => { const b = r.getBoundingClientRect(); return e.clientY < b.top + b.height / 2; });
      corpo.insertBefore(linha, antes || null);
    });
    const soltar = () => {
      if (!linha) return;
      linha.classList.remove("arrastando");
      linha = null;
      salvaOrdem(corpo);
    };
    corpo.addEventListener("pointerup", soltar);
    corpo.addEventListener("pointercancel", soltar);
    corpo.addEventListener("keydown", (e) => {
      const alca = e.target.closest(".alca");
      if (!alca || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
      e.preventDefault();
      const tr = alca.closest("tr");
      if (e.key === "ArrowUp" && tr.previousElementSibling) corpo.insertBefore(tr, tr.previousElementSibling);
      if (e.key === "ArrowDown" && tr.nextElementSibling) corpo.insertBefore(tr.nextElementSibling, tr);
      alca.focus();
      salvaOrdem(corpo);
    });
  }

  let ordemTimer = null;
  function salvaOrdem(corpo){
    clearTimeout(ordemTimer);
    ordemTimer = setTimeout(async () => {
      const ids = $$("tr[data-id]", corpo).map((r) => num(r.dataset.id));
      const mudancas = [];
      ids.forEach((id, i) => {
        const v = dados.videos.find((x) => num(x.id) === id);
        if (v && num(v.ordem) !== i + 1) mudancas.push(salvar("videos", { ordem: i + 1 }, v.id));
      });
      if (!mudancas.length) return;
      const res = await Promise.all(mudancas);
      if (res.every(Boolean)) toast("Ordem salva. O site já mostra nessa ordem.");
    }, 350);
  }

  /* =========================================================
     6. ABA MARCAS
     ========================================================= */
  const SITUACOES = ["Lead", "Conversando", "Cliente", "Parada"];
  const COR_SITUACAO = { Lead: "p-amarela", Conversando: "p-laranja", Cliente: "p-verde", Parada: "p-cinza" };
  const estadoMarcas = { busca: "", situacao: "todas" };

  const soDigitos = (s) => texto(s).replace(/\D/g, "");
  function linkWhats(tel){
    let d = soDigitos(tel);
    if (d.length < 10 || /^0+$/.test(d)) return null;
    if (d.length <= 11) d = "55" + d;
    return "https://wa.me/" + d;
  }
  function arroba(insta){
    const h = texto(insta).trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "");
    return h || null;
  }

  function mostraMarcas(){
    const conta = { todas: dados.marcas.length };
    SITUACOES.forEach((s) => { conta[s] = dados.marcas.filter((m) => m.situacao === s).length; });
    const termo = estadoMarcas.busca.toLowerCase();
    const lista = dados.marcas
      .filter((m) => estadoMarcas.situacao === "todas" || m.situacao === estadoMarcas.situacao)
      .filter((m) => !termo || [m.nome, m.instagram, m.email].some((x) => texto(x).toLowerCase().includes(termo)))
      .sort((a, b) => texto(b.criado_em).localeCompare(texto(a.criado_em)) || (num(b.id) - num(a.id)));

    const linhas = lista.length ? lista.map((m) => {
      const h = arroba(m.instagram);
      const w = linkWhats(m.telefone);
      return '<tr class="clicavel" data-id="' + esc(m.id) + '">' +
        '<td><strong>' + esc(m.nome) + '</strong>' + pilulaExemplo(m) + '</td>' +
        '<td class="sem-quebra">' + (h ? '<a href="https://instagram.com/' + encodeURIComponent(h) + '" target="_blank" rel="noopener" data-fora>@' + esc(h) + '</a>' : "") + '</td>' +
        '<td>' + (m.email ? '<a href="mailto:' + esc(m.email) + '" data-fora>' + esc(m.email) + '</a>' : "") + '</td>' +
        '<td class="sem-quebra">' + esc(m.telefone) +
          (w ? ' <a class="btn-icone" href="' + w + '" target="_blank" rel="noopener" data-fora aria-label="Abrir no WhatsApp" title="Abrir no WhatsApp">' + ic("whats") + '</a>' : "") + '</td>' +
        '<td><span class="pilula ' + (COR_SITUACAO[m.situacao] || "p-cinza") + '">' + esc(m.situacao || "sem situação") + '</span></td>' +
        '<td class="truncar" title="' + esc(m.obs) + '">' + esc(m.obs) + '</td>' +
        '<td class="sem-quebra">' + dataBR(m.ultimo_contato) + '</td>' +
      '</tr>';
    }).join("") : '<tr><td colspan="7"><p class="vazio">' + (dados.marcas.length ? "Nada encontrado com esse filtro." : "Nenhuma marca ainda. Os contatos do formulário do site caem aqui como Lead.") + '</p></td></tr>';

    area.innerHTML =
      '<div class="ferramentas">' +
        '<label class="busca">' + ic("busca") + '<input type="search" id="busca-marcas" placeholder="Buscar por nome, @ ou e-mail" value="' + esc(estadoMarcas.busca) + '" aria-label="Buscar marcas"></label>' +
        '<div class="chips" role="group" aria-label="Filtrar por situação">' +
          ["todas"].concat(SITUACOES).map((s) => '<button class="chip" type="button" data-situacao="' + s + '" aria-pressed="' + (estadoMarcas.situacao === s) + '">' + (s === "todas" ? "Todas" : s) + '<span class="n">' + (conta[s] || 0) + '</span></button>').join("") +
        '</div><span class="espaco"></span>' +
        '<button class="btn" type="button" id="csv-marcas">' + ic("baixar") + 'Baixar CSV</button>' +
        '<button class="btn principal-btn" type="button" id="nova-marca">' + ic("mais") + 'Adicionar</button>' +
      '</div>' +
      '<div class="tabela-caixa"><table><thead><tr><th>Marca</th><th>Instagram</th><th>E-mail</th><th>Telefone</th><th>Situação</th><th>Observação</th><th>Último contato</th></tr></thead>' +
      '<tbody id="corpo-marcas">' + linhas + '</tbody></table></div>';

    const busca = $("#busca-marcas");
    busca.addEventListener("input", () => {
      estadoMarcas.busca = busca.value;
      const pos = busca.selectionStart;
      mostraMarcas();
      const nova = $("#busca-marcas"); nova.focus(); try { nova.setSelectionRange(pos, pos); } catch (e){ /* ok */ }
    });
    $$("[data-situacao]").forEach((b) => b.addEventListener("click", () => { estadoMarcas.situacao = b.dataset.situacao; mostraMarcas(); }));
    $("#nova-marca").addEventListener("click", () => formMarca());
    $("#csv-marcas").addEventListener("click", () => {
      baixarCSV("marcas",
        ["Marca", "Instagram", "E-mail", "Telefone", "Situação", "Observação", "Último contato"],
        dados.marcas.map((m) => [m.nome, m.instagram, m.email, m.telefone, m.situacao, m.obs, dataBR(m.ultimo_contato)]));
    });
    $("#corpo-marcas").addEventListener("click", (e) => {
      if (e.target.closest("[data-fora]")) return; // links de Instagram, e-mail e WhatsApp abrem normalmente
      const tr = e.target.closest("tr[data-id]");
      if (!tr) return;
      const m = dados.marcas.find((x) => String(x.id) === tr.dataset.id);
      if (m) formMarca(m);
    });
  }

  function formMarca(m){
    abrirFormulario({
      titulo: m ? "Editar marca" : "Adicionar marca",
      valores: m || { situacao: "Lead", ultimo_contato: chaveData(new Date()) },
      campos: [
        { nome: "nome", rotulo: "Marca", obrigatorio: true, inteira: true },
        { nome: "instagram", rotulo: "Instagram", dica: "Pode ser @perfil ou o link." },
        { nome: "email", rotulo: "E-mail", tipo: "email" },
        { nome: "telefone", rotulo: "Telefone", tipo: "tel", dica: "Com DDD, para o botão do WhatsApp funcionar." },
        { nome: "situacao", rotulo: "Situação", tipo: "select", opcoes: SITUACOES },
        { nome: "ultimo_contato", rotulo: "Último contato", tipo: "date" },
        { nome: "obs", rotulo: "Observação", tipo: "textarea", inteira: true }
      ],
      aoSalvar: async (valores) => { const ok = await salvar("marcas", valores, m ? m.id : null); if (ok) mostraMarcas(); return ok; },
      aoApagar: m ? async () => { const ok = await apagar("marcas", m.id); if (ok) mostraMarcas(); return ok; } : null
    });
  }

  /* =========================================================
     7. ABA CALENDÁRIO
     ========================================================= */
  const TIPOS_CAL = ["gravar", "editar", "postar"];
  const estadoCal = { mes: (() => { const d = hojeData(); d.setDate(1); return d; })(), tipo: "todos" };

  function itensDoCalendario(){
    const itens = [];
    dados.calendario.forEach((c) => {
      if (!lerData(c.data)) return;
      itens.push({ origem: "calendario", linha: c, data: texto(c.data).slice(0, 10), titulo: texto(c.titulo), tipo: TIPOS_CAL.includes(c.tipo) ? c.tipo : "gravar", feito: c.status === "feito" });
    });
    dados.campanhas.forEach((c) => {
      if (!lerData(c.prazo)) return;
      itens.push({ origem: "campanha", linha: c, data: texto(c.prazo).slice(0, 10), titulo: "Prazo: " + texto(c.campanha), tipo: "prazo", feito: c.status === "Entregue" });
    });
    return itens.filter((i) => estadoCal.tipo === "todos" || i.tipo === estadoCal.tipo);
  }

  function mostraCalendario(){
    const mes = estadoCal.mes;
    const hojeK = chaveData(hojeData());
    const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const diasNoMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    const deslocamento = (primeiro.getDay() + 6) % 7; // segunda = 0
    const semanas = Math.ceil((deslocamento + diasNoMes) / 7);
    const inicio = new Date(primeiro); inicio.setDate(1 - deslocamento);

    const porDia = {};
    itensDoCalendario().forEach((i) => { (porDia[i.data] = porDia[i.data] || []).push(i); });
    Object.values(porDia).forEach((l) => l.sort((a, b) => (a.feito - b.feito) || a.titulo.localeCompare(b.titulo)));

    let celulas = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => '<div class="cal-semana">' + d + '</div>').join("");
    for (let i = 0; i < semanas * 7; i++){
      const d = new Date(inicio); d.setDate(inicio.getDate() + i);
      const k = chaveData(d);
      const itens = porDia[k] || [];
      const fora = d.getMonth() !== mes.getMonth();
      celulas += '<div class="cal-dia' + (fora ? " fora" : "") + (k === hojeK ? " hoje" : "") + '" data-dia="' + k + '">' +
        '<span class="cal-numero">' + d.getDate() + '</span>' +
        '<button class="cal-mais-btn" type="button" data-novo="' + k + '" aria-label="Adicionar no dia ' + d.getDate() + '">' + ic("mais") + '</button>' +
        itens.slice(0, 3).map((it) => botaoItem(it)).join("") +
        (itens.length > 3 ? '<button class="cal-mais" type="button" data-ver-dia="' + k + '">+' + (itens.length - 3) + ' mais</button>' : "") +
      '</div>';
    }

    const hoje = hojeData();
    const atrasados = dados.calendario
      .filter((c) => c.status !== "feito" && lerData(c.data) && lerData(c.data) < hoje)
      .sort((a, b) => texto(a.data).localeCompare(texto(b.data)));
    const listaAtrasados = atrasados.length
      ? '<ul class="lista-simples">' + atrasados.map((c) => {
          const n = diasEntre(lerData(c.data), hoje);
          return '<li><span class="pilula ' + corTipo(c.tipo) + '">' + esc(c.tipo) + '</span><span class="titulo-item">' + esc(c.titulo) + '</span>' + pilulaExemplo(c) +
            (c.marca ? '<span class="fraco">' + esc(c.marca) + '</span>' : "") +
            '<span class="direita"><span class="pilula p-vermelha">há ' + n + ' dia' + (n === 1 ? "" : "s") + '</span>' +
            '<button class="btn pequeno" type="button" data-feito="' + esc(c.id) + '">' + ic("check") + 'Feito</button></span></li>';
        }).join("") + '</ul>'
      : '<p class="vazio">Nada ficou pra trás. Tudo em dia!</p>';

    area.innerHTML =
      '<div class="cal-topo">' +
        '<button class="btn-icone" type="button" id="mes-anterior" aria-label="Mês anterior">' + ic("esquerda") + '</button>' +
        '<h2>' + meses[mes.getMonth()].charAt(0).toUpperCase() + meses[mes.getMonth()].slice(1) + ' de ' + mes.getFullYear() + '</h2>' +
        '<button class="btn-icone" type="button" id="mes-seguinte" aria-label="Próximo mês">' + ic("direita") + '</button>' +
        '<button class="btn" type="button" id="este-mes">Este mês</button>' +
        '<span class="espaco" style="flex:1"></span>' +
        '<div class="chips" role="group" aria-label="Filtrar por tipo">' +
          [["todos", "Todos"], ["gravar", "Gravar"], ["editar", "Editar"], ["postar", "Postar"], ["prazo", "Prazos"]].map(([v, t]) =>
            '<button class="chip" type="button" data-tipo="' + v + '" aria-pressed="' + (estadoCal.tipo === v) + '">' + t + '</button>').join("") +
        '</div>' +
        '<button class="btn principal-btn" type="button" id="novo-item">' + ic("mais") + 'Adicionar</button>' +
      '</div>' +
      '<div class="cal-grade">' + celulas + '</div>' +
      '<section class="cartao atrasados"><h2>Ficou pra trás</h2>' + listaAtrasados + '</section>';

    $("#mes-anterior").addEventListener("click", () => { estadoCal.mes = new Date(mes.getFullYear(), mes.getMonth() - 1, 1); mostraCalendario(); });
    $("#mes-seguinte").addEventListener("click", () => { estadoCal.mes = new Date(mes.getFullYear(), mes.getMonth() + 1, 1); mostraCalendario(); });
    $("#este-mes").addEventListener("click", () => { const d = hojeData(); d.setDate(1); estadoCal.mes = d; mostraCalendario(); });
    $$("[data-tipo]").forEach((b) => b.addEventListener("click", () => { estadoCal.tipo = b.dataset.tipo; mostraCalendario(); }));
    $("#novo-item").addEventListener("click", () => formCalendario(null, chaveData(hojeData())));

    $(".cal-grade").addEventListener("click", (e) => {
      const item = e.target.closest("[data-item]");
      if (item){ abreItem(item); return; }
      const mais = e.target.closest("[data-ver-dia]");
      if (mais){ abreDia(mais.dataset.verDia); return; }
      const novo = e.target.closest("[data-novo]");
      if (novo){ formCalendario(null, novo.dataset.novo); return; }
      const dia = e.target.closest("[data-dia]");
      if (dia) formCalendario(null, dia.dataset.dia);
    });
    $(".atrasados").addEventListener("click", async (e) => {
      const b = e.target.closest("[data-feito]");
      if (!b) return;
      const ok = await salvar("calendario", { status: "feito" }, num(b.dataset.feito));
      if (ok){ toast("Marcado como feito."); mostraCalendario(); }
    });
  }

  function corTipo(tipo){ return { gravar: "p-amarela", editar: "p-laranja", postar: "p-verde", prazo: "p-tinta" }[tipo] || "p-cinza"; }
  function botaoItem(it){
    return '<button class="cal-item t-' + it.tipo + (it.feito ? " feito" : "") + '" type="button" data-item data-origem="' + it.origem + '" data-id="' + esc(it.linha.id) + '" title="' + esc(it.titulo + (it.linha.marca ? " · " + it.linha.marca : "")) + '">' + esc(it.titulo) + '</button>';
  }
  function abreItem(el){
    const id = String(el.dataset.id);
    if (el.dataset.origem === "campanha"){
      const c = dados.campanhas.find((x) => String(x.id) === id);
      if (c) formCampanha(c, () => mostraCalendario());
    } else {
      const c = dados.calendario.find((x) => String(x.id) === id);
      if (c) formCalendario(c);
    }
  }
  function abreDia(k){
    const itens = itensDoCalendario().filter((i) => i.data === k);
    const d = lerData(k);
    const fundo = abrirJanela({
      titulo: d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }),
      corpo: itens.length ? itens.map((i) => botaoItem(i)).join("") : '<p class="fraco">Nada neste dia.</p>',
      rodape: '<span class="espaco"></span><button class="btn principal-btn" type="button" data-novo-dia>' + ic("mais") + 'Adicionar neste dia</button>'
    });
    fundo.addEventListener("click", (e) => {
      const item = e.target.closest("[data-item]");
      if (item){ abreItem(item); return; }
      if (e.target.closest("[data-novo-dia]")) formCalendario(null, k);
    });
  }

  function formCalendario(c, data){
    abrirFormulario({
      titulo: c ? "Editar item" : "Adicionar no calendário",
      valores: c || { data: data, tipo: estadoCal.tipo !== "todos" && estadoCal.tipo !== "prazo" ? estadoCal.tipo : "gravar", status: "a fazer" },
      campos: [
        { nome: "titulo", rotulo: "O que fazer", obrigatorio: true, inteira: true },
        { nome: "marca", rotulo: "Marca" },
        { nome: "tipo", rotulo: "Tipo", tipo: "select", opcoes: TIPOS_CAL },
        { nome: "data", rotulo: "Data", tipo: "date", obrigatorio: true },
        { nome: "status", rotulo: "Status", tipo: "select", opcoes: ["a fazer", "feito"] }
      ],
      aoSalvar: async (valores) => { const ok = await salvar("calendario", valores, c ? c.id : null); if (ok) mostraCalendario(); return ok; },
      aoApagar: c ? async () => { const ok = await apagar("calendario", c.id); if (ok) mostraCalendario(); return ok; } : null
    });
  }

  /* =========================================================
     8. ABA CAMPANHAS
     ========================================================= */
  const FUNIL = ["Briefing", "Roteiro", "Aprovação Roteiro", "Gravação", "Edição", "Aprovado", "Entregue"];
  const COR_STATUS = { "Briefing": "p-cinza", "Roteiro": "p-amarela", "Aprovação Roteiro": "p-amarela", "Gravação": "p-laranja", "Edição": "p-laranja", "Aprovado": "p-verde", "Entregue": "p-tinta" };
  const estadoCamp = { filtro: "todas", busca: "", coluna: "prazo", sentido: 1 };
  const COLUNAS_CAMP = [
    { chave: "favorita",  rotulo: "",          valor: (c) => (c.favorita ? 1 : 0), rotuloAria: "Favorita" },
    { chave: "campanha",  rotulo: "Campanha",  valor: (c) => texto(c.campanha).toLowerCase() },
    { chave: "cliente",   rotulo: "Cliente",   valor: (c) => texto(c.cliente).toLowerCase() },
    { chave: "tipo",      rotulo: "Tipo",      valor: (c) => texto(c.tipo).toLowerCase() },
    { chave: "status",    rotulo: "Status",    valor: (c) => { const i = FUNIL.indexOf(c.status); return i < 0 ? 99 : i; } },
    { chave: "qtd",       rotulo: "Qtd",       valor: (c) => num(c.qtd), num: true },
    { chave: "valor",     rotulo: "Valor",     valor: (c) => num(c.valor), num: true },
    { chave: "prazo",     rotulo: "Prazo",     valor: (c) => texto(c.prazo) || null },
    { chave: "pagamento", rotulo: "Pagamento", valor: (c) => (c.pagamento === "pago" ? 1 : 0) }
  ];

  function avisoPrazo(c){
    if (c.status === "Entregue") return "";
    const p = lerData(c.prazo);
    if (!p) return "";
    const d = diasEntre(hojeData(), p);
    if (d < 0){ const n = -d; return ' <span class="pilula p-vermelha">atrasada ' + n + ' dia' + (n === 1 ? "" : "s") + '</span>'; }
    if (d === 0) return ' <span class="pilula p-amarela">vence hoje</span>';
    if (d === 1) return ' <span class="pilula p-amarela">vence amanhã</span>';
    if (d <= 3) return ' <span class="pilula p-amarela">vence em ' + d + ' dias</span>';
    return "";
  }

  function mostraCampanhas(){
    const reais = dados.campanhas.filter((c) => !c.exemplo);
    const totalValor = reais.reduce((s, c) => s + num(c.valor), 0);
    const totalQtd = reais.reduce((s, c) => s + num(c.qtd), 0);
    const ticket = totalQtd > 0 ? totalValor / totalQtd : 0;
    const aReceber = reais.filter((c) => c.pagamento !== "pago").reduce((s, c) => s + num(c.valor), 0);
    const recebido = reais.filter((c) => c.pagamento === "pago").reduce((s, c) => s + num(c.valor), 0);

    const termo = estadoCamp.busca.toLowerCase();
    const col = COLUNAS_CAMP.find((c) => c.chave === estadoCamp.coluna) || COLUNAS_CAMP[7];
    const lista = dados.campanhas
      .filter((c) => estadoCamp.filtro === "todas" || (estadoCamp.filtro === "ativas" ? c.ativa !== false : c.ativa === false))
      .filter((c) => !termo || [c.campanha, c.cliente].some((x) => texto(x).toLowerCase().includes(termo)))
      .sort((a, b) => {
        const va = col.valor(a), vb = col.valor(b);
        if (va == null && vb == null) return 0;
        if (va == null) return 1;   // vazios sempre no fim
        if (vb == null) return -1;
        const r = (typeof va === "number" && typeof vb === "number") ? va - vb : String(va).localeCompare(String(vb), "pt-BR");
        return r * estadoCamp.sentido || (num(a.id) - num(b.id));
      });

    const cabecalho = COLUNAS_CAMP.map((c) => {
      const ativa = c.chave === estadoCamp.coluna;
      const sort = ativa ? (estadoCamp.sentido === 1 ? "ascending" : "descending") : "none";
      const seta = ativa ? (estadoCamp.sentido === 1 ? "▲" : "▼") : "↕";
      return '<th' + (c.num ? ' class="num"' : "") + ' aria-sort="' + sort + '"><button class="ordenar" type="button" data-coluna="' + c.chave + '" aria-label="Ordenar por ' + (c.rotulo || c.rotuloAria) + '">' +
        (c.chave === "favorita" ? ic("estrela") : esc(c.rotulo)) + '<span class="seta" aria-hidden="true">' + seta + '</span></button></th>';
    }).join("");

    const linhas = lista.length ? lista.map((c) =>
      '<tr class="clicavel' + (c.favorita ? " favorita" : "") + '" data-id="' + esc(c.id) + '">' +
        '<td style="width:36px"><button class="btn-icone estrela' + (c.favorita ? " ligada" : "") + '" type="button" data-estrela aria-label="' + (c.favorita ? "Tirar destaque" : "Destacar campanha") + '" aria-pressed="' + !!c.favorita + '">' + ic("estrela") + '</button></td>' +
        '<td><strong>' + esc(c.campanha) + '</strong>' + pilulaExemplo(c) + (c.ativa === false ? ' <span class="fraco">(finalizada)</span>' : "") + '</td>' +
        '<td>' + esc(c.cliente) + '</td>' +
        '<td><span class="pilula ' + (c.tipo === "Publicidade" ? "p-laranja" : "p-amarela") + '">' + esc(c.tipo) + '</span></td>' +
        '<td><span class="pilula ' + (COR_STATUS[c.status] || "p-cinza") + '">' + esc(c.status) + '</span></td>' +
        '<td class="num">' + inteiro(c.qtd) + '</td>' +
        '<td class="num sem-quebra">' + moeda(c.valor) + '</td>' +
        '<td class="sem-quebra">' + dataBR(c.prazo) + avisoPrazo(c) + '</td>' +
        '<td><span class="pilula ' + (c.pagamento === "pago" ? "p-verde" : "p-laranja") + '">' + esc(c.pagamento) + '</span></td>' +
      '</tr>').join("")
      : '<tr><td colspan="9"><p class="vazio">' + (dados.campanhas.length ? "Nada encontrado com esse filtro." : "Nenhuma campanha ainda. Clique em Adicionar para cadastrar a primeira.") + '</p></td></tr>';

    area.innerHTML =
      '<div class="faixa-numeros" style="--colunas:4">' +
        '<div><small>Campanhas</small><strong>' + inteiro(reais.length) + '</strong></div>' +
        '<div><small>Ativas</small><strong>' + inteiro(reais.filter((c) => c.ativa !== false).length) + '</strong></div>' +
        '<div><small>Valor total</small><strong>' + moeda(totalValor) + '</strong><em>ticket médio por vídeo: ' + moeda(ticket) + '</em></div>' +
        '<div><small>A receber</small><strong>' + moeda(aReceber) + '</strong><em>já recebido: ' + moeda(recebido) + '</em></div>' +
      '</div>' +
      '<div class="ferramentas">' +
        '<div class="chips" role="group" aria-label="Filtrar campanhas">' +
          [["todas", "Todas"], ["ativas", "Ativas"], ["finalizadas", "Finalizadas"]].map(([v, t]) =>
            '<button class="chip" type="button" data-filtro="' + v + '" aria-pressed="' + (estadoCamp.filtro === v) + '">' + t + '</button>').join("") +
        '</div>' +
        '<label class="busca">' + ic("busca") + '<input type="search" id="busca-camp" placeholder="Buscar campanha ou cliente" value="' + esc(estadoCamp.busca) + '" aria-label="Buscar campanhas"></label>' +
        '<span class="espaco"></span>' +
        '<button class="btn" type="button" id="csv-camp">' + ic("baixar") + 'Baixar</button>' +
        '<button class="btn principal-btn" type="button" id="nova-camp">' + ic("mais") + 'Adicionar</button>' +
      '</div>' +
      '<div class="tabela-caixa"><table><thead><tr>' + cabecalho + '</tr></thead><tbody id="corpo-camp">' + linhas + '</tbody></table></div>';

    $$("[data-filtro]").forEach((b) => b.addEventListener("click", () => { estadoCamp.filtro = b.dataset.filtro; mostraCampanhas(); }));
    const busca = $("#busca-camp");
    busca.addEventListener("input", () => {
      estadoCamp.busca = busca.value;
      const pos = busca.selectionStart;
      mostraCampanhas();
      const nova = $("#busca-camp"); nova.focus(); try { nova.setSelectionRange(pos, pos); } catch (e){ /* ok */ }
    });
    $$("[data-coluna]").forEach((b) => b.addEventListener("click", () => {
      const c = b.dataset.coluna;
      if (estadoCamp.coluna === c) estadoCamp.sentido *= -1; else { estadoCamp.coluna = c; estadoCamp.sentido = 1; }
      mostraCampanhas();
    }));
    $("#nova-camp").addEventListener("click", () => formCampanha());
    $("#csv-camp").addEventListener("click", () => {
      baixarCSV("campanhas",
        ["Favorita", "Campanha", "Cliente", "Tipo", "Status", "Qtd", "Valor", "Prazo", "Pagamento", "Ativa"],
        dados.campanhas.map((c) => [c.favorita ? "sim" : "", c.campanha, c.cliente, c.tipo, c.status, num(c.qtd), num(c.valor).toFixed(2).replace(".", ","), dataBR(c.prazo), c.pagamento, c.ativa === false ? "não" : "sim"]));
    });
    $("#corpo-camp").addEventListener("click", async (e) => {
      const tr = e.target.closest("tr[data-id]");
      if (!tr) return;
      const c = dados.campanhas.find((x) => String(x.id) === tr.dataset.id);
      if (!c) return;
      if (e.target.closest("[data-estrela]")){
        const ok = await salvar("campanhas", { favorita: !c.favorita }, c.id);
        if (ok) mostraCampanhas();
        return;
      }
      formCampanha(c);
    });
  }

  function formCampanha(c, depois){
    const atualiza = depois || (() => mostraCampanhas());
    abrirFormulario({
      titulo: c ? "Editar campanha" : "Adicionar campanha",
      valores: c || { tipo: "Conteúdo", status: "Briefing", qtd: 1, valor: 0, pagamento: "pendente", ativa: true },
      campos: [
        { nome: "campanha", rotulo: "Campanha", obrigatorio: true, inteira: true },
        { nome: "cliente", rotulo: "Cliente" },
        { nome: "tipo", rotulo: "Tipo", tipo: "select", opcoes: ["Conteúdo", "Publicidade"] },
        { nome: "status", rotulo: "Status", tipo: "select", opcoes: FUNIL },
        { nome: "prazo", rotulo: "Prazo", tipo: "date", dica: "Aparece sozinho no calendário." },
        { nome: "qtd", rotulo: "Quantidade de vídeos", tipo: "number", passo: "1" },
        { nome: "valor", rotulo: "Valor (R$)", tipo: "number", passo: "0.01" },
        { nome: "pagamento", rotulo: "Pagamento", tipo: "select", opcoes: ["pendente", "pago"] },
        { nome: "ativa", rotulo: "Campanha ativa (desmarque quando finalizar)", tipo: "checkbox" },
        { nome: "favorita", rotulo: "Destacar com estrela", tipo: "checkbox" }
      ],
      aoSalvar: async (valores) => {
        if (valores.qtd == null) valores.qtd = 0;
        if (valores.valor == null) valores.valor = 0;
        const ok = await salvar("campanhas", valores, c ? c.id : null);
        if (ok) atualiza();
        return ok;
      },
      aoApagar: c ? async () => { const ok = await apagar("campanhas", c.id); if (ok) atualiza(); return ok; } : null
    });
  }

  /* =========================================================
     9. ABA CHECKLIST (conteúdo de js/biblioteca.js)
     ========================================================= */
  const estadoCheck = { sub: "checklist", estilo: "todos", audiencia: "todas" };
  const SUBABAS = [["checklist", "Checklist do portfólio"], ["referencias", "Referências de vídeo"], ["roteiros", "Roteiros"], ["nichos", "Ideias por nicho"], ["revisar", "Revisar meu roteiro"]];
  const marcado = (chave) => dados.marcados.some((m) => m.chave === chave && m.marcado !== false);

  async function marcar(chave, ligado){
    /* Atualiza na tela na hora e grava no banco */
    dados.marcados = dados.marcados.filter((m) => m.chave !== chave);
    if (ligado) dados.marcados.push({ chave, marcado: true });
    if (faltando.marcados){ toast("A tabela marcados não existe, então isso não vai ficar salvo.", "erro"); return; }
    try {
      const r = ligado
        ? await banco.from("marcados").upsert({ chave, marcado: true, atualizado_em: new Date().toISOString() })
        : await banco.from("marcados").delete().eq("chave", chave);
      if (r.error) throw r.error;
    } catch (erro){ toast(explicaErro("marcados", erro), "erro"); }
  }

  function mostraChecklist(){
    const B = window.Biblioteca;
    if (!B){
      area.innerHTML = '<div class="aviso">Não encontrei o arquivo js/biblioteca.js. Ele traz o conteúdo desta aba. O resto do painel continua funcionando.</div>';
      return;
    }
    const abas = '<div class="sub-abas" role="tablist">' + SUBABAS.map(([v, t]) =>
      '<button class="sub-aba" type="button" role="tab" data-sub="' + v + '" aria-selected="' + (estadoCheck.sub === v) + '">' + t + '</button>').join("") + '</div>';
    let corpo = "";
    try {
      if (estadoCheck.sub === "checklist") corpo = htmlChecklist(B);
      if (estadoCheck.sub === "referencias") corpo = htmlReferencias(B);
      if (estadoCheck.sub === "roteiros") corpo = htmlRoteiros(B);
      if (estadoCheck.sub === "nichos") corpo = htmlNichos(B);
      if (estadoCheck.sub === "revisar") corpo = htmlRevisar(B);
    } catch (erro){
      console.error(erro);
      corpo = '<div class="aviso">O arquivo js/biblioteca.js parece diferente do esperado nesta parte.</div>';
    }
    area.innerHTML = abas + '<div id="sub-corpo">' + corpo + '</div>';

    $$("[data-sub]").forEach((b) => b.addEventListener("click", () => { estadoCheck.sub = b.dataset.sub; mostraChecklist(); }));
    ligaChecklist(B);
  }

  const lista = (x) => (Array.isArray(x) ? x : []);

  function barra(feitos, total){ return '<div class="progresso" aria-hidden="true"><span style="width:' + pct(feitos, total) + '%"></span></div>'; }

  function htmlChecklist(B){
    const secoes = lista(B.CHECKLIST);
    let feitosGeral = 0, totalGeral = 0;
    const blocos = secoes.map((s, si) => {
      const itens = lista(s.itens);
      const chaves = itens.map((_, i) => "checklist:" + (s.id || si) + ":" + i);
      const feitos = chaves.filter(marcado).length;
      feitosGeral += feitos; totalGeral += itens.length;
      return '<details class="bloco" data-secao="' + esc(s.id || si) + '">' +
        '<summary><span class="emoji" aria-hidden="true">' + esc(s.emoji) + '</span><span class="nome">' + esc(s.nome) + '</span>' +
          '<span class="lado"><span data-conta>' + feitos + '/' + itens.length + '</span>' + barra(feitos, itens.length) + ic("chev").replace('class="ic"', 'class="ic chev"') + '</span>' +
          '<span class="resumo">' + esc(s.resumo) + '</span></summary>' +
        '<div class="bloco-corpo">' +
          (s.porque ? '<p class="porque"><b>Por que importa</b>' + esc(s.porque) + '</p>' : "") +
          '<ul class="itens-check">' + itens.map((it, i) => {
            const k = chaves[i];
            const id = "chk-" + k.replace(/[^a-z0-9]/gi, "-");
            return '<li class="' + (marcado(k) ? "ok" : "") + '"><input type="checkbox" id="' + id + '" data-chave="' + esc(k) + '"' + (marcado(k) ? " checked" : "") + '>' +
              '<label for="' + id + '">' + esc(it.t) + '</label>' + (it.d ? '<p>' + esc(it.d) + '</p>' : "") + '</li>';
          }).join("") + '</ul>' +
        '</div></details>';
    }).join("");
    return '<div class="cartao progresso-geral"><strong>Seu portfólio está ' + pct(feitosGeral, totalGeral) + '% pronto</strong>' +
      barra(feitosGeral, totalGeral) + '<span class="fraco" data-conta-geral>' + feitosGeral + ' de ' + totalGeral + ' itens</span></div>' + blocos;
  }

  function htmlReferencias(B){
    const refs = lista(B.REFERENCIAS).filter((r) =>
      (estadoCheck.estilo === "todos" || r.estilo === estadoCheck.estilo) &&
      (estadoCheck.audiencia === "todas" || r.audiencia === estadoCheck.audiencia));
    const filtros =
      '<div class="ferramentas"><div class="chips" role="group" aria-label="Filtrar por estilo">' +
        ["todos"].concat(lista(B.ESTILOS)).map((e) => '<button class="chip" type="button" data-estilo="' + esc(e) + '" aria-pressed="' + (estadoCheck.estilo === e) + '">' + (e === "todos" ? "Todos os estilos" : esc(e)) + '</button>').join("") +
      '</div><div class="chips" role="group" aria-label="Filtrar por público">' +
        [{ v: "todas", t: "Todos os públicos" }].concat(lista(B.AUDIENCIAS)).map((a) => '<button class="chip" type="button" data-audiencia="' + esc(a.v) + '" aria-pressed="' + (estadoCheck.audiencia === a.v) + '">' + esc(a.t) + '</button>').join("") +
      '</div></div>';
    const grade = refs.length ? '<div class="grade-refs">' + refs.map((r) =>
      '<button class="ref" type="button" data-ref="' + esc(r.id) + '">' +
        '<span class="ref-capa cor-' + esc(r.cor || "areia") + '"><span aria-hidden="true">' + esc(r.emoji) + '</span>' +
          '<span class="est">' + esc(r.estilo) + '</span><span class="dur">' + esc(r.duracao) + '</span></span>' +
        '<strong>' + esc(r.titulo) + '</strong><span class="marca-ref">' + esc(r.marca) + '</span>' +
      '</button>').join("") + '</div>' : '<p class="vazio">Nenhuma referência com esses filtros.</p>';
    return filtros + grade;
  }

  function blocosTempo(blocos){
    return '<ol class="blocos-tempo">' + lista(blocos).map((b) =>
      '<li><span class="tempo">' + esc(b.t) + '</span><span>' + texto(b.o) + '</span></li>').join("") + '</ol>';
    /* b.o vem da biblioteca com negrito e itálico em HTML, por isso não é escapado */
  }

  function abreReferencia(B, id){
    const r = lista(B.REFERENCIAS).find((x) => x.id === id);
    if (!r) return;
    const aud = lista(B.AUDIENCIAS).find((a) => a.v === r.audiencia);
    abrirJanela({
      larga: true,
      titulo: esc(r.emoji) + " " + esc(r.titulo),
      corpo: '<div class="ficha">' +
        '<div class="chips">' + [r.estilo, aud ? aud.t : r.audiencia, r.duracao, r.marca].filter(Boolean).map((x) => '<span class="pilula p-amarela">' + esc(x) + '</span>').join("") + '</div>' +
        '<h3>Gancho</h3><p class="gancho">' + esc(r.gancho) + '</p>' +
        '<h3>Por que funciona</h3><p>' + esc(r.porque) + '</p>' +
        '<h3>O diferencial</h3><p>' + esc(r.diferencial) + '</p>' +
        '<h3>Erro comum</h3><p>' + esc(r.erro) + '</p>' +
        '<h3>Roteiro</h3>' + blocosTempo(r.roteiro) +
      '</div>',
      rodape: '<span class="espaco"></span>' + (r.youtube ? '<a class="btn principal-btn" href="' + esc(r.youtube) + '" target="_blank" rel="noopener">' + ic("play") + 'Assistir</a>' : "")
    });
  }

  function htmlRoteiros(B){
    return lista(B.TIPOS).map((t) =>
      '<details class="bloco"><summary><span class="emoji" aria-hidden="true">' + esc(t.emoji) + '</span><span class="nome">' + esc(t.nome) + '</span>' +
        '<span class="lado"><span>' + esc(t.duracao) + '</span>' + ic("chev").replace('class="ic"', 'class="ic chev"') + '</span></summary>' +
        '<div class="bloco-corpo">' +
          (t.porque ? '<p class="porque"><b>Quando usar</b>' + esc(t.porque) + '</p>' : "") +
          blocosTempo(t.beats) +
          (lista(t.erros).length ? '<div class="ficha"><h3>Erros comuns</h3><ul>' + lista(t.erros).map((e) => '<li>' + esc(e) + '</li>').join("") + '</ul></div>' : "") +
        '</div></details>').join("");
  }

  function htmlNichos(B){
    const dicas = lista(B.COMO_USAR);
    return (dicas.length ? '<section class="cartao" style="margin-bottom:12px"><h2>Como usar os ganchos</h2><ul class="ideias">' + dicas.map((d) => '<li>' + esc(d) + '</li>').join("") + '</ul></section>' : "") +
      lista(B.NICHOS).map((n) =>
        '<details class="bloco"><summary><span class="emoji" aria-hidden="true">' + esc(n.emoji) + '</span><span class="nome">' + esc(n.nome) + '</span>' +
          '<span class="lado"><span>' + lista(n.ideias).length + ' ideias</span>' + ic("chev").replace('class="ic"', 'class="ic chev"') + '</span></summary>' +
          '<div class="bloco-corpo"><ul class="ideias">' + lista(n.ideias).map((i) =>
            '<li><strong>' + esc(i.t) + '</strong><q>' + esc(i.gancho) + '</q></li>').join("") + '</ul></div></details>').join("");
  }

  function htmlRevisar(B){
    let rascunho = "";
    try { rascunho = localStorage.getItem("roteiro-em-revisao") || ""; } catch (e){ /* ok */ }
    const blocos = lista(B.REVISAO);
    let feitos = 0, total = 0;
    const html = blocos.map((b, bi) => {
      const itens = lista(b.itens);
      return '<details class="bloco" open><summary><span class="emoji" aria-hidden="true">' + esc(b.emoji) + '</span><span class="nome">' + esc(b.bloco) + '</span>' +
        '<span class="lado">' + ic("chev").replace('class="ic"', 'class="ic chev"') + '</span></summary><div class="bloco-corpo"><ul class="itens-check">' +
        itens.map((it, i) => {
          const k = "revisao:" + bi + ":" + i; total++; if (marcado(k)) feitos++;
          const id = "rev-" + bi + "-" + i;
          return '<li class="' + (marcado(k) ? "ok" : "") + '"><input type="checkbox" id="' + id + '" data-chave="' + k + '"' + (marcado(k) ? " checked" : "") + '>' +
            '<label for="' + id + '">' + esc(it.t) + '</label>' + (it.d ? '<p>' + esc(it.d) + '</p>' : "") + '</li>';
        }).join("") + '</ul></div></details>';
    }).join("");
    const palavras = rascunho.trim() ? rascunho.trim().split(/\s+/).length : 0;
    return '<div class="revisar-grade">' +
      '<section class="cartao"><h2>Cole o seu roteiro aqui</h2>' +
        '<textarea id="roteiro" placeholder="Cole o roteiro e vá conferindo os itens ao lado.">' + esc(rascunho) + '</textarea>' +
        '<p class="fraco" id="conta-palavras" style="margin:8px 0 0">' + textoPalavras(palavras) + '</p></section>' +
      '<div><div class="cartao progresso-geral"><strong>Revisão</strong>' + barra(feitos, total) + '<span class="fraco" data-conta-geral>' + feitos + ' de ' + total + '</span></div>' +
        html + '<button class="btn" type="button" id="nova-revisao">Começar uma revisão nova</button></div>' +
    '</div>';
  }
  function textoPalavras(n){
    const seg = Math.round(n / 2.5); // fala média de 150 palavras por minuto
    return n ? n + " palavra" + (n === 1 ? "" : "s") + ", cerca de " + seg + " segundos falando" : "Nenhum texto ainda.";
  }

  function ligaChecklist(B){
    const corpo = $("#sub-corpo");
    if (!corpo) return;
    corpo.addEventListener("change", (e) => {
      const cb = e.target.closest("input[type=checkbox][data-chave]");
      if (!cb) return;
      cb.closest("li").classList.toggle("ok", cb.checked);
      marcar(cb.dataset.chave, cb.checked);
      atualizaContagens(corpo);
    });
    $$("[data-estilo]", corpo).forEach((b) => b.addEventListener("click", () => { estadoCheck.estilo = b.dataset.estilo; mostraChecklist(); }));
    $$("[data-audiencia]", corpo).forEach((b) => b.addEventListener("click", () => { estadoCheck.audiencia = b.dataset.audiencia; mostraChecklist(); }));
    $$("[data-ref]", corpo).forEach((b) => b.addEventListener("click", () => abreReferencia(B, b.dataset.ref)));
    const roteiro = $("#roteiro", corpo);
    if (roteiro){
      roteiro.addEventListener("input", () => {
        try { localStorage.setItem("roteiro-em-revisao", roteiro.value); } catch (e){ /* ok */ }
        const n = roteiro.value.trim() ? roteiro.value.trim().split(/\s+/).length : 0;
        $("#conta-palavras").textContent = textoPalavras(n);
      });
    }
    const nova = $("#nova-revisao", corpo);
    if (nova){
      nova.addEventListener("click", async () => {
        if (!confirm("Limpar o roteiro e desmarcar todos os itens da revisão?")) return;
        try { localStorage.removeItem("roteiro-em-revisao"); } catch (e){ /* ok */ }
        const chaves = dados.marcados.filter((m) => String(m.chave).startsWith("revisao:")).map((m) => m.chave);
        dados.marcados = dados.marcados.filter((m) => !String(m.chave).startsWith("revisao:"));
        if (chaves.length && !faltando.marcados){
          try { const r = await banco.from("marcados").delete().in("chave", chaves); if (r.error) throw r.error; }
          catch (erro){ toast(explicaErro("marcados", erro), "erro"); }
        }
        mostraChecklist();
      });
    }
  }

  function atualizaContagens(corpo){
    let feitosGeral = 0, totalGeral = 0;
    $$("details.bloco", corpo).forEach((d) => {
      const cbs = $$("input[data-chave]", d);
      const feitos = cbs.filter((c) => c.checked).length;
      feitosGeral += feitos; totalGeral += cbs.length;
      const conta = $("[data-conta]", d);
      if (conta){ conta.textContent = feitos + "/" + cbs.length; const b = $(".lado .progresso span", d); if (b) b.style.width = pct(feitos, cbs.length) + "%"; }
    });
    const geral = $(".progresso-geral", corpo);
    if (geral){
      const b = $(".progresso span", geral); if (b) b.style.width = pct(feitosGeral, totalGeral) + "%";
      const t = $("[data-conta-geral]", geral);
      if (t) t.textContent = estadoCheck.sub === "checklist" ? feitosGeral + " de " + totalGeral + " itens" : feitosGeral + " de " + totalGeral;
      const forte = $("strong", geral);
      if (forte && estadoCheck.sub === "checklist") forte.textContent = "Seu portfólio está " + pct(feitosGeral, totalGeral) + "% pronto";
    }
  }

  /* =========================================================
     10. ABA ROTEIROS (transcrição pela Supadata)
     A chave fica na tabela "configuracoes" do Supabase, nunca no código.
     ========================================================= */
  const SUPADATA = "https://api.supadata.ai/v1";
  const CHAVE_CONFIG = "supadata_api_key";
  const MSG_VAZIO = "Não achei fala nesse vídeo. Costuma ser reel só com música ou só com texto na tela.";
  const NOMES_FONTE = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", manual: "Escrito na mão" };
  const EMOJI_FONTE = { instagram: "📸", tiktok: "🎵", youtube: "▶️", manual: "✍️" };
  const estadoRot = { deQuem: "outra", filtro: "todos", busca: "", link: "", aviso: null, atual: null, saldo: null, editandoChave: false, abertos: new Set() };
  const emAndamento = new Set(); // roteiros sendo transcritos agora, nesta aba do navegador
  const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));

  function chaveSupadata(){
    const c = dados.configuracoes.find((x) => x.chave === CHAVE_CONFIG);
    return c && c.valor ? String(c.valor).trim() : "";
  }

  /* Limpa o link e descobre de onde ele é, o @ do perfil (quando aparece) e o id do vídeo */
  function analisaLink(bruto){
    const errado = "Esse link não parece certo. Ele precisa começar com https://, do jeito que vem quando você copia o link do vídeo.";
    const t = texto(bruto).trim();
    if (!/^https?:\/\//i.test(t)) return { erro: errado };
    let u;
    try { u = new URL(t); } catch (e){ return { erro: errado }; }
    const host = u.hostname.toLowerCase().replace(/^(www|m|vm|vt)\./, "");
    let fonte = null;
    if (host === "instagram.com" || host === "instagr.am") fonte = "instagram";
    else if (host === "tiktok.com") fonte = "tiktok";
    else if (host === "youtube.com" || host === "youtu.be") fonte = "youtube";
    if (!fonte) return { erro: "Por enquanto eu só transcrevo vídeos do Instagram, do TikTok e do YouTube." };
    if (fonte === "instagram") u.pathname = u.pathname.replace(/\/reels\//, "/reel/");
    Array.from(u.searchParams.keys()).forEach((k) => { if (k === "igsh" || k === "igshid" || /^utm_/i.test(k)) u.searchParams.delete(k); });
    u.hash = "";
    const limpo = u.toString().replace(/\?$/, "");
    const partes = u.pathname.split("/").filter(Boolean);
    let perfil = null, id = null;
    if (fonte === "instagram"){
      const i = partes.findIndex((p) => p === "reel" || p === "p" || p === "tv");
      if (i >= 0) id = partes[i + 1] || null;
      if (i === 1) perfil = partes[0];
    }
    if (fonte === "tiktok"){
      if (partes[0] && partes[0].startsWith("@")) perfil = partes[0].slice(1);
      const i = partes.indexOf("video");
      if (i >= 0 && /^\d+$/.test(partes[i + 1] || "")) id = partes[i + 1];
    }
    if (fonte === "youtube"){
      if (host === "youtu.be") id = partes[0] || null;
      else if (u.searchParams.get("v")) id = u.searchParams.get("v");
      else { const i = partes.findIndex((p) => p === "shorts" || p === "embed" || p === "live"); if (i >= 0) id = partes[i + 1] || null; }
    }
    return { url: limpo, fonte, perfil, id };
  }

  function embedDe(r){
    if (!r.url) return null;
    const info = analisaLink(r.url);
    if (info.erro || !info.id) return null;
    const id = encodeURIComponent(info.id);
    if (info.fonte === "instagram") return "https://www.instagram.com/reel/" + id + "/embed";
    if (info.fonte === "youtube") return "https://www.youtube.com/embed/" + id;
    if (info.fonte === "tiktok") return "https://www.tiktok.com/embed/v2/" + id;
    return null;
  }

  /* ---------- Conversa com a Supadata ---------- */
  async function lerResposta(r){
    try { return (await r.json()) || {}; } catch (e){ return {}; }
  }

  function erroSupadata(status, corpo){
    corpo = corpo || {};
    const codigo = texto(corpo.error || corpo.code);
    const detalhe = texto(corpo.details) + " " + texto(corpo.message);
    if (codigo === "limit-exceeded" || status === 429){
      if (/plan usage/i.test(detalhe)) return { tipo: "cota", msg: "Os créditos deste mês da Supadata acabaram. Eles voltam quando o seu plano renovar." };
      return { tipo: "pressa", msg: "Foram muitos pedidos seguidos. Espera 1 minuto e tenta de novo." };
    }
    if (status === 401 || status === 403 || codigo === "unauthorized" || codigo === "forbidden" || /api key/i.test(detalhe)){
      return { tipo: "chave", msg: "A chave da Supadata não funcionou. Confira se você colou ela inteira no campo 🔑 Chave da Supadata." };
    }
    if (status === 206 || codigo === "transcript-unavailable") return { tipo: "vazio" };
    if (status === 404 || codigo === "not-found") return { tipo: "video", msg: "Não encontrei esse vídeo. Ele pode ser privado, ter sido apagado ou o link estar incompleto." };
    if (status === 400 || codigo === "invalid-request") return { tipo: "video", msg: "O serviço não aceitou esse link. Confira se você copiou o link do vídeo, e não o do perfil." };
    return { tipo: "outro", msg: "Algo deu errado na transcrição. Tenta de novo daqui a pouco." };
  }

  function resultadoTranscricao(corpo){
    const c = corpo && corpo.content;
    let textoFinal = "", segmentos = null;
    if (typeof c === "string") textoFinal = c.trim();
    else if (Array.isArray(c)){
      segmentos = c;
      textoFinal = c.map((s) => texto(s && s.text)).join(" ").replace(/\s+/g, " ").trim();
    }
    if (!textoFinal || corpo.lang === "none") return { tipo: "vazio" };
    return { tipo: "ok", texto: textoFinal, segmentos };
  }

  async function transcreveSupadata(url, chave){
    const cabecalho = { "x-api-key": chave };
    const params = new URLSearchParams({ url: url, mode: "auto", text: "true", lang: "pt" });
    let r;
    try { r = await fetch(SUPADATA + "/transcript?" + params.toString(), { headers: cabecalho }); }
    catch (e){ return { tipo: "rede", msg: "Não consegui falar com o serviço de transcrição. Confira a sua internet e tenta de novo." }; }
    const corpo = await lerResposta(r);

    /* Vídeo longo: a Supadata devolve um número de pedido e a gente pergunta a cada 5 segundos */
    if (r.status === 202 && corpo.jobId){
      const inicio = Date.now();
      while (Date.now() - inicio < 6 * 60 * 1000){
        await espera(5000);
        let rj;
        try { rj = await fetch(SUPADATA + "/transcript/" + encodeURIComponent(corpo.jobId), { headers: cabecalho }); }
        catch (e){ continue; } // internet piscou: tenta de novo na próxima volta
        const cj = await lerResposta(rj);
        if (!rj.ok && rj.status !== 202) return erroSupadata(rj.status, cj);
        if (cj.status === "completed") return resultadoTranscricao(cj);
        if (cj.status === "failed"){
          const e = erroSupadata(0, typeof cj.error === "object" && cj.error ? cj.error : { error: cj.error, details: cj.details, message: cj.message });
          return e.tipo === "outro" ? { tipo: "outro", msg: "O serviço não conseguiu transcrever esse vídeo. Tenta de novo daqui a pouco." } : e;
        }
      }
      return { tipo: "demora", msg: "Demorou demais e eu parei de esperar. Tenta de novo daqui a pouco." };
    }
    if (!r.ok || r.status === 206) return erroSupadata(r.status, corpo);
    return resultadoTranscricao(corpo);
  }

  async function carregaSaldo(){
    const chave = chaveSupadata();
    if (!chave){ estadoRot.saldo = null; desenhaChave(); return; }
    estadoRot.saldo = { carregando: true }; desenhaChave();
    try {
      const r = await fetch(SUPADATA + "/me", { headers: { "x-api-key": chave } });
      const c = await lerResposta(r);
      if (!r.ok) estadoRot.saldo = { erro: (r.status === 401 || r.status === 403) ? "a chave não funcionou, confira se colou inteira" : "não consegui ver o saldo agora" };
      else estadoRot.saldo = { plano: texto(c.plan), max: num(c.maxCredits), usado: num(c.usedCredits) };
    } catch (e){ estadoRot.saldo = { erro: "não consegui ver o saldo agora" }; }
    desenhaChave();
  }

  /* ---------- Avisos da aba (andamento e erros) ---------- */
  function avisa(tipo, html, acoes){
    estadoRot.aviso = tipo ? { tipo, html, acoes: acoes || [] } : null;
    desenhaAviso();
  }
  function desenhaAviso(){
    const el = $("#rot-aviso");
    if (!el) return;
    const a = estadoRot.aviso;
    if (!a){ el.hidden = true; el.innerHTML = ""; return; }
    el.hidden = false;
    el.className = "rot-aviso " + a.tipo;
    el.innerHTML = '<span>' + a.html + '</span>' + (a.acoes.length ? '<span class="acoes">' +
      a.acoes.map((x, i) => '<button class="btn pequeno" type="button" data-aviso-acao="' + i + '">' + esc(x.rotulo) + '</button>').join("") + '</span>' : "");
  }
  const tempoPassado = (s) => (s < 60 ? s + "s" : Math.floor(s / 60) + "min " + String(s % 60).padStart(2, "0") + "s");
  const SEM_CHAVE = 'Para transcrever eu preciso da sua chave da Supadata, o serviço que ouve o vídeo. É rapidinho: ' +
    '<strong>1.</strong> crie uma conta grátis em <a href="https://supadata.ai" target="_blank" rel="noopener">supadata.ai</a> (100 créditos por mês, sem cartão). ' +
    '<strong>2.</strong> No painel deles, copie a sua API key. ' +
    '<strong>3.</strong> Cole no campo 🔑 Chave da Supadata aqui embaixo e clique em Salvar.';

  /* ---------- A chave da Supadata ---------- */
  function desenhaChave(){
    const el = $("#rot-chave");
    if (!el) return;
    if (faltando.configuracoes){
      el.innerHTML = '<span class="fraco">🔑 Para guardar a chave da Supadata, rode o arquivo sql-roteiros.sql no Supabase.</span>';
      return;
    }
    const chave = chaveSupadata();
    if (chave && !estadoRot.editandoChave){
      const s = estadoRot.saldo;
      let saldo = "";
      if (s && s.carregando) saldo = '<span class="fraco">vendo o saldo...</span>';
      else if (s && s.erro) saldo = '<span class="fraco">' + esc(s.erro) + '</span>';
      else if (s) saldo = '<strong>' + inteiro(s.usado) + (s.max ? ' de ' + inteiro(s.max) : "") + ' créditos usados</strong>' + (s.plano ? ' <span class="fraco">(plano ' + esc(s.plano) + ')</span>' : "");
      el.innerHTML = '<span>🔑 Chave da Supadata: <strong>••••' + esc(chave.slice(-4)) + '</strong></span><span class="fraco">·</span>' + saldo +
        '<span class="espaco" style="flex:1"></span><button class="btn pequeno" type="button" data-trocar-chave>Trocar chave</button>';
      return;
    }
    el.innerHTML = '<label for="rot-chave-campo"><strong>🔑 Chave da Supadata</strong></label>' +
      '<input type="password" id="rot-chave-campo" autocomplete="off" placeholder="cole a sua chave aqui" spellcheck="false">' +
      '<button class="btn principal-btn pequeno" type="button" data-salvar-chave>Salvar</button>' +
      (chave ? '<button class="btn pequeno" type="button" data-cancelar-chave>Cancelar</button>' : "") +
      '<span class="fraco">Não tem? Crie grátis em <a href="https://supadata.ai" target="_blank" rel="noopener">supadata.ai</a> (100 créditos por mês, sem cartão).</span>';
  }

  async function salvaChave(){
    const campo = $("#rot-chave-campo");
    const valor = campo ? campo.value.trim() : "";
    if (!valor){ toast("Cole a chave no campo antes de salvar.", "erro"); if (campo) campo.focus(); return; }
    try {
      const r = await banco.from("configuracoes").upsert({ chave: CHAVE_CONFIG, valor: valor, updated_at: new Date().toISOString() });
      if (r.error) throw r.error;
      dados.configuracoes = dados.configuracoes.filter((x) => x.chave !== CHAVE_CONFIG).concat([{ chave: CHAVE_CONFIG, valor: valor }]);
      estadoRot.editandoChave = false;
      toast("🔑 Chave salva.");
      if (estadoRot.aviso && estadoRot.aviso.html === SEM_CHAVE) avisa(null);
      carregaSaldo();
    } catch (erro){ toast(explicaErro("configuracoes", erro), "erro"); }
  }

  /* ---------- Transcrever ---------- */
  async function transcrever(){
    const campo = $("#rot-link");
    const bruto = campo ? campo.value : estadoRot.link;
    estadoRot.link = bruto;
    if (faltando.roteiros){ avisa("erro", "A biblioteca de roteiros ainda não existe no banco. Rode o arquivo sql-roteiros.sql no SQL Editor do Supabase e recarregue o painel."); return; }
    if (!texto(bruto).trim()){ avisa("erro", "Cole o link de um vídeo no campo acima primeiro."); if (campo) campo.focus(); return; }
    const info = analisaLink(bruto);
    if (info.erro){ avisa("erro", esc(info.erro)); if (campo) campo.focus(); return; }
    if (!chaveSupadata()){
      estadoRot.editandoChave = true; desenhaChave();
      avisa("erro", SEM_CHAVE);
      const c = $("#rot-chave-campo"); if (c) c.focus();
      return;
    }
    const existente = dados.roteiros.find((r) => texto(r.url) === info.url);
    if (existente && !confirm("Esse vídeo já está na sua biblioteca. Quer transcrever de novo? Isso gasta créditos da Supadata.")) return;

    avisa("info", "⏳ Guardando o link na biblioteca...");
    const linha = existente
      ? await salvar("roteiros", { status: "processando", erro: null }, existente.id)
      : await salvar("roteiros", { fonte: info.fonte, url: info.url, perfil: info.perfil, de_quem: estadoRot.deQuem, status: "processando" });
    if (!linha || typeof linha !== "object"){ avisa("erro", "Não consegui guardar na biblioteca agora. Confira a sua internet e tenta de novo."); return; }
    estadoRot.link = "";
    executaTranscricao(linha);
  }

  async function executaTranscricao(r){
    const id = r.id;
    emAndamento.add(id);
    estadoRot.atual = id;
    const inicio = Date.now();
    const tick = () => {
      if (estadoRot.atual !== id) return;
      const s = Math.round((Date.now() - inicio) / 1000);
      avisa("info", "⏳ Ouvindo o vídeo… " + tempoPassado(s) + ". Costuma levar de 3 a 4 minutos, pode deixar a aba aberta.");
    };
    tick();
    const relogio = setInterval(tick, 5000);
    if (abaAtual() === "roteiros") mostraRoteiros();

    const res = await transcreveSupadata(r.url, chaveSupadata());
    clearInterval(relogio);
    emAndamento.delete(id);

    if (res.tipo === "ok"){
      await salvar("roteiros", { transcricao: res.texto, segmentos: res.segmentos, status: "pronto", erro: null }, id);
      carregaSaldo();
      if (abaAtual() === "roteiros"){
        mostraRoteiros();
        if (estadoRot.atual === id) avisa("ok", "✅ Pronto. Revisa, dá um nome e salva.");
        const atual = dados.roteiros.find((x) => x.id === id);
        if (atual) formRoteiro(atual, "✅ Pronto. Revisa, dá um nome e salva.");
      } else toast("✅ Um roteiro ficou pronto na aba Roteiros.");
      return;
    }

    const msg = res.tipo === "vazio" ? MSG_VAZIO : res.msg;
    await salvar("roteiros", { status: "falhou", erro: msg }, id);
    if (res.tipo !== "rede") carregaSaldo();
    if (abaAtual() === "roteiros"){
      mostraRoteiros();
      if (estadoRot.atual === id){
        const acoes = res.tipo === "vazio"
          ? [{ rotulo: "📝 Guardar assim mesmo", fn: () => abreRoteiro(id) }]
          : (res.tipo === "chave" ? [{ rotulo: "🔑 Trocar chave", fn: () => { estadoRot.editandoChave = true; desenhaChave(); } }] : [{ rotulo: "🔁 Tentar de novo", fn: () => tentarDeNovo(id) }]);
        avisa("erro", (res.tipo === "vazio" ? "🔇 " : "⚠️ ") + esc(msg), acoes);
      }
    } else toast(msg, "erro");
  }

  async function tentarDeNovo(id){
    const r = dados.roteiros.find((x) => x.id === id);
    if (!r) return;
    if (!r.url){ abreRoteiro(id); return; }
    if (!chaveSupadata()){ estadoRot.editandoChave = true; desenhaChave(); avisa("erro", SEM_CHAVE); return; }
    const linha = await salvar("roteiros", { status: "processando", erro: null }, id);
    if (linha && typeof linha === "object") executaTranscricao(linha);
  }

  /* ---------- Editar, escrever na mão, copiar, apagar ---------- */
  function abreRoteiro(id){
    const r = dados.roteiros.find((x) => x.id === id);
    if (r) formRoteiro(r);
  }

  function formRoteiro(r, avisoTopo){
    const valores = r ? Object.assign({}, r, { tags: (Array.isArray(r.tags) ? r.tags : []).join(", ") }) : { de_quem: estadoRot.deQuem };
    abrirFormulario({
      titulo: r ? "✏️ Editar roteiro" : "✍️ Escrever roteiro na mão",
      aviso: avisoTopo,
      valores: valores,
      campos: [
        { nome: "titulo", rotulo: "Título", inteira: true },
        { nome: "de_quem", rotulo: "De quem", tipo: "select", opcoes: [{ valor: "outra", rotulo: "De outra pessoa" }, { valor: "minha", rotulo: "Meu" }] },
        { nome: "perfil", rotulo: "Perfil (@)", dica: "Ex: @perfildacreator" },
        { nome: "url", rotulo: "Link do vídeo", tipo: "url", inteira: true },
        { nome: "postado_em", rotulo: "Data de postagem", tipo: "date" },
        { nome: "tags", rotulo: "Tags", dica: "Separadas por vírgula. Ex: gancho, skincare, humor" },
        { nome: "legenda", rotulo: "Legenda do post", tipo: "textarea", inteira: true },
        { nome: "transcricao", rotulo: "Transcrição", tipo: "textarea", inteira: true, alto: true },
        { nome: "obs", rotulo: "Minhas notas", tipo: "textarea", inteira: true }
      ],
      aoSalvar: async (v) => {
        const saida = Object.assign({}, v);
        saida.tags = texto(v.tags).split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean);
        saida.perfil = texto(v.perfil).trim().replace(/^@/, "") || null;
        const link = texto(v.url).trim();
        if (link){
          if (!/^https?:\/\//i.test(link)){ toast("O link precisa começar com https://", "erro"); return false; }
          const info = analisaLink(link);
          saida.url = info.erro ? link : info.url;
          saida.fonte = info.erro ? "manual" : info.fonte;
          if (!saida.perfil && !info.erro && info.perfil) saida.perfil = info.perfil;
        } else { saida.url = null; saida.fonte = "manual"; }
        saida.status = "pronto";
        saida.erro = null;
        const ok = await salvar("roteiros", saida, r ? r.id : null);
        if (ok){
          if (estadoRot.aviso && estadoRot.aviso.tipo !== "info") avisa(null);
          mostraRoteiros();
        }
        return ok;
      },
      aoApagar: r ? async () => { const ok = await apagar("roteiros", r.id); if (ok) mostraRoteiros(); return ok; } : null
    });
  }

  async function copiaTexto(t){
    try { await navigator.clipboard.writeText(t); return true; }
    catch (e){
      const area2 = document.createElement("textarea");
      area2.value = t; area2.style.position = "fixed"; area2.style.opacity = "0";
      document.body.appendChild(area2); area2.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e2){ ok = false; }
      area2.remove();
      return ok;
    }
  }

  /* ---------- Estudar com o Claude: monta o prompt e copia ---------- */
  function promptEstudo(){
    const lista = dados.roteiros
      .filter((r) => r.de_quem === "outra" && texto(r.transcricao).trim())
      .sort((a, b) => texto(b.created_at).localeCompare(texto(a.created_at)))
      .slice(0, 10);
    if (!lista.length) return null;
    const videos = lista.map((r, i) =>
      "VÍDEO " + (i + 1) + "\n" +
      "Perfil: " + (r.perfil ? "@" + r.perfil : "não informado") + "\n" +
      "Fonte: " + (NOMES_FONTE[r.fonte] || "não informada") + "\n" +
      (r.titulo ? "Título: " + r.titulo + "\n" : "") +
      "Transcrição:\n" + texto(r.transcricao).trim()).join("\n\n");
    return {
      n: lista.length,
      texto:
        "Oi, Claude! Eu sou a Isabelle Bueno, creator de UGC e micro influenciadora (@bellebuenosilveira). " +
        "Faço vídeos para marcas de beleza, skincare, moda, comida, casa e decoração, maternidade, pet, viagem e tech.\n\n" +
        "Abaixo estão as transcrições de " + lista.length + " vídeo" + (lista.length === 1 ? "" : "s") + " de outras creators que eu salvei como referência. " +
        "Estude esses vídeos e me entregue:\n\n" +
        "1. Assuntos em alta: os temas que aparecem com mais força nesses vídeos.\n" +
        "2. Expressões que estão prendendo: frases e jeitos de falar que seguram a atenção, com o trecho de onde você tirou.\n" +
        "3. Padrões de gancho: os tipos de abertura que se repetem. Para cada padrão, mostre um exemplo real tirado das transcrições.\n" +
        "4. Cinco roteiros novos no MEU assunto (UGC para os nichos que eu atendo), reaproveitando a ESTRUTURA desses vídeos, e não o conteúdo. " +
        "Cada roteiro com gancho, desenvolvimento e chamada final, em blocos de tempo, para vídeos de 30 a 60 segundos.\n\n" +
        "Importante: escreva do jeito que uma pessoa fala de verdade, com naturalidade, sem cara de texto robotizado e sem copiar frases das outras creators.\n\n" +
        "VÍDEOS DE REFERÊNCIA\n\n" + videos
    };
  }

  /* ---------- A tela ---------- */
  function mostraRoteiros(){
    const termo = estadoRot.busca.toLowerCase();
    const todasTags = Array.from(new Set(dados.roteiros.flatMap((r) => (Array.isArray(r.tags) ? r.tags : [])).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
    if (estadoRot.filtro.startsWith("tag:") && !todasTags.includes(estadoRot.filtro.slice(4))) estadoRot.filtro = "todos";
    const lista = dados.roteiros
      .filter((r) => {
        const f = estadoRot.filtro;
        if (f === "meus") return r.de_quem === "minha";
        if (f === "outras") return r.de_quem !== "minha";
        if (f.startsWith("tag:")) return Array.isArray(r.tags) && r.tags.includes(f.slice(4));
        return true;
      })
      .filter((r) => !termo || [r.transcricao, r.perfil, r.titulo, r.obs, r.legenda].concat(Array.isArray(r.tags) ? r.tags : [])
        .some((x) => texto(x).toLowerCase().includes(termo)))
      .sort((a, b) => texto(b.created_at).localeCompare(texto(a.created_at)));

    const contaMeus = dados.roteiros.filter((r) => r.de_quem === "minha").length;
    const chips = [["todos", "Todos", dados.roteiros.length], ["meus", "Meus", contaMeus], ["outras", "De outras", dados.roteiros.length - contaMeus]]
      .concat(todasTags.map((t) => ["tag:" + t, "#" + t, null]))
      .map(([v, rot, n]) => '<button class="chip" type="button" data-filtro-rot="' + esc(v) + '" aria-pressed="' + (estadoRot.filtro === v) + '">' + esc(rot) + (n != null ? '<span class="n">' + n + '</span>' : "") + '</button>').join("");

    const cards = lista.length ? '<div class="rot-grade">' + lista.map(cardRoteiro).join("") + '</div>'
      : '<p class="vazio">' + (dados.roteiros.length
          ? "Nada encontrado com essa busca ou filtro."
          : "📜 Sua biblioteca ainda está vazia. Cole o link de um reel lá em cima e clique em Transcrever, ou escreva um roteiro na mão.") + '</p>';

    area.innerHTML = '<div id="rot-raiz">' +
      '<section class="cartao">' +
        '<div class="rot-entrada">' +
          '<input type="url" id="rot-link" inputmode="url" autocomplete="off" placeholder="Cole aqui: instagram.com/reel/... · tiktok.com/... · youtube.com/..." aria-label="Link do vídeo" value="' + esc(estadoRot.link) + '">' +
          '<div class="seletor" role="group" aria-label="De quem é o vídeo">' +
            [["outra", "De outra pessoa"], ["minha", "Meu"]].map(([v, t]) => '<button type="button" data-de-quem="' + v + '" aria-pressed="' + (estadoRot.deQuem === v) + '">' + t + '</button>').join("") +
          '</div>' +
          '<button class="btn principal-btn" type="button" id="rot-transcrever">🎧 Transcrever</button>' +
          '<button class="btn" type="button" id="rot-manual">' + ic("mais") + 'Escrever na mão ✍️</button>' +
        '</div>' +
        '<div class="rot-aviso" id="rot-aviso" role="status" aria-live="polite" hidden></div>' +
        '<div class="rot-chave" id="rot-chave"></div>' +
      '</section>' +
      '<div class="ferramentas" style="margin-top:16px">' +
        '<label class="busca">' + ic("busca") + '<input type="search" id="rot-busca" placeholder="Buscar na transcrição, perfil, título ou notas" value="' + esc(estadoRot.busca) + '" aria-label="Buscar roteiros"></label>' +
        '<div class="chips" role="group" aria-label="Filtrar roteiros">' + chips + '</div>' +
        '<span class="espaco"></span>' +
        '<button class="btn" type="button" id="rot-estudar">🧠 Estudar com o Claude</button>' +
      '</div>' + cards + '</div>';

    desenhaAviso();
    desenhaChave();
    if (chaveSupadata() && estadoRot.saldo === null) carregaSaldo();
    ligaRoteiros();
  }

  function cardRoteiro(r){
    const fonte = NOMES_FONTE[r.fonte] ? r.fonte : "manual";
    const emb = embedDe(r);
    const aberto = emb && estadoRot.abertos.has(r.id);
    const capa = aberto
      ? '<div class="rot-capa"><iframe src="' + esc(emb) + '" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; clipboard-write" allowfullscreen title="Vídeo: ' + esc(r.titulo || "sem título") + '"></iframe></div>'
      : '<div class="rot-capa f-' + fonte + '"><span class="fonte-emoji" aria-hidden="true">' + EMOJI_FONTE[fonte] + '</span>' +
          (emb ? '<button class="ver" type="button" data-ver="' + esc(r.id) + '">▶ ver vídeo</button>'
               : (r.url ? '<a class="ver" href="' + esc(r.url) + '" target="_blank" rel="noopener">↗ abrir</a>' : "")) + '</div>';

    let estado = "";
    if (r.status === "processando"){
      estado = emAndamento.has(r.id)
        ? '<div class="rot-status processando"><span class="relogio" aria-hidden="true"></span>Transcrevendo... pode continuar usando o painel.</div>'
        : '<div class="rot-status processando"><span class="relogio" aria-hidden="true"></span>Ficou parado no meio, provavelmente a aba foi fechada.' +
          '<button class="btn pequeno" type="button" data-tentar="' + esc(r.id) + '" style="margin-left:auto">🔁 Tentar de novo</button></div>';
    } else if (r.status === "falhou"){
      estado = '<div class="rot-status falhou"><span>⚠️ ' + esc(r.erro || "A transcrição não deu certo.") + '</span></div>';
    }

    const quando = r.postado_em ? "postado em " + dataBR(r.postado_em) : (r.created_at ? "salvo em " + new Date(r.created_at).toLocaleDateString("pt-BR") : "");
    const tags = (Array.isArray(r.tags) ? r.tags : []).map((t) => '<span class="pilula p-tag">#' + esc(t) + '</span>').join("");
    const temTexto = texto(r.transcricao).trim();

    const acoes = r.status === "falhou"
      ? '<button class="btn pequeno" type="button" data-editar-rot="' + esc(r.id) + '">📝 Abrir mesmo assim</button>' +
        (r.url ? '<button class="btn pequeno" type="button" data-tentar="' + esc(r.id) + '">🔁 Tentar de novo</button>' : "")
      : (temTexto ? '<button class="btn pequeno" type="button" data-copiar="' + esc(r.id) + '">📋 Copiar transcrição</button>' : "") +
        '<button class="btn pequeno" type="button" data-editar-rot="' + esc(r.id) + '">✏️ Editar</button>';

    return '<article class="rot-card' + (aberto ? " com-video" : "") + '">' + capa +
      '<div class="rot-info">' +
        '<h3>' + (r.titulo ? esc(r.titulo) : '<span class="fraco">Sem título</span>') + '</h3>' +
        '<div class="rot-meta">' +
          (r.perfil ? '<span>@' + esc(r.perfil) + '</span>' : "") +
          '<span class="pilula ' + (r.de_quem === "minha" ? "p-minha" : "p-outra") + '">' + (r.de_quem === "minha" ? "Meu" : "De outra") + '</span>' +
          '<span class="pilula p-cinza">' + EMOJI_FONTE[fonte] + ' ' + NOMES_FONTE[fonte] + '</span>' +
          (quando ? '<span>' + esc(quando) + '</span>' : "") +
        '</div>' +
        (tags ? '<div class="rot-meta">' + tags + '</div>' : "") +
        estado +
        (temTexto ? '<p class="rot-trecho">' + esc(temTexto.slice(0, 500)) + '</p>' : "") +
        '<div class="rot-acoes">' + acoes +
          (aberto ? '<button class="btn pequeno" type="button" data-fechar-video="' + esc(r.id) + '">✖ Fechar vídeo</button>' : "") +
          '<button class="btn pequeno perigo" type="button" data-apagar-rot="' + esc(r.id) + '">🗑️ Apagar</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function ligaRoteiros(){
    const raiz = $("#rot-raiz");
    if (!raiz) return;
    const link = $("#rot-link");
    link.addEventListener("input", () => { estadoRot.link = link.value; });
    link.addEventListener("keydown", (e) => { if (e.key === "Enter"){ e.preventDefault(); transcrever(); } });
    $("#rot-transcrever").addEventListener("click", transcrever);
    $("#rot-manual").addEventListener("click", () => {
      if (faltando.roteiros){ avisa("erro", "A biblioteca de roteiros ainda não existe no banco. Rode o arquivo sql-roteiros.sql no SQL Editor do Supabase e recarregue o painel."); return; }
      formRoteiro(null);
    });
    const busca = $("#rot-busca");
    busca.addEventListener("input", () => {
      estadoRot.busca = busca.value;
      const pos = busca.selectionStart;
      mostraRoteiros();
      const nova = $("#rot-busca"); nova.focus(); try { nova.setSelectionRange(pos, pos); } catch (e){ /* ok */ }
    });
    $("#rot-estudar").addEventListener("click", async () => {
      const p = promptEstudo();
      if (!p){ avisa("erro", "🧠 Ainda não tem roteiros de outras creators com transcrição. Transcreva alguns marcando \"De outra pessoa\" e tenta de novo."); return; }
      const ok = await copiaTexto(p.texto);
      if (ok){ avisa("ok", "🧠 Prompt copiado com os " + p.n + " roteiros mais recentes de outras creators. Abra o Claude, cole numa conversa nova e envie."); toast("🧠 Prompt copiado!"); }
      else avisa("erro", "Não consegui copiar sozinha. Tente de novo pelo Chrome.");
    });

    raiz.addEventListener("click", async (e) => {
      const alvo = e.target.closest("button, a");
      if (!alvo || !raiz.contains(alvo)) return;
      const d = alvo.dataset;
      if (d.deQuem){ estadoRot.deQuem = d.deQuem; $$("[data-de-quem]", raiz).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.deQuem === d.deQuem))); return; }
      if (d.filtroRot){ estadoRot.filtro = d.filtroRot; mostraRoteiros(); return; }
      if (d.avisoAcao != null){ const a = estadoRot.aviso && estadoRot.aviso.acoes[num(d.avisoAcao)]; if (a) a.fn(); return; }
      if ("trocarChave" in d){ estadoRot.editandoChave = true; desenhaChave(); const c = $("#rot-chave-campo"); if (c) c.focus(); return; }
      if ("cancelarChave" in d){ estadoRot.editandoChave = false; desenhaChave(); return; }
      if ("salvarChave" in d){ salvaChave(); return; }
      if (d.ver){ estadoRot.abertos.add(d.ver); mostraRoteiros(); return; }
      if (d.fecharVideo){ estadoRot.abertos.delete(d.fecharVideo); mostraRoteiros(); return; }
      if (d.editarRot){ abreRoteiro(d.editarRot); return; }
      if (d.tentar){ tentarDeNovo(d.tentar); return; }
      if (d.copiar){
        const r = dados.roteiros.find((x) => x.id === d.copiar);
        if (!r) return;
        const original = alvo.textContent;
        const ok = await copiaTexto(texto(r.transcricao));
        alvo.textContent = ok ? "copiado ✓" : "não consegui copiar";
        setTimeout(() => { alvo.textContent = original; }, 1800);
        return;
      }
      if (d.apagarRot){
        const r = dados.roteiros.find((x) => x.id === d.apagarRot);
        if (!r || !confirm('Apagar "' + (r.titulo || "Sem título") + '" da biblioteca? Isso não tem volta.')) return;
        if (await apagar("roteiros", r.id)){ toast("🗑️ Roteiro apagado."); mostraRoteiros(); }
      }
    });
    raiz.addEventListener("keydown", (e) => {
      if (e.target && e.target.id === "rot-chave-campo" && e.key === "Enter"){ e.preventDefault(); salvaChave(); }
    });
  }

  /* ---------------------------------------------------------
     11. COMEÇAR
     --------------------------------------------------------- */
  trocaAba();          // mostra a aba já (vazia) enquanto carrega
  area.innerHTML = '<p class="carregando">Carregando seus dados...</p>';
  await carregarTudo();
  trocaAba();
})();
