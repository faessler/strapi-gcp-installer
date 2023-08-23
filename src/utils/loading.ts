// export const loading = (() => {
//   var P = ["\\", "|", "/", "-"];
//   var x = 0;
//   return setInterval(function () {
//     process.stdout.write(`\r${P[x++]} Checking prerequisites`);
//     x &= 3;
//   }, 250);
// })();

// export const resolved = (() => clearInterval(loading))();

export const loading = (text?: string) => {
  const stdout = process.stdout;
  const animation = (() => {
    var P = ["\\", "|", "/", "-"];
    var x = 0;
    return setInterval(function () {
      stdout.write(`\r${P[x++]} Checking prerequisites`);
      x &= 3;
    }, 250);
  })();

  const success = () => {
    clearInterval(animation);
    stdout.write("✅ Checking prerequisites");
  };

  const failure = () => {
    clearInterval(animation);
    stdout.write("❌ Checking prerequisites");
  };
  return {
    success,
    failure,
  };
};
