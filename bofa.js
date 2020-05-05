const bofaRegex = /\bBOFA\b/gi;

exports.test = (msg) => {
  return bofaRegex.test(msg.cleanContent);
};

exports.handle = (msg) => {
  try {
    msg.reply('BOFA DEEZ NUTZ');
  }
  catch {}
};