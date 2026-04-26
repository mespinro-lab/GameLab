'use strict';

// factions: which factions this event primarily concerns
// tone: 'crisis' = arises from an unhappy/demanding faction
//       'opportunity' = arises from a content/engaged faction
//       'neutral' = quirky, not mood-driven
// ignore.fx / ignore.idleMsg: what happens if the player does nothing
// options[n].idleMsg: shown in idle-state after that option is chosen

const EVENTS = [
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

// ── Global conjuncture events (shown between mandates) ──────────────────────
// Each sets the political/economic context for the next mandate.
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

// ── World definitions ───────────────────────────────────────────────────────
// Each world: id, name, icon, color, description, factionConfig,
//             startMoney, startFactions, startTax, drift, events[]

const WORLDS = [
  {
    id: 'vilaturisme',
    name: 'Vilaturisme',
    icon: '🌅',
    color: '#FF9F43',
    description: 'Poble turístic en plena transformació. Gestiona l\'equilibri entre residents i la indústria de l\'hospitalitat.',
    factionConfig: {
      veins:      { icon: '🏠', name: 'Residents' },
      mercat:     { icon: '🏨', name: 'Hostalers' },
      activistes: { icon: '🌿', name: 'Ecologistes' },
    },
    startMoney: 600,
    startFactions: { veins: 55, mercat: 70, activistes: 50 },
    startTax: 'mid',
    drift: { veins: -1.3, mercat: -0.7, activistes: -1.3 },
    events: [
      {
        id: 'v_aptos', icon: '🏠', title: 'PISOS TURÍSTICS',
        factions: ['veins', 'activistes'], tone: 'crisis',
        text: 'Dotze pisos del centre s\'han convertit en apartaments turístics en un mes. Els residents troben turistes amb maletes als rebaixos a les 3h. Al bústia, notes en anglès pregunten on és "the local artisan coffee experience".',
        options: [
          { label: 'Regular els lloguers', preview: '+Residents  −Hostalers  −80€', fx: { veins: 12, mercat: -10, money: -80 }, idleMsg: 'La regulació avança. Set recursos legals han arribat la mateixa setmana.' },
          { label: 'Deixar actuar el mercat', preview: '+Hostalers  −Residents', fx: { mercat: 14, veins: -14 }, risk: 'El barri es buida de veïns', idleMsg: 'Tres famílies han marxat. Un pis fa visites "authentic local experience".' },
        ],
        ignore: { fx: { veins: -10, mercat: 8 }, idleMsg: 'L\'oferta d\'apartaments creix. El barri no reconeix els seus veïns. Literalment.' },
      },
      {
        id: 'v_influencer', icon: '📸', title: 'FENOMEN INFLUENCER',
        factions: ['mercat', 'veins'], tone: 'opportunity',
        text: 'Un influencer de 12 milions de seguidors ha penjat una foto del campanar i l\'ha qualificat de "hidden gem vibes". Han vingut 2.000 persones en un cap de setmana. El campanar té aforament per a 40.',
        options: [
          { label: 'Organitzar visites guiades', preview: '+Hostalers  +300€  −Residents', fx: { mercat: 10, money: 300, veins: -8 }, idleMsg: 'Les visites funcionen. El campanar resisteix. L\'influencer ha publicat la Part 2.' },
          { label: 'Demanar que elimini la foto', preview: '+Residents  −Hostalers', fx: { veins: 8, mercat: -12 }, idleMsg: 'Ha eliminat la foto i ha penjat un "sincere apology content". Més vistes que l\'original.' },
        ],
        ignore: { fx: { mercat: 8, veins: -8 }, idleMsg: 'La gent segueix venint sola. El campanar parpelleja sota pressió.' },
      },
      {
        id: 'v_soroll_nit', icon: '🎉', title: 'TURISME NOCTURN',
        factions: ['veins'], tone: 'crisis',
        text: 'El carrer central s\'ha convertit en zona de festa nocturna improvisada. Els turistes canten fins a les 5h. La farmàcia ha esgotat les tapetes per a les orelles. El farmacèutic diu que "és la millor temporada de la seva vida".',
        options: [
          { label: 'Zones d\'oci delimitades', preview: '+Residents  +Hostalers  −200€', fx: { veins: 10, mercat: 8, money: -200 }, idleMsg: 'Les zones funcionen. El soroll es concentra. El veí del cantó porta auriculars industrials.' },
          { label: 'Permetre l\'ambient', preview: '+Hostalers  −Residents', fx: { mercat: 10, veins: -14 }, idleMsg: 'Els Hostalers estan contents. El metge ha obert consulta nocturna "per estrès acústic".' },
        ],
        ignore: { fx: { veins: -12, mercat: 6 }, idleMsg: 'La farmàcia ha fet comanda especial. Les tapetes arriben dimecres.' },
      },
      {
        id: 'v_guia', icon: '🗺️', title: 'GUIES AUTOPROCLAMATS',
        factions: ['mercat', 'veins'], tone: 'neutral',
        text: 'Tres persones s\'han autoproclamat guies turístics oficials. Cap té titulació. Un porta barret de copa. Un altre fa servir segway sense permís. La tercera no parla català però diu que "l\'autenticitat és universal".',
        options: [
          { label: 'Crear guies oficials', preview: '+Hostalers  +Residents  −150€', fx: { mercat: 10, veins: 8, money: -150 }, idleMsg: 'Les guies oficials han substituït les autoproclamades. El barret de copa ha desaparegut.' },
          { label: 'Deixar el mercat regularse', preview: '+Hostalers  −Residents', fx: { mercat: 8, veins: -8 }, risk: 'El segway ha atropellat un turista', idleMsg: 'El segway ha atropellat un turista. El turista l\'ha puntuat 4 estrelles igualment.' },
        ],
        ignore: { fx: { mercat: 5 }, idleMsg: 'Els tres guies segueixen actius. Un ha obert canal de YouTube "Vilatourisme Oficial (No Oficial)".' },
      },
      {
        id: 'v_monument', icon: '🏛️', title: 'MONUMENT EN PERILL',
        factions: ['veins', 'activistes'], tone: 'crisis',
        text: 'Un grup de turistes s\'ha enfilat al monument del fundador per fer fotos. S\'ha trencat el braç dret. El de pedra. El monument té 160 anys. El turista ha publicat el vídeo com a "urban explorer content".',
        options: [
          { label: 'Restaurar i posar tanca', preview: '+Residents  +Ecologistes  −280€', fx: { veins: 12, activistes: 10, money: -280 }, idleMsg: 'La restauració inclou tanca. L\'Urban Explorer ha rebut 4.000 comentaris negatius.' },
          { label: 'Multar i deixar com està', preview: '+Hostalers  −Residents', fx: { mercat: 6, veins: -10 }, risk: 'La multa no cobreix la restauració', idleMsg: 'La multa no cobreix la restauració. El monument segueix manc.' },
        ],
        ignore: { fx: { veins: -14, money: -150 }, idleMsg: 'El monument segueix manc. Ha sigut declarat "part del caràcter del poble".' },
      },
      {
        id: 'v_festival', icon: '🍷', title: 'FIRA GASTRONÒMICA',
        factions: ['mercat', 'veins'], tone: 'opportunity',
        text: 'L\'Associació d\'Hostalers vol una Fira Gastronòmica Internacional. Han reservat la plaça tres caps de setmana. Diuen que serà "artisanal, local i experiencial". Han imprès la paraula "experiencial" a les samarretes.',
        options: [
          { label: 'Subvencionar la fira', preview: '+Hostalers  +Residents  +200€  −220€', fx: { mercat: 10, veins: 8, money: -20 }, idleMsg: 'La fira ha funcionat. El resultat net és -20€ però l\'ambient ha valgut la pena.' },
          { label: 'Cobrar taxa als organitzadors', preview: '+Residents  −Hostalers', fx: { veins: 8, mercat: -10 }, idleMsg: 'L\'Associació ha pagat la taxa amb disgust. La fira ha sigut la meitat de gran.' },
        ],
        ignore: { fx: { activistes: 8, mercat: -6 }, idleMsg: 'La fira s\'ha fet sense permís. L\'Ajuntament surt al programa com a "no col·laborador".' },
      },
      {
        id: 'v_habitatge', icon: '🏡', title: 'HABITATGE IMPOSSIBLE',
        factions: ['veins', 'activistes'], tone: 'crisis',
        text: 'El preu del lloguer ha pujat un 60% en dos anys. Una família que viu al poble des del 1978 ha hagut de marxar perquè el propietari converteix el pis en turístic. L\'apartament es diu "Casa Glòria – Authentic Local Home".',
        options: [
          { label: 'Fons d\'habitatge municipal', preview: '+Residents  +Ecologistes  −600€', fx: { veins: 14, activistes: 10, money: -600 }, idleMsg: 'El fons ajuda 4 famílies. La llista d\'espera en té 34.' },
          { label: 'Incentius per a lloguers llargs', preview: '+Hostalers  −Residents  −100€', fx: { mercat: 6, veins: -8, money: -100 }, idleMsg: 'Dos propietaris han canviat a lloguer llarg. Els altres trenta-vuit "ho estan valorant".' },
        ],
        ignore: { fx: { veins: -12, activistes: -8 }, idleMsg: 'Dues famílies més marxen. Els Ecologistes han enviat una carta de vuit folis.' },
      },
      {
        id: 'v_bus', icon: '🚌', title: 'BUS TURÍSTIC',
        factions: ['mercat', 'veins'], tone: 'opportunity',
        text: 'Una empresa proposa un bus turístic que faria 4 voltes al dia. El recorregut passa per davant de tres cases particulars que no han sigut avisades. El propietari del Carrer Major s\'assabenta pels veïns.',
        options: [
          { label: 'Aprovar el bus', preview: '+Hostalers  +150€  −Residents', fx: { mercat: 10, money: 150, veins: -8 }, idleMsg: 'El bus funciona. El propietari del Carrer Major demana "royalties de façana".' },
          { label: 'Recorregut alternatiu', preview: '+Residents  −Hostalers  −80€', fx: { veins: 8, mercat: -8, money: -80 }, idleMsg: 'El recorregut alternatiu evita les cases. Passa per la zona d\'obra. El bus fa soroll extra.' },
        ],
        ignore: { fx: { mercat: 10, veins: -8 }, idleMsg: 'El bus ha fet la ruta original sense permís. El propietari ha posat una pancarta.' },
      },
      {
        id: 'v_taxa', icon: '💶', title: 'TAXA TURÍSTICA',
        factions: ['mercat', 'veins'], tone: 'neutral',
        text: 'L\'Ajuntament proposa una taxa turística d\'1,50€ per nit. Els Hostalers diuen que "els espantarà". Els Residents diuen que "és poc". El turista que ho ha sentit diu que "no sabia que existia".',
        options: [
          { label: 'Aprovar la taxa', preview: '+Residents  −Hostalers  +250€/mandat', fx: { veins: 10, mercat: -10, money: 250 }, idleMsg: 'La taxa es recapta. Quatre hostalers han posat cartells de "Nosaltres no la cobrem. (La cobrem.)".' },
          { label: 'Rebutjar-la', preview: '+Hostalers  −Residents', fx: { mercat: 10, veins: -8 }, idleMsg: 'Els Hostalers feliços. Els Residents diuen que "estem subvencionant el turisme".' },
        ],
        ignore: { fx: { veins: -4, mercat: 4 }, idleMsg: 'La taxa s\'ha posposat. Per tercera vegada.' },
      },
      {
        id: 'v_suvenir', icon: '🛍️', title: 'BOTIGA A LA PLAÇA',
        factions: ['mercat', 'veins'], tone: 'opportunity',
        text: 'Un empresari vol una botiga de suvenirs a la façana de l\'edifici historic de la plaça. Es dirà "Autentica Vila Memorabilia Store". El logotip inclou el campanar amb palmera, "que queda millor per als turistes".',
        options: [
          { label: 'Autoritzar', preview: '+Hostalers  −Residents  −Ecologistes', fx: { mercat: 12, veins: -8, activistes: -8 }, idleMsg: 'La botiga ven campanars amb palmera. Cap turista ha preguntat per la palmera.' },
          { label: 'Negar la ubicació', preview: '+Residents  +Ecologistes  −Hostalers', fx: { veins: 8, activistes: 8, mercat: -10 }, idleMsg: 'L\'empresari ha trobat un local fora de la plaça. El campanar segueix sense palmera.' },
        ],
        ignore: { fx: { mercat: -8 }, idleMsg: 'L\'empresari ha signat a Vilaroja. Allà el campanar té palmera i pelicà.' },
      },
      {
        id: 'v_drons', icon: '🚁', title: 'DRONS SOBRE EL POBLE',
        factions: ['veins', 'activistes'], tone: 'neutral',
        text: 'Cinc turistes fan fotos amb dron al centre historic. Un ha sobrevolat el pati interior de Can Puig, que és privat. La senyora Puig ha sortit al pati en roba de casa. La foto ja circula.',
        options: [
          { label: 'Zona de drons regulada', preview: '+Residents  +Ecologistes  −120€', fx: { veins: 10, activistes: 8, money: -120 }, idleMsg: 'La zona delimitada funciona. La senyora Puig no ha sortit al pati des de llavors.' },
          { label: 'Prohibició total', preview: '+Residents  −Hostalers', fx: { veins: 10, mercat: -10 }, idleMsg: 'Quatre turistes han protestat. Un ha dit "tinc drets aeris internacionals".' },
        ],
        ignore: { fx: { veins: -8 }, idleMsg: 'Tres fotos més del pati. La senyora Puig ha tancat el pati. I les persianes.' },
      },
      {
        id: 'v_ruta', icon: '🌲', title: 'RUTA NATURAL SATURADA',
        factions: ['activistes', 'veins'], tone: 'crisis',
        text: 'La ruta de senderisme ha rebut 800 visitants en un cap de setmana. El camí, dissenyat per a 40 persones al dia, té cues a la pedrera. Un grup ha fet foc on no es pot fer foc.',
        options: [
          { label: 'Gestionar accés amb reserves', preview: '+Ecologistes  +Residents  −180€', fx: { activistes: 12, veins: 8, money: -180 }, idleMsg: 'El sistema de reserves funciona. Els senders respiren. Tres visitants diuen que "era millor sense ordre".' },
          { label: 'Ampliar la infraestructura', preview: '+Hostalers  −Ecologistes  −350€', fx: { mercat: 8, activistes: -12, money: -350 }, idleMsg: 'La infraestructura aguanta. Els Ecologistes han enviat un informe de 22 pàgines.' },
        ],
        ignore: { fx: { activistes: -12, veins: -6 }, idleMsg: 'La ruta queda tancada. El grup del foc no s\'ha identificat mai.' },
      },
      {
        id: 'v_creuers', icon: '⚓', title: 'ESCALA NÀUTICA',
        factions: ['mercat', 'veins'], tone: 'opportunity',
        text: 'Una empresa de creuers petits vol fer escala al port pesquer. Portaria 300 turistes cada dijous. El patró de la llotja diu que "amb 300 turistes als molls, els peixos no podran amarrar".',
        options: [
          { label: 'Acceptar l\'escala', preview: '+Hostalers  +200€  −Residents', fx: { mercat: 12, money: 200, veins: -8 }, idleMsg: 'Els dijous el port s\'omple. El peix es ven tot el matí. El patró s\'ha comprat un barret.' },
          { label: 'Rebutjar-ho', preview: '+Residents  −Hostalers', fx: { veins: 8, mercat: -10 }, idleMsg: 'L\'empresa ha anat a Calonava. El seu patró ara té tres barrets.' },
        ],
        ignore: { fx: { mercat: -8 }, idleMsg: 'L\'empresa ha tornat a preguntar. Ha afegit "els turistes compraran peix fresc" a la proposta.' },
      },
      {
        id: 'v_fotospot', icon: '🤳', title: 'FOTO SPOT OFICIAL',
        factions: ['mercat', 'veins'], tone: 'neutral',
        text: 'El Departament de Turisme proposa un "Foto Spot Official" a la plaça major, amb marques al terra per saber on posar-se. "Els turistes ja fan cues a la cantonada bona, però sense ordre", argumenten.',
        options: [
          { label: 'Crear el spot', preview: '+Hostalers  −Residents', fx: { mercat: 10, veins: -8 }, idleMsg: 'El spot funciona. Hi ha cua constant. Els Residents fan el rodeo per no sortir a les fotos.' },
          { label: 'Deixar com està', preview: '+Residents  −Hostalers', fx: { veins: 8, mercat: -8 }, idleMsg: 'La cua continua a la cantonada bona. Però sense cartells, que ja és alguna cosa.' },
        ],
        ignore: { fx: { mercat: 6 }, idleMsg: 'L\'empresa de turisme ha creat el spot per compte seu. L\'ha patrocinat una marca de gelats.' },
      },
      {
        id: 'v_saturat', icon: '🌡️', title: 'SATURACIÓ ESTIUENCA',
        factions: ['veins', 'activistes'], tone: 'crisis',
        text: 'El juliol passat, els turistes van triplicar la població. Les cues al forn duraven 40 minuts. El mestre obrer ha demanat "un dia sense turistes" com a condició laboral. L\'Ajuntament no sap si és festiu o laboral.',
        options: [
          { label: 'Pla de descongestió', preview: '+Residents  +Ecologistes  −300€', fx: { veins: 12, activistes: 10, money: -300 }, idleMsg: 'El pla funciona parcialment. Les cues al forn es redueixen a 20 minuts. Millora del 50%.' },
          { label: 'Promoció de temporada baixa', preview: '+Hostalers  −Residents  −150€', fx: { mercat: 8, veins: -8, money: -150 }, idleMsg: 'La campanya de tardor porta turistes a l\'octubre. A l\'agost segueix igual. I al forn.' },
        ],
        ignore: { fx: { veins: -14, activistes: -10 }, idleMsg: 'L\'agost ha sigut rècord de visites i de queixes. Dos en un.' },
      },
    ],
  },

  {
    id: 'sleeptown',
    name: 'Sleeptown',
    icon: '🌙',
    color: '#A78BFA',
    description: 'Barri residencial que valora la tranquil·litat per sobre de tot. Gestiona conflictes entre veïns, propietaris i la generació jove.',
    factionConfig: {
      veins:      { icon: '🏠', name: 'Residents' },
      mercat:     { icon: '🏡', name: 'Propietaris' },
      activistes: { icon: '🎸', name: 'Joves' },
    },
    startMoney: 400,
    startFactions: { veins: 65, mercat: 55, activistes: 58 },
    startTax: 'mid',
    drift: { veins: -0.9, mercat: -0.7, activistes: -1.1 },
    events: [
      {
        id: 's_doble_fila', icon: '🚗', title: 'LA PLAGA DE LA DOBLE FILA',
        factions: ['veins'], tone: 'crisis',
        text: 'El carrer Major porta sis mesos amb doble fila permanent. L\'empresa de distribució diu que "no hi ha on parar". El repartidor de pa és el principal infractor però és "molt simpàtic", cosa que complica les denúncies.',
        options: [
          { label: 'Zona de càrrega i descàrrega', preview: '+Residents  −Propietaris  −180€', fx: { veins: 12, mercat: -8, money: -180 }, idleMsg: 'La zona funciona. El repartidor de pa ha dit "gràcies" i ha tornat a aparcar a la doble fila quan no hi ha guàrdia.' },
          { label: 'Multes sistemàtiques', preview: '+Propietaris  −Residents', fx: { mercat: 10, veins: -10 }, idleMsg: 'Les multes han triplicat l\'ingrés per sancions. Tots diuen que la zona de descàrrega és insuficient.' },
        ],
        ignore: { fx: { veins: -10 }, idleMsg: 'La doble fila ha crescut fins al Carrer Nou. El repartidor de pa és ara un problema comarcal.' },
      },
      {
        id: 's_gos', icon: '🐕', title: 'EL CAS DEL GOS',
        factions: ['veins'], tone: 'crisis',
        text: 'El gos del 4rt 2a del Carrer de la Pau lladra cada nit des de les 2h fins a les 4h. El propietari assegura que "no lladra mai, és molt tranquil". Els veïns porten 7 mesos gravant en vídeo. Cada nit.',
        options: [
          { label: 'Mediació oficial', preview: '+Residents  −150€', fx: { veins: 12, money: -150 }, idleMsg: 'La mediació conclou que el gos té "ansietat per separació". El propietari ha comprat auriculars al gos.' },
          { label: 'Denúncia formal', preview: '+Residents  −Joves', fx: { veins: 10, activistes: -8 }, idleMsg: 'La denúncia avança. El gos ha canviat de propietari. Continua ladrant.' },
        ],
        ignore: { fx: { veins: -12 }, idleMsg: 'El vídeo acumulat pesa 47 gigabytes. Els veïns han presentat la denúncia per compte seu.' },
      },
      {
        id: 's_festa_pis', icon: '🎵', title: 'FESTA PRIVADA PÚBLICA',
        factions: ['veins', 'activistes'], tone: 'crisis',
        text: 'El pis del 2n 1a organitza festes cada divendres que acaben a les 5h. El propietari de l\'immoble és el regidor d\'Urbanisme. La policia ha anat dues vegades i ha marxat "per la música". La música és molt bona.',
        options: [
          { label: 'Ordenança de sorolls estricta', preview: '+Residents  −Joves', fx: { veins: 14, activistes: -10 }, idleMsg: 'Les festes acaben a la 1h. El regidor vota en contra "per coherència filosòfica".' },
          { label: 'Mediació veïnal', preview: '+Residents  −150€', fx: { veins: 8, money: -150 }, idleMsg: 'La mediació finalitza sense acord. El regidor ha ofert entrades per a la propera festa.' },
        ],
        ignore: { fx: { veins: -14, activistes: 8 }, idleMsg: 'La festa ha guanyat un premi de cultura emergent. El regidor surt a la foto.' },
      },
      {
        id: 's_llum', icon: '💡', title: 'LA LLUM DEL CARRER',
        factions: ['veins'], tone: 'neutral',
        text: 'La nova llum LED del carrer dels Pins és tan potent que s\'il·luminen els dormitoris de set cases. La senyora del 12 diu que "ara llegeix al llit sense llum artificial". El 14 ha instal·lat una persiana molt negra.',
        options: [
          { label: 'Substituir amb llum amortida', preview: '+Residents  −150€', fx: { veins: 12, money: -150 }, idleMsg: 'La llum nova és més càlida. La senyora del 12 diu que "ara llegir és menys còmode".' },
          { label: 'Deixar com està', preview: '−Residents  (+eficiència)', fx: { veins: -8 }, idleMsg: 'L\'eficiència és un 30% millor. Set famílies porten ulleres de sol per dormir.' },
        ],
        ignore: { fx: { veins: -6 }, idleMsg: 'S\'ha instal·lat una pantalla. Ara sembla un focus de cinema. Diferent però igual.' },
      },
      {
        id: 's_parc', icon: '🛝', title: 'PARC INFANTIL RECLAMAT',
        factions: ['veins', 'activistes'], tone: 'opportunity',
        text: 'L\'AMPA ha demanat un parc infantil al solar davant l\'escola. El solar pertany a l\'Ajuntament i porta buit des del 2004. Hi ha un banc vell i un cartell de "Propera construcció: 2008".',
        options: [
          { label: 'Construir el parc', preview: '+Residents  +Joves  −420€', fx: { veins: 14, activistes: 10, money: -420 }, idleMsg: 'El parc és inaugurat. El cartell del 2008 ha sigut conservat com a peça humorística.' },
          { label: 'Estudi de necessitats primer', preview: '−Residents', fx: { veins: -8 }, idleMsg: 'L\'estudi durarà 8 mesos. El solar seguirà buit 8 mesos més. El banc resisteix.' },
        ],
        ignore: { fx: { veins: -8 }, idleMsg: 'L\'AMPA ha comprat equips de joc amb una col·lecta. El solar segueix essent municipal.' },
      },
      {
        id: 's_escombraries', icon: '🗑️', title: 'HORARI DE RECOLLIDA',
        factions: ['veins'], tone: 'crisis',
        text: 'El camió d\'escombraries passa a les 6:30 del matí. A l\'estiu. Amb retromarxa sonora. I un operari que canta. El carrer dels Alzines porta 340 firmes. L\'operari en porta una altra de 12 "a favor del dret a cantar".',
        options: [
          { label: 'Canviar a recollida nocturna', preview: '+Residents  −180€', fx: { veins: 12, money: -180 }, idleMsg: 'La recollida nocturna funciona. L\'operari ha gravat un disc. No és el que s\'esperava.' },
          { label: 'Mantenir horari actual', preview: '−Residents', fx: { veins: -10 }, idleMsg: 'L\'empresa diu que "canviar costat". Segueix a les 6:30. Amb la cançó.' },
        ],
        ignore: { fx: { veins: -8, mercat: -6 }, idleMsg: 'La petició ha sigut presentada. L\'operari ha demandat per "discriminació vocal".' },
      },
      {
        id: 's_grafiti', icon: '🎨', title: 'GRAFITI O MURAL?',
        factions: ['veins', 'activistes'], tone: 'neutral',
        text: 'Algú ha pintat un ocell gegant al mur de la riera. Des del carrer és difícil saber si és vandalisme o art. L\'artista anònim ha enviat una carta a l\'Ajuntament amb una factura de "3.200€ per mural encarregat no pagat".',
        options: [
          { label: 'Encarregar mural oficial', preview: '+Joves  −Residents  −200€', fx: { activistes: 12, veins: -8, money: -200 }, idleMsg: 'El mural "oficial" té una placa. L\'artista original ha dit que "ho han arruïnat".' },
          { label: 'Pintar-ho de gris', preview: '+Residents  −Joves  −100€', fx: { veins: 10, activistes: -12, money: -100 }, idleMsg: 'El gris dura tres dies. L\'ocell torna. Amb les ales més grans.' },
        ],
        ignore: { fx: { activistes: 10, veins: -10 }, idleMsg: 'El mural ha guanyat un premi de cultura popular. L\'artista segueix anònim.' },
      },
      {
        id: 's_velocitat', icon: '🏎️', title: 'VELOCITAT AL CARRER',
        factions: ['veins'], tone: 'crisis',
        text: 'El carrer de la Lluna és una recta perfecta d\'1km. Límit de 20 km/h. El radar manual porta un any i mig avariat. La gent hi va a 80. Un veí ha cronometrat cotxes "per fer alguna cosa".',
        options: [
          { label: 'Radar fix i reductor', preview: '+Residents  −Propietaris  −320€', fx: { veins: 14, mercat: -6, money: -320 }, idleMsg: 'El radar instal·lat. Els primers tres dies recapta 1.800€ en multes. El reductor fa soroll.' },
          { label: 'Campanya de conscienciació', preview: '−Residents', fx: { veins: -10 }, idleMsg: 'S\'han imprès fulletons. Ningú els ha llegit. La velocitat mitjana és ara de 82 km/h.' },
        ],
        ignore: { fx: { veins: -12 }, idleMsg: 'Un cotxe ha hagut d\'evitar un gat al carrer. L\'accident ha sigut lent, però.' },
      },
      {
        id: 's_habitatge_soc', icon: '🏢', title: 'HABITATGE SOCIAL',
        factions: ['veins', 'activistes'], tone: 'opportunity',
        text: 'Una promotora social proposa construir 12 habitatges assequibles al carrer de les Flors. Els Propietaris de la zona diuen que "baixarà el preu dels seus pisos". Els Joves diuen que "és l\'única manera que puguin viure aquí".',
        options: [
          { label: 'Aprovar el projecte', preview: '+Joves  +Residents  −Propietaris  −600€', fx: { activistes: 12, veins: 10, mercat: -12, money: -600 }, idleMsg: 'Els 12 habitatges es construiran. Tres recursos han sigut presentats en 48 hores.' },
          { label: 'Limitar a 6 habitatges', preview: '+Propietaris  −Joves  −Residents  −250€', fx: { mercat: 8, activistes: -8, veins: -6, money: -250 }, idleMsg: 'Sis habitatges. La meitat. Els Joves han fet un hashtag. Ha tingut cert ressò.' },
        ],
        ignore: { fx: { activistes: -12, mercat: -8 }, idleMsg: 'El projecte ha caducat per falta de resposta. La promotora ha anat a una altra comarca.' },
      },
      {
        id: 's_assemblea', icon: '📢', title: 'ASSEMBLEA MEMORABLE',
        factions: ['veins'], tone: 'neutral',
        text: 'L\'assemblea per debatre el pla de millora del barri ha durat 4h 20 min. S\'ha parlat del semàfor, del gos del 4rt 2a, del grafiti de l\'ocell i de les escombraries a les 6:30. No s\'ha votat cap punt de l\'ordre del dia.',
        options: [
          { label: 'Seguiment formal dels punts', preview: '+Residents  −100€', fx: { veins: 10, money: -100 }, idleMsg: 'El seguiment cobreix 8 dels 14 punts. El gos no estava a l\'ordre del dia original.' },
          { label: 'Convocar una altra assemblea', preview: '−Residents', fx: { veins: -8 }, idleMsg: 'L\'assemblea de seguiment ha durat 5 hores. Tampoc s\'ha votat.' },
        ],
        ignore: { fx: { veins: -6 }, idleMsg: 'Ningú ha tornat a convocar assemblea. L\'ordre del dia segueix pendent.' },
      },
      {
        id: 's_ciclistes', icon: '🚲', title: 'CICLISTES PER LA VORERA',
        factions: ['veins', 'activistes'], tone: 'crisis',
        text: 'Un col·lectiu de ciclistes fa servir la vorera del carrer Vic. La vorera té 80 cm. Els Residents s\'organitzen per bloquejar el pas de manera passiva cada dilluns. Els ciclistes diuen que "tècnicament és legal".',
        options: [
          { label: 'Carril bici en calçada', preview: '+Joves  +Residents  −280€', fx: { activistes: 10, veins: 10, money: -280 }, idleMsg: 'El carril bici soluciona el conflicte. Dos places d\'aparcament han desaparegut. Problema nou.' },
          { label: 'Senyalització prohibitiva', preview: '+Residents  −Joves', fx: { veins: 10, activistes: -10 }, idleMsg: 'Els cartells estan posats. Tres ciclistes els han ignorat. Un ha dit que "no els havia vist".' },
        ],
        ignore: { fx: { veins: -10, activistes: -4 }, idleMsg: 'El col·lectiu ha augmentat. La vorera de 80 cm fa servei de carril bici de facto.' },
      },
      {
        id: 's_jardinet', icon: '🌻', title: 'GUERRA DEL JARDÍ COMUNAL',
        factions: ['veins', 'activistes'], tone: 'crisis',
        text: 'El jardí comunal porta 3 setmanes de guerra freda entre dos grups. El primer planta tomàquets. El segon, "plantes medicinals". Tots dos han tancat la seva zona amb tela de pollastre. El guarda ha demanat la baixa.',
        options: [
          { label: 'Mediació i repartiment oficial', preview: '+Residents  −150€', fx: { veins: 12, money: -150 }, idleMsg: 'El repartiment oficial funciona. El guarda ha tornat.' },
          { label: 'Deixar-ho resoldre sol', preview: '−Residents  −Joves', fx: { veins: -8, activistes: -8 }, idleMsg: 'El conflicte ha escalatat. Hi ha una tercera facció: els qui volen flors.' },
        ],
        ignore: { fx: { veins: -8, activistes: -8 }, idleMsg: 'El jardí porta dues setmanes tancat per tothom. Les plantes s\'eixuguen.' },
      },
      {
        id: 's_obres_nit', icon: '🔨', title: 'OBRES DE MATINADA',
        factions: ['veins'], tone: 'crisis',
        text: 'Les obres del gasoducte programades per "minimitzar impacte diari" es fan de les 23h a les 5h. L\'empresa argumenta que "el dia és per als vianants". Porta cinc nits. La queixa formal ocupa tres pàgines.',
        options: [
          { label: 'Paralitzar obres nocturnes', preview: '+Residents  −250€ (penalització)', fx: { veins: 14, money: -250 }, idleMsg: 'Les obres paren de nit. La penalització és assumida. El carrer sembla una zona de guerra.' },
          { label: 'Negociar franja reduïda (23h-1h)', preview: '+Residents parcial  −80€', fx: { veins: 8, money: -80 }, idleMsg: 'La franja de 23h a 1h és un compromís. La queixa formal queda en standby.' },
        ],
        ignore: { fx: { veins: -14 }, idleMsg: 'La quinta nit, tres veïns han sortit al carrer amb llanterna a les 2h.' },
      },
      {
        id: 's_electric', icon: '🔌', title: 'PUNTS DE RECÀRREGA',
        factions: ['mercat', 'veins'], tone: 'opportunity',
        text: 'Una empresa proposa 8 punts de recàrrega de vehicles elèctrics al carrer Major. A canvi de publicitat. El logotip és gran. Molt. "Les dimensions són estàndard europees", diuen.',
        options: [
          { label: 'Acceptar els punts', preview: '+Propietaris  −Residents', fx: { mercat: 10, veins: -8 }, idleMsg: 'Els punts funcionen. Dos cotxes elèctrics al carrer Major donen exemple. El logotip és molt visible.' },
          { label: 'Punts sense publicitat', preview: '+Residents  +Propietaris  −150€', fx: { veins: 8, mercat: 8, money: -150 }, idleMsg: 'Els punts sense logotip. L\'empresa ha enviat una factura per "branding renunciat". Rebutjada.' },
        ],
        ignore: { fx: { mercat: -6 }, idleMsg: 'L\'empresa ha posat els punts a Riudavells. Dos cotxes elèctrics allà reben la publicitat.' },
      },
      {
        id: 's_obres_carrer', icon: '🏗️', title: 'OBRA SENSE FI',
        factions: ['veins'], tone: 'crisis',
        text: 'La remodelació del carrer Central ha entrat en el sisè mes d\'una obra prevista per a tres. L\'empresa diu que "han trobat capes geològiques no previstes" (un tros de rajola romana). L\'arqueòleg de guàrdia és molt feliç.',
        options: [
          { label: 'Multar i exigir termini', preview: '+Residents  −Propietaris', fx: { veins: 10, mercat: -8 }, idleMsg: 'L\'empresa ha pagat la multa i promet acabar en 4 setmanes. Porten 2 setmanes acumulades.' },
          { label: 'Prorrogar raonablement', preview: '−Residents  +Propietaris  −200€', fx: { veins: -8, mercat: 6, money: -200 }, idleMsg: 'La pròrroga és de 6 setmanes. L\'arqueòleg continua feliç.' },
        ],
        ignore: { fx: { veins: -12, mercat: -8 }, idleMsg: 'L\'empresa ha marxat "per discrepàncies contractuals". El carrer segueix obert a la meitat.' },
      },
    ],
  },

  {
    id: 'technoburg',
    name: 'Technoburg',
    icon: '⚡',
    color: '#38BDF8',
    description: 'Hub tecnològic en formació. Gestiona l\'equilibri entre innovació, residents tradicionals i els Hacktivistes que ho qüestionen tot.',
    factionConfig: {
      veins:      { icon: '🏘️', name: 'Veïns' },
      mercat:     { icon: '💻', name: 'Startups' },
      activistes: { icon: '🔓', name: 'Hacktivistes' },
    },
    startMoney: 550,
    startFactions: { veins: 50, mercat: 68, activistes: 54 },
    startTax: 'mid',
    drift: { veins: -1.3, mercat: -1.1, activistes: -1.4 },
    events: [
      {
        id: 't_acceleradora', icon: '🚀', title: 'ACCELERADORA STARTUP',
        factions: ['mercat', 'veins'], tone: 'opportunity',
        text: 'Una acceleradora de startups vol instal·lar la seu a l\'edifici de correus antic. "Transformarem el centre en un hub innovador", diuen. Porten un foosball a la reunió de presentació. Literalment.',
        options: [
          { label: 'Cedir l\'espai', preview: '+Startups  −Veïns  −200€', fx: { mercat: 14, veins: -8, money: -200 }, idleMsg: 'L\'acceleradora funciona. Hi ha 12 startups. Totes fan servir el foosball. Tres fan algun producte.' },
          { label: 'Condicions d\'ús estrictes', preview: '+Veïns  −Startups  −80€', fx: { veins: 8, mercat: -8, money: -80 }, idleMsg: 'Les condicions s\'accepten. L\'acceleradora és més petita però menys caòtica.' },
        ],
        ignore: { fx: { mercat: -10 }, idleMsg: 'L\'acceleradora s\'ha instal·lat a Rocaltech. Ja parlen de "escalar a nivell comarcal".' },
      },
      {
        id: 't_dades', icon: '📊', title: 'DADES OBERTES MUNICIPALS',
        factions: ['activistes', 'veins'], tone: 'opportunity',
        text: 'Els Hacktivistes proposen publicar totes les dades públiques de l\'Ajuntament en format obert. Inclou pressupostos, contractes i l\'horari real de recollida d\'escombraries. L\'administratiu pregunta si inclou les seves notes de reunió.',
        options: [
          { label: 'Publicar totes les dades', preview: '+Hacktivistes  +Veïns  −120€', fx: { activistes: 12, veins: 8, money: -120 }, idleMsg: 'Les dades estan publicades. Tres periodistes han trobat inconsistències del 2019. Situació controlable.' },
          { label: 'Publicar dades seleccionades', preview: '+Hacktivistes parcial  −Veïns', fx: { activistes: 6, veins: -8 }, idleMsg: 'Es publiquen les dades "no sensibles". Els Hacktivistes publiquen la llista del que "no és sensible".' },
        ],
        ignore: { fx: { activistes: -12 }, idleMsg: 'Els Hacktivistes han publicat les dades via una filtració. Menys controlat.' },
      },
      {
        id: 't_hackejat', icon: '🔓', title: 'ATAC INFORMÀTIC',
        factions: ['veins'], tone: 'crisis',
        text: 'Els servidors de l\'Ajuntament han sigut hackejats. Les factures 2018-2022 estan cifrades. Un missatge a la pàgina diu: "PAGUEU 2 BITCOIN O EXPLIQUEU EL PRESSUPOST DE 2019". El responsable TIC mira el sostre.',
        options: [
          { label: 'Contractar experts i recuperar', preview: '+Veïns  −Startups  −850€', fx: { veins: 12, mercat: -8, money: -850 }, idleMsg: 'Els experts recuperen el 70% de les dades. El 30% estava duplicat en un USB al calaix.' },
          { label: 'Pagar el rescat', preview: '+Veïns  −Hacktivistes  −400€', fx: { veins: 8, activistes: -12, money: -400 }, idleMsg: 'El rescat és pagat. Les dades tornen. El missatge de confirmació diu "gràcies i bona gestió".' },
        ],
        ignore: { fx: { veins: -14, money: -600 }, idleMsg: 'L\'atac s\'ha estès a les càmeres de trànsit. Un periodista grava el caos en directe.' },
      },
      {
        id: 't_robot', icon: '🤖', title: 'ROBOT NETEJADOR',
        factions: ['veins', 'mercat'], tone: 'neutral',
        text: 'Una startup proposa testar un robot de neteja autònom als carrers. El robot es diu "GoodBot v0.9". El "0.9" no és tranquil·litzador. Ha xocat amb dos testos en les proves. Un era del regidor d\'obres.',
        options: [
          { label: 'Aprovar el pilot', preview: '+Startups  −Veïns  −180€', fx: { mercat: 12, veins: -8, money: -180 }, idleMsg: 'GoodBot v0.9 funciona raonablement. Ha evolucionat a v0.95. Dos testos nous s\'han comprat.' },
          { label: 'Demanar versió estable', preview: '+Veïns  −Startups', fx: { veins: 8, mercat: -10 }, idleMsg: 'La startup ha dit que "v1.0 trigarà sis mesos". Qui neteja mentrestant no ha canviat.' },
        ],
        ignore: { fx: { mercat: -6 }, idleMsg: 'GoodBot v0.9 ha continuat les proves sense permís. El testo del regidor segueix trencat.' },
      },
      {
        id: 't_gentrif', icon: '☕', title: 'GENTRIFICACIÓ HIPSTER',
        factions: ['veins', 'activistes'], tone: 'crisis',
        text: 'El bar de tota la vida del carrer Nou ha tancat. L\'han substituït per una tostaderia artisanal que ven cafès de 6€ i "avocado toast inspirat en els orígens locals". Els veïns de sempre no hi entren.',
        options: [
          { label: 'Protegir el comerç de proximitat', preview: '+Veïns  +Hacktivistes  −150€', fx: { veins: 12, activistes: 10, money: -150 }, idleMsg: 'La regulació protegeix 4 locals. La tostaderia ha obert una "sucursal popular" a 4€.' },
          { label: 'Deixar el mercat actuar', preview: '+Startups  −Veïns', fx: { mercat: 12, veins: -12 }, idleMsg: 'Tres bars de tota la vida han tancat. Dos "co-coffee experiences" han obert. El barri ha canviat de barri.' },
        ],
        ignore: { fx: { veins: -10, activistes: -8 }, idleMsg: 'Dos bars més tancats. Un ha obert un TikTok en el seu últim dia. Emocional.' },
      },
      {
        id: 't_5g', icon: '📡', title: 'ANTENA 5G',
        factions: ['veins', 'activistes'], tone: 'crisis',
        text: 'Una operadora vol instal·lar una antena 5G al campanar de l\'església. "Pot allotjar els instruments sense problemes estructurals", diuen. El rector ha dit que "no tenim problemes estructurals i preferim no descobrir-ne".',
        options: [
          { label: 'Autoritzar ubicació alternativa', preview: '+Veïns  +Hacktivistes  −100€', fx: { veins: 10, activistes: 8, money: -100 }, idleMsg: 'L\'antena és al polígon. La cobertura és excel·lent. El rector no ha hagut de revisar l\'estructura.' },
          { label: 'Rebutjar per ara', preview: '+Veïns  −Startups', fx: { veins: 10, mercat: -10 }, idleMsg: 'Les Startups diuen que "sense 5G no podem escalar". L\'escala del buidat no ha canviat.' },
        ],
        ignore: { fx: { veins: -8, mercat: -8 }, idleMsg: 'L\'empresa ha instal·lat l\'antena en una propietat privada propera. Sense permís. Però hi ha 5G.' },
      },
      {
        id: 't_app_gov', icon: '📱', title: 'APP MUNICIPAL SMART',
        factions: ['mercat', 'veins'], tone: 'opportunity',
        text: 'Una startup proposa una app per fer tots els tràmits municipals. L\'app es diu "GestioPOBLE" i ja té 200 descàrregues de beta-testing. 180 descàrregues les ha fet el gerent de la startup.',
        options: [
          { label: 'Contractar el projecte', preview: '+Startups  +Veïns  −380€', fx: { mercat: 12, veins: 10, money: -380 }, idleMsg: 'L\'app funciona. Té 1.200 usuaris. Les queixes arriben 24/7. Inclosa una a les 3h sobre el semàfor.' },
          { label: 'Versió mínima (incidències)', preview: '+Veïns  −Startups  −120€', fx: { veins: 8, mercat: -6, money: -120 }, idleMsg: 'La versió mínima reporta incidències. La primera és sobre l\'app en si.' },
        ],
        ignore: { fx: { mercat: -8 }, idleMsg: 'GestioPOBLE ha obert capital a inversors. L\'Ajuntament no en rep benefici. El gerent porta un Tesla.' },
      },
      {
        id: 't_ia', icon: '🧠', title: 'IA PER A DECISIONS MUNICIPALS',
        factions: ['activistes', 'veins'], tone: 'crisis',
        text: 'Una empresa proposa un sistema d\'intel·ligència artificial per ajudar a prendre decisions d\'urbanisme. Els Hacktivistes diuen que "el biaix és de qui alimenta el model". L\'empresa diu que el model "aprèn sol". Això no tranquil·litza ningú.',
        options: [
          { label: 'Pilot limitat (incidències vials)', preview: '+Startups  −Hacktivistes  −280€', fx: { mercat: 10, activistes: -12, money: -280 }, idleMsg: 'El pilot aprova reclamacions de semàfors. Ha denegat 3 recursos sense explicació. Normal.' },
          { label: 'Rebutjar fins que hi hagi marc legal', preview: '+Hacktivistes  −Startups', fx: { activistes: 12, mercat: -10 }, idleMsg: 'La decisió és prudent. L\'empresa diu que "ens prendran la davantera". No queda clar qui.' },
        ],
        ignore: { fx: { activistes: -10, mercat: -6 }, idleMsg: 'L\'empresa ha implementat el sistema en un departament sense comunicar-ho. Dues setmanes d\'autonomia.' },
      },
      {
        id: 't_dron_vigil', icon: '🚁', title: 'VIGILANCIA AMB DRONS',
        factions: ['activistes', 'veins'], tone: 'crisis',
        text: 'La policia local proposa drons de vigilancia per als actes públics. "Augmentarà la seguretat", argumenten. Els Hacktivistes han fet un manifest. Llarg. Molt ben redactat. I amb dades de casos internacionals.',
        options: [
          { label: 'Autoritzar ús limitat (actes grans)', preview: '+Veïns  −Hacktivistes', fx: { veins: 10, activistes: -12 }, idleMsg: 'Els drons vigilen la Festa Major. Tres menors surten al vídeo. L\'informe diu que "és acceptable".' },
          { label: 'Rebutjar (marc legal absent)', preview: '+Hacktivistes  −Veïns', fx: { activistes: 12, veins: -8 }, idleMsg: 'Els Hacktivistes celebren. Però vigilar la festa sense drons costa un 30% més.' },
        ],
        ignore: { fx: { activistes: -12, money: -300 }, idleMsg: 'La policia ha provat els drons de totes maneres. Tres queixes formals i un article al digital local.' },
      },
      {
        id: 't_fab_lab', icon: '🖨️', title: 'FAB LAB MUNICIPAL',
        factions: ['activistes', 'veins'], tone: 'opportunity',
        text: 'Una donació ha deixat 4 impressores 3D a la sala de material de l\'Ajuntament. Ningú sap ben bé per a qué. Els Hacktivistes proposen un "Fab Lab" obert a la ciutadania. La sala de material té goteres.',
        options: [
          { label: 'Crear el Fab Lab', preview: '+Hacktivistes  +Veïns  −200€', fx: { activistes: 12, veins: 8, money: -200 }, idleMsg: 'El Fab Lab obre. La primera setmana s\'imprimeix: 3 figuretes, 1 peça de cotxe i un trofeu del gat municipal.' },
          { label: 'Vendre l\'equipament', preview: '+Startups  −Hacktivistes  +200€', fx: { mercat: 8, activistes: -14, money: 200 }, idleMsg: 'L\'equipament es ven per 2.300€. Els Hacktivistes han presentat una queixa. Molt ben redactada.' },
        ],
        ignore: { fx: { activistes: 8, veins: -6 }, idleMsg: 'Les impressores han sigut "agafades en préstec" pels Hacktivistes. Una torna funcionant.' },
      },
      {
        id: 't_startup_caiguda', icon: '💸', title: 'STARTUP IMPORTANT TANCA',
        factions: ['mercat', 'veins'], tone: 'crisis',
        text: 'La startup més gran del polígon tanca. Havia rebut 200.000€ de subvenció municipal. Tenien 12 treballadors. La web segueix activa amb "We are pivoting our business model".',
        options: [
          { label: 'Investigar i recuperar subvenció', preview: '+Veïns  −Startups  −200€', fx: { veins: 10, mercat: -12, money: -200 }, idleMsg: 'La investigació troba irregularitats parcials. La recuperació és del 40%. El CEO fa "consultoria".' },
          { label: 'Acceptar la pèrdua i seguir', preview: '−Veïns  −Startups', fx: { veins: -8, mercat: -10 }, idleMsg: 'La pèrdua s\'assumeix. L\'ecosistema startup queda tocat. Tres startups demanen menys visibilitat.' },
        ],
        ignore: { fx: { mercat: -14, veins: -8 }, idleMsg: 'La premsa ha publicat els detalls. La subvenció és el tema de la setmana. Dues preguntes parlamentàries.' },
      },
      {
        id: 't_coworking', icon: '🏢', title: 'GRAN COWORKING',
        factions: ['mercat', 'veins'], tone: 'opportunity',
        text: 'Una empresa vol convertir l\'antiga fàbrica tèxtil en un coworking de 2.000 metres quadrats. "Portarà 400 professionals", diuen. Quatre-cents professionals significa 400 cotxes i 400 opinions sobre el barri.',
        options: [
          { label: 'Aprovar el projecte', preview: '+Startups  −Veïns  −200€', fx: { mercat: 12, veins: -10, money: -200 }, idleMsg: 'El coworking obre. Porta 280 professionals (previsió ajustada). El barri ha canviat d\'ambient.' },
          { label: 'Negociar amb condicions', preview: '+Veïns  −Startups  −150€', fx: { veins: 8, mercat: -8, money: -150 }, idleMsg: 'Les condicions inclouen aparcament intern i comerç local. L\'empresa diu "acceptable però no ideal".' },
        ],
        ignore: { fx: { mercat: -10 }, idleMsg: 'L\'empresa ha anat a Valltech. Ja parlen del seu barri "viu".' },
      },
      {
        id: 't_esports', icon: '🎮', title: 'TORNEIG D\'ESPORTS ELECTRÒNICS',
        factions: ['activistes', 'veins'], tone: 'opportunity',
        text: 'Una associació proposa un torneig de videojocs a la plaça major durant un cap de setmana. "Portarà joves al poble", argumenten. El regidor de cultura ha preguntat "com funciona exactament". La pregunta ha durat 25 minuts.',
        options: [
          { label: 'Autoritzar i co-organitzar', preview: '+Hacktivistes  +Veïns  −180€', fx: { activistes: 12, veins: 8, money: -180 }, idleMsg: 'El torneig porta 300 participants. La plaça major s\'ha transformat. El regidor ha après a llegir les classificacions.' },
          { label: 'Autoritzar sense suport', preview: '+Hacktivistes  −Veïns', fx: { activistes: 10, veins: -8 }, idleMsg: 'El torneig es fa. La plaça queda neta per miracle. L\'Ajuntament no surt a l\'organigrama però surt al compte de reclamacions.' },
        ],
        ignore: { fx: { activistes: -10, mercat: -4 }, idleMsg: 'L\'associació ha fet el torneig al pàrquing comunal. Han aconseguit llum però no cadires.' },
      },
      {
        id: 't_xarxes', icon: '📢', title: 'CRISI A XARXES SOCIALS',
        factions: ['veins', 'activistes'], tone: 'crisis',
        text: 'El compte oficial de l\'Ajuntament ha publicat "Gràcies a tothom!" acompanyat d\'una foto d\'un treballador en actitud poc professional a la festa de Nadal. La foto dura 12 minuts. Ha sigut suficient.',
        options: [
          { label: 'Gestió de crisi professional', preview: '+Veïns  −Startups  −150€', fx: { veins: 10, mercat: -8, money: -150 }, idleMsg: 'La resposta professional desescala la crisi. L\'empresa ha dit que "no tornarà a passar". Ho veurem.' },
          { label: 'Disculpa breu i endavant', preview: '+Startups  −Veïns', fx: { mercat: 8, veins: -12 }, idleMsg: 'La disculpa és massa breu. Tres periodistes han preguntat per les "circumstàncies". S\'ha hagut d\'ampliar.' },
        ],
        ignore: { fx: { veins: -12, activistes: -6 }, idleMsg: 'El silenci institucional ha generat 40 articles. El treballador porta de baixa "per estrès".' },
      },
      {
        id: 't_crypto', icon: '💰', title: 'CRIPTO MUNICIPAL',
        factions: ['mercat', 'activistes'], tone: 'neutral',
        text: 'Un regidor proposa emetre una "moneda municipal" digital per incentivar el comerç local. Es diria "TechnoCoin". El white paper té 60 pàgines. Les primeres 40 parlen de "comunitat". Les últimes 20 parlen de tecnologia.',
        options: [
          { label: 'Estudiar-ho seriosament', preview: '+Startups  −Veïns  −80€', fx: { mercat: 10, veins: -8, money: -80 }, idleMsg: 'L\'estudi conclou que "és viable amb condicions". Les condicions ocupen 40 pàgines. Com el white paper.' },
          { label: 'Rebutjar-ho clarament', preview: '+Veïns  −Startups', fx: { veins: 10, mercat: -12 }, idleMsg: 'La decisió és clara. El regidor ha dimitit "per discrepàncies filosòfiques". Tots surten guanyant.' },
        ],
        ignore: { fx: { mercat: -6, activistes: 6 }, idleMsg: 'El regidor ha emès TechnoCoins per compte seu. En circulen 4. Dues son seves.' },
      },
    ],
  },
];
