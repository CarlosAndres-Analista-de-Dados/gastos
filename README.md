# Meus Gastos

App web para controlar gastos e receitas pessoais. Funciona no navegador do celular ou do computador, pode ser instalado como aplicativo (PWA) e guarda tudo no próprio aparelho, sem conta e sem servidor.

## Recursos

- **Registro por voz:** toque no microfone e diga, por exemplo, "Almoço 25 reais alimentação" ou "Recebi 3000 de salário". O app identifica descrição, valor, categoria e tipo, e salva o lançamento.
- **Lançamento manual:** formulário com tipo (despesa ou receita), descrição, valor, data e categoria. Toque em qualquer item da lista para editar.
- **Saldo por período:** Hoje, Semana, Mês, Tudo ou um intervalo personalizado, com totais de receitas e despesas.
- **Orçamento mensal com projeção:** defina um teto de gastos e acompanhe a barra de progresso. Logo abaixo dela, o app mostra a projeção de fechamento do mês no ritmo atual e, quando a meta está em risco, quanto dá para gastar por dia até o fim do mês sem ultrapassá-la. O app também avisa ao salvar uma despesa que ultrapassa o orçamento.
- **Três visões dos registros:**
  - **Lista:** agrupada por dia (Hoje, Ontem, data por extenso).
  - **Por categoria:** gráfico de rosca com as despesas do período.
  - **Relatório:** compara o mês (ou a semana) atual com o anterior e gera dicas automáticas. Nos modos Mensal e Semanal, inclui uma **análise aprofundada**: diagnóstico (taxa de poupança, média diária, projeção), tendência de 6 meses, metas por categoria, padrões de comportamento (dia da semana, quinzena, pequenos gastos, gastos recorrentes, maiores despesas), regra 50/30/20 e um plano com teto sugerido para o mês seguinte.
