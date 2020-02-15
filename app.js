const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const urls = {
    base: 'https://www.smogon.com/',
    stats: 'stats/'
}

getCurrentMonthUrl = async () => {
    try {
        const res = await axios.get(urls.base + urls.stats);
        const $ = cheerio.load(res.data);
        const monthPath = $('a').last().attr('href');
        return urls.base + urls.stats + monthPath;
    } catch(error) {
        console.log(error);
    }
}

getRankFileUrl = async () => {
    try {
        const currentMonthUrl = await getCurrentMonthUrl();
        const res = await axios.get(currentMonthUrl);
        let $ = cheerio.load(res.data);
        const rankFile = $('a').last().attr('href');
        return currentMonthUrl + rankFile;
    } catch(error) {
        console.log(error)
    }
}

getRanks = async () => {
    try {
        const rankFileUrl = await getRankFileUrl();
        const res = await axios.get(rankFileUrl);
        return res.data;
    } catch(error) {
        console.log(error);
    }
}

createObjectFromFile = (file) => {
    const fileArr = file.split("\n");
    const regex = new RegExp('[!@#$^&*(),?"+{}<>]|(-){2,}|( )', 'g');
    const newArr = []
    fileArr.forEach(line => {
        const pipeSeparatedArr = line.replace(regex, '').split('|');
        const noEmptyVal = pipeSeparatedArr.filter(item => item !== '');
        if (noEmptyVal.length > 1) {
            const keys = [ 'rank', 'pokemon', 'usagePercentage', 'raw', 'rawPercent', 'real', 'realPercent' ];
            newArr.push( arrayToObject(keys, noEmptyVal) )
        }
    });
    return newArr
}

storeData = (data, path) => {
    try {
        fs.writeFileSync(path, JSON.stringify(data))
    } catch (error) {
        console.log(error)
    }
}

arrayToObject = (keys, values) => {
    return keys.reduce((obj, key, index) => ({ ...obj, [key]: values[index] }), {});
}

getRanks().then(res => {
    storeData(createObjectFromFile(res), './data/leaderboard.json');
})