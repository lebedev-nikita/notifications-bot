import { Hono } from "https://deno.land/x/hono@v4.1.4/mod.ts";
import { serveStatic } from "https://deno.land/x/hono@v4.1.4/middleware.ts";
import { Telegraf } from "npm:telegraf";

const hono = new Hono()
  .post("/sendMessage", async (ctx) => {
    try {
      let message: string | null = null;

      switch (ctx.req.header("content-type")) {
        case "application/json": {
          const body = await ctx.req.json();
          message = body.message;
          break;
        }
        case "application/x-www-form-urlencoded": {
          const body = await ctx.req.formData();
          const msg = body.get("message");
          if (typeof msg == "string") {
            message = msg;
          }
          break;
        }
      }

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
      return new Response(`Message "${message}" sent successfully`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  })
  .use("*", serveStatic({ root: "./static" }));

Deno.serve(hono.fetch);
