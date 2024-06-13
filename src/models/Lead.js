// import mongoose from "mongoose";

// const leadSchema = new mongoose.Schema({
//   created_time: {
//     type: Date,
//     required: true,
//   },
//   ad_id: String,
//   ad_name: String,
//   adset_id: String,
//   adset_name: String,
//   campaign_id: String,
//   campaign_name: String,
//   form_id: String,
//   form_name: String,
//   is_organic: Boolean,
//   platform: String,
//   full_name: String,
//   phone_number: String,
//   lead_status: String,
// });

// export const Lead = mongoose.model("Lead", leadSchema);

import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    campaign_name: String,
    form_id: String,
    form_name: String,
    is_organic: Boolean,
    platform: String,
    full_name: String,
    phone_number: String,
    lead_status: String,
  },
  { strict: false } // Allow dynamic fields
);

export const Lead = mongoose.model("Lead", leadSchema);
