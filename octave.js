export { test, handle }
const octave = /^_/g;

function test(msg) {
  return octave.test(msg.cleanContent);
}

function handle(msg) {
  try {
    if (msg.channel.name != 'skynet')
      msg.reply('Hey! this goes in the bot channel!');
  }
  catch {}
}
