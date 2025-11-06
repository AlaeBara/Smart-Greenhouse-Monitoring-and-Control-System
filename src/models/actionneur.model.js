import mongoose from 'mongoose';

const actionneurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  type: { type: String, required: true },
  etat: { type: String, enum: ['ON', 'OFF'], default: 'OFF' },
  date_installation: { type: Date },
  derniere_activation: { type: Date },
}, { timestamps: false, collection: 'actionneurs' });

export default mongoose.model('Actionneur', actionneurSchema, 'actionneurs');