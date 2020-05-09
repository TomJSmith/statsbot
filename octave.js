module.exports.listeners = [
  { event: 'message', handler: handle }
];

const octave = /^_/g;

function handle(msg) {
  try {
    if (msg.author.bot || !octave.lastIndex(msg.cleanContent))
      return;

    if (msg.channel.name != 'skynet')
      msg.reply('Hey! this goes in the bot channel!');
  }
  catch(e) {
    console.log(e);
  }
}
