import { Actor } from 'apify';
import puppeteer from 'puppeteer';

await Actor.init();

const browser = await puppeteer.launch({ headless: true }); // Garante execução em background
const page = await browser.newPage();

// Disfarça o Puppeteer como navegador comum
await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
await page.setExtraHTTPHeaders({ "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" });

const url = "https://resources.cemaden.gov.br/graficos/interativo/grafico_CEMADEN.php?idpcd=7049&uf=SP";

await page.goto(url, { waitUntil: 'networkidle2' });

// Aguarda a tabela carregar completamente
await page.waitForSelector("table thead tr td", { timeout: 15000 });

const dados = await page.evaluate(() => {
    const linhas = Array.from(document.querySelectorAll("table thead tr td"));
    return linhas.map(linha => {
        let colunas = linha.querySelectorAll("td");
        return Array.from(colunas).map(td => td.innerText.trim());
    });
});

await browser.close();

// Salva os dados no Apify Dataset (para consulta posterior via API)
await Actor.pushData(dados);

console.log("Dados coletados:", JSON.stringify(dados, null, 2));

await Actor.exit();
