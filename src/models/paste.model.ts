import mongoose, { Schema, Document, Model } from "mongoose";

export enum Language {
  JAVASCRIPT = "javascript",
  C = "c",
  CPP = "cpp",
  CSHARP = "csharp",
  CSS = "css",
  DART = "dart",
  GO = "go",
  HASKELL = "haskell",
  HTML = "html",
  JAVA = "java",
  KOTLIN = "kotlin",
  LUA = "lua",
  OBJECTIVE_C = "objective-c",
  PERL = "perl",
  PHP = "php",
  PYTHON = "python",
  R = "r",
  RUBY = "ruby",
  RUST = "rust",
  SCALA = "scala",
  SQL = "sql",
  SWIFT = "swift",
  TEXT = "plain text",
  TYPESCRIPT = "typescript",
}
export enum Visibility {
  PUBLIC = "public",
  PRIVATE = "private",
  CUSTOM = "custom",
}

export interface IPaste extends Document {
  userId?: mongoose.Schema.Types.ObjectId;
  s3Key: string;
  title: string;
  language: string,
  visibility: string,
  authorizedEmails?: String[],
  expiration?: Date;
  createdAt: Date;
}

const pasteSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  s3Key: { type: String, required: true },
  title: { type: String },
  language: {
    type: String,
    enum: Language,
    default: Language.TEXT,
    required: true,
  },
  visibility: {
    type: String,
    enum: Visibility,
    default: Visibility.PUBLIC,
    required: true,
  },
  authorizedEmails: { type: [String] },
  expiration: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now },
});

const Paste: Model<IPaste> = mongoose.model<IPaste>("Paste", pasteSchema);
export default Paste;
