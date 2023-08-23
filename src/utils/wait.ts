export const wait = async (time = 1000) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
