import { Hono } from "npm:hono";
import { Telegraf } from "npm:telegraf";

const hono = new Hono()
  .get("/", (ctx) => {
    return ctx.html(
      `Make POST request to /sendMessage with <code>{ "message": "test" }</code>`
    );
  })
  .post("/sendMessage", async (ctx) => {
    const message = await ctx.req.json().then((body) => body.message);

    if (typeof message != "string") {
      return new Response("typeof message != 'string'", { status: 400 });
    }

    const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_TOKEN");
    if (!TELEGRAM_TOKEN) {
      return new Response("Error: TELEGRAM_TOKEN not found", { status: 500 });
    }

    const CHAT_ID = Deno.env.get("CHAT_ID");
    if (!CHAT_ID) {
      return new Response("Error: CHAT_ID not found", { status: 500 });
    }

    const bot = new Telegraf(TELEGRAM_TOKEN);

    bot.telegram.sendMessage(CHAT_ID, message);
    return new Response(`Message "${message}" successfully sent`);
  });

Deno.serve(hono.fetch);
