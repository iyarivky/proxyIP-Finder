async function CountryASN(country,amount,totalPages,typeASN) {
  let allData = [];

  try {
    const promises = [];
    for (let i = 0; i <= totalPages; i++) {
      const url = `https://ipinfo.io/api/data/asns?country=${country}&amount=${amount}&page=${i}`;
      promises.push(fetch(url).then(response => response.json()));
    }

    const results = await Promise.all(promises);

    results.forEach(data => {
      const filteredData = data.filter(item => item.type === typeASN);
      allData = allData.concat(filteredData);
    });
    return allData;

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function fetchAllDataWithTiming(country, amount, totalPages) {
  console.time('fetchAllData');
  const data = await CountryASN(country, amount, totalPages);
  console.timeEnd('fetchAllData');
  return data;
}

fetchAllDataWithTiming("id", 20, 116, "hosting").then(dataID => {
  Bun.write("output.json", JSON.stringify(dataID, null, 2));
});