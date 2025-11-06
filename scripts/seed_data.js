// Seed script: inserts initial Capteurs (DHT22, humidité_sol, luminosité, MQ2)
// Run: node scripts/seed_data.js

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../src/config/database.js';
import Capteur from '../src/models/capteur.model.js';

async function seed() {
  try {
    await connectDB();

    // 1) Capteurs principaux
    const capteurs = [
      { type: 'DHT22', unite: 'C', emplacement: 'Serre A', etat: true, date_installation: new Date() },
      { type: 'humidite_sol', unite: '%', emplacement: 'Serre A', etat: true, date_installation: new Date() },
      { type: 'luminosite', unite: 'lux', emplacement: 'Serre A', etat: true, date_installation: new Date() },
      { type: 'MQ2', unite: 'ppm', emplacement: 'Serre A', etat: true, date_installation: new Date() },
    ];

    const seededCapteurs = [];

    for (const c of capteurs) {
      const doc = await Capteur.findOneAndUpdate(
        { type: c.type, emplacement: c.emplacement },
        { $setOnInsert: c },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededCapteurs.push(doc);
      console.log(`Capteur ready: ${doc.type} @ ${doc.emplacement} -> _id=${doc._id}`);
    }

    console.log('\nRésumé:');
    console.log(`- Capteurs: ${seededCapteurs.map(c => `${c.type} @ ${c.emplacement}`).join(', ')}`);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
