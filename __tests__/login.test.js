const puppeteer = require("puppeteer");
//const dotenv = require("dotenv");
//dotenv.config({ path: "./env" });

//testMatch: ["<rootDir>/__tests__/**/*.js"],

//i18n.init();
const i18nTranslate = require("../getI18n");
//console.log(i18nTranslate);
i18nTranslate.init();

const isDebugging = () => {
  let debugging_mode = {
    headless: false,
    slowMo: 50,
    devtools: true,
  };
  return process.env.NODE_ENV === "debug" ? debugging_mode : {};
};

const checkThis = async (page, selector, text, timeout = 0) => {
  let found = false;
  console.log("CHECK ", text);

  try {
    await page.waitForFunction(
      (text, selector) =>
        document.querySelector(selector).innerText.includes(text),
      { timeout: timeout },
      text,
      selector
    );
    console.log(`The text "${text}" was found on the page`);
    found = true;
  } catch (e) {
    console.log(`The text "${text}" was not found on the page`);
    found = false;
  }

  return Promise.resolve(found);
};

const waitThis = async (page, selector, timeout = 0) => {
  let found = false;
  console.log("WAIT ", selector);

  try {
    await page.waitForSelector(selector, { timeout: timeout });
    console.log(`"${selector}" was found on the page`);
    found = true;
  } catch (e) {
    console.log(`"${selector}" was not found on the page`);
    found = false;
  }

  return Promise.resolve(found);
};

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch(isDebugging());
  page = await browser.newPage();
  await page.goto(process.env.TEST_URL);
  // default design viewport size
  page.setViewport({ width: 500, height: 2400 });
  /*
  page.on("console", (msg) => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`);
  });
  */
});

