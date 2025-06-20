const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// **ROUTING ORDER FIX**
// More specific routes should come before dynamic routes like /:id

// Get recent pets (last 8 pets)
router.get('/recent', async (req, res) => {
  try {
    const pets = await Pet.find()
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(8);
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent pets', error: error.message });
  }
});

// Get featured pets (random 6 pets)
router.get('/featured', async (req, res) => {
  try {
    const pets = await Pet.aggregate([
      { $sample: { size: 6 } }
    ]);
    
    // Populate owner information
    const populatedPets = await Pet.populate(pets, {
      path: 'owner',
      select: 'name email phone'
    });
    
    res.json(populatedPets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured pets', error: error.message });
  }
});

// Get user's pets (my-listings endpoint)
router.get('/my-listings', auth, async (req, res) => {
  try {
    console.log('Fetching my-listings for user:', req.user._id);
    const pets = await Pet.find({ owner: req.user._id })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    console.log('Found pets:', pets.length);
    res.json(pets);
  } catch (error) {
    console.error('Error in my-listings:', error);
    res.status(500).json({ message: 'Error fetching user pets', error: error.message });
  }
});

// Get all pets with optional filters (handles search)
router.get('/search', async (req, res) => {
  try {
    const { type, age, size, search } = req.query;
    const filter = {};

    if (type) filter.type = type.toLowerCase();
    if (size) filter.size = size;

    if (age) {
      if (age === 'puppy') filter.age = { $lte: 1 };
      if (age === 'young') filter.age = { $gte: 1, $lte: 3 };
      if (age === 'adult') filter.age = { $gte: 3, $lte: 7 };
      if (age === 'senior') filter.age = { $gte: 7 };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pets = await Pet.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pets', error: error.message });
  }
});

// Get all pets with optional filters (general listing)
router.get('/', async (req, res) => {
  try {
    const { species, location, status } = req.query;
    const filter = {};

    if (species) filter.species = species;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (status) filter.status = status;

    const pets = await Pet.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pets', error: error.message });
  }
});

// Create new pet with image upload
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Creating pet with data:', req.body);
    console.log('Files uploaded:', req.files);
    
    const imageUrls = req.files ? req.files.map(file => file.path || file.url) : [];
    console.log('Image URLs:', imageUrls);
    
    const pet = new Pet({
      ...req.body,
      images: imageUrls,
      owner: req.user._id
    });

    console.log('Pet object to save:', pet);
    await pet.save();
    console.log('Pet saved successfully');
    
    res.status(201).json(pet);
  } catch (error) {
    console.error('Error creating pet:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error creating pet', error: error.message });
  }
});

// Get single pet BY ID - This MUST be after other specific GET routes
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('owner', 'name email phone');
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pet', error: error.message });
  }
});

// Update pet with image upload
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Check if user is the owner
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this pet' });
    }

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
      
      // Delete old images
      pet.images.forEach(imageUrl => {
        const imagePath = path.join(__dirname, '..', imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });

      req.body.images = newImageUrls;
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedPet);
  } catch (error) {
    // If there's an error, delete uploaded files
    if (req.files) {
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
    res.status(500).json({ message: 'Error updating pet', error: error.message });
  }
});

// Delete pet
router.delete('/:id', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Check if user is the owner
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this pet' });
    }

    // Delete associated images
    pet.images.forEach(imageUrl => {
      const imagePath = path.join(__dirname, '..', imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    // This method is deprecated, using deleteOne() instead.
    const result = await Pet.deleteOne({ _id: req.params.id });
    if(result.deletedCount === 0){
        return res.status(404).json({ message: 'Pet not found for deletion' });
    }

    res.json({ message: 'Pet removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting pet', error: error.message });
  }
});

module.exports = router; 