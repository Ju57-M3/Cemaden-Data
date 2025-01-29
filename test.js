import { Actor } from 'apify';
import puppeteer from 'puppeteer';

await Actor.init();

const browser = await puppeteer.launch();
const page = await browser.newPage();

const url = "https://resources.cemaden.gov.br/graficos/interativo/grafico_CEMADEN.php?uf=SP";

await page.goto(url, { waitUntil: 'networkidle2' });

// Função para extrair os dados
const dados = await page.evaluate(() => {
    const linhas = document.querySelectorAll("#infopcds > thead > tr"); // Seleciona todas as linhas da tabela
    let resultados = [];

    linhas.forEach((linha, index) => {
        let colunas = linha.querySelectorAll("td");
        let valores = Array.from(colunas).map(td => td.innerText.trim());
        
        resultados.push({
            linha: index + 1,
            valores
        });
    });

    return resultados;
});

await browser.close();

// Salva os dados no Apify Dataset (para consulta posterior via API)
await Actor.pushData(dados);

console.log("Dados coletados:", dados);

await Actor.exit();
