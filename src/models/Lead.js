import mongoose from "mongoose";

const ExcelDataSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    // Using Mixed type for flexibility
    data: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const ExcelData = mongoose.model("ExcelData", ExcelDataSchema);
