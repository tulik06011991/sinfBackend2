


const jwt = require('jsonwebtoken');
const Answer = require('../Model/Javoblar'); // Foydalanuvchilar natijalari model
const Question = require('../Model/questionModel'); // Savollar model

const Subject = require('../Model/Fanlar');
 const Option = require('../Model/hammasi');
 const Results = require('../Model/pdf');


// Admin tokenini tekshirish funksiyasi
const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token topilmadi.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Sizda ushbu amalni bajarish huquqi yo\'q.' });
        }
        req.userId = decoded.id; // Admin ID
        next();
    });
};

// Fan bo'yicha ma'lumotlarni olish va natijalarni hisoblash
const getSubjectDetails = async (req, res) => {
    try {
        const subjectId = req.params.subjectId; // URL'dan subjectId olindi

        // subjectId bo'yicha foydalanuvchilarning javoblarini olish
        const answers = await Answer.find({ subjectId }) // Faqat subjectId bo'yicha javoblar olindi
            .populate('userId', 'name') // Foydalanuvchining ismi
            .populate({
                path: 'questionId',
                populate: {
                    path: 'subject', // Savolning fani haqida ham ma'lumot olamiz
                    model: 'Subject'
                }
            }); // Javoblar bilan bog'liq savollarni olish va populate qilish

        // Agar javoblar topilmasa
        if (!answers.length) {
            return res.status(404).json({ message: 'Subject bo\'yicha javoblar topilmadi.' });
        }

        // Har bir foydalanuvchining natijalarini saqlash uchun array
        const userResults = [];
        const allQuestionsWithOptions = []; // Barcha savollar va variantlar
        const addedQuestionIds = new Set(); // Takrorlanishni oldini olish uchun savol ID'larni saqlash

        // Foydalanuvchilarni takrorlanmas qilib olish (unique)
        const users = [...new Set(answers.map(answer => answer.userId._id.toString()))]; // Foydalanuvchilarning unique ro'yxati

        // Har bir foydalanuvchining javoblarini hisoblash
        for (let userId of users) {
            // Shu foydalanuvchining subjectId bo'yicha barcha javoblarini olish
            const userAnswers = answers.filter(answer => answer.userId._id.toString() === userId);

            let correctAnswersCount = 0;

            // Har bir foydalanuvchi javobini to'g'ri javob bilan solishtiramiz
            for (let userAnswer of userAnswers) {
                const question = userAnswer.questionId; // Savolni olamiz
                const selectedOption = userAnswer.selectedOption; // Foydalanuvchining tanlagan varianti
                const correctAnswer = question.correctAnswer; // To'g'ri javob

                // Agar savol ID allaqachon to'plamga qo'shilmagan bo'lsa, uni qo'shamiz
                if (!addedQuestionIds.has(question._id.toString())) {
                    allQuestionsWithOptions.push({
                        questionId: question._id,
                        questionText: question.question, // questionModel'dagi savol
                        options: question.options, // Variantlar (text va isCorrect)
                        selectedOption: selectedOption,
                        correctAnswer: correctAnswer,
                        subject: question.subject, // Savolning fani
                        userId: userAnswer.userId._id, // Savolga javob bergan foydalanuvchi ID'si
                        userName: userAnswer.userId.name // Foydalanuvchi nomi
                    });
                    // Takrorlanmasligini ta'minlash uchun savol ID'sini to'plamga qo'shamiz
                    addedQuestionIds.add(question._id.toString());
                }

                // Agar tanlangan variant to'g'ri javobga mos kelsa, ball qo'shamiz
                if (selectedOption === correctAnswer) {
                    correctAnswersCount++;
                }
            }

            // Foydalanuvchi ma'lumotlarini yig'ish
            const totalQuestions = userAnswers.length; // Foydalanuvchi javob bergan savollar soni
            const correctPercentage = totalQuestions > 0 ? ((correctAnswersCount / totalQuestions) * 100).toFixed(2) : 0; // To'g'ri javoblar foizi

            userResults.push({
                userId: userAnswers[0].userId._id,
                userName: userAnswers[0].userId.name,
                totalQuestions,
                correctAnswersCount,
                correctPercentage
            });
        }

        // Foydalanuvchilarning natijalarini va savollarni alohida qaytarish
        res.status(200).json({
            subjectId,
            userResults, // Foydalanuvchilar natijalari
            questionsWithOptions: allQuestionsWithOptions // Savollar va ularning variantlari
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ma\'lumotlarni olishda xatolik yuz berdi.' });
    }
};



const deleteQuestion = async (req, res) => {
    const subjectId = req.params.fanId;
    
    console.log(subjectId)
    // URL dan subjectId ni olish

  try {
    // `subject` maydoni bo'yicha barcha savollarni o'chirish
    const result = await Question.deleteMany({ subject: subjectId });

    if (result.deletedCount > 0) {
      // Agar savollar o'chirilgan bo'lsa
      console.log(`${result.deletedCount} ta savol o'chirildi.`);
      return res.status(200).json({
        message: `${result.deletedCount} ta savol muvaffaqiyatli o'chirildi.`,
      });
    } else {
      // O'chiriladigan savollar topilmasa
      console.log(`Savollar topilmadi.`);
      return res.status(404).json({
        message: 'O\'chiriladigan savollar topilmadi.',
      });
    }
  } catch (error) {
    // Xatolik yuz berganda
    console.error("Xatolik:", error);
    return res.status(500).json({
      message: 'Serverda xatolik yuz berdi.',
      error: error.message,
    });
  }
  };


const deleteResult = async (req, res) => {
    const { id } = req.params; // userId ni req.params dan olamiz
   

    try {
        // Natijani userId bo'yicha o'chirish
        const result = await Answer.deleteMany({ userId: id }); // userId ga tegishli barcha natijalarni o'chiradi

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Natija topilmadi.' }); // 404 - Not Found, agar o'chiriladigan natija topilmasa
        }

        res.status(200).json({ message: 'Foydalanuvchiga tegishli barcha natijalar muvaffaqiyatli o\'chirildi.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'O\'chirishda xatolik yuz berdi.' });
    }
};




module.exports = {
    verifyAdminToken,
    getSubjectDetails,
    deleteQuestion,
    deleteResult,
};















































