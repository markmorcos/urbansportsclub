import { chromium, Browser, Page } from "playwright";

import { CLASSES } from "./constants";
import { getConfig } from "./config";
import { Klass } from "./types";
import { getUpcomingClassDates } from "./util";
import { redisClient } from "./redis";

async function login(page: Page) {
  await page.click(".usc-button-rebrand.login");
  await page.waitForSelector("#login-form", { state: "visible" });

  await page.fill("#login-form #email", process.env.EMAIL!);
  await page.fill("#login-form #password", process.env.PASSWORD!);

  const consentButton = page.locator("#onetrust-accept-btn-handler");
  if (await consentButton.isVisible()) {
    await consentButton.click();
  }

  await page.click("#login");

  await page.waitForSelector(".smm-header__menu-item.customer", {
    state: "visible",
  });
}

async function findTimeSlot(page: Page, klass: Klass) {
  const timeSlots = page.locator(".smm-class-snippet__class-time");
  const count = await timeSlots.count();

  for (let i = 0; i < count; i++) {
    const slot = timeSlots.nth(i);
    const timeText = (await slot.textContent())?.replace(/\s+/g, "");

    if (timeText === klass.time) {
      await slot.scrollIntoViewIfNeeded();

      const container = slot
        .locator("..")
        .locator("..")
        .locator("..")
        .locator(".smm-class-snippet__image");

      await container.waitFor({ state: "visible" });
      await container.click();

      return true;
    }
  }

  return false;
}

async function completeBooking(page: Page) {
  const bookingButton = page.locator(".smm-class-details__button.booking.book");
  await bookingButton.scrollIntoViewIfNeeded();
  if (await bookingButton.isVisible()) {
    await bookingButton.click();
  }

  await page.waitForSelector(".smm-class-details__button.booking.cancel", {
    state: "visible",
  });
}

async function navigateToClass(page: Page, klass: Klass, date: string) {
  const bookingUrl = klass.url(date);
  await page.goto(bookingUrl);
}

async function run(klass: Klass, date: string) {
  const { headless } = getConfig();
  const browser: Browser = await chromium.launch({ headless });

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

    console.log(`Navigating to ${klass.url(date)}...`);
    await navigateToClass(page, klass, date);
    console.log("Navigated to class");

    console.log("Finding time slot...");
    const found = await findTimeSlot(page, klass);
    if (!found) return;
    console.log("Found time slot");

    console.log("Completing booking...");
    await completeBooking(page);

    console.log(`Booking ${klass} on ${date} completed`);
    await redisClient.sAdd("usc", date);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await browser.close();
  }
}

export async function runAll() {
  for (const { klass, date } of getUpcomingClassDates(CLASSES)) {
    if (await redisClient.sIsMember("usc", date)) {
      console.log(`Already booked for ${date}, skipping...`);
      continue;
    }

    console.log(`Booking ${klass} on ${date}...`);
    await run(CLASSES[klass], date);
  }
}
