import { Actor } from 'apify';
import puppeteer from 'puppeteer';

await Actor.init();

const browser = await puppeteer.launch();
const page = await browser.newPage();

const url = "https://resources.cemaden.gov.br/graficos/interativo/grafico_CEMADEN.php?idpcd=7049&uf=SP";

await page.goto(url, { waitUntil: 'networkidle2' });

// Função para extrair os dados
const dados = await page.evaluate(() => {
    const linhas = Array.from(document.querySelectorAll("table tbody tr"));
    return linhas.map(linha => {
        let colunas = linha.querySelectorAll("td");
        return Array.from(colunas).map(td => td.innerText.trim());
    });
});

await browser.close();

// Salva os dados no Apify Dataset (para consulta posterior via API)
await Actor.pushData(dados);

console.log("Dados coletados:", dados);

await Actor.exit();
