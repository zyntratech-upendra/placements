const Folder = require('../models/Folder');
const File = require('../models/File');

exports.createFolder = async (req, res) => {
  try {
    const { name, companyName, description } = req.body;

    const folder = await Folder.create({
      name,
      companyName,
      description,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.find()
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: folders.length,
      folders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getFolderById = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    const files = await File.find({ folder: folder._id })
      .populate('uploadedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      folder,
      files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateFolder = async (req, res) => {
  try {
    const { name, companyName, description } = req.body;

    let folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    folder = await Folder.findByIdAndUpdate(
      req.params.id,
      { name, companyName, description },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Folder updated successfully',
      folder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    await File.deleteMany({ folder: folder._id });
    await Folder.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Folder and associated files deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
