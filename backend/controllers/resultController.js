// controllers/resultController.js
import Result from '../models/class/resultModel.js';
import User from '../models/User.js';
import Class from '../models/class/classModel.js';

import 'colors';

// TEACHER ENTERS RESULT
export const enterResult = async (req, res) => {
  const { studentId, subject, term, session, scores, weights } = req.body;
  const teacher = req.user;

  try {
    let result = await Result.findOne({
      student: studentId,
      subject,
      term,
      session
    });

    if (result) {
      // Update
      Object.assign(result, scores);
      if (weights) result.weights = weights;
      result.enteredBy = teacher._id;
    } else {
      // Create new
      result = new Result({
        student: studentId,
        subject,
        term,
        session,
        class: (await User.findById(studentId)).currentClass,
        enteredBy: teacher._id,
        ...scores,
        weights
      });
    }

    await result.save();

    console.log(`RESULT ENTERED → ${result.studentId} | ${subject} | ${result.total} (${result.grade})`.yellow.bold);

    res.json({
      success: true,
      message: "Result saved successfully!",
      result: {
        total: result.total,
        grade: result.grade,
        published: result.published
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUBLISH RESULT
export const publishResult = async (req, res) => {
  const { resultId } = req.body;

  try {
    const result = await Result.findById(resultId);
    if (!result) return res.status(404).json({ success: false, message: "Result not found" });

    result.published = true;
    result.publishedAt = new Date();
    await result.save();

    console.log(`RESULT PUBLISHED → ${result.studentId} ${result.subject} ${result.grade}`.bgGreen.white.bold);

    res.json({ success: true, message: "Result published! Parents can now see it." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// STUDENT SEES THEIR RESULTS
export const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({
      student: req.user._id,
      published: true
    }).sort({ term: 1, subject: 1 });

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PARENT SEES CHILD'S RESULTS
export const getChildResults = async (req, res) => {
  try {
    const children = await User.find({ parent: req.user._id, role: 'student' });
    const childIds = children.map(c => c._id);

    const results = await Result.find({
      student: { $in: childIds },
      published: true
    })
    .populate('student', 'name studentId')
    .sort({ term: 1 });

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// TEACHER ENTERS OR UPDATES RESULT
export const saveResult = async (req, res) => {
  const { resultId, studentId, subject, term, session, scores, weights } = req.body;
  const teacher = req.user;

  try {
    let result;

    if (resultId) {
      // EDIT EXISTING RESULT
      result = await Result.findById(resultId);
      if (!result) {
        return res.status(404).json({ success: false, message: "Result not found" });
      }

      // Security: Only the teacher who entered it can edit (or admin)
      if (!result.enteredBy.equals(teacher._id) && teacher.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: "You can only edit results you entered!" 
        });
      }

      // Allow editing even after publish? No — block if published
      if (result.published) {
        return res.status(400).json({ 
          success: false, 
          message: "Cannot edit published result! Unpublish first." 
        });
      }

      // Update fields
      Object.assign(result, {
        ...scores,
        weights: weights || result.weights,
        enteredBy: teacher._id
      });

      console.log(`RESULT UPDATED → ${result.studentId} | ${subject} | New Total: ${result.total} (${result.grade})`.yellow.bold);

    } else {
      // CREATE NEW RESULT
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        return res.status(404).json({ success: false, message: "Student not found" });
      }

      result = new Result({
        student: studentId,
        studentId: student.studentId,
        class: student.currentClass,
        subject,
        term,
        session,
        enteredBy: teacher._id,
        ...scores,
        weights
      });
    }

    await result.save();

    res.json({
      success: true,
      message: resultId ? "Result updated successfully!" : "Result saved successfully!",
      result: {
        _id: result._id,
        total: result.total,
        grade: result.grade,
        published: result.published
      }
    });

  } catch (error) {
    console.error("Save Result Error:".red, error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// TEACHER DELETES RESULT (Only before publishing)
export const deleteResult = async (req, res) => {
  const { resultId } = req.params;
  const teacher = req.user;

  try {
    const result = await Result.findById(resultId);
    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    // Only owner or admin can delete
    if (!result.enteredBy.equals(teacher._id) && teacher.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own results!" 
      });
    }

    if (result.published) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete published result!" 
      });
    }

    await Result.findByIdAndDelete(resultId);

    console.log(`RESULT DELETED → ${result.studentId} | ${result.subject} by ${teacher.name}`.red.bold);

    res.json({ success: true, message: "Result deleted successfully!" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UNPUBLISH RESULT (So teacher can edit again)
export const unpublishResult = async (req, res) => {
  const { resultId } = req.body;
  const teacher = req.user;

  try {
    const result = await Result.findById(resultId);
    if (!result) return res.status(404).json({ success: false, message: "Result not found" });

    if (!result.enteredBy.equals(teacher._id) && teacher.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    result.published = false;
    result.publishedAt = null;
    await result.save();

    console.log(`RESULT UNPUBLISHED → ${result.subject} | ${result.studentId}`.gray.bold);

    res.json({ success: true, message: "Result unpublished. You can now edit." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};