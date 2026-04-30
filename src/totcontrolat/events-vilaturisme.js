'use strict';

const EVENTS_VILATURISME = [
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
];
