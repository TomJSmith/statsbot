export { test, handle };

const bofaRegex = /\bBOFA\b/gi;

function test(msg) {
  return bofaRegex.test(msg.cleanContent);
}

function handle(msg) {
  try {
    msg.reply('BOFA DEEZ NUTZ');
  }
  catch {}
}