// Script to add test measurements for all sensors including MQ2
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../src/config/database.js';
import Capteur from '../src/models/capteur.model.js';
import Mesure from '../src/models/mesure.model.js';

async function addTestMeasures() {
  try {
    await connectDB();

    // Get all sensors
    const capteurs = await Capteur.find();
    console.log(`Found ${capteurs.length} sensors`);

    // Create test measurements for each sensor
    for (const capteur of capteurs) {
      let mesureType, valeur;

      // Map sensor type to measurement type and generate realistic value
      switch (capteur.type) {
        case 'DHT22':
          mesureType = 'temperature';
          valeur = 20 + Math.random() * 5; // 20-25°C
          break;
        case 'humidite_sol':
          mesureType = 'humidite';
          valeur = 50 + Math.random() * 20; // 50-70%
          break;
        case 'luminosite':
          mesureType = 'luminosite';
          valeur = 500 + Math.random() * 300; // 500-800 lux
          break;
        case 'MQ2':
          mesureType = 'gaz';
          valeur = 100 + Math.random() * 100; // 100-200 ppm (safe range)
          break;
        default:
          console.log(`Unknown sensor type: ${capteur.type}`);
          continue;
      }

      const mesure = await Mesure.create({
        capteur_id: capteur._id,
        type: mesureType,
        valeur: Number(valeur.toFixed(2)),
        timestamp: new Date()
      });

      console.log(`✅ Created ${mesureType} measurement for ${capteur.type}: ${mesure.valeur}${capteur.unite}`);
    }

    console.log('\n🎉 Test measurements added successfully!');
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addTestMeasures();