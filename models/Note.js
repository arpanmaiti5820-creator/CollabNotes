const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            required: true
        },

        folder: {
            type: String,
            default: "General"
        },

        favorite: {
            type: Boolean,
            default: false
        },

        favoriteBy: {
            type: [String],
            default: []
        },

        likedBy: {
            type: [String],
            default: []
        },

        ownerEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        visibility: {
            type: String,
            enum: ["public", "private"],
            default: "private"
        },

        updatedAt: {
            type: String,
            default: "Just now"
        },

        trashed: {
            type: Boolean,
            default: false
        },

        trashedAt: {
            type: Date,
            default: null
        },

        file: {
            name: {
                type: String
            },

            type: {
                type: String
            },

            url: {
                type: String
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Note", noteSchema);