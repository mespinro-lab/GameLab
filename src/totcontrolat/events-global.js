'use strict';

// factions: which factions this event primarily concerns
// tone: 'crisis' = arises from an unhappy/demanding faction
//       'opportunity' = arises from a content/engaged faction
//       'neutral' = quirky, not mood-driven
// ignore.fx / ignore.idleMsg: what happens if the player does nothing
// options[n].idleMsg: shown in idle-state after that option is chosen

const EVENTS_GLOBAL = [
  {
    id: 'coloms', icon: '🐦', title: 'LA INVASIÓ',
    factions: ['veins', 'activistes'], tone: 'crisis',
    text: 'Una colònia de coloms ha ocupat el jutjat municipal. Els advocats no poden entrar. Fa tres dies. El degà del col·legi diu que "tècnicament ja no hi ha llei".',
    options: [
      { label: 'Desallotjar-los', preview: '+Veïns  −Activistes  −150€', fx: { veins: 10, activistes: -12, money: -150 }, idleMsg: 'El jutjat torna a funcionar. Els coloms s\'han instal·lat a l\'arxiu.' },
      { label: 'Negociar', preview: '+Activistes  −Veïns', fx: { activistes: 12, veins: -8 }, risk: 'Risc: assemblea permanent de coloms', idleMsg: 'Els coloms han acceptat un rol consultiu no vinculant. El degà va dimitir.' },
    ],
    ignore: { fx: { veins: -5, mercat: -5 }, idleMsg: 'El jutjat porta una setmana tancat. La llei segueix tècnicament en suspens.' },
  },
  {
    id: 'app', icon: '📱', title: 'GOVTECH SOLUTIONS',
    factions: ['mercat', 'veins'], tone: 'opportunity',
    text: 'Una startup vol fer una app de queixes municipals. S\'anomenen "Queixa+". Porten corbata els caps de setmana i diuen "escalar" molt.',
    options: [
      { label: 'Contractar-los', preview: '+Veïns  +Mercat  −350€', fx: { veins: 8, mercat: 10, money: -350 }, idleMsg: 'Queixa+ té 43 descàrregues. 41 han sigut queixes sobre l\'app en si.' },
      { label: 'Rebutjar', preview: '−Mercat', fx: { mercat: -10 }, risk: 'Les queixes les rebràs tu directament', idleMsg: 'Les queixes arriben directament al teu mòbil. Avui n\'hi ha 14.' },
    ],
    ignore: { fx: { mercat: -8 }, idleMsg: 'La startup s\'ha instal·lat a Vilaroja. Diuen que "escalaran" molt.' },
  },
  {
    id: 'formatge', icon: '🧀', title: 'EL FORMATGE',
    factions: ['veins'], tone: 'crisis',
    text: 'Un camió ha bolcat a la rotonda. Tres tones de brie. Fa cinc dies. Ningú sap de qui és el camió. La florista diu que "li agrada la nova olor".',
    options: [
      { label: 'Netejar-ho', preview: '+Veïns  −200€', fx: { veins: 12, money: -200 }, idleMsg: 'La plaça sent a lavanda. Provisionalment.' },
      { label: 'Declarar-ho monument', preview: '+Activistes  −Veïns  −Mercat', fx: { activistes: 14, veins: -12, mercat: -8 }, risk: 'Risc sanitari latent', idleMsg: 'En Brie té 2.300 seguidors. El Ministeri de Cultura ha trucat.' },
    ],
    ignore: { fx: { veins: -10 }, idleMsg: 'Tres tones de brie maduren al sol. El metge ha demanat vacances.' },
  },
  {
    id: 'calendari', icon: '📅', title: 'LA FESTA',
    factions: ['activistes'], tone: 'crisis',
    text: 'Els Activistes proposen canviar el nom de la Festa Major a "Celebració de la Consciència Col·lectiva i la Identitat en Diàleg". Ja han imprès els programes.',
    options: [
      { label: 'Acceptar el nom', preview: '+Activistes  −Veïns', fx: { activistes: 12, veins: -8 }, idleMsg: 'El programa de la Festa Major ocupa 12 pàgines. La portada és en neó.' },
      { label: 'Ignorar-ho', preview: '−Activistes', fx: { activistes: -12 }, risk: 'Pintaran la façana de l\'ajuntament', idleMsg: 'Els Activistes han pintat "DIÀLEG" al pàrquing municipal. Amb plantilla.' },
    ],
    ignore: { fx: { activistes: -8 }, idleMsg: 'Els programes ja circulen. La Festa es diu ara com ells volien de totes maneres.' },
  },
  {
    id: 'conseller', icon: '🧳', title: 'VISITA OFICIAL',
    factions: ['mercat'], tone: 'opportunity',
    text: 'Un conseller autonòmic vol visitar el poble. Necessita catifa vermella, 15 aparcaments reservats, un "dinar lleuger" de 4 plats i "accés a un piano".',
    options: [
      { label: 'Acollir-lo', preview: '+Mercat  −450€', fx: { mercat: 10, money: -450 }, idleMsg: 'El conseller va fer un selfie amb el gat. Porta 8.000 likes.' },
      { label: 'Excuses mèdiques', preview: '+Veïns  −Mercat', fx: { veins: 6, mercat: -12 }, idleMsg: 'El conseller va anar a Miraflors. Diuen que el piano era millor.' },
    ],
    ignore: { fx: { mercat: -8 }, idleMsg: 'El conseller ho ha interpretat com un desaire protocol·lari. Oficial.' },
  },
  {
    id: 'semàfor', icon: '🚦', title: 'EL SEMÀFOR',
    factions: ['veins'], tone: 'crisis',
    text: 'El semàfor de la plaça major porta 9 mesos parpellejant. Els veïns tenen un grup de WhatsApp dedicat. Té 847 membres i un logo propi.',
    options: [
      { label: 'Arreglar-lo', preview: '+Veïns  −120€', fx: { veins: 14, money: -120 }, idleMsg: 'El semàfor funciona. El grup de WhatsApp segueix actiu. Per inercia.' },
      { label: 'Dir que ja s\'ha encarregat', preview: 'Guanya temps', fx: { veins: -3 }, risk: 'Es descobrirà en 2-3 setmanes', idleMsg: 'Han descobert que no s\'havia encarregat res. El grup té 1.200 membres.' },
    ],
    ignore: { fx: { veins: -9 }, idleMsg: 'El grup de WhatsApp ha creat un subgrup: "Semàfor Fora de Control".' },
  },
  {
    id: 'fabrica', icon: '🏭', title: 'INVERSIÓ ESTRANGERA',
    factions: ['mercat', 'activistes'], tone: 'opportunity',
    text: 'Una empresa japonesa vol obrir una fàbrica de palets al polígon. No parlen català ni castellà ni anglès. Comuniquen amb diagrames de flux.',
    options: [
      { label: 'Benvinguts!', preview: '+Mercat  +400€  −Activistes', fx: { mercat: 15, activistes: -10, money: 400 }, idleMsg: 'La fàbrica funciona. Els diagrames de flux han resultat ser poesia haiku.' },
      { label: 'Estudi d\'impacte primer', preview: '+Activistes  −Mercat', fx: { activistes: 10, mercat: -12 }, idleMsg: 'L\'estudi durarà 3 mesos. La fàbrica s\'ha instal·lat a Vallromanes.' },
    ],
    ignore: { fx: { mercat: -12 }, idleMsg: 'La fàbrica és ara a Puigfred. El polígon segueix buit i esperançat.' },
  },
  {
    id: 'festival', icon: '🥛', title: 'FESTIVAL DEL IOGURT',
    factions: ['veins', 'activistes'], tone: 'opportunity',
    text: 'Un col·lectiu proposa el Primer Festival Internacional de Iogurt Artesà de la Comarca. Ja han encarregat samarretes. Amb les samarretes ho han fet tot.',
    options: [
      { label: 'Subvencionar', preview: '+Veïns  +Activistes  −280€', fx: { veins: 8, activistes: 10, money: -280 }, idleMsg: 'El festival ha tingut 43 assistents. Tots eren del col·lectiu organitzador.' },
      { label: 'Que es financin sols', preview: '−Veïns  −Activistes', fx: { veins: -6, activistes: -10 }, idleMsg: 'El festival s\'ha fet. La nota de premsa culpa l\'ajuntament de tot.' },
    ],
    ignore: { fx: { activistes: -10, veins: -4 }, idleMsg: 'El festival s\'ha fet sense suport. L\'ajuntament surt malament a la crònica local.' },
  },
  {
    id: 'gat', icon: '🐱', title: 'INCIDENT FELÍ',
    factions: ['mercat'], tone: 'crisis',
    text: 'El gat del despatx ha mossegat al tresorer. El tresorer amenaça amb denúncia. El gat ha estat fotografiat dormint còmodament sobre els expedients.',
    options: [
      { label: 'Indemnitzar el tresorer', preview: '−220€  evita escàndol', fx: { money: -220 }, idleMsg: 'El tresorer ha acceptat. El gat dorm sobre els papers de l\'acord.' },
      { label: 'Defensar el gat', preview: '+Activistes  −Mercat', fx: { activistes: 14, mercat: -14 }, risk: 'Escàndol garantit. El gat no s\'ha disculpat.', idleMsg: 'El gat ha declarat davant notari. L\'advocat defensor ha pujat els honoraris.' },
    ],
    ignore: { fx: { mercat: -8, money: -300 }, idleMsg: 'El tresorer ha presentat la demanda. L\'import és superior al que s\'esperava.' },
  },
  {
    id: 'rotonda', icon: '🔄', title: 'ROTONDA PREMIUM',
    factions: ['mercat', 'veins', 'activistes'], tone: 'opportunity',
    text: 'L\'empresa de pavimentació ofereix una rotonda completament gratis. A canvi d\'un logo de l\'empresa de 4 metres de diàmetre al centre i drets de denominació (Rotonda Asfaltis S.L.).',
    options: [
      { label: 'Acceptar', preview: '+Mercat  −Veïns  −Activistes', fx: { mercat: 14, veins: -10, activistes: -8 }, idleMsg: 'La rotonda porta el logo. Almenys és rodona i sense forats.' },
      { label: 'Rebutjar', preview: '+Veïns  +Activistes  −Mercat', fx: { veins: 8, activistes: 8, mercat: -12 }, idleMsg: 'La rotonda segueix sense asfaltar. La coherència s\'ha agraït en silenci.' },
    ],
    ignore: { fx: { mercat: -5 }, idleMsg: 'L\'empresa ha anat a Moianes. La seva rotonda és impecable i patrocinada.' },
  },
  {
    id: 'vaga', icon: '🧹', title: 'EXIGÈNCIES LABORALS',
    factions: ['veins', 'activistes'], tone: 'crisis',
    text: 'El sindicat de neteja vol aire condicionat als uniformes d\'estiu. La proposta incloïa LED integrats però han acceptat retirar-los "de moment".',
    options: [
      { label: 'Uniformes nous (sense LED)', preview: '+Veïns  −180€', fx: { veins: 10, money: -180 }, idleMsg: 'El sindicat ha acceptat. Han dit que revisaran els LED "en un futur proper".' },
      { label: 'Vaga que és vaga', preview: '−Veïns  −Activistes', fx: { veins: -16, activistes: -8 }, risk: 'Durarà més del previst', idleMsg: 'La vaga porta tres dies. Els carrers estan nets de queixes, si més no.' },
    ],
    ignore: { fx: { veins: -15, activistes: -8 }, idleMsg: 'La vaga ha començat. La plaça no s\'ha escombrat des de dimarts.' },
  },
  {
    id: 'turistes', icon: '📸', title: 'TURISME CULTURAL',
    factions: ['mercat', 'veins'], tone: 'opportunity',
    text: 'Un grup de turistes alemanys ha descobert el poble per un error de GPS. Volen una ruta guiada pel cementiri. "Sehr authentisch", diuen. Molt contents.',
    options: [
      { label: 'Organitzar la ruta', preview: '+Mercat  +150€  −Veïns', fx: { mercat: 10, money: 150, veins: -6 }, idleMsg: 'Els alemanys han puntuat el cementiri 5 estrelles. "Sehr romantisch".' },
      { label: 'Redirigir-los al museu', preview: '+Veïns  −Mercat', fx: { veins: 6, mercat: -8 }, risk: 'El museu tanca els dimecres', idleMsg: 'El museu era tancat. Han fet fotos de la porta. Igualment contents.' },
    ],
    ignore: { fx: { mercat: -5 }, idleMsg: 'Han marxat a la comarca del costat. Han deixat una ressenya d\'1 estrella.' },
  },
  {
    id: 'viral', icon: '🌐', title: 'FENOMEN VIRAL',
    factions: ['veins', 'mercat'], tone: 'opportunity',
    text: 'El perfil oficial del municipi ha publicat per error una foto del gat de l\'alcalde. Té 50.000 likes. Sis periodistes truquen. El gat no en sap res.',
    options: [
      { label: 'Aprofitar l\'ona', preview: '+Veïns  +Mercat  compte oficial del gat', fx: { veins: 14, mercat: 10 }, idleMsg: 'El gat té 23.000 seguidors. Exigeix crèdit en els comunicats oficials.' },
      { label: 'Esborrar i disculpar-se', preview: '+Activistes  −Veïns  −Mercat', fx: { activistes: 8, veins: -10, mercat: -10 }, idleMsg: 'La disculpa ha generat més likes que la foto original. El gat no s\'ha disculpat.' },
    ],
    ignore: { fx: { veins: -4, mercat: -4 }, idleMsg: 'El moment ha passat. Sis periodistes esperen resposta des de dimarts.' },
  },
  {
    id: 'canonada', icon: '💧', title: 'EMERGÈNCIA HIDRÀULICA',
    factions: ['veins'], tone: 'crisis',
    text: 'La canonada principal de la plaça ha petat. L\'aigua surt per la floristeria. La florista diu que és "una benedicció" i ha pujat els preus un 40%.',
    options: [
      { label: 'Reparació urgent', preview: '+Veïns  −380€', fx: { veins: 12, money: -380 }, idleMsg: 'La plaça torna a estar seca. La florista ha baixat els preus. Molt poc.' },
      { label: 'Font ornamental provisional', preview: '+Activistes  −Veïns  −180€', fx: { activistes: 12, veins: -10, money: -180 }, idleMsg: 'La font ornamental té 14 crítiques negatives a Google. Cap és de la florista.' },
    ],
    ignore: { fx: { veins: -14, money: -200 }, idleMsg: 'La inundació s\'ha estès. L\'asseguradora ha enviat un formulari de 40 pàgines.' },
  },
  {
    id: 'sondeo', icon: '🗳️', title: 'SONDEO ELECTORAL',
    factions: ['veins'], tone: 'neutral',
    text: 'Un sondeo us dona 34% d\'intenció de vot. El rival en té 35%. L\'1% restant vota per en Brie (el formatge de la rotonda, ja amb personalitat jurídica pròpia).',
    options: [
      { label: 'Campanya de proximitat', preview: '+Veïns  −220€', fx: { veins: 12, money: -220 }, idleMsg: 'Has parlat amb 94 veïns. El 94è ha dit "qui ets tu?".' },
      { label: 'Ignorar sondeos', preview: 'Res canvia', fx: {}, idleMsg: 'El sondeo ha publicat una actualització. En Brie ara va tercer.' },
    ],
    ignore: { fx: { veins: -3 }, idleMsg: 'El percentatge d\'en Brie puja. Dos periodistes truquen per entrevistar-lo.' },
  },
  {
    id: 'reciclatge', icon: '♻️', title: 'PLA VERD',
    factions: ['activistes'], tone: 'crisis',
    text: 'Els Activistes proposen substituir tots els contenidors per "Punts de Consciència Ambiental". Costen el triple. Vénen en colors que "no existien fins ara".',
    options: [
      { label: 'Pla mixt (la meitat)', preview: '+Activistes  −Mercat  −220€', fx: { activistes: 8, mercat: -4, money: -220 }, idleMsg: 'La meitat dels contenidors fan olor de consciència. L\'altra meitat, de sempre.' },
      { label: 'Contenidors de sempre', preview: '+Mercat  −Activistes', fx: { mercat: 8, activistes: -14 }, idleMsg: 'Els Activistes han publicat un informe de 34 pàgines sobre la decisió.' },
    ],
    ignore: { fx: { activistes: -12 }, idleMsg: 'Els Activistes han organitzat una "auditoria ciutadana". Dura 6 hores.' },
  },
  {
    id: 'concert', icon: '🎸', title: 'FESTIVAL DE MÚSICA',
    factions: ['mercat', 'activistes', 'veins'], tone: 'opportunity',
    text: 'Una promotora vol un festival de música electrònica al parc. "Serà tranquil", asseguren. El DJ principal es diu DJ Apocalipsi.',
    options: [
      { label: 'Autoritzar', preview: '+Mercat  +Activistes  −Veïns', fx: { mercat: 10, activistes: 14, veins: -16 }, idleMsg: 'DJ Apocalipsi ha durat fins les 5h. Un veí ha trucat 9 vegades. Un altre ha ballat.' },
      { label: 'Denegar', preview: '+Veïns  −Mercat  −Activistes', fx: { veins: 12, mercat: -10, activistes: -10 }, idleMsg: 'La promotora ha publicat un comunicat. Anomenen l\'ajuntament "enemics de la cultura".' },
    ],
    ignore: { fx: { activistes: -8, mercat: -6 }, idleMsg: 'La promotora ha anat a la comarca veïna. El festival porta el nom d\'aquell poble.' },
  },
  {
    id: 'auditoria', icon: '📊', title: 'AUDITORIA SORPRESA',
    factions: ['veins', 'mercat'], tone: 'crisis',
    text: 'L\'assessoria ha trobat un error al pressupost. Falten 280€ de l\'any passat. "Han d\'haver sortit d\'alguna banda", diu l\'auditor, mirant el gat.',
    options: [
      { label: 'Investigar', preview: '+Veïns  −Mercat  −100€', fx: { veins: 8, mercat: -10, money: -100 }, idleMsg: 'L\'auditoria ha trobat el culpable: una errada del 2003 en un full de càlcul.' },
      { label: 'Absorbir la diferència', preview: '−280€  nota de premsa breu', fx: { money: -280 }, idleMsg: 'La nota de premsa era de 80 paraules. Cap pregunta. Perfecte.' },
    ],
    ignore: { fx: { veins: -8, mercat: -8 }, idleMsg: 'L\'auditor ha publicat el cas com a estudi acadèmic. Porta el nom del poble.' },
  },
  {
    id: 'globus', icon: '🎈', title: 'EMERGÈNCIA AÈRIA',
    factions: ['veins'], tone: 'crisis',
    text: 'Un globus d\'aire calent s\'ha enganxat al campanar. La parella a bord porta 4 hores allà dalt. Han demanat pizza. La pizza ja ha arribat. El campaner no sap on mirar.',
    options: [
      { label: 'Desplegar la grua', preview: '+Veïns  −180€', fx: { veins: 12, money: -180 }, risk: 'La grua és del 1987', idleMsg: 'La grua ha funcionat al segon intent. La parella ha deixat 3 estrelles a Google.' },
      { label: 'Esperar que baixi sol', preview: '+Mercat  −Veïns  (espectacle)', fx: { mercat: 8, veins: -10 }, risk: 'Bateria per a dos dies més', idleMsg: 'El globus ha baixat sol al vespre. El campaner segueix sense poder dormir.' },
    ],
    ignore: { fx: { veins: -8, mercat: 6 }, idleMsg: 'La parella ha baixat sola i ha anat als informatius de nit. Publicitat inesperada.' },
  },
  {
    id: 'gossos', icon: '🐕', title: 'GUERRA PEL SOLAR',
    factions: ['veins', 'activistes', 'mercat'], tone: 'crisis',
    text: 'El solar de la cantonada desperta passions. Els propietaris de gossos volen parc caní. Els Activistes volen hort comunitari. El Mercat vol aparcament. El solar fa 8×6 metres.',
    options: [
      { label: 'Parc caní', preview: '+Veïns  −Activistes  −Mercat', fx: { veins: 10, activistes: -10, mercat: -8 }, idleMsg: 'El parc caní té 12 gossos i 3 gats. Ningú sap com han entrat els gats.' },
      { label: 'Hort comunitari', preview: '+Activistes  −Veïns  −Mercat', fx: { activistes: 12, veins: -8, mercat: -10 }, idleMsg: 'L\'hort creix. Els propietaris de gossos han presentat una queixa formal.' },
    ],
    ignore: { fx: { veins: -6, activistes: -6, mercat: -6 }, idleMsg: 'Les tres associacions han convocat assemblees el mateix dia. I la mateixa hora.' },
  },
  {
    id: 'xocolata', icon: '🍫', title: 'AROMA PERSISTENT',
    factions: ['veins', 'mercat'], tone: 'crisis',
    text: 'La nova fàbrica de xocolata fa olor increïble. Les 24 hores. Els veïns del carrer del costat han engreixat 2kg de mitjana i no saben per quina raó. El metge apunta "estrès osmòtic".',
    options: [
      { label: 'Horari de producció restringit', preview: '+Veïns  −Mercat', fx: { veins: 10, mercat: -12 }, idleMsg: 'La fàbrica atura a les 22h. L\'olor residual dura fins les 4h.' },
      { label: 'Filtres antiolor (acord)', preview: '−300€  equilibri de faccions', fx: { money: -300, veins: 4, mercat: 4 }, idleMsg: 'Els filtres funcionen. La florista ha baixat els productes aromàtics. Molt poc.' },
    ],
    ignore: { fx: { veins: -8, mercat: -6 }, idleMsg: 'El metge ha publicat un informe. El terme "estrès osmòtic" és ara viral.' },
  },
  {
    id: 'asfaltat', icon: '🔨', title: 'SORPRESA GEOLÒGICA',
    factions: ['veins'], tone: 'crisis',
    text: 'El pla d\'asfaltat ha descobert tubs de gas no cartografiats sota el 40% dels carrers. L\'empresa demana un "sobrecost d\'incertesa geològica" del 280%. El plànol original era en un paper de serviette.',
    options: [
      { label: 'Acceptar el sobrecost', preview: '+Veïns  −550€', fx: { veins: 14, money: -550 }, idleMsg: 'El carrer nou és llis. Ningú recorda com estava abans. Millor.' },
      { label: 'Cancel·lar el pla', preview: '−Veïns  +Mercat', fx: { veins: -12, mercat: 6 }, risk: 'Els carrers seguiran com estaven', idleMsg: 'Els carrers seguiran com estaven. L\'empresa conserva el paper de serviette.' },
    ],
    ignore: { fx: { veins: -18, money: -300 }, idleMsg: 'Han tancat tres carrers per risc de gas. El pressupost d\'emergències ha saltat.' },
  },
  {
    id: 'wifi', icon: '📡', title: 'CONNECTIVITAT PATROCINADA',
    factions: ['veins', 'mercat', 'activistes'], tone: 'opportunity',
    text: 'Una empresa ofereix WiFi gratuït a la plaça. La lletra petita: el nom de xarxa serà "AjuntamentXarxa_MoblesMartí" per sempre. Inclou un banner animat cada 10 minuts.',
    options: [
      { label: 'Acceptar (WiFi gratis!)', preview: '+Veïns  +Mercat  −Activistes', fx: { veins: 8, mercat: 10, activistes: -10 }, idleMsg: 'El WiFi funciona. La xarxa es diu "AjuntamentXarxa_MoblesMartí". La gent la fa servir.' },
      { label: 'Rebutjar', preview: '+Activistes  −Veïns  −Mercat', fx: { activistes: 10, veins: -6, mercat: -8 }, idleMsg: 'Els Activistes han tuitejat l\'agraïment. Els Veïns segueixen sense WiFi.' },
    ],
    ignore: { fx: { mercat: -5 }, idleMsg: 'L\'empresa ha signat amb Lliranes. La seva plaça té WiFi. La nostra, no.' },
  },
  {
    id: 'murals', icon: '🎨', title: 'PROPOSTA ARTÍSTICA',
    factions: ['activistes', 'veins'], tone: 'opportunity',
    text: 'Un artista reconegut vol pintar un mural a la façana de l\'ajuntament. L\'obra s\'anomena "Burocracia en Descomposició III". Ha mostrat els esbossos. La secretaria ha demanat la baixa laboral.',
    options: [
      { label: 'Autoritzar', preview: '+Activistes  −Veïns', fx: { activistes: 14, veins: -10 }, risk: 'La premsa nacional vindrà. Dividits.', idleMsg: 'El mural genera debat nacional. El gat hi ha sortit sense ser convidat.' },
      { label: 'Rebutjar educadament', preview: '+Veïns  −Activistes', fx: { veins: 8, activistes: -12 }, idleMsg: 'L\'artista ha acceptat amb elegància. Ha dit que "la censura és també una obra".' },
    ],
    ignore: { fx: { activistes: 10, veins: -14 }, idleMsg: 'L\'artista ho ha pintat de nit. Il·legalment. És millor que els esbossos originals.' },
  },
  {
    id: 'piscina', icon: '🏊', title: 'TROBALLES ARQUEOLÒGIQUES',
    factions: ['veins'], tone: 'crisis',
    text: 'La piscina municipal porta 3 anys tancada per obres. L\'empresa ha trobat "restes arqueològiques": un calçotets dels 90 i una xancla. El Ministeri ha enviat un arqueòleg. Porta lupa i entusiasme.',
    options: [
      { label: 'Contractar nova empresa', preview: '+Veïns  −500€', fx: { veins: 16, money: -500 }, risk: 'L\'arqueòleg vol quedar-se', idleMsg: 'La nova empresa comença la setmana que ve. L\'arqueòleg porta camp de treball.' },
      { label: 'Seguir esperant', preview: '−Veïns  s\'estalvia diners', fx: { veins: -12 }, idleMsg: 'La piscina porta 3 anys i 1 mes tancada. El rècord no és oficial però és real.' },
    ],
    ignore: { fx: { veins: -10 }, idleMsg: 'L\'arqueòleg ha declarat els calçotets "bé cultural immoble". Més retards.' },
  },
  {
    id: 'mercat', icon: '🛒', title: 'RENOVACIÓ DEL MERCAT',
    factions: ['mercat', 'veins'], tone: 'opportunity',
    text: 'El mercat vol renovar-se. El projecte inclou zona gastronòmica premium, espai de "street food artesà" i un "corner de mindfulness". El lloc de les mongetes quedarà "repensant el seu rol".',
    options: [
      { label: 'Aprovar la renovació', preview: '+Mercat  −Veïns  −480€', fx: { mercat: 16, veins: -10, money: -480 }, idleMsg: 'El corner de mindfulness rep 4 clients al dia. La parada de mongetes torna dilluns.' },
      { label: 'Renovació mínima', preview: '+Veïns  −Mercat  −120€', fx: { veins: 8, mercat: -10, money: -120 }, idleMsg: 'El mercat sembla igual però amb pintura nova. Tots preferien la versió anterior.' },
    ],
    ignore: { fx: { mercat: -10, veins: -5 }, idleMsg: 'El mercat ha convocat una junta i ha votat sense esperar la resposta de l\'ajuntament.' },
  },
  {
    id: 'pluja', icon: '⛈️', title: 'L\'ARXIU INUNDAT',
    factions: ['veins'], tone: 'crisis',
    text: 'Les pluges han inundat el soterrani. Concretament, l\'arxiu d\'expedients pendents del 2018-2023. L\'administratiu en cap ha dit "quin desastre" sense dissimular del tot un somriure.',
    options: [
      { label: 'Recuperar els expedients', preview: '+Veïns  −260€', fx: { veins: 10, money: -260 }, idleMsg: 'El 40% dels expedients han sobreviscut. El 60% era millor no llegir-los.' },
      { label: 'Digitalitzar "el que es pugui"', preview: '−Veïns  −100€', fx: { veins: -8, money: -100 }, risk: 'El 60% ja era il·legible abans', idleMsg: 'S\'han digitalitzat 12 expedients. El sistema ha fallat en el 13è.' },
    ],
    ignore: { fx: { veins: -10, money: -200 }, idleMsg: 'L\'inspector de sanitat ha visitat el soterrani. Ha demanat un informe d\'urgència.' },
  },
  {
    id: 'escola', icon: '🏫', title: 'EXCURSIÓ FORMATIVA',
    factions: ['veins'], tone: 'opportunity',
    text: 'L\'escola vol anar a Brussel·les per "formació cívica europea". Surten a 480€ per alumne. Hi ha 180 alumnes. El director ha reservat habitació individual amb minibar.',
    options: [
      { label: 'Subvencionar parcialment', preview: '+Veïns  −700€', fx: { veins: 12, money: -700 }, idleMsg: 'Els alumnes tornen de Brussel·les amb moltes fotos i cap recordança clara.' },
      { label: 'Visita virtual al Parlament', preview: '−Veïns  s\'estalvia el viatge', fx: { veins: -10 }, risk: 'La plataforma val 320€ de totes maneres', idleMsg: 'Els alumnes han visitat el Parlament des de casa. La plataforma s\'ha penjat dues vegades.' },
    ],
    ignore: { fx: { veins: -8 }, idleMsg: 'Els pares han organitzat el viatge sols. L\'escola surt als titulars sense mencionar l\'ajuntament.' },
  },
  {
    id: 'dj', icon: '🎧', title: 'DJ MUNICIPAL',
    factions: ['activistes', 'mercat', 'veins'], tone: 'opportunity',
    text: 'L\'associació de veïns proposa un DJ permanent a la plaça cada divendres. S\'anomena "Dr. Baix Continu" i ha presentat un rider de 4 pàgines. L\'apartat "ambient manager" és el més llarg.',
    options: [
      { label: 'Autoritzar', preview: '+Activistes  +Mercat  −Veïns', fx: { activistes: 12, mercat: 6, veins: -10 }, risk: 'El rider inclou retroalimentació "orgànica"', idleMsg: 'Dr. Baix Continu porta tres setmanes. El carrer del costat ha instal·lat doble finestra.' },
      { label: 'Denegar', preview: '+Veïns  −Activistes', fx: { veins: 10, activistes: -12 }, idleMsg: 'El DJ ha publicat una cançó titulada "L\'Ajuntament No M\'Entén". Té 800 reproduccions.' },
    ],
    ignore: { fx: { activistes: 5, veins: -12, mercat: -4 }, idleMsg: 'Dr. Baix Continu s\'ha instal·lat sense permís. La policia ha ballat involuntàriament.' },
  },
  {
    id: 'teletreball', icon: '💻', title: 'HUB DIGITAL',
    factions: ['mercat', 'veins'], tone: 'opportunity',
    text: 'Una empresa proposa un espai de cotreball al mercat vell. "Atraurem talent jove", asseguren. Han portat mockups en paper d\'estrassa i parlen molt de "sinèrgies locals".',
    options: [
      { label: 'Cedir l\'espai', preview: '+Mercat  −Veïns  −200€', fx: { mercat: 12, veins: -8, money: -200 }, idleMsg: 'El cotreball té 8 membres. Tres parlen de "sinèrgies" constantment. Els altres cinc escolten.' },
      { label: 'Mantenir l\'ús actual', preview: '+Veïns  −Mercat', fx: { veins: 8, mercat: -10 }, idleMsg: 'El mercat vell segueix igual. Ningú ha notat la diferència, de moment.' },
    ],
    ignore: { fx: { mercat: -8 }, idleMsg: 'El hub s\'ha obert a Valldeixars. El seu cartell diu "Atreiem talent jove".' },
  },
  {
    id: 'arbrat', icon: '🌳', title: 'PLA D\'ARBRAT',
    factions: ['activistes', 'veins'], tone: 'opportunity',
    text: 'El pla de sostenibilitat preveu 80 arbres nous. L\'inconvenient: cal suprimir 40 places d\'aparcament. El regidor d\'obres ha aparcat a la vorera mentre feia la proposta.',
    options: [
      { label: 'Aprovar el pla complet', preview: '+Activistes  −Veïns  −Mercat', fx: { activistes: 14, veins: -10, mercat: -8 }, idleMsg: '80 arbres. 40 places menys. Els Activistes n\'han plantat un de propi per celebrar-ho.' },
      { label: 'Versió reduïda (20 arbres)', preview: '+Activistes parcial  −150€', fx: { activistes: 6, money: -150 }, idleMsg: '20 arbres. Els Activistes han dit que "és un inici". S\'espera pressió continuada.' },
    ],
    ignore: { fx: { activistes: -10, money: -150 }, idleMsg: 'Ha arribat una multa mediambiental. El regidor ha aparcat, de nou, a la vorera.' },
  },
  {
    id: 'font', icon: '⛲', title: 'LA FONT LLEGENDÀRIA',
    factions: ['veins', 'mercat'], tone: 'neutral',
    text: 'La font monumental porta 18 anys sense funcionar. Algú hi ha instal·lat un peix de plàstic a la bassa i els turistes la fotografien igualment. La restauració costa 340€.',
    options: [
      { label: 'Restaurar-la', preview: '+Veïns  +Mercat  −340€', fx: { veins: 12, mercat: 8, money: -340 }, idleMsg: 'La font funciona. El peix de plàstic ha sigut conservat en una vitrina a recepció.' },
      { label: 'Deixar el peix', preview: 'Estalvia diners', fx: { veins: -2 }, risk: 'El peix té 4 seguidors a Instagram', idleMsg: 'El peix té ara 340 seguidors. Ha tuitejat per primer cop.' },
    ],
    ignore: { fx: { mercat: 5 }, idleMsg: 'El compte d\'Instagram del peix creix sol. És l\'actiu digital més valuós del poble.' },
  },
  {
    id: 'policia', icon: '🛵', title: 'MODERNITZACIÓ POLICIAL',
    factions: ['activistes', 'veins'], tone: 'neutral',
    text: 'La policia local vol patinets elèctrics en lloc de cotxes. "Reduïrem emissions i serem més àgils", diuen. El sergent ha provat el patinet i ha trencat dos testos.',
    options: [
      { label: 'Aprovar els patinets', preview: '+Activistes  −Veïns  −280€', fx: { activistes: 10, veins: -8, money: -280 }, idleMsg: 'El sergent ha millorat. Només ha trencat un test aquesta setmana.' },
      { label: 'Mantenir els cotxes', preview: '+Veïns  −Activistes', fx: { veins: 8, activistes: -10 }, idleMsg: 'La policia segueix en cotxes. El sergent practica el patinet en privat.' },
    ],
    ignore: { fx: { activistes: 5, money: -280 }, idleMsg: 'El sergent ha comprat els patinets amb el pressupost discrecional. Sort irregular.' },
  },
  {
    id: 'ginkgo', icon: '🍂', title: 'EL PROBLEMA DELS GINKGOS',
    factions: ['veins'], tone: 'crisis',
    text: 'Els 12 ginkgos plantats fa dos anys ara fan una olor que els veïns descriuen com "mantega rància mesclada amb petons de iaia". El jardiner diu que "és natural i transitori". Dura 6 setmanes.',
    options: [
      { label: 'Substituir els arbres', preview: '+Veïns  −420€', fx: { veins: 14, money: -420 }, idleMsg: 'Els nous arbres no fan olor. La iaia del carrer diu que "li faltava quelcom".' },
      { label: 'Campanya de sensibilització', preview: '−Veïns  estalvia diners', fx: { veins: -8 }, risk: 'Ningú llegirà el fulletó', idleMsg: 'El fulletó l\'han llegit 3 persones. La 4a era el jardiner.' },
    ],
    ignore: { fx: { veins: -14 }, idleMsg: 'La petició té 847 firmes. El WhatsApp dels ginkgos ha superat el del semàfor.' },
  },
  {
    id: 'expo', icon: '🖼️', title: 'EXPOSICIÓ ITINERANT',
    factions: ['activistes', 'mercat'], tone: 'opportunity',
    text: 'Una exposició d\'art contemporani vol instal·lar-se a la plaça 3 mesos. Hi ha una escultura de 4 metres anomenada "El Pes de la Gestió". El pes real és de 2 tones.',
    options: [
      { label: 'Acceptar', preview: '+Activistes  +Mercat  −Veïns', fx: { activistes: 12, mercat: 8, veins: -10 }, idleMsg: 'L\'escultura de 2 tones és inamovible. S\'ha convertit en punt de trobada oficial.' },
      { label: 'Proposar lloc alternatiu', preview: '+Veïns  −Activistes', fx: { veins: 8, activistes: -10 }, risk: 'L\'únic lloc lliure és el cementiri', idleMsg: 'L\'exposició és al cementiri. El resultat artístic funciona millor del previst.' },
    ],
    ignore: { fx: { activistes: 8, veins: -12, money: -200 }, idleMsg: 'Han instal·lat l\'escultura de nit sense permís. La multa ha arribat ràpid.' },
  },
  {
    id: 'casament', icon: '💒', title: 'CONFLICTE NUPCIAL',
    factions: ['veins', 'mercat'], tone: 'crisis',
    text: 'Dues famílies prominents han reservat el mateix dia la sala de plens per a un casament. Tots dos diuen tenir "la reserva original". Ambdós documents porten la mateixa taca de cafè.',
    options: [
      { label: 'Sorteig oficial', preview: '+Veïns  −Mercat (una família)', fx: { veins: 6, mercat: -6 }, idleMsg: 'Una família celebra el casament. L\'altra ha dit que "l\'atzar és injust per definició".' },
      { label: 'Proposar data alternativa', preview: '−Veïns  tots dos enutjats', fx: { veins: -8, mercat: -8 }, risk: 'La nova data és cap d\'any', idleMsg: 'Tots dos casaments són cap d\'any. L\'ajuntament porta 3 paperetes de disculpa.' },
    ],
    ignore: { fx: { veins: -15, mercat: -10 }, idleMsg: 'Tots dos grups han aparegut el mateix dia. Hi ha fotos. Han sortit als diaris.' },
  },
  {
    id: 'ratolins', icon: '🐭', title: 'FAUNA NO DESITJADA',
    factions: ['veins'], tone: 'crisis',
    text: 'S\'han vist ratolins a l\'arxiu municipal. L\'empresa de control de plagues ha presentat un pressupost en tres toms. El gat de l\'ajuntament ha presentat la seva dimissió.',
    options: [
      { label: 'Contractar l\'empresa', preview: '+Veïns  −310€', fx: { veins: 10, money: -310 }, idleMsg: 'El pressupost era llarg però els ratolins han marxat. El gat s\'ha apuntat el mèrit.' },
      { label: 'Convèncer el gat de tornar', preview: '+Activistes  estalvia diners', fx: { activistes: 8 }, risk: 'El gat demana augment de sou', idleMsg: 'El gat ha tornat amb condicions. El conveni col·lectiu felí té 4 articles.' },
    ],
    ignore: { fx: { veins: -14, money: -400 }, idleMsg: 'L\'inspector de sanitat ha visitat l\'arxiu. L\'informe ocupa tres toms.' },
  },
  {
    id: 'web', icon: '🖥️', title: 'LA WEB MUNICIPAL',
    factions: ['veins', 'mercat'], tone: 'neutral',
    text: 'La web municipal porta oberta des del 2003. L\'última notícia és "Celebrem l\'Euro!" Un periodista l\'ha descoberta i l\'ha indexada com a "peça arqueològica digital". Té 14.000 visites setmanals.',
    options: [
      { label: 'Nova web (empresa local)', preview: '+Veïns  +Mercat  −480€', fx: { veins: 10, mercat: 10, money: -480 }, idleMsg: 'La nova web carrega en 2 segons. L\'antiga tenia més visites.' },
      { label: 'Actualitzar internament', preview: '+Veïns  −220€', fx: { veins: 8, money: -220 }, risk: 'El responsable TIC recorda cada commit des del 2003', idleMsg: 'La web nova té la foto del 2003 però en HD. Ningú ha notat la diferència.' },
    ],
    ignore: { fx: { mercat: 5 }, idleMsg: 'Un tercer periodista ha descobert la web. El hashtag és tendència nacional.' },
  },
  {
    id: 'cabra', icon: '🐐', title: 'ESCAPAMENT CAPRÍ',
    factions: ['mercat', 'activistes'], tone: 'crisis',
    text: 'Una cabra del mercat ha escapat i ha pres possessió del despatx de la regidora d\'Urbanisme. Porta 6 hores. Ha revisat i aparentment aprovat tres expedients pendents.',
    options: [
      { label: 'Desallotjar-la', preview: '+Veïns  −80€', fx: { veins: 8, money: -80 }, idleMsg: 'La cabra ha sortit amb dignitat. Els expedients aprovats han sigut anul·lats. Amb molt de tràmit.' },
      { label: 'Validar els expedients', preview: '+Mercat  −Activistes', fx: { mercat: 10, activistes: -14 }, risk: 'Tres llicències d\'obra depenen ara d\'una cabra', idleMsg: 'Tres llicències d\'obra es basen en la firma d\'una cabra. Tècnicament vàlid.' },
    ],
    ignore: { fx: { mercat: -10, activistes: 8, money: -200 }, idleMsg: 'La cabra ha aprovat 12 expedients més. El registre és un caos productiu.' },
  },
  {
    id: 'clot', icon: '🕳️', title: 'EL CLOT EMBLEMÀTIC',
    factions: ['veins', 'activistes'], tone: 'neutral',
    text: 'El clot del carrer Major porta 4 anys sense arreglar. Algú hi ha posat una barana, una planta i un cartellet: "CLOT PATRIMONIAL. Si us plau, no ompliu." Ara surt als mapes turístics.',
    options: [
      { label: 'Omplir-lo definitivament', preview: '+Veïns  −160€', fx: { veins: 12, money: -160 }, risk: 'Es perdrà el turisme del clot', idleMsg: 'El clot ja no existeix. El compte d\'Instagram porta 3 dies en dol.' },
      { label: 'Declarar-lo patrimoni local', preview: '+Activistes  −Veïns', fx: { activistes: 10, veins: -10 }, idleMsg: 'El clot és ara patrimoni local. La barana original ha sigut restaurada amb subvenció.' },
    ],
    ignore: { fx: { veins: -8, money: -200 }, idleMsg: 'Algú ha caigut al clot. El metge i l\'advocat han anat junts al lloc dels fets.' },
  },
  {
    id: 'cigonyes', icon: '🦅', title: 'OCELLS PROTEGITS',
    factions: ['activistes', 'veins'], tone: 'crisis',
    text: 'Unes cigonyes han fet el niu sobre la xemeneia de l\'escola. L\'obra d\'impermeabilització ha de parar per llei fins que surtin els pollets. "Podem trigar 2 mesos", ha dit l\'ornitòleg amb evident joia.',
    options: [
      { label: 'Esperar i fer PR ecològic', preview: '+Activistes  −Veïns', fx: { activistes: 12, veins: -8 }, idleMsg: 'Les cigonyes han marxat. L\'ornitòleg ha plorat discretament al pàrquing.' },
      { label: 'Trasllat del niu (legal, car)', preview: '+Veïns  −580€', fx: { veins: 10, money: -580 }, risk: 'Cal validació de tres ministeris', idleMsg: 'El niu és al nou emplaçament. La documentació ha trigat 6 setmanes i 4 segells.' },
    ],
    ignore: { fx: { activistes: -6, veins: -6 }, idleMsg: 'La premsa porta 3 articles sobre "l\'ajuntament contra la natura". L\'ornitòleg parla lliurement.' },
  },
  {
    id: 'banda', icon: '🎺', title: 'REPERTORI LIMITAT',
    factions: ['veins', 'mercat'], tone: 'neutral',
    text: 'La banda municipal admet que sap tocar exactament una cançó: "La Cumparsita". L\'han interpretada a tots els actes oficials dels últims 8 anys. Ningú havia dit res. La directora sembla orgullosa.',
    options: [
      { label: 'Finançar nous arranjaments', preview: '+Veïns  −350€', fx: { veins: 10, money: -350 }, idleMsg: 'La banda ara sap tocar dues cançons. La Cumparsita segueix sent la favorita.' },
      { label: 'Abraçar el clàssic', preview: '+Mercat (nostàlgia)', fx: { mercat: 8, veins: -6 }, risk: 'La propera és la cerimònia del Dia de la Vila', idleMsg: 'La Cumparsita sona al Dia de la Vila. Cinquena vegada consecutiva. Rècord no oficial.' },
    ],
    ignore: { fx: { veins: -4 }, idleMsg: 'La cerimònia ha sigut sonoritzada per La Cumparsita. Ningú ha dit res. De nou.' },
  },
  {
    id: 'mascota', icon: '🦊', title: 'MASCOTA OFICIAL',
    factions: ['activistes', 'mercat', 'veins'], tone: 'opportunity',
    text: 'El concurs per triar mascota oficial ha resultat en empat: "Brie" (el formatge-monument), "Enric" (una guineu del mercat) i "El Gat" (que mai ha confirmat el seu nom). Cal decidir.',
    options: [
      { label: 'Elegir "Enric" la guineu', preview: '+Activistes  +Mercat', fx: { activistes: 8, mercat: 8 }, idleMsg: 'Enric la guineu té un compte oficial. Ha tuitejat "encantat" davant la notícia.' },
      { label: 'Votació popular', preview: '+Veïns  −120€', fx: { veins: 10, money: -120 }, risk: 'Guanyarà "El Gat" per aclapadament', idleMsg: 'Ha guanyat El Gat amb el 68% dels vots. No ha fet cap declaració pública.' },
    ],
    ignore: { fx: { mercat: 5 }, idleMsg: 'Enric la guineu ha creat el seu propi compte sense esperar la decisió oficial.' },
  },
  {
    id: 'carrers', icon: '🗺️', title: 'CARRERS HOMÒNIMS',
    factions: ['mercat', 'veins'], tone: 'crisis',
    text: 'La comissió de nomenclatura ha descobert que tres carrers del poble es diuen igual: "Carrer Nou". Estan a 80 metres l\'un de l\'altre. L\'empresa de missatgeria porta 4 anys maleint.',
    options: [
      { label: 'Rebatejar-los tots', preview: '+Mercat  −Veïns  −100€', fx: { mercat: 10, veins: -8, money: -100 }, idleMsg: 'Tres carrers nous, tres noms nous. El carter ha demanat vacances com a celebració.' },
      { label: 'Afegir numeració romana', preview: '+Activistes  −Mercat', fx: { activistes: 6, mercat: -8 }, risk: '"Carrer Nou III" ha desconcertat el carter', idleMsg: 'El Carrer Nou III ha generat 34 queixes. El carter no sap on deixar els paquets.' },
    ],
    ignore: { fx: { mercat: -10, money: -150 }, idleMsg: 'L\'empresa de missatgeria ha presentat una queixa formal. Avís de demanda inclòs.' },
  },
  {
    id: 'cartell', icon: '🪧', title: 'CARTELL D\'ENTRADA',
    factions: ['veins', 'activistes'], tone: 'neutral',
    text: 'El cartell d\'entrada al poble porta 11 anys mal escrit, en castellà, malgrat el decret de retolació. El turisme ha augmentat des d\'una foto irònica a les xarxes. 80.000 impressions.',
    options: [
      { label: 'Substituir el cartell', preview: '+Veïns  +Activistes  −180€', fx: { veins: 10, activistes: 10, money: -180 }, idleMsg: 'El nou cartell és correcte. El vell té ja dos compradors col·leccionistes.' },
      { label: 'Mantenir-lo com a reclam viral', preview: '+Mercat  −Activistes', fx: { mercat: 12, activistes: -16 }, idleMsg: 'El cartell porta 100.000 impressions. El turisme ha pujat un 4%. El cartell segueix igual.' },
    ],
    ignore: { fx: { mercat: 6, activistes: -4 }, idleMsg: 'Una tercera foto irònica circula. L\'ajuntament surt sempre al fons sense voler.' },
  },
  {
    id: 'estatua', icon: '🗿', title: 'ESTÀTUA EN DISPUTA',
    factions: ['veins'], tone: 'neutral',
    text: 'L\'estàtua del fundador és, de fet, el mateix model de catàleg que fan servir dos pobles veïns. Les tres comissions de patrimoni ho han descobert simultàniament. L\'escultor va morir el 1931.',
    options: [
      { label: 'Comissió d\'investigació', preview: '+Veïns  −150€', fx: { veins: 8, money: -150 }, idleMsg: 'La comissió ha determinat que el model es va vendre a 14 municipis. Tots ho investiguen.' },
      { label: 'Afegir-li un barret exclusiu', preview: '+Veïns  −200€  (distinció)', fx: { veins: 12, money: -200 }, idleMsg: 'L\'estàtua porta barret. Cap dels altres catorze pobles pot dir el mateix.' },
    ],
    ignore: { fx: {}, idleMsg: 'Els tres pobles no diuen res. L\'escultor del 1931 segueix sent tema de conversa.' },
  },
  {
    id: 'gegants', icon: '🎭', title: 'GEGANTS EN CRISI',
    factions: ['veins'], tone: 'opportunity',
    text: 'La colla de gegants vol sortir per la Festa Major però "en Jaume el Gros" té el braç esquerre despenjat i "la Margarida" ha perdut la cabellera. Surten en 12 dies.',
    options: [
      { label: 'Restauració urgent', preview: '+Veïns  −240€', fx: { veins: 14, money: -240 }, idleMsg: 'En Jaume i la Margarida surten impecables. La colla ha ballat tres passes de més per alegria.' },
      { label: 'Sortir amb els desperfectes', preview: '+Activistes (autenticitat)', fx: { activistes: 8, veins: -8 }, idleMsg: 'En Jaume ha sortit amb el braç despenjat. Uns han dit "art", els altres "vergonya".' },
    ],
    ignore: { fx: { veins: -10 }, idleMsg: 'La colla no ha sortit. La Festa Major ha quedat com una cerimònia d\'abandó municipal.' },
  },
  {
    id: 'llums_nadal', icon: '🎄', title: 'LLUMS DE NADAL',
    factions: ['mercat', 'veins'], tone: 'opportunity',
    text: 'L\'empresa funerària vol patrocinar les llums de Nadal. A canvi: "Bon Nadal de Pompes Fúnebres Torrents" a totes les estrelles lluminoses. Cobreix el 90% del cost.',
    options: [
      { label: 'Acceptar el patrocini', preview: '+Mercat  −Veïns  estalvia', fx: { mercat: 10, veins: -12 }, idleMsg: 'Les llums estan precioses. L\'eslògan ha generat 23 queixes i 80 selfies irònics.' },
      { label: 'Pagar-ho nosaltres', preview: '+Veïns  −360€', fx: { veins: 12, money: -360 }, idleMsg: 'Les llums no mencionen ningú. El carrer és festiu i lleugerament menys inquietant.' },
    ],
    ignore: { fx: { mercat: -6, veins: -6 }, idleMsg: 'Les llums no s\'han penjat. La funerària ha decorat la seva façana. Molt elaboradament.' },
  },
  {
    id: 'bus_nocturn', icon: '🚌', title: 'BUS DE MITJANIT',
    factions: ['activistes'], tone: 'crisis',
    text: 'Els Activistes exigeixen bus nocturn fins les 3h els caps de setmana. L\'empresa de transport diu que valdria 680€ per trajecte. "Però som nosaltres qui ho paguem", responen els Activistes.',
    options: [
      { label: 'Negociar fins a la 1h', preview: '+Activistes parcial  −280€/mes', fx: { activistes: 8, money: -280 }, idleMsg: 'El bus de la 1h funciona. Sempre hi ha una persona sola que el pren. Va feliç.' },
      { label: 'Rebutjar (pressupost limitat)', preview: '−Activistes  estalvia', fx: { activistes: -12 }, idleMsg: 'Els Activistes han organitzat una xarxa de cotxes compartits. No han dit gràcies.' },
    ],
    ignore: { fx: { activistes: -14 }, idleMsg: 'Els Activistes han pintat "BUS NOCTURN O MOBILITAT ZERO" a l\'entrada de l\'ajuntament.' },
  },
  {
    id: 'sequera', icon: '🏜️', title: 'RESTRICCIONS HÍDIQUES',
    factions: ['veins', 'mercat'], tone: 'crisis',
    text: 'La sequera obliga a regar els jardins públics de matinada. El jardiner diu que "de matinada no és la seva franja horària". Ha presentat una queixa formal de tres pàgines.',
    options: [
      { label: 'Sistema de degoteig automàtic', preview: '+Veïns  −480€', fx: { veins: 12, money: -480 }, idleMsg: 'El sistema funciona sol. El jardiner ha demanat una reassignació de funcions.' },
      { label: 'Horari de matinada obligatori', preview: '+Activistes  −Veïns', fx: { activistes: 10, veins: -8 }, risk: 'La queixa formal seguirà activa', idleMsg: 'El jardiner fa la feina a les 4h. No saluda ningú. Ho fa igualment bé.' },
    ],
    ignore: { fx: { veins: -10, mercat: -8, money: -300 }, idleMsg: 'La multa hídrica ha arribat. L\'inspector ha fotografiat els gespes regats de dia.' },
  },
  {
    id: 'revetlla', icon: '🎆', title: 'NOCHE DE SANT JOAN',
    factions: ['veins', 'activistes'], tone: 'opportunity',
    text: 'La Revetlla: els Activistes volen fogueres simbòliques amb papers de protesta. Els Veïns volen petards fins les 3h. El bomber ha demanat vacances precisament aquell cap de setmana.',
    options: [
      { label: 'Revetlla tradicional (petards)', preview: '+Veïns  −Activistes', fx: { veins: 14, activistes: -10 }, risk: 'El bomber torna dimarts', idleMsg: 'La revetlla ha sigut ruidosa i festiva. El bomber ha trucat des de vacances dues vegades.' },
      { label: 'Fogueres simbòliques', preview: '+Activistes  −Veïns', fx: { activistes: 12, veins: -10 }, idleMsg: 'La foguera simbòlica ha durat 20 minuts. Algú ha cremat els documents equivocats.' },
    ],
    ignore: { fx: { veins: -6, activistes: -6 }, idleMsg: 'Ningú ha organitzat res oficial. La gent ha comprat petards a la comarca veïna.' },
  },
  {
    id: 'bicicletes', icon: '🚴', title: 'BICICLETES COMPARTIDES',
    factions: ['activistes', 'mercat', 'veins'], tone: 'opportunity',
    text: 'Una empresa proposa 30 bicicletes compartides. Sistema GPS, app i un color "que inspiri moviment" (taronja fluorescent). La moció porta el nom "Pedalem cap al Futur, Ja!".',
    options: [
      { label: 'Aprovar el projecte', preview: '+Activistes  +Mercat  −Veïns  −400€', fx: { activistes: 12, mercat: 8, veins: -8, money: -400 }, idleMsg: '22 de les 30 bicicletes funcionen. Les 8 restants "inspiren igualment", diu l\'empresa.' },
      { label: 'Pilot de 5 bicicletes', preview: '+Activistes parcial  −80€', fx: { activistes: 6, money: -80 }, risk: 'Les fa servir sempre la mateixa persona', idleMsg: 'El pilot l\'ha avaluat la mateixa persona que les fa servir. 10/10.' },
    ],
    ignore: { fx: { activistes: -10 }, idleMsg: 'L\'empresa ha anat a Rocalba. El seu carrer principal és ara taronja fluorescent.' },
  },
  {
    id: 'pont', icon: '🌉', title: 'PONT PROBLEMÀTIC',
    factions: ['veins', 'mercat'], tone: 'crisis',
    text: 'El pont del barri vell té una esquerda. El primer informe: "estètica". El segon: "estructural". El tercer consultor ha demanat un 10% per "decidir quin criteri adoptar".',
    options: [
      { label: 'Tancament i reparació', preview: '+Veïns  −820€', fx: { veins: 10, money: -820 }, risk: 'El barri queda aïllat 3 setmanes', idleMsg: 'El pont reparat ha passat tres inspeccions. El tercer consultor ha desaparegut.' },
      { label: 'Apuntalament provisional', preview: '−Veïns  −Mercat  −200€', fx: { veins: -8, mercat: -8, money: -200 }, risk: '"Provisional" és un concepte molt elàstic', idleMsg: 'L\'apuntalament aguanta. El segon informe segueix sobre la taula, sense resposta.' },
    ],
    ignore: { fx: { veins: -14, mercat: -12, money: -500 }, idleMsg: 'L\'esquerda ha crescut. L\'ajuntament rep la primera demanda. De moment.' },
  },
  {
    id: 'ploms', icon: '🔧', title: 'CANONADES DE PLOM',
    factions: ['veins', 'activistes'], tone: 'crisis',
    text: 'Canonades de plom dels anys 50 afecten 14 carrers. L\'empresa no pot començar fins d\'aquí a 3 mesos i ha enviat un fulletó titulat "Tranquil·litat és una Qüestió d\'Actitud".',
    options: [
      { label: 'Finançar la substitució urgent', preview: '+Veïns  +Activistes  −720€', fx: { veins: 16, activistes: 12, money: -720 }, idleMsg: 'Les canonades noves instal·lades. El fulletó tranquil·litzador ha quedat obsolet.' },
      { label: 'Filtres temporals (60% d\'eficàcia)', preview: '+Veïns parcial  −150€', fx: { veins: 4, money: -150 }, risk: 'El 40% és motiu de conversa al mercat', idleMsg: 'Els filtres funcionen al 60%. L\'altre 40% és motiu de conversa al mercat cada dia.' },
    ],
    ignore: { fx: { veins: -18, activistes: -12 }, idleMsg: 'L\'Agència de Salut Pública ha obert un expedient. La premsa ja ho ha publicat.' },
  },
  {
    id: 'heliport', icon: '🚁', title: 'HELIPORT VISIONARI',
    factions: ['mercat'], tone: 'opportunity',
    text: 'Un inversor proposa un heliport municipal. "Posarem el poble al mapa executiu", assegura mentre assenyala un camp de girasols. El camp pertany a la senyora Pujol, que no n\'ha sigut informada.',
    options: [
      { label: 'Estudi de viabilitat', preview: '+Mercat  −80€', fx: { mercat: 6, money: -80 }, risk: 'La senyora Pujol ja ha contractat advocat', idleMsg: 'L\'estudi conclou que el camp és necessari. La senyora Pujol ha presentat al·legacions.' },
      { label: 'Rebutjar la proposta', preview: '+Veïns  −Mercat', fx: { veins: 6, mercat: -12 }, idleMsg: 'L\'inversor ha anat a Riudornes. Diuen que els girasols de la seva senyora són infinits.' },
    ],
    ignore: { fx: { mercat: -8 }, idleMsg: 'L\'inversor ha marxat sense resposta. Ha tweejat que "la visió requereix audàcia".' },
  },
  {
    id: 'pla_mobilitat', icon: '🛣️', title: 'PLA DE MOBILITAT',
    factions: ['mercat', 'veins', 'activistes'], tone: 'neutral',
    text: 'El Pla de Mobilitat Sostenible té 340 pàgines i 12 accions. L\'acció 1: un semàfor nou. L\'acció 12: "repensar el vehicle privat de forma holística". Ningú ha llegit les accions 2 a 11.',
    options: [
      { label: 'Implementar accions 1-6', preview: '+Veïns  +Mercat  −320€', fx: { veins: 8, mercat: 8, money: -320 }, idleMsg: 'Les accions 1-6 s\'han implementat. El semàfor funciona. Les 7-12 esperen dignament.' },
      { label: 'Aprovar en bloc (simbòlic)', preview: '+Activistes  −Mercat  −Veïns', fx: { activistes: 10, mercat: -6, veins: -6 }, risk: 'Aprovar no és implementar', idleMsg: 'El Pla és aprovat. Cap acció implementada. El document descansa en pau.' },
    ],
    ignore: { fx: { activistes: -8 }, idleMsg: 'El Pla porta 3 mesos sense resposta oficial. S\'ha iniciat la versió 2.0.' },
  },
  {
    id: 'subvencio', icon: '💸', title: 'SUBVENCIÓ EUROPEA',
    factions: ['mercat', 'activistes'], tone: 'opportunity',
    text: 'Hi ha una subvenció europea de 50.000€ per a "projectes de cohesió territorial innovadors amb impacte mesurable". Termini: 12 dies. Formulari: 48 pàgines. La secretaria mira el sostre.',
    options: [
      { label: 'Contractar gestora externa', preview: '+Mercat  −480€  (gestió)', fx: { mercat: 14, money: -480 }, risk: 'Si guanyem, recuperem amb escreix', idleMsg: 'La gestora ha presentat la sol·licitud. Esperem resolució en 6 mesos.' },
      { label: 'Presentar internament', preview: '+Activistes  −Mercat (si es perd)', fx: { activistes: 8, mercat: -4 }, risk: 'La secretaria ha comptat les pàgines dues vegades', idleMsg: 'La sol·licitud s\'ha presentat. La secretaria s\'ha agafat 2 dies de vacances tot seguit.' },
    ],
    ignore: { fx: { mercat: -10 }, idleMsg: 'El termini ha passat. El municipi veí ha guanyat la subvenció. Envien postals.' },
  },
  {
    id: 'edifici_abandonat', icon: '🏚️', title: 'EDIFICI EN RUNES',
    factions: ['veins', 'activistes', 'mercat'], tone: 'crisis',
    text: 'L\'edifici dels antics jutjats (buit des del 1994) s\'ensorra parcialment. El carrer s\'ha tallat. Pertany a una herència amb 14 hereus a 6 països. Cap respon el telèfon.',
    options: [
      { label: 'Enderroc d\'urgència (nosaltres)', preview: '+Veïns  −680€', fx: { veins: 12, money: -680 }, risk: 'Reclamarem als hereus. Probablement mai.', idleMsg: 'L\'edifici ja no existeix. El carrer ha obert. Cap hereu ha trucat. Tampoc s\'esperava.' },
      { label: 'Apuntalament i reclamació legal', preview: '−Veïns  −Mercat  −200€', fx: { veins: -8, mercat: -8, money: -200 }, risk: 'Els advocats cobren per hora. Moltes hores.', idleMsg: 'L\'apuntalament aguanta. Els advocats han facturat la primera hora de moltes.' },
    ],
    ignore: { fx: { veins: -16, mercat: -10, money: -400 }, idleMsg: 'Una part addicional s\'ha ensortit. L\'assegurança demana l\'historial de manteniment del 1994.' },
  },
  {
    id: 'subhasta', icon: '🔨', title: 'SUBHASTA MUNICIPAL',
    factions: ['veins', 'mercat'], tone: 'opportunity',
    text: 'Per quadrar el pressupost, s\'han inventariat béns subhastables: 400 cadires de plàstic, un fax en perfecte estat, i el nom de la sala de plens per un any. La sala s\'anomena "Sala Glòria".',
    options: [
      { label: 'Subhastar-ho tot', preview: '+600€  −Veïns', fx: { money: 600, veins: -8 }, risk: 'La sala pot passar a dir-se "Sala Ferreteria Pep"', idleMsg: 'La sala s\'anomena ara "Sala Ferreteria Pep". Els plens tenen un to diferent.' },
      { label: 'Només cadires i fax', preview: '+180€', fx: { money: 180 }, idleMsg: 'El fax s\'ha venut per 85€. El comprador ha dit que "els faxos tornen". Bé.' },
    ],
    ignore: { fx: { money: -180 }, idleMsg: 'El forat pressupostari s\'ha cobert amb reserves. Les reserves eren per a una altra cosa.' },
  },
];

