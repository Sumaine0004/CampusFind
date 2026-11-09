const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Item = require("./models/item");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to the existing local MongoDB database configured in backend/.env.
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });

app.get("/", (req, res) => {
    res.send("CampusFind backend is running!");
});

// READ: return every item, newest reports first.
app.get("/api/items", async (req, res) => {
    try {
        const items = await Item.find().sort({ dateReported: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Could not retrieve items." });
    }
});

// READ: return one item by its MongoDB ID.
app.get("/api/items/:id", async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found." });
        res.json(item);
    } catch (error) {
        const status = error.name === "CastError" ? 400 : 500;
        res.status(status).json({ message: status === 400 ? "Invalid item ID." : "Could not retrieve item." });
    }
});

// CREATE: validate and save a new item.
app.post("/api/items", async (req, res) => {
    try {
        const item = await Item.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        const status = error.name === "ValidationError" || error.name === "CastError" ? 400 : 500;
        res.status(status).json({ message: status === 400 ? error.message : "Could not create item." });
    }
});

// UPDATE: change only the fields supplied by the caller.
app.put("/api/items/:id", async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            overwrite: false
        });
        if (!item) return res.status(404).json({ message: "Item not found." });
        res.json(item);
    } catch (error) {
        const status = error.name === "ValidationError" || error.name === "CastError" ? 400 : 500;
        res.status(status).json({ message: status === 400 ? error.message : "Could not update item." });
    }
});

// DELETE: remove one item by its MongoDB ID.
app.delete("/api/items/:id", async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found." });
        res.json({ message: "Item deleted successfully.", item });
    } catch (error) {
        const status = error.name === "CastError" ? 400 : 500;
        res.status(status).json({ message: status === 400 ? "Invalid item ID." : "Could not delete item." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
