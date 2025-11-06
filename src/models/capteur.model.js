import mongoose from 'mongoose';

const capteurSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['DHT22', 'humidite_sol', 'luminosite', 'autre'] },
  unite: { type: String, required: true },
  emplacement: { type: String },
  date_installation: { type: Date },
  etat: { type: Boolean, default: true },
}, { timestamps: false, collection: 'capteurs' });

export default mongoose.model('Capteur', capteurSchema, 'capteurs');