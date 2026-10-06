/* =========================================================
   CONEXÃO COM O SUPABASE
   Este é o único lugar com o endereço e a chave do banco.
   Todas as páginas (portfólio, login e admin) usam este arquivo.

   A chave abaixo é a chave PÚBLICA (publishable). Ela pode ficar
   no site sem problema: quem protege os dados é a tranca (RLS)
   que está no arquivo banco.sql.
   NUNCA coloque aqui a chave secreta (service_role / secret).
   ========================================================= */
(function(){
  var SUPABASE_URL = "https://kfwmrlgiongxppsyzamn.supabase.co";
  var SUPABASE_CHAVE_PUBLICA = "sb_publishable_ghUVNujI5jkXF8-LvUCKsg_fjnacIKl";

  /* window.banco é o cliente do Supabase que as páginas usam.
     Se a biblioteca do Supabase não carregou (internet fora, por exemplo),
     window.banco fica null e cada página mostra um aviso em vez de quebrar. */
  window.banco = null;
  try {
    if (window.supabase && typeof window.supabase.createClient === "function"){
      window.banco = window.supabase.createClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA);
    }
  } catch (e){
    window.banco = null;
  }
})();
