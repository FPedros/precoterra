# Agrovalora — site institucional

Site institucional multipágina da Agrovalora, construído com Vite e JavaScript puro. O projeto gera arquivos estáticos e não depende de servidor Node.js em produção.

## Estado atual

- Home: ativa em `/`.
- Análises: ativas em `/analises.html`.
- Apresentação Preço Terra: ativa em `/preco-terra.html`, com conteúdo e simulações do protótipo AgroTerra (sem cobrança ou envio de dados).
- Política de Privacidade: ativa em `/politica-privacidade.html`.
- Preço Terra, Análise de acesso e Socioambiental: ativos.
- Uso e ocupação e Agrogrid: removidos da página de análises.
- Blog: temporariamente desativado. Os arquivos `blog.html`, `blog.css` e `blog.js` foram preservados.

## Tecnologias

- Vite 8
- JavaScript, HTML e CSS
- Mapbox GL JS
- Lenis para rolagem suave
- Google Fonts

## Requisitos

- Node.js 20 LTS ou superior
- npm 10 ou superior
- AWS CLI v2 para publicação manual
- Conta Mapbox com token público para os mapas interativos

## Instalação e execução local

```bash
git clone <URL_DO_REPOSITORIO>
cd agrovalora-site
npm ci
npm run dev
```

O Vite mostrará o endereço local no terminal, normalmente `http://localhost:5173`.

Páginas principais:

- `http://localhost:5173/`
- `http://localhost:5173/analises.html`
- `http://localhost:5173/preco-terra.html`
- `http://localhost:5173/politica-privacidade.html`

## Variáveis de ambiente

Crie `.env.local` para desenvolvimento ou `.env.production.local` para um build local de produção:

```dotenv
VITE_MAPBOX_TOKEN=
VITE_BFF_API_BASE_URL=https://api.exemplo.com/api
```

Regras importantes:

- Utilize somente token público Mapbox iniciado por `pk` no frontend.
- Nunca utilize ou versione tokens secretos iniciados por `sk`.
- Restrinja no painel Mapbox as URLs autorizadas para o domínio de produção e para `localhost`.
- Configure `VITE_BFF_API_BASE_URL` com a URL base do BFF; o fallback local é `/api`.
- Configure `VITE_MAPBOX_TOKEN` com um token público (`pk.`) no ambiente local e no serviço de build. Não há credencial embutida no código; sem essa configuração, os mapas interativos dependentes do Mapbox ficam indisponíveis.
- Arquivos `.env*.local` não são versionados.

## Scripts

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # gera a versão de produção em dist/
npm run preview  # serve localmente o conteúdo gerado em dist/
```

Antes de publicar:

```bash
npm ci
npm run build
npm run preview
```

Confirme visualmente a Home e todas as análises em desktop e mobile.

Antes da publicação definitiva, submeta o conteúdo da Política de Privacidade à validação do jurídico ou do responsável por proteção de dados da organização.

## Estrutura principal

```text
agrovalora-site/
├── index.html                      # Entrada da home
├── analises.html                   # Entrada das análises
├── politica-privacidade.html       # Entrada da política de privacidade
├── blog.html                       # Página preservada, atualmente desativada
├── src/
│   ├── scripts/
│   │   ├── pages/                  # Comportamento específico de cada página
│   │   └── shared/                 # Utilitários reutilizáveis
│   └── styles/
│       ├── features/analises/      # Estilos das funcionalidades de análises
│       └── pages/                  # Estilos específicos de páginas
├── public/
│   └── assets/
│       ├── brand/                  # Logo e favicon
│       ├── home/                   # Vídeo e imagem de fundo da home
│       ├── blog/                   # Imagens dos artigos
│       └── analises/               # Mapas, GeoJSON, tiles e imagens de referência
├── vite.config.mjs                 # Entradas do build multipágina
└── dist/                           # Saída gerada; não versionada
```

## Arquitetura recomendada na AWS

Para produção, recomenda-se:

```text
Route 53 → CloudFront → bucket S3 privado
                  ↘ AWS Certificate Manager
