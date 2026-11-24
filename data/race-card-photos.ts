/**
 * Race-card photographs hosted on this site.
 * Each credit is the photographer, the licence, and the file page.
 */

export type RaceCardPhotoUse = {
  slug: string
  name: string
}

export type RaceCardPhoto = {
  src: string
  alt: string
  author: string
  licence: string
  licenceUrl: string
  commonsUrl: string
  races: readonly RaceCardPhotoUse[]
}

export const RACE_CARD_PHOTOS: readonly RaceCardPhoto[] = [
  {
    src: "/images/race-cards/valencia-motogp.webp",
    alt: "MotoGP riders on track at Circuit Ricardo Tormo",
    author: "Box Repsol",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Pol_Espargar%C3%B3,_Fabio_Di_Giannantonio,_Takaaki_Nakagami_and_Darryn_Binder_2022_Valencia.jpg",
    races: [
      {
        slug: "grand-prix-of-valencia-2026-motogp-2026",
        name: "Grand Prix of Valencia 2026"
      },
      {
        slug: "grand-prix-of-valencia-2027-motogp-2027",
        name: "Grand Prix of Valencia 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/mexico-city-formula-e.webp",
    alt: "Formula E cars on track at the Autódromo Hermanos Rodríguez",
    author: "Eder Lozada",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Porsche_at_the_2022_Mexico_City_ePrix.jpg",
    races: [
      {
        slug: "mexico-city-e-prix-2027-formula-e-2027",
        name: "Mexico City E-Prix 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/formula-e-car.webp",
    alt: "A Formula E car on track",
    author: "Morio",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Pascal_Wehrlein_2024_Tokyo_Qualify-Duel.jpg",
    races: [
      { slug: "austin-e-prix-2027-formula-e-2027", name: "Austin E-Prix 2027" },
      { slug: "miami-e-prix-2027-formula-e-2027", name: "Miami E-Prix 2027" },
      { slug: "sanya-e-prix-2027-formula-e-2027", name: "Sanya E-Prix 2027" },
      {
        slug: "jeddah-e-prix-2027-race-1-formula-e-2027",
        name: "Jeddah E-Prix 2027 (Race 1)"
      },
      {
        slug: "jeddah-e-prix-2027-race-2-formula-e-2027",
        name: "Jeddah E-Prix 2027 (Race 2)"
      },
      {
        slug: "monaco-e-prix-2027-race-1-formula-e-2027",
        name: "Monaco E-Prix 2027 (Race 1)"
      },
      {
        slug: "monaco-e-prix-2027-race-2-formula-e-2027",
        name: "Monaco E-Prix 2027 (Race 2)"
      },
      {
        slug: "shanghai-e-prix-2027-race-1-formula-e-2027",
        name: "Shanghai E-Prix 2027 (Race 1)"
      },
      {
        slug: "shanghai-e-prix-2027-race-2-formula-e-2027",
        name: "Shanghai E-Prix 2027 (Race 2)"
      }
    ]
  },
  {
    src: "/images/race-cards/buriram-motogp.webp",
    alt: "A MotoGP rider celebrating at the Chang International Circuit",
    author: "Box Repsol",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Marc_M%C3%A1rquez_2019_Buriram_11.jpeg",
    races: [
      {
        slug: "grand-prix-of-thailand-2027-motogp-2027",
        name: "Grand Prix of Thailand 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/sao-paulo-street-circuit.webp",
    alt: "The São Paulo street circuit",
    author: "Boaventuravinicius",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Pista_f%C3%B3rmula_E_2023.jpg",
    races: [
      {
        slug: "sao-paulo-e-prix-2027-formula-e-2027",
        name: "São Paulo E-Prix 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/lusail-motogp.webp",
    alt: "MotoGP riders racing at night at Lusail International Circuit",
    author: "Box Repsol",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Dani_Pedrosa_leads_the_pack_2015_Losail_2.jpeg",
    races: [
      {
        slug: "grand-prix-of-qatar-2027-motogp-2027",
        name: "Grand Prix of Qatar 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/goiania-motogp.webp",
    alt: "MotoGP bikes on the circuit in Goiânia",
    author: "Boaventuravinicius",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Moto_GP_2026-_Goi%C3%A2nia.jpg",
    races: [
      {
        slug: "grand-prix-of-brazil-2027-motogp-2027",
        name: "Grand Prix of Brazil 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/buenos-aires-motorcycle.webp",
    alt: "A grand prix motorcycle at the Buenos Aires circuit",
    author: "Box Repsol",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Carlos_Checa_1995_Buenos_Aires.jpg",
    races: [
      {
        slug: "grand-prix-of-argentina-2027-motogp-2027",
        name: "Grand Prix of Argentina 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/cota-motogp.webp",
    alt: "MotoGP riders racing at Circuit of the Americas",
    author: "Box Repsol",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Marc_M%C3%A1rquez_leads_the_group_2019_Austin.jpeg",
    races: [
      {
        slug: "grand-prix-of-the-united-states-2027-motogp-2027",
        name: "Grand Prix of the United States 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/berlin-formula-e.webp",
    alt: "A Formula E car on the Berlin E-Prix circuit",
    author: "Steffen Prößdorf",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:2023-04-23_Motorsport,_ABB_FIA_Formula_E_World_Championship,_Berlin_E-Prix_2023_1DX_1445_by_Stepro.jpg",
    races: [
      {
        slug: "berlin-e-prix-2027-race-1-formula-e-2027",
        name: "Berlin E-Prix 2027 (Race 1)"
      },
      {
        slug: "berlin-e-prix-2027-race-2-formula-e-2027",
        name: "Berlin E-Prix 2027 (Race 2)"
      }
    ]
  },
  {
    src: "/images/race-cards/jerez-motogp.webp",
    alt: "MotoGP riders racing at the Jerez circuit",
    author: "Box Repsol",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Jorge_Lorenzo_leads_the_pack_2015_Jerez_2.jpeg",
    races: [
      {
        slug: "grand-prix-of-spain-2027-motogp-2027",
        name: "Grand Prix of Spain 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/le-mans-motogp.webp",
    alt: "A MotoGP rider on track at the Le Mans circuit",
    author: "Matthieu Pelletier",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Valentino_ROSSI_-_Movistar_Yamaha_MotoGP_-_MotoGP_2014_-_Le_Mans_(14216954461).jpg",
    races: [
      {
        slug: "grand-prix-of-france-2027-motogp-2027",
        name: "Grand Prix of France 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/formula-e-porsche.webp",
    alt: "A Formula E car on track",
    author: "Matt Buck",
    licence: "CC BY-SA 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:IMGP7259_(51542731449).jpg",
    races: [
      {
        slug: "london-e-prix-2027-race-1-formula-e-2027",
        name: "London E-Prix 2027 (Race 1)"
      },
      {
        slug: "london-e-prix-2027-race-2-formula-e-2027",
        name: "London E-Prix 2027 (Race 2)"
      }
    ]
  },
  {
    src: "/images/race-cards/mugello-motogp.webp",
    alt: "MotoGP riders on track at the Mugello circuit",
    author: "joevanni_99",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl: "https://commons.wikimedia.org/wiki/File:Mugello_Circuit.jpg",
    races: [
      {
        slug: "grand-prix-of-italy-2027-motogp-2027",
        name: "Grand Prix of Italy 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/catalunya-motogp.webp",
    alt: "A MotoGP rider on track at the Circuit de Barcelona-Catalunya",
    author: "Anyul Rivas",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Marc_M%C3%A1rquez_(28235169747).jpg",
    races: [
      {
        slug: "grand-prix-of-catalunya-2027-motogp-2027",
        name: "Grand Prix of Catalunya 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/zandvoort-circuit.webp",
    alt: "Aerial view of Circuit Zandvoort",
    author: "dronepicr",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Formula_one_Circuit_Park_in_the_dunes_of_Zandvoort_in_the_Netherlands_(47856564401).jpg",
    races: [
      {
        slug: "zandvoort-e-prix-2027-race-1-formula-e-2027",
        name: "Zandvoort E-Prix 2027 (Race 1)"
      },
      {
        slug: "zandvoort-e-prix-2027-race-2-formula-e-2027",
        name: "Zandvoort E-Prix 2027 (Race 2)"
      }
    ]
  },
  {
    src: "/images/race-cards/portimao-circuit.webp",
    alt: "Aerial view of the Autódromo Internacional do Algarve",
    author: "Vitor Oliveira",
    licence: "CC BY-SA 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Aut%C3%B3dromo_Internacional_do_Algarve_-_Portim%C3%A3o_-_Portugal_%F0%9F%87%B5%F0%9F%87%B9_(53656876708).jpg",
    races: [
      {
        slug: "portuguese-grand-prix-2027-f1-2027",
        name: "Portuguese Grand Prix 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/jarama-circuit.webp",
    alt: "Aerial view of the Circuito del Jarama",
    author: "Carlos Teixidor Cadenas",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Circuito_de_Madrid_Jarama_-_RACE,_o_%22Circuito_del_Jarama%22._Comunidad_de_Madrid._Espa%C3%B1a,_Spain.jpg",
    races: [
      {
        slug: "madrid-e-prix-2027-race-1-formula-e-2027",
        name: "Madrid E-Prix 2027 (Race 1)"
      },
      {
        slug: "madrid-e-prix-2027-race-2-formula-e-2027",
        name: "Madrid E-Prix 2027 (Race 2)"
      }
    ]
  },
  {
    src: "/images/race-cards/assen-motogp.webp",
    alt: "MotoGP riders on track at the Assen circuit",
    author: "Jarno Loeff",
    licence: "CC BY-SA 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:2010_Dutch_TT_-_GT_Corner.jpg",
    races: [
      {
        slug: "grand-prix-of-the-netherlands-2027-dutch-tt-motogp-2027",
        name: "Grand Prix of the Netherlands 2027 (Dutch TT)"
      }
    ]
  },
  {
    src: "/images/race-cards/sachsenring-motogp.webp",
    alt: "A MotoGP bike on track at the Sachsenring",
    author: "Neuwieser",
    licence: "CC BY-SA 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:MotoGP_-_Sachsenring_2018_(42154521000).jpg",
    races: [
      {
        slug: "grand-prix-of-germany-2027-motogp-2027",
        name: "Grand Prix of Germany 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/brno-motogp.webp",
    alt: "MotoGP riders on track at the Brno circuit",
    author: "Box Repsol",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Stefan_Bradl_and_%C3%81lex_M%C3%A1rquez_2020_Brno.jpg",
    races: [
      {
        slug: "grand-prix-of-czechia-2027-motogp-2027",
        name: "Grand Prix of Czechia 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/tokyo-formula-e.webp",
    alt: "A Formula E car on track at the Tokyo E-Prix",
    author: "Morio",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Antonio_Felix_da_Costa_2024_Tokyo_FP2.jpg",
    races: [
      {
        slug: "tokyo-e-prix-2027-race-1-formula-e-2027",
        name: "Tokyo E-Prix 2027 (Race 1)"
      },
      {
        slug: "tokyo-e-prix-2027-race-2-formula-e-2027",
        name: "Tokyo E-Prix 2027 (Race 2)"
      }
    ]
  },
  {
    src: "/images/race-cards/silverstone-motogp.webp",
    alt: "A MotoGP rider on track at Silverstone",
    author: "Matt Billings",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Jorge_Lorenzo_Silverstone_Moto_Gp_2010.jpg",
    races: [
      {
        slug: "grand-prix-of-great-britain-2027-motogp-2027",
        name: "Grand Prix of Great Britain 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/red-bull-ring-motogp.webp",
    alt: "A MotoGP rider on track at the Red Bull Ring",
    author: "Lukas Raich",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:MotoGP_2026_Austria_Nr._33_Binder_(2).jpg",
    races: [
      {
        slug: "grand-prix-of-austria-2027-motogp-2027",
        name: "Grand Prix of Austria 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/misano-motogp.webp",
    alt: "MotoGP riders racing at the Misano circuit",
    author: "Box Repsol",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Valentino_Rossi_and_Marc_M%C3%A1rquez_leading_the_pack_2015_Misano.jpeg",
    races: [
      {
        slug: "grand-prix-of-san-marino-and-the-rimini-riviera-2027-motogp-2027",
        name: "Grand Prix of San Marino and the Rimini Riviera 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/motorland-motogp.webp",
    alt: "MotoGP riders racing at MotorLand Aragón",
    author: "Box Repsol",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Marc_M%C3%A1rquez,_Jack_Miller_and_Jorge_Mart%C3%ADn_2021_Arag%C3%B3n.jpg",
    races: [
      {
        slug: "grand-prix-of-aragon-2027-motogp-2027",
        name: "Grand Prix of Aragón 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/istanbul-park-formula-1.webp",
    alt: "A Formula 1 car on track at Istanbul Park",
    author: "Mark McArdle",
    licence: "CC BY-SA 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Fernando_Alonso_2009_Turkey.jpg",
    races: [
      {
        slug: "turkish-grand-prix-2027-f1-2027",
        name: "Turkish Grand Prix 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/portimao-motogp.webp",
    alt: "MotoGP riders racing at the Autódromo Internacional do Algarve",
    author: "Box Repsol",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:15_Portimao_GP_20_a_22_de_Noviembre_de_2020._Cto_de_Portimao,_Portugal_(50633340583).jpg",
    races: [
      {
        slug: "grand-prix-of-portugal-2027-motogp-2027",
        name: "Grand Prix of Portugal 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/mandalika-motogp.webp",
    alt: "MotoGP riders racing in the wet at the Mandalika circuit",
    author: "Andika Wahyu / Portal Informasi Indonesia",
    licence: "public domain",
    licenceUrl: "https://commons.wikimedia.org/wiki/Template:PD-IDGov",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:MotoGP_di_Sirkuit_Balapan_Pertamina_Mandalika,_NTB,_Indonesia.jpg",
    races: [
      {
        slug: "grand-prix-of-indonesia-2027-motogp-2027",
        name: "Grand Prix of Indonesia 2027"
      }
    ]
  },
  {
    src: "/images/race-cards/adelaide-street-circuit.webp",
    alt: "Aerial view of the Adelaide Street Circuit",
    author: "Avatar5991",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Adelaide_Street_Circuit.jpg",
    races: [
      {
        slug: "grand-prix-of-australia-2027-motogp-2027",
        name: "Grand Prix of Australia 2027"
      }
    ]
  }
]
