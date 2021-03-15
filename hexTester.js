function expectedBlend(color1, color2) {
  let newColor = '#';
  for (let i = 1; i < color1.length; i += 2) {
    const partialAsInt1 = parseInt(color1[i] + color1[i+1], 16);
    const partialAsInt2 = parseInt(color2[i] + color2[i+1], 16);
    newColor += Math.floor((partialAsInt1 + partialAsInt2)/2).toString(16).padStart(2, '0').toUpperCase();
  }
  return newColor;
}

function simpleBlend(color1, color2) {
  const asInt1 = parseInt(color1.slice(1), 16);
  const asInt2 = parseInt(color2.slice(2), 16);
  return '#' + Math.floor((asInt1 + asInt2) / 2).toString(16).padStart(6, '0').toUpperCase();
}

const black = '#000000';
const white = '#FFFFFF';
const green = '#00FF00';
const pink = '#EE1133';

console.log(white, black, expectedBlend(white, black), simpleBlend(white, black));
console.log(white, pink, expectedBlend(white, pink), simpleBlend(white, pink));
console.log(black, pink, expectedBlend(black, pink), simpleBlend(black, pink));
console.log(black, green, expectedBlend(black, green), simpleBlend(black, green));
