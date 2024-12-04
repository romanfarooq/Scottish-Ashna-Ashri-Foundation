import mongoose from "mongoose";
import fs from "fs";
import xml2js from "xml2js";
import Surah from "../models/Surah.js";
import connectDB from "../config/db.js";

connectDB();

const XML_FILE = 'quran-simple.xml';

async function storeQuranInMongoDB() {
  try {
    const xmlData = fs.readFileSync(XML_FILE, 'utf8');
    const parser = new xml2js.Parser();
    const jsonData = await parser.parseStringPromise(xmlData);

    const suras = jsonData.quran.sura.map((sura) => ({
      surahNumber: parseInt(sura.$.index, 10),
      name: sura.$.name,
      ayat: sura.aya.map((aya, index) => ({
        ayahNumber: parseInt(aya.$.index, 10),
        text: index === 0 && aya.$.bismillah ? `${aya.$.bismillah} ${aya.$.text}` : aya.$.text, // Include Bismillah for the first Ayah
      })),
    }));

    await Surah.insertMany(suras);
    console.log('Quran data successfully inserted into MongoDB!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

storeQuranInMongoDB();