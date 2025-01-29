import { Actor } from 'apify';
import puppeteer from 'puppeteer';

async function run() {
    await Actor.init();

    const browser = await puppeteer.launch({ headless: true });  // Agora sim!
    const page = await browser.newPage();

    // Disfarça o Puppeteer como um navegador comum
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    await page.setExtraHTTPHeaders({ "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" });

    const url = "https://resources.cemaden.gov.br/graficos/interativo/grafico_CEMADEN.php?idpcd=7049&uf=SP";

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Aguarda um tempo extra para garantir que o Angular carregue os dados
    await page.waitForTimeout(5000);

    // Aguarda especificamente uma célula que deve conter dados reais
    await page.waitForSelector("table thead tr:nth-child(3) td", { timeout: 15000 });

    const dados = await page.evaluate(() => {
        const linhas = Array.from(document.querySelectorAll("table thead tr"));
        return linhas.map(linha => {
            const colunas = Array.from(linha.querySelectorAll("th, td"));
            return colunas.map(coluna => coluna.innerText.trim());
        });
    });

    console.log("Dados coletados:", JSON.stringify(dados, null, 2));

    await browser.close();
    await Actor.pushData(dados);
    await Actor.exit();
}

// Executa a função async
run().catch(console.error);
