import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaste extends Document {
  userId?: string;
  s3Key: string;
  expiration?: Date;
  createdAt: Date;
}

const pasteSchema: Schema = new Schema({
  userId: { type: String, required: false }, 
  s3Key: { type: String, required: true },
  expiration: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now }
});

const Paste : Model<IPaste> = mongoose.model<IPaste>('Paste', pasteSchema);
export default Paste;
