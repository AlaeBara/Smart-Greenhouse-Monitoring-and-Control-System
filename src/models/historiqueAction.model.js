// Model: historique_actions — stores actions triggered by actuators
import mongoose from 'mongoose';

const historiqueActionSchema = new mongoose.Schema({
  actionneur_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Actionneur', required: true },
  type_action: { type: String, enum: ['Automatique', 'Manuel'], required: true },
  etat: { type: String, enum: ['ON', 'OFF'], required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false, collection: 'historique_actions' });

export default mongoose.model('HistoriqueAction', historiqueActionSchema, 'historique_actions');