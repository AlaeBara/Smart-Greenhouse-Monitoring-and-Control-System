import mongoose from 'mongoose';

const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mot_de_passe: { type: String, required: true },
  date_creation: { type: Date, default: Date.now },
}, { timestamps: false, collection: 'utilisateurs' });

export default mongoose.model('Utilisateur', utilisateurSchema, 'utilisateurs');