'use strict';

const EVENTS_TECHNOBURG = [
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
];
