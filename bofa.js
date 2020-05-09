module.exports.listeners = [
  { event: 'message', handler: handle }
];

const bofaRegex = /\bBOFA\b/gi;

function handle(msg) {
  try {
    if (this.msg.bot || !bofaRegex.test(msg.cleanContent))
      return;

    msg.reply('BOFA DEEZ NUTZ');
  }
  catch(e) {
    console.log(e);
  }
}