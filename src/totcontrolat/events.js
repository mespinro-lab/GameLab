'use strict';

const EVENTS = [
  {
    id: 'coloms',
    icon: '🐦',
    title: 'LA INVASIÓ',
    text: 'Una colònia de coloms ha ocupat el jutjat municipal. Els advocats no poden entrar. Fa tres dies. El degà del col·legi diu que "tècnicament ja no hi ha llei".',
    options: [
      { label: 'Desallotjar-los', preview: '+Veïns  −Activistes  −150€', fx: { veins: 10, activistes: -12, money: -150 } },
      { label: 'Negociar', preview: '+Activistes  −Veïns', fx: { activistes: 12, veins: -8 }, risk: 'Risc: assemblea permanent de coloms' },
    ],
  },
  {
    id: 'app',
    icon: '📱',
    title: 'GOVTECH SOLUTIONS',
    text: 'Una startup vol fer una app de queixes municipals. S\'anomenen "Queixa+". Porten corbata els caps de setmana i diuen "escalar" molt.',
    options: [
      { label: 'Contractar-los', preview: '+Veïns  +Mercat  −350€', fx: { veins: 8, mercat: 10, money: -350 } },
      { label: 'Rebutjar', preview: '−Mercat', fx: { mercat: -10 }, risk: 'Les queixes les rebràs tu directament' },
    ],
  },
  {
    id: 'formatge',
    icon: '🧀',
    title: 'EL FORMATGE',
    text: 'Un camió ha bolcat a la rotonda. Tres tones de brie. Fa cinc dies. Ningú sap de qui és el camió. La florista diu que "li agrada la nova olor".',
    options: [
      { label: 'Netejar-ho', preview: '+Veïns  −200€', fx: { veins: 12, money: -200 } },
      { label: 'Declarar-ho monument', preview: '+Activistes  −Veïns  −Mercat', fx: { activistes: 14, veins: -12, mercat: -8 }, risk: 'Risc sanitari latent' },
    ],
  },
  {
    id: 'calendari',
    icon: '📅',
    title: 'LA FESTA',
    text: 'Els Activistes proposen canviar el nom de la Festa Major a "Celebració de la Consciència Col·lectiva i la Identitat en Diàleg". Ja han imprès els programes.',
    options: [
      { label: 'Acceptar el nom', preview: '+Activistes  −Veïns', fx: { activistes: 12, veins: -8 } },
      { label: 'Ignorar-ho', preview: '−Activistes', fx: { activistes: -12 }, risk: 'Pintaran la façana de l\'ajuntament' },
    ],
  },
  {
    id: 'conseller',
    icon: '🧳',
    title: 'VISITA OFICIAL',
    text: 'Un conseller autonòmic vol visitar el poble. Necessita catifa vermella, 15 aparcaments reservats, un "dinar lleuger" de 4 plats i "accés a un piano".',
    options: [
      { label: 'Acollir-lo', preview: '+Mercat  −450€', fx: { mercat: 10, money: -450 } },
      { label: 'Excuses mèdiques', preview: '+Veïns  −Mercat', fx: { veins: 6, mercat: -12 } },
    ],
  },
  {
    id: 'semàfor',
    icon: '🚦',
    title: 'EL SEMÀFOR',
    text: 'El semàfor de la plaça major porta 9 mesos parpellejant. Els veïns tenen un grup de WhatsApp dedicat. Té 847 membres i un logo propi.',
    options: [
      { label: 'Arreglar-lo', preview: '+Veïns  −120€', fx: { veins: 14, money: -120 } },
      { label: 'Dir que ja s\'ha encarregat', preview: 'Guanya temps', fx: { veins: -3 }, risk: 'Es descobrirà en 2-3 setmanes' },
    ],
  },
  {
    id: 'fabrica',
    icon: '🏭',
    title: 'INVERSIÓ ESTRANGERA',
    text: 'Una empresa japonesa vol obrir una fàbrica de palets al polígon. No parlen català ni castellà ni anglès. Comuniquen amb diagrames de flux.',
    options: [
      { label: 'Benvinguts!', preview: '+Mercat  +400€  −Activistes', fx: { mercat: 15, activistes: -10, money: 400 } },
      { label: 'Estudi d\'impacte primer', preview: '+Activistes  −Mercat', fx: { activistes: 10, mercat: -12 } },
    ],
  },
  {
    id: 'festival',
    icon: '🥛',
    title: 'FESTIVAL DEL IOGURT',
    text: 'Un col·lectiu proposa el Primer Festival Internacional de Iogurt Artesà de la Comarca. Ja han encarregat samarretes. Amb les samarretes ho han fet tot.',
    options: [
      { label: 'Subvencionar', preview: '+Veïns  +Activistes  −280€', fx: { veins: 8, activistes: 10, money: -280 } },
      { label: 'Que es financin sols', preview: '−Veïns  −Activistes', fx: { veins: -6, activistes: -10 } },
    ],
  },
  {
    id: 'gat',
    icon: '🐱',
    title: 'INCIDENT FELÍ',
    text: 'El gat del despatx ha mossegat al tresorer. El tresorer amenaça amb denúncia. El gat ha estat fotografiat dormint còmodament sobre els expedients.',
    options: [
      { label: 'Indemnitzar el tresorer', preview: '−220€  evita escàndol', fx: { money: -220 } },
      { label: 'Defensar el gat', preview: '+Activistes  −Mercat', fx: { activistes: 14, mercat: -14 }, risk: 'Escàndol garantit. El gat no s\'ha disculpat.' },
    ],
  },
  {
    id: 'rotonda',
    icon: '🔄',
    title: 'ROTONDA PREMIUM',
    text: 'L\'empresa de pavimentació ofereix una rotonda completament gratis. A canvi d\'un logo de l\'empresa de 4 metres de diàmetre al centre i drets de denominació (Rotonda Asfaltis S.L.).',
    options: [
      { label: 'Acceptar', preview: '+Mercat  −Veïns  −Activistes', fx: { mercat: 14, veins: -10, activistes: -8 } },
      { label: 'Rebutjar', preview: '+Veïns  +Activistes  −Mercat', fx: { veins: 8, activistes: 8, mercat: -12 } },
    ],
  },
  {
    id: 'vaga',
    icon: '🧹',
    title: 'EXIGÈNCIES LABORALS',
    text: 'El sindicat de neteja vol aire condicionat als uniformes d\'estiu. La proposta incloïa LED integrats però han acceptat retirar-los "de moment".',
    options: [
      { label: 'Uniformes nous (sense LED)', preview: '+Veïns  −180€', fx: { veins: 10, money: -180 } },
      { label: 'Vaga que és vaga', preview: '−Veïns  −Activistes', fx: { veins: -16, activistes: -8 }, risk: 'Durarà més del previst' },
      { label: 'Tot el que demanen (amb LED)', preview: '+Veïns  +Activistes  −420€', fx: { veins: 14, activistes: 10, money: -420 } },
    ],
  },
  {
    id: 'turistes',
    icon: '📸',
    title: 'TURISME CULTURAL',
    text: 'Un grup de turistes alemanys ha descobert el poble per un error de GPS. Volen una ruta guiada pel cementiri. "Sehr authentisch", diuen. Molt contents.',
    options: [
      { label: 'Organitzar la ruta', preview: '+Mercat  +150€  −Veïns', fx: { mercat: 10, money: 150, veins: -6 } },
      { label: 'Redirigir-los al museu', preview: '+Veïns  −Mercat', fx: { veins: 6, mercat: -8 }, risk: 'El museu tanca els dimecres' },
    ],
  },
  {
    id: 'viral',
    icon: '🌐',
    title: 'FENOMEN VIRAL',
    text: 'El perfil oficial del municipi ha publicat per error una foto del gat de l\'alcalde. Té 50.000 likes. Sis periodistes truquen. El gat no en sap res.',
    options: [
      { label: 'Aprofitar l\'ona', preview: '+Veïns  +Mercat  compte oficial del gat', fx: { veins: 14, mercat: 10 } },
      { label: 'Esborrar i disculpar-se', preview: '+Activistes  −Veïns  −Mercat', fx: { activistes: 8, veins: -10, mercat: -10 } },
    ],
  },
  {
    id: 'canonada',
    icon: '💧',
    title: 'EMERGÈNCIA HIDRÀULICA',
    text: 'La canonada principal de la plaça ha petat. L\'aigua surt per la floristeria. La florista diu que és "una benedicció" i ha pujat els preus un 40%.',
    options: [
      { label: 'Reparació urgent', preview: '+Veïns  −380€', fx: { veins: 12, money: -380 } },
      { label: 'Font ornamental provisional', preview: '+Activistes  −Veïns  −180€', fx: { activistes: 12, veins: -10, money: -180 } },
    ],
  },
  {
    id: 'sondeo',
    icon: '🗳️',
    title: 'SONDEO ELECTORAL',
    text: 'Un sondeo us dona 34% d\'intenció de vot. El rival en té 35%. L\'1% restant vota per en Brie (el formatge de la rotonda, ja amb personalitat jurídica pròpia).',
    options: [
      { label: 'Campanya de proximitat', preview: '+Veïns  −220€', fx: { veins: 12, money: -220 } },
      { label: 'Ignorar sondeos', preview: 'Res canvia', fx: {} },
    ],
  },
  {
    id: 'reciclatge',
    icon: '♻️',
    title: 'PLA VERD',
    text: 'Els Activistes proposen substituir tots els contenidors per "Punts de Consciència Ambiental". Costen el triple. Vénen en colors que "no existien fins ara".',
    options: [
      { label: 'Pla complet', preview: '+Activistes  −Mercat  −450€', fx: { activistes: 15, mercat: -8, money: -450 } },
      { label: 'Pla mixt (la meitat)', preview: '+Activistes  −Mercat  −220€', fx: { activistes: 8, mercat: -4, money: -220 } },
      { label: 'Contenidors de sempre', preview: '+Mercat  −Activistes', fx: { mercat: 8, activistes: -14 } },
    ],
  },
  {
    id: 'concert',
    icon: '🎸',
    title: 'FESTIVAL DE MÚSICA',
    text: 'Una promotora vol un festival de música electrònica al parc. "Serà tranquil", asseguren. El DJ principal es diu DJ Apocalipsi.',
    options: [
      { label: 'Autoritzar', preview: '+Mercat  +Activistes  −Veïns', fx: { mercat: 10, activistes: 14, veins: -16 } },
      { label: 'Denegar', preview: '+Veïns  −Mercat  −Activistes', fx: { veins: 12, mercat: -10, activistes: -10 } },
    ],
  },
  {
    id: 'auditoria',
    icon: '📊',
    title: 'AUDITORIA SORPRESA',
    text: 'L\'assessoria ha trobat un error al pressupost. Falten 280€ de l\'any passat. "Han d\'haver sortit d\'alguna banda", diu l\'auditor, mirant el gat.',
    options: [
      { label: 'Investigar', preview: '+Veïns  −Mercat  −100€', fx: { veins: 8, mercat: -10, money: -100 } },
      { label: 'Absorbir la diferència', preview: '−280€  nota de premsa breu', fx: { money: -280 } },
    ],
  },
];
