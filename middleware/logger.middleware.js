// холболтыг шалгах код. өөрийн бичсэн, одоо Morgan тай хамт ашиглаж байгаа
const logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.protocol}://${req.hostname}${req.originalUrl}`
  );
  next();
};

module.exports = logger;