describe("Test Login page ", () => {
  test("loads correctly", async () => {
    let text = i18nTranslate.__("loginWelcomeMessage");
    console.log("I18n", i18nTranslate.__("loginWelcomeMessage"));

    const found = await checkThis(page, "body", text, 10000);

    expect(found).toBe(true);
  }, 16000);

  test("login username check empty on enter keypress", async (done) => {
    //const page2 = await browser.newPage();

    //await page2.goto(process.env.TEST_URL + "login");
    const usernameEl = await page.$("#username");

    const invalidEntry = i18nTranslate.__("invalidEntry");
    await usernameEl.tap();
    await page.focus("#username");
    await page.keyboard.press("Enter");
    // check if empty username triggers toast

    const checkInvalidEntry = await checkThis(
      page,
      "[id*='blend-toast-']",
      invalidEntry,
      4000
    );
    //console.log("CHECK ", checkInvalidEntry);
    expect(checkInvalidEntry).toBe(true);
    done();
  }, 6000);

  test("login username check length after blur event", async (done) => {
    //const page2 = await browser.newPage();

    //await page2.goto(process.env.TEST_URL + "login");
    const usernameEl = await page.$("#username");

    const invalidLength = i18nTranslate.__("usernameError", {
      length: process.env.USERNAME_LENGTH,
    });
    await usernameEl.tap();
    await page.focus("#username");

    await page.type("#username", "test");
    await page.$eval("#username", (e) => e.blur());
    // check if empty username triggers toast

    const checkInvalidEntry = await checkThis(
      page,
      "[id*='blend-toast-']",
      invalidLength,
      4000
    );
    //console.log("CHECK ", checkInvalidEntry);

    expect(checkInvalidEntry).toBe(true);
    done();
  }, 6000);

  test("login username, check length when password onFocus ", async (done) => {
    // remove any previous entries...
    await page.evaluate(function () {
      document.querySelector("input#username").value = "";
    });

    const passwordEl = await page.$("#password");
    await passwordEl.tap();
    //await page.$eval("#password", (e) => e.focus());
    await page.focus("#password");

    const elID = await page.evaluate(() => document.activeElement.id);
    //console.log("ACTIVE ", elID);
    expect(elID).toBe("username");

    done();
  }, 6000);

  test("login password check empty on enter keypress", async (done) => {
    const passwordEl = await page.$("#password");
    const invalidEntry = i18nTranslate.__("invalidEntry");
    await passwordEl.tap();
    await page.focus("#password");
    await page.keyboard.press("Enter");

    const checkInvalidEntry = await checkThis(
      page,
      "[id*='blend-toast-']",
      invalidEntry,
      4000
    );
    //console.log("CHECK ", checkInvalidEntry);
    expect(checkInvalidEntry).toBe(true);
    done();
  }, 6000);

  test("login weak password quality check on enter keypress", async (done) => {
    // type username, so on focus check is not triggered....

    await page.type("#username", "testing");
    await page.evaluate(function () {
      document.querySelector("input#username").value = "testing";
    });
    const passwordEl = await page.$("#password");
    const invalidPassword = i18nTranslate.__("passwordQuality");
    await passwordEl.tap();
    //await page.focus("#password");
    await page.type("#password", "weakpassword");
    await page.keyboard.press("Enter");

    const checkInvalidEntry = await checkThis(
      page,
      "[id*='blend-toast-']",
      invalidPassword,
      3000
    );
    //console.log("CHECK ", checkInvalidEntry);
    expect(checkInvalidEntry).toBe(true);
    done();
  }, 6000);

  test("login password change visibility, show", async (done) => {
    await page.click(".PasswordRightIcon");

    const iconShown = await waitThis(page, ".HideIcon", 1000);
    expect(iconShown).toBe(true);

    done();
  }, 3000);
  test("login password change visibility, hide", async (done) => {
    await page.click(".PasswordRightIcon");

    const iconShown = await waitThis(page, ".EyeIcon", 1000);
    expect(iconShown).toBe(true);

    done();
  }, 6000);

  test("login weak password quality check on blur event", async (done) => {
    // type username, so on focus check is not triggered....

    await page.type("#username", "testing");
    await page.evaluate(function () {
      document.querySelector("input#username").value = "testing";
      document.querySelector("input#password").value = "";
    });
    const passwordEl = await page.$("#password");
    const invalidPassword = i18nTranslate.__("passwordQuality");
    await passwordEl.tap();
    //await page.focus("#password");
    await page.type("#password", "weakpassword");
    await page.$eval("#password", (e) => e.blur());

    const checkInvalidEntry = await checkThis(
      page,
      "[id*='blend-toast-']",
      invalidPassword,
      3000
    );
    //console.log("CHECK ", checkInvalidEntry);
    expect(checkInvalidEntry).toBe(true);
    done();
  }, 6000);
  test("login strong password quality check on blur event", async (done) => {
    // 2 test results...
    expect.assertions(2);

    // type username, so on focus check is not triggered....
    await page.type("#username", "testing");
    await page.evaluate(function () {
      document.querySelector("input#username").value = "testing";
      document.querySelector("input#password").value = "";
    });
    const passwordEl = await page.$("#password");
    const invalidPassword = i18nTranslate.__("passwordQuality");
    await passwordEl.tap();
    //await page.focus("#password");
    await page.type("#password", "thisISGoodPassword12!#");
    await page.$eval("#password", (e) => e.blur());

    const checkInvalidEntry = await checkThis(
      page,
      "[id*='blend-toast-']",
      invalidPassword,
      2000
    );
    //console.log("CHECK ", checkInvalidEntry);
    expect(checkInvalidEntry).toBe(false);
    const is_disabled = (await page.$(".LoginButton[disabled]")) !== null;
    // Login button should now be normal
    expect(is_disabled).toBe(false);

    done();
  }, 8000);

  test("login login button click invalid credentials", async (done) => {
    // using previous test input field values....
    await page.click(".LoginButton");
    const invalidLogin = i18nTranslate.__("invalidLogin");
    const checkInvalidLogin = await checkThis(
      page,
      "[id*='blend-toast-']",
      invalidLogin,
      2000
    );

    expect(checkInvalidLogin).toBe(true);

    done();
  }, 6000);

  test("login forgot password click", async (done) => {
    await page.click(".ForgotPasswordButton");
    const forgotPasswordTitle = i18nTranslate.__("resetPasswordTitle");
    const checkTitle = await checkThis(page, "body", forgotPasswordTitle, 3000);
    expect(checkTitle).toBe(true);
    await page.click(".BackButton");
    done();
  }, 6000);
  /*
  test("login forgot username click", async (done) => {
    await page.click(".ForgotUsernameButton");
    const forgotPasswordTitle = i18nTranslate.__("resetPasswordTitle");
    const checkTitle = await checkThis(page, "body", forgotPasswordTitle, 3000);
    expect(checkTitle).toBe(true);
    await page.click(".BackButton");
    done();
  }, 6000);
*/
});

afterAll(() => {
  if (isDebugging()) {
    //browser.close();
  }
});

process.on("unhandledRejection", (reason) => {
  console.log("DEBUG: " + reason);
});
