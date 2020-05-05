const octave = /^_/g;

exports.test = (msg) => {
  return octave.test(msg.cleanContent);
};

exports.handle = (msg) => {
  try {
    if (msg.channel.name != 'skynet')
      msg.reply('Hey! this goes in the bot channel!');
  }
  catch {}
};
