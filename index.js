const puppeteer = require("puppeteer");
const fs = require("fs");
const cookies = require('./cookies.json');
const config = require('./config.json');

(async () => {

    for (let i = 0; i < 100; i++) {

        if (Object.keys(cookies).length) {

            let webApp = "https://www.ea.com/nb-no/fifa/ultimate-team/web-app/";

            let browser = await puppeteer.launch({ headless: false });

            let page = await browser.newPage();
            await page.setCookie(...cookies);
            await page.goto(webApp, { waitUntil: "networkidle2" });

            await page.waitFor(6000);

            /* Login med brukernavn og passord */
            await page.click("button[class='btn-standard call-to-action']");
            await page.waitFor(5000);
            await page.type('input[name=email]', config.username, {delay: 30});
            await page.waitFor(1000);
            await page.type('input[name=password]', config.password, {delay: 30});
            await page.waitFor(1000);
            await page.click("a[class='otkbtn otkbtn-primary ']");
            await page.waitFor(35000);


            await page.click("button[class='ut-tab-bar-item icon-transfer']");
            await page.waitFor(2500);


            await page.click("div[class='tile col-1-2 ut-tile-transfer-list']");
            await page.waitFor(2500);


            for (let i = 0; i < 100; i++) {

                console.log("Jeg er på transferlist")

                try {
                    await page.waitFor(4500);
                    await page.click("button[class='btn-standard section-header-btn mini call-to-action']");
                } catch (error) {
                    console.log("Det er ingen solgte spillere(1)")
                }

                try {
                    await page.waitFor(3500);
                    console.log("Prøve å trykke på spiller")
                    const [span8] = await page.$x("//span[contains(., 'Utløpt')]");
                    if (span8) {
                        await span8.click();
                    }

                    console.log("Trykket på spiller");

                    await page.waitFor(3500);
                    await page.click("button[class='accordian']");
                    await page.waitFor(3500);
                    console.log("Trykket på overgangs knapp");


                } catch (error) {
                    console.log("Det er ingen flere spillere");
                    break;
                }


                try {
                    await page.waitFor(2000)
                    await page.click("button[class='btn-standard decrement-value']");

                } catch (error) {

                        console.log("Hutigselger spiller")
                        await page.waitFor(3000);

                        /* Programmer krasjer for ofte her, men er en løsning
                        await page.click("span[class='btn-subtext currency-coins']");*/

                        const [button5] = await page.$x("//button[contains(., 'Ok')]");
                        if (button5) {
                            await button5.click();
                        }

                        await page.waitFor(3000)

                        const [spanHutigSelg] = await page.$x("//span[contains(., 'Hurtigselg')]");
                        if (spanHutigSelg) {
                            await spanHutigSelg.click();
                        }

                }


                await page.waitFor(1500)

                for (let i = 0; i < 9; i++) {
                    console.log("tar ned prisen på spiller")
                    try {
                        await page.waitFor(100);
                        const minus = await page.$x('/html/body/main/section/section/div[2]/div/div/section/div/div/div[2]/div[2]/div[2]/div[3]/div[2]/button[1]');
                        await minus[0].click();
                    } catch (error) {
                        break;
                    }
                }

                try {
                    await page.waitFor(2000)
                    const [button6] = await page.$x("//button [contains(., 'Legg ut for overgang')]");
                    if (button6) {
                        await button6.click();
                    }
                    await page.waitFor(3500)

                } catch (error) {
                    console.log("Va ingen å legge ut")
                }

            }

            await page.waitFor(3500)
            await page.click("button[class='ut-navigation-button-control']");


            /* Finne ut hvor mange kort som er på transferlist også regne ut hvor mange pakker som kan bli åpnet*/
            let data = await page.evaluate(() => {
                let itemsTransferlist = +document.querySelector('span[class="value"]').innerText;

                let ledigePlasser = 100 - itemsTransferlist;

                let packs = ledigePlasser/4;

                let floorPacks = Math.floor(packs);

                return {
                    floorPacks,
                }
            });

            console.log(data);

            await page.waitFor(3000);
            await page.click("button[class='ut-tab-bar-item icon-store']");
            await page.waitFor(2000);
            await page.click("div[class='tileContent']");
            await page.waitFor(2000);

            for (let i = 0; i < Object.values(data); i++){

                console.log(i);

                await page.waitFor(2500);
                const [button1] = await page.$x("//button[contains(., 'KLASSISKE PAKKER')]");
                if (button1) {
                    await button1.click();
                }

                try {
                    await page.waitFor(2000);
                    const [span4] = await page.$x("//span[contains(., '750')]");
                    if (span4) {
                        await span4.click();
                    }
                } catch (error){
                    console.log("Klarte ikke å åpne pakken");
                    process.exit(0);
                }

                await page.waitFor(2000);

                const [button2] = await page.$x("//button[contains(., 'Ok')]");
                if (button2) {
                    await button2.click();
                }

                await page.waitFor(10000);

                for (let i = 0; i < 8; i++){

                    try {
                        await page.waitFor(3000);
                        await page.click("div[class='player-stats-data-component']");

                    } catch (error) {
                        console.log("Ingen flere spillere!");
                        break;
                    }

                    await page.waitFor(2000);
                    /* skal sammenligne pris (Fynker ikke)
                    const [button3] = await page.$x("//button[contains(., 'Sammenlign pris')]");
                    if (button3) {
                        await button3.click();
                    }

                    await page.waitFor(1500);

                    const [getXpath] = await page.$x('//body/main/section/section/div[2]/div/div/section[2]/div[2]/section/div[2]/ul/li[1]/div/div[2]/div[3]/span[2]/text()');
                    console.log(getXpath);
                    await page.waitFor(1500);
                    const getMsg = await page.evaluate(el => el.innerText, getXpath[0]);
                    console.log(getMsg);

                    debugger;

                    await page.waitFor(1500);
                    const elements = await page.$x('/html/body/main/section/section/div[2]/div/div/section[2]/div[1]/button');
                    await elements[0].click();*/

                    await page.waitFor(3000);
                    await page.click("button[class='accordian']");
                    await page.waitFor(100);

                    const [xpathBuy] = await page.$x("/html/body/main/section/section/div[2]/div/div/section[2]/div/div/div[2]/div[2]/div[2]/div[3]/div[2]/input");

                    console.log(xpathBuy);

                    await page.waitFor(1000);

                    await page.evaluate((element, value) => element.value = value, xpathBuy, 1000);

                    await page.waitFor(1500);
                    const [button4] = await page.$x("//button[contains(., 'Legg ut for overgang')]");
                    if (button4) {
                        await button4.click();
                    }
                }

                for (let i = 0; i < 2; i++) {

                    try {
                        await page.waitFor(1500);
                        await page.click("button[class='ut-group-button cta']");
                        await page.waitFor(1500);
                        const [span2] = await page.$x("//span[contains(., 'Ok')]");
                        if (span2) {
                            await span2.click();
                        }

                    } catch (error) {
                        break;
                    }
                }

                /*Hva kommer over øverst av "Løs inn pakker" eller "Løs inn mynter?"*/
                for (let i = 0; i < 1; i++){
                    try {
                        await page.waitFor(1500);
                        const [span3] = await page.$x("//span[contains(., 'Løs inn pakke')]");
                        if (span3) {
                            await span3.click();
                        }

                    } catch (error){
                        break;
                    }
                }

                /*Kan vær løs inn bronse pakekr har samme class name som løs inn mynter*/
                for (let i = 0; i < 1; i++){
                    try {
                        await page.waitFor(1500);
                        const [span1] = await page.$x("//span[contains(., 'Løs inn mynter')]");
                        if (span1) {
                            await span1.click();
                        }

                    } catch (error){
                        break;
                    }
                }


                await page.waitFor(2500);
                await page.click("button[class='ut-navigation-button-control");


            }


            //lag en for loop som varer i 1time og printer hvor lang tid det har tatt vært 5min
            console.log("programmet er ferdig")
            await page.waitFor(1000);
            await browser.close();
            await page.waitFor(3600000);



            /*Set Cookies*/
        } else {
            console.log("Set Cookies")
            await page.goto(webApp);
            await page.waitFor(60000);

            try {
                await page.waitFor(3000);
                await page.$eval("button[class='ut-tab-bar-item icon-transfer']", elem => elem.click());

            } catch (error) {
                console.log("Failed to login");
                process.exit(0);
            }

            console.log("Succseeded to login");

            let currentCookies = await page.cookies();
            fs.writeFileSync('./cookies.json', JSON.stringify(currentCookies));
        }

    }


/* For github */
})();
