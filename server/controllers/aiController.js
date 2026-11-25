const { analyzeCampusComplaint } = require('../services/geminiService');

exports.classifyComplaint = async (req, res) => {
  const { title, description } = req.body;

  if (typeof title !== 'string' || typeof description !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'A complaint title and description are required.',
    });
  }

  const cleanTitle = title.trim();
  const cleanDescription = description.trim();
  if (!cleanTitle && !cleanDescription) {
    return res.status(400).json({
      success: false,
      message: 'Enter a complaint title or description to analyze.',
    });
  }

  if (cleanTitle.length > 200 || cleanDescription.length > 8000) {
    return res.status(400).json({
      success: false,
      message: 'The title or description exceeds the allowed length.',
    });
  }

  try {
    const analysis = await analyzeCampusComplaint(cleanTitle, cleanDescription);
    return res.status(200).json({ success: true, analysis });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.publicMessage || 'AI classification failed.',
    });
  }
};
