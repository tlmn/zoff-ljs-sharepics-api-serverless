import chromium from 'chrome-aws-lambda';

async function getBrowserInstance() {
  return chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1080,
      height: 1080
    },
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true
  });
}

async function takeScreenshot(SVGContent) {
  let browser = null;

  try {
    browser = await getBrowserInstance();

    const page = await browser.newPage();

    await page.setContent(SVGContent);

    const screenshot = await page.screenshot({ type: 'png' });
    await page.close();

    return screenshot;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export default async function handler(req, res) {
  const { body: SVGContent } = req;

  try {
    const screenshot = await takeScreenshot(SVGContent);

    if (!screenshot) {
      throw new Error('Screenshot could not be generated.');
    }

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(screenshot);
  } catch (error) {
    console.log(error);
    res.status(500).send(JSON.stringify(error));
  }

  return {};
}