```

- S3 armazena somente o conteúdo gerado em `dist/`.
- O bucket deve permanecer privado.
- CloudFront acessa o bucket por Origin Access Control (OAC).
- O certificado TLS do CloudFront deve ser criado no ACM em `us-east-1`.
- Route 53 é opcional caso o DNS esteja em outro provedor.

Não é necessário executar `npm`, Node.js ou Vite na instância de produção. O build acontece antes do upload.

## Configuração do S3 e CloudFront

1. Crie um bucket S3 exclusivo para o site.
2. Mantenha “Block Public Access” habilitado.
3. Crie uma distribuição CloudFront usando o endpoint REST do bucket como origem.
4. Crie e associe um OAC à origem S3.
5. Autorize a distribuição na policy do bucket usando a policy sugerida pelo CloudFront.
6. Configure `index.html` como Default Root Object.
7. Habilite redirecionamento de HTTP para HTTPS.
8. Ative compressão automática.
9. Associe o domínio e o certificado ACM, se aplicável.

O site é multipágina. Os links usam arquivos explícitos, como `/analises.html`; não é necessária regra de fallback de SPA.

## Publicação manual na AWS

Gere o build:

```bash
npm ci
npm run build
```

Envie os arquivos para o bucket:

```bash
aws s3 sync dist/ s3://SEU_BUCKET --delete
```

Defina cache curto para os documentos HTML:

```bash
aws s3 cp dist/ s3://SEU_BUCKET \
  --recursive \
  --exclude "*" \
  --include "*.html" \
  --content-type "text/html; charset=utf-8" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --metadata-directive REPLACE
```

Os arquivos com hash gerados pelo Vite podem receber cache longo:

```bash
aws s3 cp dist/assets/ s3://SEU_BUCKET/assets/ \
  --recursive \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata-directive REPLACE
```

Após o upload, invalide o CloudFront:

```bash
aws cloudfront create-invalidation \
  --distribution-id SUA_DISTRIBUICAO \
  --paths "/*"
```

Substitua `SEU_BUCKET` e `SUA_DISTRIBUICAO` pelos identificadores do ambiente.

## Publicação automatizada

Em CI/CD, o fluxo esperado é:

1. Checkout do repositório.
2. Instalação com `npm ci`.
3. Injeção de `VITE_MAPBOX_TOKEN` durante o build.
4. Execução de `npm run build`.
5. Sincronização de `dist/` com o S3.
6. Invalidação do CloudFront.

O pipeline está definido em `bitbucket-pipelines.yml` e é executado somente
na branch `main`. A etapa de produção é manual e exige as variáveis de
repositório ou deployment `AWS_DEFAULT_REGION`, `AWS_S3_BUCKET_NAME`,
`AWS_S3_BUCKET_PREFIX`, `DISTRIBUTION_ID`, `VITE_MAPBOX_TOKEN` e
`VITE_BFF_API_BASE_URL`.

Os arquivos HTML recebem cache desabilitado e os assets versionados recebem
cache de longa duração. Ao final do deploy, o CloudFront é invalidado.

Prefira autenticação da pipeline por OpenID Connect e IAM Role temporária. Evite armazenar chaves permanentes `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` no repositório.

Permissões mínimas da role de deploy:

- leitura e atualização dos objetos do bucket do site;
- listagem apenas desse bucket;
- criação de invalidação apenas na distribuição CloudFront do projeto.

## Headers e segurança

Configure uma Response Headers Policy no CloudFront com, no mínimo:

- `Strict-Transport-Security`;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Content-Security-Policy` somente após validar Google Fonts e todos os endpoints Mapbox utilizados pelo site.

Não versione perfis de navegador, capturas de depuração, diretórios `dist/`, arquivos `.env` locais ou credenciais AWS.

## Reativação do Blog

O Blog permanece no repositório, mas seus links e sua entrada no build estão comentados.

Para reativá-lo:

1. Restaure os links para `/blog.html` em `index.html` e `analises.html`.
2. Restaure a seção de divulgação do Blog na Home, se desejado.
3. Descomente a entrada `blog` em `vite.config.mjs`.
4. Execute `npm run build` e confirme a presença de `dist/blog.html`.

## Checklist de entrega

- [ ] `npm ci` executa sem erros.
- [ ] `npm run build` conclui com sucesso.
- [ ] Home abre corretamente.
- [ ] Todas as análises aparecem na barra e na página.
- [ ] Mapas Mapbox carregam no domínio final.
- [ ] Token Mapbox está restrito aos domínios autorizados.
- [ ] Layout foi conferido em desktop e mobile.
- [ ] Bucket S3 não está público.
- [ ] CloudFront utiliza HTTPS e OAC.
- [ ] Cache dos arquivos HTML está desabilitado ou com duração curta.
- [ ] Uma invalidação foi criada após o deploy.

## Observações de manutenção

- Os dados e sobreposições apresentados nas análises são demonstrativos.
- Arquivos em `public/` são copiados sem alteração para a raiz de `dist/`.
- Alterações em nomes de arquivos de `public/` exigem atualização das referências absolutas no HTML ou JavaScript.
- A mensagem de chunk grande do Mapbox durante o build é um aviso de tamanho, não uma falha de compilação.
# precoterra
