#!/usr/bin/env node
/**
 * Project-level hook: chatbot-voice-greeting
 * Trigger: When the user clicks the IT Assistant chatbot widget.
 * Action: Generates the voice message "I am your IT assistant, how can I help you?"
 */

import { execFileSync } from "node:child_process";
import process from "node:process";

const VOICE_MESSAGE = "I am your IT assistant, how can I help you?";

function speakMessage(text) {
  if (process.platform === "win32") {
    const psScript = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Speak('${text.replace(/'/g, "''")}'); $s.Dispose()`;
    execFileSync("powershell", ["-NoProfile", "-Command", psScript], {
      stdio: "ignore",
      timeout: 15000,
    });
    return "windows-sapi";
  }
  if (process.platform === "darwin") {
    execFileSync("say", [text], { stdio: "ignore", timeout: 15000 });
    return "macos-say";
  }
  execFileSync("espeak", [text], { stdio: "ignore", timeout: 15000 });
  return "linux-espeak";
}

async function readStdinWithTimeout(ms = 150) {
  if (process.stdin.isTTY) return "";
  return new Promise((resolve) => {
    const chunks = [];
    const timer = setTimeout(() => {
      process.stdin.pause();
      resolve(Buffer.concat(chunks).toString("utf8").trim());
    }, ms);
    process.stdin.on("data", (c) => chunks.push(c));
    process.stdin.on("end", () => {
      clearTimeout(timer);
      resolve(Buffer.concat(chunks).toString("utf8").trim());
    });
    process.stdin.on("error", () => {
      clearTimeout(timer);
      resolve("");
    });
    process.stdin.resume();
  });
}

async function main() {
  let payload = {};
  try {
    const raw = await readStdinWithTimeout(150);
    if (raw) payload = JSON.parse(raw);
  } catch {
    // Ignore malformed or empty stdin
  }

  const message =
    typeof payload.voiceMessage === "string" && payload.voiceMessage.trim()
      ? payload.voiceMessage.trim()
      : VOICE_MESSAGE;

  try {
    const engine = speakMessage(message);
    process.stdout.write(
      JSON.stringify({
        hook: "chatbot-voice-greeting",
        event: payload.event || "chatbot_click",
        voiceMessage: message,
        engine,
        status: "spoken",
      }) + "\n"
    );
  } catch (err) {
    process.stdout.write(
      JSON.stringify({
        hook: "chatbot-voice-greeting",
        event: payload.event || "chatbot_click",
        voiceMessage: message,
        status: "fallback",
        error: err instanceof Error ? err.message : String(err),
      }) + "\n"
    );
  }
}

main();
