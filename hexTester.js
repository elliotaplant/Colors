const max = parseInt("FFFFFF", 16);

for (let i = 0; i <= max; i++) {
  const hexValue = "#" + i.toString(16).padStart(6, "0");
  console.log('hexValue', hexValue);
}
