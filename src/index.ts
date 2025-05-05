import { chromium, Browser, Page, Locator } from "playwright";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.EMAIL || !process.env.PASSWORD) {
  throw new Error("EMAIL and PASSWORD must be set");
}

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface USCClass {
  url: (date: string) => string;
  weekday: string;
  time: string;
}

const CLASSES: Record<string, USCClass> = {
  POLE: {
    url: (date: string) =>
      `https://urbansportsclub.com/de/venues/redlightdance-wedding-1?date=${date}&plan_type=2`,
    weekday: "Thursday",
    time: "18:10—19:10",
  },
  PILATES: {
    url: (date: string) =>
      `https://urbansportsclub.com/de/venues/yoga4all-mitte?date=${date}&service_type=1`,
    weekday: "Monday",
    time: "18:00—18:45",
  },
};

async function login(page: Page) {
  await page.click(".usc-button-rebrand.login");
  await page.waitForSelector("#login-form", { state: "visible" });

  await page.fill("#login-form #email", EMAIL);
  await page.fill("#login-form #password", PASSWORD);

  await page.click("#login");

  await page.waitForSelector(".smm-header__menu-item.customer", {
    state: "visible",
  });
}

const getNextDate = (weekday: string) => {
  const today = new Date();
  const targetDay = WEEKDAYS.indexOf(weekday);
  const daysToAdd = (targetDay - today.getDay() + 7) % 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysToAdd);
  const date = targetDate.toISOString().split("T")[0];

  return date;
};

async function findTimeSlot(page: Page, classToBook: USCClass) {
  const timeSlots = page.locator(".smm-class-snippet__class-time");
  const count = await timeSlots.count();

  for (let i = 0; i < count; i++) {
    const slot = timeSlots.nth(i);
    const timeText = (await slot.textContent())?.replace(/\s+/g, "");

    if (timeText === classToBook.time) {
      await slot.scrollIntoViewIfNeeded();

      const container = slot
        .locator("..")
        .locator("..")
        .locator("..")
        .locator(".smm-class-snippet__image");

      await container.waitFor({ state: "visible" });
      await container.click();

      return container;
    }
  }
}

async function completeBooking(page: Page, container: Locator) {
  await container.click();
}

async function navigateToClass(page: Page, classToBook: USCClass) {
  const nextDate = getNextDate(classToBook.weekday);
  const bookingUrl = classToBook.url(nextDate);

  await page.goto(bookingUrl);
}

async function main() {
  const browser: Browser = await chromium.launch({
    headless: process.env.NODE_ENV !== "development",
  });

  try {
    console.log("Starting browser...");
    const page: Page = await browser.newPage();
    console.log("Browser started");

    console.log("Navigating to https://www.urbansportsclub.com...");
    await page.goto("https://www.urbansportsclub.com");
    console.log("Navigated to https://www.urbansportsclub.com");

    console.log("Logging in...");
    await login(page);
    console.log("Logged in");

    const classToBook = CLASSES.POLE;
    console.log(
      `Navigating to ${classToBook.url(getNextDate(classToBook.weekday))}...`
    );
    await navigateToClass(page, classToBook);
    console.log("Navigated to class");

    console.log("Finding time slot...");
    const container = await findTimeSlot(page, classToBook);
    if (!container) return;
    console.log("Found time slot");

    console.log("Completing booking...");
    await completeBooking(page, container);
    console.log("Booking completed");

    console.log("Taking screenshot...");
    await page.screenshot({ path: `${Date.now()}.png` });
    console.log("Screenshot taken");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
