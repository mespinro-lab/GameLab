'use strict';

const EVENTS_SLEEPTOWN = [
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
];
