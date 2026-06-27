import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILinkItem {
  label: string;
  href: string;
}

export interface IPageContents {
  ourStory: string;
  theWeavers: string;
  care: string;
  shipping: string;
  returns: string;
  privacy: string;
  terms: string;
}

export interface ISiteConfig extends Document {
  trustItems: string[];
  footerShopLinks: ILinkItem[];
  footerHouseLinks: ILinkItem[];
  footerCareLinks: ILinkItem[];
  pageContents: IPageContents;
  createdAt: Date;
  updatedAt: Date;
}

const LinkItemSchema = new Schema<ILinkItem>(
  {
    label: { type: String, required: true },
    href:  { type: String, required: true },
  },
  { _id: false }
);

const PageContentsSchema = new Schema<IPageContents>(
  {
    ourStory:   { type: String, default: '' },
    theWeavers: { type: String, default: '' },
    care:       { type: String, default: '' },
    shipping:   { type: String, default: '' },
    returns:    { type: String, default: '' },
    privacy:    { type: String, default: '' },
    terms:      { type: String, default: '' },
  },
  { _id: false }
);

const SiteConfigSchema = new Schema<ISiteConfig>(
  {
    trustItems: {
      type: [String],
      default: [
        'Free shipping above ₹5,000',
        'Easy 15-day returns',
        'Secure payment',
        '100% authentic handloom',
      ],
    },
    footerShopLinks: {
      type: [LinkItemSchema],
      default: [],
    },
    footerHouseLinks: {
      type: [LinkItemSchema],
      default: [],
    },
    footerCareLinks: {
      type: [LinkItemSchema],
      default: [],
    },
    pageContents: {
      type: PageContentsSchema,
      default: () => ({ ourStory: '', theWeavers: '', care: '', shipping: '', returns: '', privacy: '', terms: '' }),
    },
  },
  { timestamps: true }
);

// In dev, delete the cached model so schema changes are picked up after hot reload
if (process.env.NODE_ENV !== 'production') {
  delete (mongoose.models as Record<string, unknown>).SiteConfig;
}

const SiteConfigModel: Model<ISiteConfig> =
  mongoose.models.SiteConfig ||
  mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);

export default SiteConfigModel;
