'use strict';

// factions: which factions this event primarily concerns
// tone: 'crisis' = arises from an unhappy/demanding faction
//       'opportunity' = arises from a content/engaged faction
//       'neutral' = quirky, not mood-driven
// ignore.fx: what happens if the player does nothing (timer expires)

const EVENTS = [
  {
    id: 'coloms', icon: '🐦', title: 'LA INVASIÓ',
    factions: ['veins', 'activistes'], tone: 'crisis',
    text: 'Una colònia de coloms ha ocupat el jutjat municipal. Els advocats no poden entrar. Fa tres dies. El degà del col·legi diu que "tècnicament ja no hi ha llei".',
    options: [
      { label: 'Desallotjar-los', preview: '+Veïns  −Activistes  −150€', fx: { veins: 10, activistes: -12, money: -150 } },
      { label: 'Negociar', preview: '+Activistes  −Veïns', fx: { activistes: 12, veins: -8 }, risk: 'Risc: assemblea permanent de coloms' },
    ],
    ignore: { fx: { veins: -5, mercat: -5 } },
  },
  {
    id: 'app', icon: '📱', title: 'GOVTECH SOLUTIONS',
    factions: ['mercat', 'veins'], tone: 'opportunity',
    text: 'Una startup vol fer una app de queixes municipals. S\'anomenen "Queixa+". Porten corbata els caps de setmana i diuen "escalar" molt.',
    options: [
      { label: 'Contractar-los', preview: '+Veïns  +Mercat  −350€', fx: { veins: 8, mercat: 10, money: -350 } },
      { label: 'Rebutjar', preview: '−Mercat', fx: { mercat: -10 }, risk: 'Les queixes les rebràs tu directament' },
    ],
    ignore: { fx: { mercat: -8 } },
  },
  {
    id: 'formatge', icon: '🧀', title: 'EL FORMATGE',
    factions: ['veins'], tone: 'crisis',
    text: 'Un camió ha bolcat a la rotonda. Tres tones de brie. Fa cinc dies. Ningú sap de qui és el camió. La florista diu que "li agrada la nova olor".',
    options: [
      { label: 'Netejar-ho', preview: '+Veïns  −200€', fx: { veins: 12, money: -200 } },
      { label: 'Declarar-ho monument', preview: '+Activistes  −Veïns  −Mercat', fx: { activistes: 14, veins: -12, mercat: -8 }, risk: 'Risc sanitari latent' },
    ],
    ignore: { fx: { veins: -10 } },
  },
  {
    id: 'calendari', icon: '📅', title: 'LA FESTA',
    factions: ['activistes'], tone: 'crisis',
    text: 'Els Activistes proposen canviar el nom de la Festa Major a "Celebració de la Consciència Col·lectiva i la Identitat en Diàleg". Ja han imprès els programes.',
    options: [
      { label: 'Acceptar el nom', preview: '+Activistes  −Veïns', fx: { activistes: 12, veins: -8 } },
      { label: 'Ignorar-ho', preview: '−Activistes', fx: { activistes: -12 }, risk: 'Pintaran la façana de l\'ajuntament' },
    ],
    ignore: { fx: { activistes: -8 } },
  },
  {
    id: 'conseller', icon: '🧳', title: 'VISITA OFICIAL',
    factions: ['mercat'], tone: 'opportunity',
    text: 'Un conseller autonòmic vol visitar el poble. Necessita catifa vermella, 15 aparcaments reservats, un "dinar lleuger" de 4 plats i "accés a un piano".',
    options: [
      { label: 'Acollir-lo', preview: '+Mercat  −450€', fx: { mercat: 10, money: -450 } },
      { label: 'Excuses mèdiques', preview: '+Veïns  −Mercat', fx: { veins: 6, mercat: -12 } },
    ],
    ignore: { fx: { mercat: -8 } },
  },
  {
    id: 'semàfor', icon: '🚦', title: 'EL SEMÀFOR',
    factions: ['veins'], tone: 'crisis',
    text: 'El semàfor de la plaça major porta 9 mesos parpellejant. Els veïns tenen un grup de WhatsApp dedicat. Té 847 membres i un logo propi.',
    options: [
      { label: 'Arreglar-lo', preview: '+Veïns  −120€', fx: { veins: 14, money: -120 } },
      { label: 'Dir que ja s\'ha encarregat', preview: 'Guanya temps', fx: { veins: -3 }, risk: 'Es descobrirà en 2-3 setmanes' },
    ],
    ignore: { fx: { veins: -9 } },
  },
  {
    id: 'fabrica', icon: '🏭', title: 'INVERSIÓ ESTRANGERA',
    factions: ['mercat', 'activistes'], tone: 'opportunity',
    text: 'Una empresa japonesa vol obrir una fàbrica de palets al polígon. No parlen català ni castellà ni anglès. Comuniquen amb diagrames de flux.',
    options: [
      { label: 'Benvinguts!', preview: '+Mercat  +400€  −Activistes', fx: { mercat: 15, activistes: -10, money: 400 } },
      { label: 'Estudi d\'impacte primer', preview: '+Activistes  −Mercat', fx: { activistes: 10, mercat: -12 } },
    ],
    ignore: { fx: { mercat: -12 } },
  },
  {
    id: 'festival', icon: '🥛', title: 'FESTIVAL DEL IOGURT',
    factions: ['veins', 'activistes'], tone: 'opportunity',
    text: 'Un col·lectiu proposa el Primer Festival Internacional de Iogurt Artesà de la Comarca. Ja han encarregat samarretes. Amb les samarretes ho han fet tot.',
    options: [
      { label: 'Subvencionar', preview: '+Veïns  +Activistes  −280€', fx: { veins: 8, activistes: 10, money: -280 } },
      { label: 'Que es financin sols', preview: '−Veïns  −Activistes', fx: { veins: -6, activistes: -10 } },
    ],
    ignore: { fx: { activistes: -10, veins: -4 } },
  },
  {
    id: 'gat', icon: '🐱', title: 'INCIDENT FELÍ',
    factions: ['mercat'], tone: 'crisis',
    text: 'El gat del despatx ha mossegat al tresorer. El tresorer amenaça amb denúncia. El gat ha estat fotografiat dormint còmodament sobre els expedients.',
    options: [
      { label: 'Indemnitzar el tresorer', preview: '−220€  evita escàndol', fx: { money: -220 } },
      { label: 'Defensar el gat', preview: '+Activistes  −Mercat', fx: { activistes: 14, mercat: -14 }, risk: 'Escàndol garantit. El gat no s\'ha disculpat.' },
    ],
    ignore: { fx: { mercat: -8, money: -300 } },
  },
  {
    id: 'rotonda', icon: '🔄', title: 'ROTONDA PREMIUM',
    factions: ['mercat', 'veins', 'activistes'], tone: 'opportunity',
    text: 'L\'empresa de pavimentació ofereix una rotonda completament gratis. A canvi d\'un logo de l\'empresa de 4 metres de diàmetre al centre i drets de denominació (Rotonda Asfaltis S.L.).',
    options: [
      { label: 'Acceptar', preview: '+Mercat  −Veïns  −Activistes', fx: { mercat: 14, veins: -10, activistes: -8 } },
      { label: 'Rebutjar', preview: '+Veïns  +Activistes  −Mercat', fx: { veins: 8, activistes: 8, mercat: -12 } },
    ],
    ignore: { fx: { mercat: -5 } },
  },
  {
    id: 'vaga', icon: '🧹', title: 'EXIGÈNCIES LABORALS',
    factions: ['veins', 'activistes'], tone: 'crisis',
    text: 'El sindicat de neteja vol aire condicionat als uniformes d\'estiu. La proposta incloïa LED integrats però han acceptat retirar-los "de moment".',
    options: [
      { label: 'Uniformes nous (sense LED)', preview: '+Veïns  −180€', fx: { veins: 10, money: -180 } },
      { label: 'Vaga que és vaga', preview: '−Veïns  −Activistes', fx: { veins: -16, activistes: -8 }, risk: 'Durarà més del previst' },
    ],
    ignore: { fx: { veins: -15, activistes: -8 } },
  },
  {
    id: 'turistes', icon: '📸', title: 'TURISME CULTURAL',
    factions: ['mercat', 'veins'], tone: 'opportunity',
    text: 'Un grup de turistes alemanys ha descobert el poble per un error de GPS. Volen una ruta guiada pel cementiri. "Sehr authentisch", diuen. Molt contents.',
    options: [
      { label: 'Organitzar la ruta', preview: '+Mercat  +150€  −Veïns', fx: { mercat: 10, money: 150, veins: -6 } },
      { label: 'Redirigir-los al museu', preview: '+Veïns  −Mercat', fx: { veins: 6, mercat: -8 }, risk: 'El museu tanca els dimecres' },
    ],
    ignore: { fx: { mercat: -5 } },
  },
  {
    id: 'viral', icon: '🌐', title: 'FENOMEN VIRAL',
    factions: ['veins', 'mercat'], tone: 'opportunity',
    text: 'El perfil oficial del municipi ha publicat per error una foto del gat de l\'alcalde. Té 50.000 likes. Sis periodistes truquen. El gat no en sap res.',
    options: [
      { label: 'Aprofitar l\'ona', preview: '+Veïns  +Mercat  compte oficial del gat', fx: { veins: 14, mercat: 10 } },
      { label: 'Esborrar i disculpar-se', preview: '+Activistes  −Veïns  −Mercat', fx: { activistes: 8, veins: -10, mercat: -10 } },
    ],
    ignore: { fx: { veins: -4, mercat: -4 } },
  },
  {
    id: 'canonada', icon: '💧', title: 'EMERGÈNCIA HIDRÀULICA',
    factions: ['veins'], tone: 'crisis',
    text: 'La canonada principal de la plaça ha petat. L\'aigua surt per la floristeria. La florista diu que és "una benedicció" i ha pujat els preus un 40%.',
    options: [
      { label: 'Reparació urgent', preview: '+Veïns  −380€', fx: { veins: 12, money: -380 } },
      { label: 'Font ornamental provisional', preview: '+Activistes  −Veïns  −180€', fx: { activistes: 12, veins: -10, money: -180 } },
    ],
    ignore: { fx: { veins: -14, money: -200 } },
  },
  {
    id: 'sondeo', icon: '🗳️', title: 'SONDEO ELECTORAL',
    factions: ['veins'], tone: 'neutral',
    text: 'Un sondeo us dona 34% d\'intenció de vot. El rival en té 35%. L\'1% restant vota per en Brie (el formatge de la rotonda, ja amb personalitat jurídica pròpia).',
    options: [
      { label: 'Campanya de proximitat', preview: '+Veïns  −220€', fx: { veins: 12, money: -220 } },
      { label: 'Ignorar sondeos', preview: 'Res canvia', fx: {} },
    ],
    ignore: { fx: { veins: -3 } },
  },
  {
    id: 'reciclatge', icon: '♻️', title: 'PLA VERD',
    factions: ['activistes'], tone: 'crisis',
    text: 'Els Activistes proposen substituir tots els contenidors per "Punts de Consciència Ambiental". Costen el triple. Vénen en colors que "no existien fins ara".',
    options: [
      { label: 'Pla mixt (la meitat)', preview: '+Activistes  −Mercat  −220€', fx: { activistes: 8, mercat: -4, money: -220 } },
      { label: 'Contenidors de sempre', preview: '+Mercat  −Activistes', fx: { mercat: 8, activistes: -14 } },
    ],
    ignore: { fx: { activistes: -12 } },
  },
  {
    id: 'concert', icon: '🎸', title: 'FESTIVAL DE MÚSICA',
    factions: ['mercat', 'activistes', 'veins'], tone: 'opportunity',
    text: 'Una promotora vol un festival de música electrònica al parc. "Serà tranquil", asseguren. El DJ principal es diu DJ Apocalipsi.',
    options: [
      { label: 'Autoritzar', preview: '+Mercat  +Activistes  −Veïns', fx: { mercat: 10, activistes: 14, veins: -16 } },
      { label: 'Denegar', preview: '+Veïns  −Mercat  −Activistes', fx: { veins: 12, mercat: -10, activistes: -10 } },
    ],
    ignore: { fx: { activistes: -8, mercat: -6 } },
  },
  {
    id: 'auditoria', icon: '📊', title: 'AUDITORIA SORPRESA',
    factions: ['veins', 'mercat'], tone: 'crisis',
    text: 'L\'assessoria ha trobat un error al pressupost. Falten 280€ de l\'any passat. "Han d\'haver sortit d\'alguna banda", diu l\'auditor, mirant el gat.',
    options: [
      { label: 'Investigar', preview: '+Veïns  −Mercat  −100€', fx: { veins: 8, mercat: -10, money: -100 } },
      { label: 'Absorbir la diferència', preview: '−280€  nota de premsa breu', fx: { money: -280 } },
    ],
    ignore: { fx: { veins: -8, mercat: -8 } },
  },
  {
    id: 'globus', icon: '🎈', title: 'EMERGÈNCIA AÈRIA',
    factions: ['veins'], tone: 'crisis',
    text: 'Un globus d\'aire calent s\'ha enganxat al campanar. La parella a bord porta 4 hores allà dalt. Han demanat pizza. La pizza ja ha arribat. El campaner no sap on mirar.',
    options: [
      { label: 'Desplegar la grua', preview: '+Veïns  −180€', fx: { veins: 12, money: -180 }, risk: 'La grua és del 1987' },
      { label: 'Esperar que baixi sol', preview: '+Mercat  −Veïns  (espectacle)', fx: { mercat: 8, veins: -10 }, risk: 'Bateria per a dos dies més' },
    ],
    ignore: { fx: { veins: -8, mercat: 6 } },
  },
  {
    id: 'gossos', icon: '🐕', title: 'GUERRA PEL SOLAR',
    factions: ['veins', 'activistes', 'mercat'], tone: 'crisis',
    text: 'El solar de la cantonada desperta passions. Els propietaris de gossos volen parc caní. Els Activistes volen hort comunitari. El Mercat vol aparcament. El solar fa 8×6 metres.',
    options: [
      { label: 'Parc caní', preview: '+Veïns  −Activistes  −Mercat', fx: { veins: 10, activistes: -10, mercat: -8 } },
      { label: 'Hort comunitari', preview: '+Activistes  −Veïns  −Mercat', fx: { activistes: 12, veins: -8, mercat: -10 } },
    ],
    ignore: { fx: { veins: -6, activistes: -6, mercat: -6 } },
  },
  {
    id: 'xocolata', icon: '🍫', title: 'AROMA PERSISTENT',
    factions: ['veins', 'mercat'], tone: 'crisis',
    text: 'La nova fàbrica de xocolata fa olor increïble. Les 24 hores. Els veïns del carrer del costat han engreixat 2kg de mitjana i no saben per quina raó. El metge apunta "estrès osmòtic".',
    options: [
      { label: 'Horari de producció restringit', preview: '+Veïns  −Mercat', fx: { veins: 10, mercat: -12 } },
      { label: 'Filtres antiolor (acord)', preview: '−300€  equilibri de faccions', fx: { money: -300, veins: 4, mercat: 4 } },
    ],
    ignore: { fx: { veins: -8, mercat: -6 } },
  },
  {
    id: 'asfaltat', icon: '🔨', title: 'SORPRESA GEOLÒGICA',
    factions: ['veins'], tone: 'crisis',
    text: 'El pla d\'asfaltat ha descobert tubs de gas no cartografiats sota el 40% dels carrers. L\'empresa demana un "sobrecost d\'incertesa geològica" del 280%. El plànol original era en un paper de serviette.',
    options: [
      { label: 'Acceptar el sobrecost', preview: '+Veïns  −550€', fx: { veins: 14, money: -550 } },
      { label: 'Cancel·lar el pla', preview: '−Veïns  +Mercat', fx: { veins: -12, mercat: 6 }, risk: 'Els carrers seguiran com estaven' },
    ],
    ignore: { fx: { veins: -18, money: -300 } },
  },
  {
    id: 'wifi', icon: '📡', title: 'CONNECTIVITAT PATROCINADA',
    factions: ['veins', 'mercat', 'activistes'], tone: 'opportunity',
    text: 'Una empresa ofereix WiFi gratuït a la plaça. La lletra petita: el nom de xarxa serà "AjuntamentXarxa_MoblesMartí" per sempre. Inclou un banner animat cada 10 minuts.',
    options: [
      { label: 'Acceptar (WiFi gratis!)', preview: '+Veïns  +Mercat  −Activistes', fx: { veins: 8, mercat: 10, activistes: -10 } },
      { label: 'Rebutjar', preview: '+Activistes  −Veïns  −Mercat', fx: { activistes: 10, veins: -6, mercat: -8 } },
    ],
    ignore: { fx: { mercat: -5 } },
  },
  {
    id: 'murals', icon: '🎨', title: 'PROPOSTA ARTÍSTICA',
    factions: ['activistes', 'veins'], tone: 'opportunity',
    text: 'Un artista reconegut vol pintar un mural a la façana de l\'ajuntament. L\'obra s\'anomena "Burocracia en Descomposició III". Ha mostrat els esbossos. La secretaria ha demanat la baixa laboral.',
    options: [
      { label: 'Autoritzar', preview: '+Activistes  −Veïns', fx: { activistes: 14, veins: -10 }, risk: 'La premsa nacional vindrà. Dividits.' },
      { label: 'Rebutjar educadament', preview: '+Veïns  −Activistes', fx: { veins: 8, activistes: -12 } },
    ],
    ignore: { fx: { activistes: 10, veins: -14 } },
  },
  {
    id: 'piscina', icon: '🏊', title: 'TROBALLES ARQUEOLÒGIQUES',
    factions: ['veins'], tone: 'crisis',
    text: 'La piscina municipal porta 3 anys tancada per obres. L\'empresa ha trobat "restes arqueològiques": un calçotets dels 90 i una xancla. El Ministeri ha enviat un arqueòleg. Porta lupa i entusiasme.',
    options: [
      { label: 'Contractar nova empresa', preview: '+Veïns  −500€', fx: { veins: 16, money: -500 }, risk: 'L\'arqueòleg vol quedar-se' },
      { label: 'Seguir esperant', preview: '−Veïns  s\'estalvia diners', fx: { veins: -12 } },
    ],
    ignore: { fx: { veins: -10 } },
  },
  {
    id: 'mercat', icon: '🛒', title: 'RENOVACIÓ DEL MERCAT',
    factions: ['mercat', 'veins'], tone: 'opportunity',
    text: 'El mercat vol renovar-se. El projecte inclou zona gastronòmica premium, espai de "street food artesà" i un "corner de mindfulness". El lloc de les mongetes quedarà "repensant el seu rol".',
    options: [
      { label: 'Aprovar la renovació', preview: '+Mercat  −Veïns  −480€', fx: { mercat: 16, veins: -10, money: -480 } },
      { label: 'Renovació mínima', preview: '+Veïns  −Mercat  −120€', fx: { veins: 8, mercat: -10, money: -120 } },
    ],
    ignore: { fx: { mercat: -10, veins: -5 } },
  },
  {
    id: 'pluja', icon: '⛈️', title: 'L\'ARXIU INUNDAT',
    factions: ['veins'], tone: 'crisis',
    text: 'Les pluges han inundat el soterrani. Concretament, l\'arxiu d\'expedients pendents del 2018-2023. L\'administratiu en cap ha dit "quin desastre" sense dissimular del tot un somriure.',
    options: [
      { label: 'Recuperar els expedients', preview: '+Veïns  −260€', fx: { veins: 10, money: -260 } },
      { label: 'Digitalitzar "el que es pugui"', preview: '−Veïns  −100€', fx: { veins: -8, money: -100 }, risk: 'El 60% ja era il·legible abans' },
    ],
    ignore: { fx: { veins: -10, money: -200 } },
  },
  {
    id: 'escola', icon: '🏫', title: 'EXCURSIÓ FORMATIVA',
    factions: ['veins'], tone: 'opportunity',
    text: 'L\'escola vol anar a Brussel·les per "formació cívica europea". Surten a 480€ per alumne. Hi ha 180 alumnes. El director ha reservat habitació individual amb minibar.',
    options: [
      { label: 'Subvencionar parcialment', preview: '+Veïns  −700€', fx: { veins: 12, money: -700 } },
      { label: 'Visita virtual al Parlament', preview: '−Veïns  s\'estalvia el viatge', fx: { veins: -10 }, risk: 'La plataforma val 320€ de totes maneres' },
    ],
    ignore: { fx: { veins: -8 } },
  },
  {
    id: 'dj', icon: '🎧', title: 'DJ MUNICIPAL',
    factions: ['activistes', 'mercat', 'veins'], tone: 'opportunity',
    text: 'L\'associació de veïns proposa un DJ permanent a la plaça cada divendres. S\'anomena "Dr. Baix Continu" i ha presentat un rider de 4 pàgines. L\'apartat "ambient manager" és el més llarg.',
    options: [
      { label: 'Autoritzar', preview: '+Activistes  +Mercat  −Veïns', fx: { activistes: 12, mercat: 6, veins: -10 }, risk: 'El rider inclou retroalimentació "orgànica"' },
      { label: 'Denegar', preview: '+Veïns  −Activistes', fx: { veins: 10, activistes: -12 } },
    ],
    ignore: { fx: { activistes: 5, veins: -12, mercat: -4 } },
  },
  {
    id: 'teletreball', icon: '💻', title: 'HUB DIGITAL',
    factions: ['mercat', 'veins'], tone: 'opportunity',
    text: 'Una empresa proposa un espai de cotreball al mercat vell. "Atraurem talent jove", asseguren. Han portat mockups en paper d\'estrassa i parlen molt de "sinèrgies locals".',
    options: [
      { label: 'Cedir l\'espai', preview: '+Mercat  −Veïns  −200€', fx: { mercat: 12, veins: -8, money: -200 } },
      { label: 'Mantenir l\'ús actual', preview: '+Veïns  −Mercat', fx: { veins: 8, mercat: -10 } },
    ],
    ignore: { fx: { mercat: -8 } },
  },
  {
    id: 'arbrat', icon: '🌳', title: 'PLA D\'ARBRAT',
    factions: ['activistes', 'veins'], tone: 'opportunity',
    text: 'El pla de sostenibilitat preveu 80 arbres nous. L\'inconvenient: cal suprimir 40 places d\'aparcament. El regidor d\'obres ha aparcat a la vorera mentre feia la proposta.',
    options: [
      { label: 'Aprovar el pla complet', preview: '+Activistes  −Veïns  −Mercat', fx: { activistes: 14, veins: -10, mercat: -8 } },
      { label: 'Versió reduïda (20 arbres)', preview: '+Activistes parcial  −150€', fx: { activistes: 6, money: -150 } },
    ],
    ignore: { fx: { activistes: -10, money: -150 } },
  },
  {
    id: 'font', icon: '⛲', title: 'LA FONT LLEGENDÀRIA',
    factions: ['veins', 'mercat'], tone: 'neutral',
    text: 'La font monumental porta 18 anys sense funcionar. Algú hi ha instal·lat un peix de plàstic a la bassa i els turistes la fotografien igualment. La restauració costa 340€.',
    options: [
      { label: 'Restaurar-la', preview: '+Veïns  +Mercat  −340€', fx: { veins: 12, mercat: 8, money: -340 } },
      { label: 'Deixar el peix', preview: 'Estalvia diners', fx: { veins: -2 }, risk: 'El peix té 4 seguidors a Instagram' },
    ],
    ignore: { fx: { mercat: 5 } },
  },
  {
    id: 'policia', icon: '🛵', title: 'MODERNITZACIÓ POLICIAL',
    factions: ['activistes', 'veins'], tone: 'neutral',
    text: 'La policia local vol patinets elèctrics en lloc de cotxes. "Reduïrem emissions i serem més àgils", diuen. El sergent ha provat el patinet i ha trencat dos testos.',
    options: [
      { label: 'Aprovar els patinets', preview: '+Activistes  −Veïns  −280€', fx: { activistes: 10, veins: -8, money: -280 } },
      { label: 'Mantenir els cotxes', preview: '+Veïns  −Activistes', fx: { veins: 8, activistes: -10 } },
    ],
    ignore: { fx: { activistes: 5, money: -280 } },
  },
  {
    id: 'ginkgo', icon: '🍂', title: 'EL PROBLEMA DELS GINKGOS',
    factions: ['veins'], tone: 'crisis',
    text: 'Els 12 ginkgos plantats fa dos anys ara fan una olor que els veïns descriuen com "mantega rància mesclada amb petons de iaia". El jardiner diu que "és natural i transitori". Dura 6 setmanes.',
    options: [
      { label: 'Substituir els arbres', preview: '+Veïns  −420€', fx: { veins: 14, money: -420 } },
      { label: 'Campanya de sensibilització', preview: '−Veïns  estalvia diners', fx: { veins: -8 }, risk: 'Ningú llegirà el fulletó' },
    ],
    ignore: { fx: { veins: -14 } },
  },
  {
    id: 'expo', icon: '🖼️', title: 'EXPOSICIÓ ITINERANT',
    factions: ['activistes', 'mercat'], tone: 'opportunity',
    text: 'Una exposició d\'art contemporani vol instal·lar-se a la plaça 3 mesos. Hi ha una escultura de 4 metres anomenada "El Pes de la Gestió". El pes real és de 2 tones.',
    options: [
      { label: 'Acceptar', preview: '+Activistes  +Mercat  −Veïns', fx: { activistes: 12, mercat: 8, veins: -10 } },
      { label: 'Proposar lloc alternatiu', preview: '+Veïns  −Activistes', fx: { veins: 8, activistes: -10 }, risk: 'L\'únic lloc lliure és el cementiri' },
    ],
    ignore: { fx: { activistes: 8, veins: -12, money: -200 } },
  },
  {
    id: 'casament', icon: '💒', title: 'CONFLICTE NUPCIAL',
    factions: ['veins', 'mercat'], tone: 'crisis',
    text: 'Dues famílies prominents han reservat el mateix dia la sala de plens per a un casament. Tots dos diuen tenir "la reserva original". Ambdós documents porten la mateixa taca de cafè.',
    options: [
      { label: 'Sorteig oficial', preview: '+Veïns  −Mercat (una família)', fx: { veins: 6, mercat: -6 } },
      { label: 'Proposar data alternativa', preview: '−Veïns  tots dos enutjats', fx: { veins: -8, mercat: -8 }, risk: 'La nova data és cap d\'any' },
    ],
    ignore: { fx: { veins: -15, mercat: -10 } },
  },
  {
    id: 'ratolins', icon: '🐭', title: 'FAUNA NO DESITJADA',
    factions: ['veins'], tone: 'crisis',
    text: 'S\'han vist ratolins a l\'arxiu municipal. L\'empresa de control de plagues ha presentat un pressupost en tres toms. El gat de l\'ajuntament ha presentat la seva dimissió.',
    options: [
      { label: 'Contractar l\'empresa', preview: '+Veïns  −310€', fx: { veins: 10, money: -310 } },
      { label: 'Convèncer el gat de tornar', preview: '+Activistes  estalvia diners', fx: { activistes: 8 }, risk: 'El gat demana augment de sou' },
    ],
    ignore: { fx: { veins: -14, money: -400 } },
  },
  {
    id: 'web', icon: '🖥️', title: 'LA WEB MUNICIPAL',
    factions: ['veins', 'mercat'], tone: 'neutral',
    text: 'La web municipal porta oberta des del 2003. L\'última notícia és "Celebrem l\'Euro!" Un periodista l\'ha descoberta i l\'ha indexada com a "peça arqueològica digital". Té 14.000 visites setmanals.',
    options: [
      { label: 'Nova web (empresa local)', preview: '+Veïns  +Mercat  −480€', fx: { veins: 10, mercat: 10, money: -480 } },
      { label: 'Actualitzar internament', preview: '+Veïns  −220€', fx: { veins: 8, money: -220 }, risk: 'El responsable TIC recorda cada commit des del 2003' },
    ],
    ignore: { fx: { mercat: 5 } },
  },
  {
    id: 'cabra', icon: '🐐', title: 'ESCAPAMENT CAPRÍ',
    factions: ['mercat', 'activistes'], tone: 'crisis',
    text: 'Una cabra del mercat ha escapat i ha pres possessió del despatx de la regidora d\'Urbanisme. Porta 6 hores. Ha revisat i aparentment aprovat tres expedients pendents.',
    options: [
      { label: 'Desallotjar-la', preview: '+Veïns  −80€', fx: { veins: 8, money: -80 } },
      { label: 'Validar els expedients', preview: '+Mercat  −Activistes', fx: { mercat: 10, activistes: -14 }, risk: 'Tres llicències d\'obra depenen ara d\'una cabra' },
    ],
    ignore: { fx: { mercat: -10, activistes: 8, money: -200 } },
  },
  {
    id: 'clot', icon: '🕳️', title: 'EL CLOT EMBLEMÀTIC',
    factions: ['veins', 'activistes'], tone: 'neutral',
    text: 'El clot del carrer Major porta 4 anys sense arreglar. Algú hi ha posat una barana, una planta i un cartellet: "CLOT PATRIMONIAL. Si us plau, no ompliu." Ara surt als mapes turístics.',
    options: [
      { label: 'Omplir-lo definitivament', preview: '+Veïns  −160€', fx: { veins: 12, money: -160 }, risk: 'Es perdrà el turisme del clot' },
      { label: 'Declarar-lo patrimoni local', preview: '+Activistes  −Veïns', fx: { activistes: 10, veins: -10 } },
    ],
    ignore: { fx: { veins: -8, money: -200 } },
  },
  {
    id: 'cigonyes', icon: '🦅', title: 'OCELLS PROTEGITS',
    factions: ['activistes', 'veins'], tone: 'crisis',
    text: 'Unes cigonyes han fet el niu sobre la xemeneia de l\'escola. L\'obra d\'impermeabilització ha de parar per llei fins que surtin els pollets. "Podem trigar 2 mesos", ha dit l\'ornitòleg amb evident joia.',
    options: [
      { label: 'Esperar i fer PR ecològic', preview: '+Activistes  −Veïns', fx: { activistes: 12, veins: -8 } },
      { label: 'Trasllat del niu (legal, car)', preview: '+Veïns  −580€', fx: { veins: 10, money: -580 }, risk: 'Cal validació de tres ministeris' },
    ],
    ignore: { fx: { activistes: -6, veins: -6 } },
  },
  {
    id: 'banda', icon: '🎺', title: 'REPERTORI LIMITAT',
    factions: ['veins', 'mercat'], tone: 'neutral',
    text: 'La banda municipal admet que sap tocar exactament una cançó: "La Cumparsita". L\'han interpretada a tots els actes oficials dels últims 8 anys. Ningú havia dit res. La directora sembla orgullosa.',
    options: [
      { label: 'Finançar nous arranjaments', preview: '+Veïns  −350€', fx: { veins: 10, money: -350 } },
      { label: 'Abraçar el clàssic', preview: '+Mercat (nostàlgia)', fx: { mercat: 8, veins: -6 }, risk: 'La propera és la cerimònia del Dia de la Vila' },
    ],
    ignore: { fx: { veins: -4 } },
  },
  {
    id: 'mascota', icon: '🦊', title: 'MASCOTA OFICIAL',
    factions: ['activistes', 'mercat', 'veins'], tone: 'opportunity',
    text: 'El concurs per triar mascota oficial ha resultat en empat: "Brie" (el formatge-monument), "Enric" (una guineu del mercat) i "El Gat" (que mai ha confirmat el seu nom). Cal decidir.',
    options: [
      { label: 'Elegir "Enric" la guineu', preview: '+Activistes  +Mercat', fx: { activistes: 8, mercat: 8 } },
      { label: 'Votació popular', preview: '+Veïns  −120€', fx: { veins: 10, money: -120 }, risk: 'Guanyarà "El Gat" per aclapadament' },
    ],
    ignore: { fx: { mercat: 5 } },
  },
  {
    id: 'carrers', icon: '🗺️', title: 'CARRERS HOMÒNIMS',
    factions: ['mercat', 'veins'], tone: 'crisis',
    text: 'La comissió de nomenclatura ha descobert que tres carrers del poble es diuen igual: "Carrer Nou". Estan a 80 metres l\'un de l\'altre. L\'empresa de missatgeria porta 4 anys maleint.',
    options: [
      { label: 'Rebatejar-los tots', preview: '+Mercat  −Veïns  −100€', fx: { mercat: 10, veins: -8, money: -100 } },
      { label: 'Afegir numeració romana', preview: '+Activistes  −Mercat', fx: { activistes: 6, mercat: -8 }, risk: '"Carrer Nou III" ha desconcertat el carter' },
    ],
    ignore: { fx: { mercat: -10, money: -150 } },
  },
  {
    id: 'cartell', icon: '🪧', title: 'CARTELL D\'ENTRADA',
    factions: ['veins', 'activistes'], tone: 'neutral',
    text: 'El cartell d\'entrada al poble porta 11 anys mal escrit, en castellà, malgrat el decret de retolació. El turisme ha augmentat des d\'una foto irònica a les xarxes. 80.000 impressions.',
    options: [
      { label: 'Substituir el cartell', preview: '+Veïns  +Activistes  −180€', fx: { veins: 10, activistes: 10, money: -180 } },
      { label: 'Mantenir-lo com a reclam viral', preview: '+Mercat  −Activistes', fx: { mercat: 12, activistes: -16 } },
    ],
    ignore: { fx: { mercat: 6, activistes: -4 } },
  },
  {
    id: 'estatua', icon: '🗿', title: 'ESTÀTUA EN DISPUTA',
    factions: ['veins'], tone: 'neutral',
    text: 'L\'estàtua del fundador és, de fet, el mateix model de catàleg que fan servir dos pobles veïns. Les tres comissions de patrimoni ho han descobert simultàniament. L\'escultor va morir el 1931.',
    options: [
      { label: 'Comissió d\'investigació', preview: '+Veïns  −150€', fx: { veins: 8, money: -150 } },
      { label: 'Afegir-li un barret exclusiu', preview: '+Veïns  −200€  (distinció)', fx: { veins: 12, money: -200 } },
    ],
    ignore: { fx: {} },
  },
  {
    id: 'subhasta', icon: '🔨', title: 'SUBHASTA MUNICIPAL',
    factions: ['veins', 'mercat'], tone: 'opportunity',
    text: 'Per quadrar el pressupost, s\'han inventariat béns subhastables: 400 cadires de plàstic, un fax en perfecte estat, i el nom de la sala de plens per un any. La sala s\'anomena "Sala Glòria".',
    options: [
      { label: 'Subhastar-ho tot', preview: '+600€  −Veïns', fx: { money: 600, veins: -8 }, risk: 'La sala pot passar a dir-se "Sala Ferreteria Pep"' },
      { label: 'Només cadires i fax', preview: '+180€', fx: { money: 180 } },
    ],
    ignore: { fx: { money: -180 } },
  },
];