- **Categorias personalizadas:** crie categorias com emoji e cor, separadas para despesas e receitas.
- **Desfazer:** ao remover um registro, o aviso oferece a opção "Desfazer".
- **Exportar e fazer backup:** exportação em CSV e backup completo em JSON.
- **Instalável e offline:** funciona como app na tela inicial e abre sem internet (veja [Limitações](#limitações)).

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | O app inteiro: interface, estilos e lógica em um único arquivo |
| `manifest.json` | Metadados de instalação do PWA (nome, cores, ícones) |
| `sw.js` | Service Worker que guarda os arquivos do app em cache para uso offline |
| `icon-192.png`, `icon-512.png` | Ícones do app, referenciados pelo manifesto e pelo Service Worker |

Os ícones não fazem parte deste repositório por padrão. Crie os dois arquivos PNG (192×192 e 512×512 pixels) na mesma pasta do `index.html`. Sem eles, o Service Worker falha ao instalar o cache e o app não fica instalável.

## Como executar

O Service Worker e o reconhecimento de voz exigem **HTTPS** ou **localhost**. Abrir o `index.html` direto do disco (`file://`) mostra a interface, mas sem instalação, modo offline e voz.

**Testar localmente:**

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`.

**Publicar:** envie todos os arquivos para qualquer hospedagem estática com HTTPS, como GitHub Pages, Netlify, Cloudflare Pages ou Vercel. Os caminhos são relativos, então o app funciona também dentro de uma subpasta.

**Instalar no celular:**

- **Android (Chrome):** menu ⋮ e "Instalar app" ou "Adicionar à tela inicial".
- **iPhone (Safari):** botão Compartilhar e "Adicionar à Tela de Início".

## Registro por voz

O reconhecimento usa a Web Speech API em português do Brasil (`pt-BR`). Funciona em Chrome e Edge (computador e Android) e no Safari do iOS 14.5 ou superior. O navegador precisa de permissão de microfone e, na maioria dos casos, de conexão com a internet para transcrever a fala.

A frase segue o padrão **descrição, valor, categoria**:

| Você diz | Resultado |
|---|---|
| "Almoço 25 reais alimentação" | Despesa de R$ 25,00, "Almoço", categoria Alimentação |
| "Uber 15 transporte" | Despesa de R$ 15,00, "Uber", categoria Transporte |
| "Recebi 3000 de salário" | Receita de R$ 3.000,00, categoria Salário |

Regras de interpretação:

- Frases com **recebi**, **receita**, **ganhei**, **entrada** ou **recebimento** são tratadas como receita. As demais são despesa.
- O primeiro número da frase é o valor. O que vem antes vira a descrição e o que vem depois é comparado com as categorias.
- Se nenhuma categoria for reconhecida, o lançamento vai para "Outros".
- Se nenhum valor for identificado, o formulário abre com a descrição preenchida e o campo de valor em destaque para você completar.

## Categorias padrão

- **Despesas:** Alimentação, Transporte, Moradia, Saúde, Lazer, Compras, Educação, Outros.
- **Receitas:** Salário, Freelance, Investimentos, Presente, Outros.

Categorias criadas por você aparecem junto das padrão. Ao remover uma categoria em uso, os lançamentos dela passam para "Outros".

## Seus dados

Tudo fica no `localStorage` do navegador, neste aparelho. Nada é enviado para servidores.

| Chave | Conteúdo |
|---|---|
| `meus-gastos:registros` | Lista de lançamentos |
| `meus-gastos:orcamento` | Valor do orçamento mensal |
| `meus-gastos:categorias-custom` | Categorias personalizadas |

Cada lançamento tem o formato:

```json
{
  "id": "uuid",
  "tipo": "despesa",
  "descricao": "Almoço",
  "valor": 25,
  "categoria": "Alimentação",
  "data": "2026-09-24"
}
```

**Como não perder os dados:** limpar os dados do navegador, reinstalar o app ou trocar de aparelho apaga o `localStorage`. Use **Dados e backup > Backup (.json)** com frequência e guarde o arquivo em local seguro. Para recuperar, use **Restaurar backup**, que substitui todos os dados atuais pelos do arquivo.

Outras ações da seção "Dados e backup":

- **Exportar CSV:** planilha com separador `;` e codificação UTF-8, aberta direto no Excel ou Google Planilhas.
- **Apagar tudo:** remove todos os lançamentos, mas mantém o orçamento e as categorias personalizadas. Pede confirmação antes.

## Tecnologias

- HTML, CSS e JavaScript puros, sem etapa de build.
- [Tailwind CSS](https://tailwindcss.com) via CDN.
- Fontes [Fraunces](https://fonts.google.com/specimen/Fraunces) (títulos e valores) e [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) (texto), via Google Fonts.
- Gráfico de categorias feito com `conic-gradient` em CSS, sem biblioteca de gráficos.

Paleta:

| Nome | Cor | Uso |
|---|---|---|
| ink | `#1F2A24` | Texto |
| paper | `#FAF8F5` | Fundo |
| forest | `#2F6F5E` | Cor principal, receitas |
| coral | `#C4573D` | Despesas, botão de voz |
| gold | `#E8A33D` | Alertas de orçamento |

## Atualizando o app

O Service Worker responde primeiro com o cache e atualiza em segundo plano. Depois de alterar qualquer arquivo, aumente o número da versão em `sw.js`:

```js
const CACHE_NAME = "meus-gastos-cache-v7"; // troque para v6, v7...
```

Quem já instalou o app recebe a nova versão ao abri-lo, e pode ser preciso abrir duas vezes para ver a mudança. Se renomear ou adicionar arquivos, atualize também a lista `APP_SHELL` no mesmo arquivo.

## Limitações

- **Uso offline:** o Tailwind e as fontes vêm de CDNs externos, e o Service Worker atual pode não guardá-los no cache. Sem internet, o app pode abrir com a aparência simplificada. Para uso offline completo, gere o CSS do Tailwind localmente e hospede as fontes junto com o app.
- **Voz sem internet:** a transcrição costuma depender do serviço de voz do navegador. Sem conexão, use o formulário manual.
- **Dados só no aparelho:** não há sincronização entre dispositivos. Para levar os dados a outro aparelho, use backup e restauração.
