import User from '../models/User.js';

const checkAdminRole = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: 'Error when checking role',
    });
  }
};

export default checkAdminRole;
