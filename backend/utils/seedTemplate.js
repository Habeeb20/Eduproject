


// backend/utils/letterTemplates.js
export const DEFAULT_LETTER_BODIES = {
  leave: {
    annual: `Dear {{adminName}},\n\nI am writing to formally request annual leave from {{startDate}} to {{endDate}}.\n\nThe reason for my leave is personal/vacation/family matters.\n\nI have made arrangements for my classes to be covered during this period and will ensure all lesson plans and marking are up to date.\n\nThank you for your understanding.\n\nYours sincerely,\n{{teacherName}}`,

    sick: `Dear {{adminName}},\n\nI regret to inform you that I am unwell and require sick leave from {{startDate}} to {{endDate}} (medical certificate attached).\n\nI am under medical care and will keep you updated on my recovery.\n\nI have informed my colleagues and arranged for lesson coverage.\n\nThank you for your support.\n\nYours sincerely,\n{{teacherName}}`,

    maternity: `Dear {{adminName}},\n\nI am writing to formally request maternity leave from {{startDate}} to {{endDate}} as per my expected delivery date.\n\nI have completed all necessary documentation and arranged for substitute teaching.\n\nThank you for your support during this time.\n\nYours sincerely,\n{{teacherName}}`,
  },

  resignation: {
    standard: `Dear {{adminName}},\n\nI am writing to formally resign from my position as {{subjectTeacher}} at Lagos International School, effective {{lastWorkingDay}}.\n\nThis decision was not made lightly, and I am grateful for the opportunities and support I have received during my time here.\n\nI will do everything possible to ensure a smooth transition, including completing current responsibilities and assisting in handover.\n\nThank you once again for the valuable experience.\n\nYours sincerely,\n{{teacherName}}`,
  },

  report: {
    incident: `Dear {{adminName}},\n\nI wish to bring to your attention an incident that occurred on {{date}} involving {{description of incident}}.\n\nDetails:\n- Time: {{time}}\n- Location: {{location}}\n- Students/Staff involved: {{names}}\n- Witnesses: {{witnesses}}\n\nI believe this matter requires urgent attention and appropriate action.\n\nThank you.\n\nSincerely,\n{{teacherName}} (or Anonymous)`,

    suggestion: `Dear {{adminName}},\n\nI would like to respectfully suggest the following improvement to enhance teaching/learning at the school:\n\n{{suggestion details}}\n\nI believe this change would benefit students, staff, and the school community.\n\nThank you for considering this suggestion.\n\nSincerely,\n{{teacherName}} (or Anonymous)`,
  },
};