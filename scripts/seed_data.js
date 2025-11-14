// Seed script: inserts initial Actionneurs (Pompe d'irrigation, Ventilateur)
// Run: node scripts/seed_data.js

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../src/config/database.js';
import { connectPostgres, ensureTables, getPool } from '../src/config/postgres.js';
import Actionneur from '../src/models/actionneur.model.js';
import Utilisateur from '../src/models/utilisateur.model.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await connectDB();
    // Connect to Postgres (Neon) and ensure tables
    const pg = await connectPostgres();
    if (pg) await ensureTables();

    // Actionneurs (Pompe d'irrigation, Ventilateur)
    const actionneurs = [
      { nom: "Pompe d'irrigation", type: 'pompe', etat: 'OFF', date_installation: new Date(), derniere_activation: null },
      { nom: 'Ventilateur', type: 'ventilateur', etat: 'OFF', date_installation: new Date(), derniere_activation: null },
    ];

    const seededActionneurs = [];

    for (const a of actionneurs) {
      const doc = await Actionneur.findOneAndUpdate(
        { nom: a.nom, type: a.type },
        { $setOnInsert: a },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededActionneurs.push(doc);
      console.log(`Actionneur ready: ${doc.nom} (${doc.type}) -> _id=${doc._id}`);

      // Mirror into Postgres
      try {
        const pool = getPool();
        if (pool) {
          await pool.query(
            `INSERT INTO actionneurs (mongo_id, nom, type, etat, date_installation, derniere_activation)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (mongo_id) DO NOTHING`,
            [
              String(doc._id),
              doc.nom,
              doc.type,
              doc.etat || 'OFF',
              doc.date_installation || null,
              doc.derniere_activation || null,
            ]
          );
        }
      } catch (e) {
        console.error('Postgres insert (actionneurs) failed:', e.message);
      }
    }

    console.log('\nRésumé:');
    console.log(`- Actionneurs: ${seededActionneurs.map(a => `${a.nom} (${a.type})`).join(', ')}`);

    // Utilisateur unique (config via env or defaults)
    const seedUserNom = process.env.SEED_USER_NOM || 'Admin';
    const seedUserEmail = process.env.SEED_USER_EMAIL || 'admin@example.com';
    const seedUserPassword = process.env.SEED_USER_PASSWORD || 'admin123';

    // Upsert user into Mongo
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(seedUserPassword, salt);
    const userDoc = await Utilisateur.findOneAndUpdate(
      { email: seedUserEmail },
      { $setOnInsert: { nom: seedUserNom, email: seedUserEmail, mot_de_passe: hashed, date_creation: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Utilisateur prêt: ${userDoc.nom} <${userDoc.email}> -> _id=${userDoc._id}`);

    // Mirror user into Postgres
    try {
      const pool = getPool();
      if (pool) {
        await pool.query(
          `INSERT INTO utilisateurs (mongo_id, nom, email, mot_de_passe, date_creation)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (email) DO NOTHING`,
          [
            String(userDoc._id),
            userDoc.nom,
            userDoc.email,
            userDoc.mot_de_passe,
            userDoc.date_creation || new Date()
          ]
        );
      }
    } catch (e) {
      console.error('Postgres insert (utilisateurs) failed:', e.message);
    }
  } catch (err) {
    console.error('Seeding error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    // Close Postgres pool if connected
    try {
      const pool = getPool();
      if (pool) {
        await pool.end();
        console.log('Disconnected from Postgres');
      }
    } catch (_) {}
  }
}

seed();
