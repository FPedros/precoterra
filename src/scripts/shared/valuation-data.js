// Dados ilustrativos da degustação AgroTerra; não são uma base de avaliação de produção.
export const CLASSES=[
 {n:'Agricultura de alto potencial',v:16500},
 {n:'Agricultura de médio potencial',v:12800},
 {n:'Culturas permanentes',v:14200},
 {n:'Pastagem de médio suporte',v:7400},
 {n:'Pastagem de alto suporte',v:9100},
 {n:'Pastagem de baixo suporte',v:5200},
 {n:'Reflorestamento',v:8600},
 {n:'Remanescente de vegetação nativa',v:3100}
];
/* cada município traz o fator do POLO agrícola a que pertence — é o polo, não o estado, que define o preço */
export const UF={
 'MT':{c:[['Sorriso',1.00,'Polo 10 — Médio Norte'],['Sinop',0.96,'Polo 10 — Médio Norte'],['Lucas do Rio Verde',1.02,'Polo 10 — Médio Norte'],['Nova Mutum',0.99,'Polo 10 — Médio Norte'],['Primavera do Leste',0.92,'Polo 12 — Sudeste de MT'],['Rondonópolis',0.88,'Polo 14 — Sul de MT']]},
 'MS':{c:[['Maracaju',0.97,'Polo 31 — Sul de MS'],['Dourados',1.01,'Polo 31 — Sul de MS'],['Chapadão do Sul',0.93,'Polo 33 — Nordeste de MS'],['São Gabriel do Oeste',0.86,'Polo 34 — Norte de MS']]},
 'GO':{c:[['Rio Verde',1.12,'Polo 21 — Sudoeste de GO'],['Jataí',1.09,'Polo 21 — Sudoeste de GO'],['Cristalina',1.05,'Polo 24 — Sudeste de GO'],['Luziânia',0.98,'Polo 24 — Sudeste de GO']]},
 'PR':{c:[['Cascavel',1.38,'Polo 71 — Oeste do PR'],['Londrina',1.44,'Polo 74 — Norte do PR'],['Ponta Grossa',1.21,'Polo 77 — Campos Gerais'],['Campo Mourão',1.30,'Polo 73 — Centro-Oeste do PR']]},
 'RS':{c:[['Passo Fundo',1.19,'Polo 91 — Planalto Médio'],['Cruz Alta',1.08,'Polo 92 — Alto Jacuí'],['Erechim',0.94,'Polo 94 — Alto Uruguai'],['Santa Rosa',1.02,'Polo 96 — Noroeste do RS']]},
 'BA':{c:[['Luís Eduardo Magalhães',0.84,'Polo 45 — Oeste da BA'],['Barreiras',0.79,'Polo 45 — Oeste da BA'],['São Desidério',0.81,'Polo 45 — Oeste da BA'],['Correntina',0.68,'Polo 47 — Sudoeste da BA']]},
 'SP':{c:[['Ribeirão Preto',1.52,'Polo 61 — Nordeste de SP'],['Araçatuba',1.24,'Polo 64 — Noroeste de SP'],['Assis',1.36,'Polo 66 — Médio Paranapanema'],['Itapeva',1.11,'Polo 68 — Sudoeste de SP']]},
 'MG':{c:[['Uberlândia',1.14,'Polo 51 — Triângulo Mineiro'],['Uberaba',1.09,'Polo 51 — Triângulo Mineiro'],['Unaí',0.92,'Polo 54 — Noroeste de MG'],['Patos de Minas',0.97,'Polo 53 — Alto Paranaíba']]},
 'MA':{c:[['Balsas',0.64,'Polo 41 — Sul do MA'],['Tasso Fragoso',0.59,'Polo 41 — Sul do MA'],['Riachão',0.56,'Polo 41 — Sul do MA']]},
 'TO':{c:[['Pedro Afonso',0.61,'Polo 43 — Centro do TO'],['Campos Lindos',0.54,'Polo 42 — Nordeste do TO'],['Porto Nacional',0.58,'Polo 43 — Centro do TO']]}
};