// Global conjuncture events (shown between mandates).
// startFx: applied once at mandate start
// incomeMod: flat modifier to weekly income for the whole mandate
// driftMod: per-faction drift modifier for the whole mandate
// badge: unlocked permanently when first encountered

const CONJUNCTURES = [
  {
    id: 'crisi_eco', icon: '📉', title: 'CRISI ECONÒMICA GLOBAL',
    text: 'Els mercats internacionals han entrat en recessió. El comerç local nota la pressió i el Mercat ja parla de "mesures d\'ajust necessàries i doloroses".',
    badge: { icon: '📉', name: 'Mà Ferma en Crisi', desc: 'Has governat durant una crisi econòmica global' },
    startFx: { money: -200, mercat: -8 },
    incomeMod: -15,
    driftMod: { mercat: -0.6 },
  },
  {
    id: 'boom_tec', icon: '💻', title: 'BOOM TECNOLÒGIC',
    text: 'La comarca ha atret inversió tecnològica. El Mercat és optimista, els joves parlen de "startups" i els ingressos municipals creixen inesperadament.',
    badge: { icon: '💻', name: 'Vila Digital', desc: 'Has governat durant el boom tecnològic de la comarca' },
    startFx: { money: 250, mercat: 10 },
    incomeMod: 20,
    driftMod: { mercat: 0.5 },
  },
  {
    id: 'turisme_mas', icon: '✈️', title: 'TURISME MASSIU',
    text: 'Un influencer ha publicat una foto del poble amb 2M de visualitzacions. El turisme arriba en onades. El Mercat és feliç. Els Veïns, progressivament menys.',
    badge: { icon: '✈️', name: 'Destinació Viral', desc: 'Has gestionat l\'afluència turística massiva del poble' },
    startFx: { money: 180, mercat: 12, veins: -8 },
    incomeMod: 25,
    driftMod: { veins: -0.8, mercat: 0.4 },
  },
  {
    id: 'calor_ext', icon: '🌡️', title: 'ONADA DE CALOR EXTREMA',
    text: 'Temperatures rècord, talls de llum i tensions socials. Els Activistes demanen accions climàtiques immediates. El jardiner ha demanat una samarreta nova amb refrigeració integrada.',
    badge: { icon: '🌡️', name: 'Resistència Tèrmica', desc: 'Has governat durant una onada de calor extrema' },
    startFx: { money: -100, activistes: -10, veins: -6 },
    incomeMod: -10,
    driftMod: { veins: -0.5, activistes: -0.7 },
  },
  {
    id: 'eleccions_reg', icon: '🗳️', title: 'ELECCIONS REGIONALS',
    text: 'Eleccions autonòmiques. Tothom promet coses al poble. Els Activistes estan particularment actius. Les promeses no inclouen cap partida del pressupost local.',
    badge: { icon: '🗳️', name: 'Polític de Carrera', desc: 'Has governat durant un any electoral regional' },
    startFx: { activistes: 10, veins: 5 },
    incomeMod: 0,
    driftMod: { activistes: 0.5, veins: -0.3 },
  },
  {
    id: 'grip_muni', icon: '🤒', title: 'GRIP MUNICIPAL',
    text: 'Una grip atípica circula pel poble. El metge ha demanat reforços. Els actes públics se suspenen. La factura sanitària és el tema del trimestre.',
    badge: { icon: '🤒', name: 'Gestió Sanitària', desc: 'Has governat durant una epidèmia local de grip' },
    startFx: { money: -250, veins: -8 },
    incomeMod: -20,
    driftMod: { veins: -0.6 },
  },
  {
    id: 'subv_ext', icon: '🏛️', title: 'SUBVENCIÓ EXTRAORDINÀRIA',
    text: 'L\'administració central ha aprovat una subvenció extraordinària per a municipis amb "trajectòria de gestió exemplar". Sou vosaltres. Per fi uns diners que ningú esperava.',
    badge: { icon: '🏛️', name: 'Gestió Exemplar', desc: 'Has rebut una subvenció extraordinària entre mandats' },
    startFx: { money: 500 },
    incomeMod: 10,
    driftMod: {},
  },
  {
    id: 'escandol_reg', icon: '📰', title: 'ESCÀNDOL REGIONAL',
    text: 'Un escàndol a la capital regional salpica tots els ajuntaments per proximitat mediàtica. No heu fet res dolent. Però el neguit és general i tothom mira amb ull crític.',
    badge: { icon: '📰', name: 'Dany Col·lateral', desc: 'Has governat enmig d\'un escàndol polític regional' },
    startFx: { veins: -12, mercat: -8, activistes: 8 },
    incomeMod: 0,
    driftMod: { veins: -0.4, mercat: -0.3, activistes: 0.4 },
  },
  {
    id: 'industria_com', icon: '🏭', title: 'NOVA INDÚSTRIA COMARCAL',
    text: 'Una gran empresa s\'ha instal·lat a la comarca. Feina i dinamisme, però també pressió sobre l\'habitatge i noves cares al poble. Els Veïns estan dividits.',
    badge: { icon: '🏭', name: 'Transformació Comarcal', desc: 'Has gestionat l\'impacte d\'una gran indústria a la comarca' },
    startFx: { money: 150, mercat: 10, veins: -6, activistes: -8 },
    incomeMod: 15,
    driftMod: { mercat: 0.4, veins: -0.5, activistes: -0.4 },
  },
  {
    id: 'sequera_ext', icon: '☀️', title: 'SEQUERA PROLONGADA',
    text: 'La sequera s\'allarga de mandat en mandat. Les restriccions d\'aigua afecten tothom. El jardiner ha presentat la seva quarta queixa formal de l\'any.',
    badge: { icon: '☀️', name: 'Governança en Sequera', desc: 'Has governat durant una sequera prolongada i persistent' },
    startFx: { money: -150, veins: -8, mercat: -6 },
    incomeMod: -10,
    driftMod: { veins: -0.5, mercat: -0.3 },
  },
];
