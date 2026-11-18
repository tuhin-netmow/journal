import { Types } from "mongoose";

export type ManuscriptStatus =
  | "submitted"
  | "under_review"
  | "revision_requested"
  | "accepted"
  | "rejected"
  | "published";

export type PaymentStatus = "not_required" | "pending" | "paid" | "waived";

export interface IPdfFile {
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface ICoAuthor {
  name: string;
  affiliation?: string;
  email?: string;
}

export interface IUser {
  _id?: string | Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin";
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IManuscript {
  _id?: string | Types.ObjectId;
  submissionId: string;
  authorName: string;
  authorEmail: string;
  authorPhone?: string;
  institution: string;
  department?: string;
  country: string;
  title: string;
  manuscriptType: string;
  category: string;
  abstract: string;
  keywords: string[];
  coAuthors: ICoAuthor[];
  pdfFile: IPdfFile;
  status: ManuscriptStatus;
  paymentStatus: PaymentStatus;
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IArticle {
  _id?: string | Types.ObjectId;
  title: string;
  slug: string;
  authors: ICoAuthor[];
  abstract: string;
  keywords: string[];
  category: string;
  volume: Types.ObjectId | any;
  issue: Types.ObjectId | any;
  publicationDate?: Date;
  pdfFile?: IPdfFile;
  doi?: string;
  status: "draft" | "published";
  sourceManuscript?: Types.ObjectId | any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVolume {
  _id?: string | Types.ObjectId;
  volumeNumber: number;
  year: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IIssue {
  _id?: string | Types.ObjectId;
  issueNumber: number;
  volume: Types.ObjectId | any;
  title: string;
  description?: string;
  coverImage?: string;
  publicationDate?: Date;
  status: "draft" | "published";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEditorialBoard {
  _id?: string | Types.ObjectId;
  name: string;
  academicTitle?: string;
  role: string;
  institution: string;
  country?: string;
  specialization?: string;
  photo?: string;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJournalSettings {
  _id?: string | Types.ObjectId;
  journalName: string;
  shortName?: string;
  issn?: string;
  publisherName?: string;
  description?: string;
  publicationFrequency?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  paymentFee?: number;
  paymentCurrency?: string;
  paymentProvider?: string;
  paymentLink?: string;
  paymentQrCode?: string;
  paymentInstructions?: string;
}

export interface IPageContent {
  _id?: string | Types.ObjectId;
  pageKey: string;
  title?: string;
  content: string;
  updatedAt?: Date;
}

export interface IContactMessage {
  _id?: string | Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt?: Date;
}
