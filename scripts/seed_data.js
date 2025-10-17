// Seed script: inserts initial data for Capteurs, Actionneurs, and one Utilisateur
// Run: node scripts/seed_data.js
// Requirements: .env must have DATA_BASE_UTL and (optionally) DB_NAME, JWT_SECRET

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../src/config/database.js';
import Capteur from '../src/models/capteur.model.js';
import Actionneur from '../src/models/actionneur.model.js';
import Utilisateur from '../src/models/utilisateur.model.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await connectDB();

    // 1) Seed Capteurs principaux
    const capteurs = [
      { type: 'DHT22', unite: 'C', emplacement: 'Serre A', etat: true, date_installation: new Date() },
      { type: 'humidite_sol', unite: '%', emplacement: 'Serre A', etat: true, date_installation: new Date() },
      { type: 'luminosite', unite: 'lux', emplacement: 'Serre A', etat: true, date_installation: new Date() },
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

    // 2) Seed Actionneurs principaux
    const actionneurs = [
      { nom: "Pompe d'irrigation", type: 'Irrigation', etat: 'OFF', date_installation: new Date() },
      { nom: 'Ventilateur', type: 'Ventilation', etat: 'OFF', date_installation: new Date() },
    ];

    const seededActionneurs = [];
    for (const a of actionneurs) {
      const doc = await Actionneur.findOneAndUpdate(
        { nom: a.nom },
        { $setOnInsert: a },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededActionneurs.push(doc);
      console.log(`Actionneur ready: ${doc.nom} (${doc.type}) -> _id=${doc._id}`);
    }

    // 3) Seed Utilisateur (name/email/password provided)
    const nom = 'fsa';
    const email = 'fsa@gmail.com';
    const mot_de_passe_plain = 'fsa123';

    let user = await Utilisateur.findOne({ email });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(mot_de_passe_plain, salt);
      user = await Utilisateur.create({ nom, email, mot_de_passe: hashed });
      console.log(`Utilisateur créé: ${user.nom} <${user.email}> -> _id=${user._id}`);
    } else {
      console.log(`Utilisateur déjà existant: ${user.nom} <${user.email}> -> _id=${user._id}`);
    }

    console.log('\nRésumé:');
    console.log(`- Capteurs: ${seededCapteurs.map(c => c.type + ' @ ' + c.emplacement).join(', ')}`);
    console.log(`- Actionneurs: ${seededActionneurs.map(a => a.nom + ' (' + a.type + ')').join(', ')}`);
    console.log(`- Utilisateur: ${user.nom} <${user.email}>`);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();