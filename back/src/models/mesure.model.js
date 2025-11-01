import mongoose from 'mongoose';

const mesureSchema = new mongoose.Schema({
  capteur_id: { type: mongoose.Schema.Types.ObjectId, ref: 'capteurs', required: true },
  type: { type: String, required: true, enum: ['temperature', 'humidite', 'luminosite' , "caz" ] },
  valeur: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false, collection: 'mesures' });

export default mongoose.model('Mesure', mesureSchema, 'mesures');