const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// Maps each frontend `data-endpoint` (e.g. /api/newsletter) to a Supabase table
// and the fields that must be present and non-empty.
const FORM_CONFIG = {
  newsletter: { table: 'newsletter_subscribers', required: ['email'] },
  contact: { table: 'contact_messages', required: ['name', 'email', 'message'] },
  prayer: { table: 'prayer_requests', required: ['email', 'request'] },
  'bible-study': { table: 'bible_study_signups', required: ['name', 'email'] },
  mentorship: { table: 'mentorship_applications', required: ['name', 'email'] },
  volunteer: { table: 'volunteer_interest', required: ['name', 'email'] },
  testimony: { table: 'testimonies', required: ['story'] }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(config, body) {
  for (const field of config.required) {
    if (!body[field] || String(body[field]).trim() === '') {
      return `Missing required field: ${field}`;
    }
  }
  if (body.email && !EMAIL_RE.test(body.email)) {
    return 'Please provide a valid email address.';
  }
  return null;
}

router.post('/:formType', async (req, res) => {
  const { formType } = req.params;
  const config = FORM_CONFIG[formType];

  if (!config) {
    return res.status(404).json({ ok: false, error: `Unknown form type: ${formType}` });
  }

  // Honeypot spam trap — real users never fill in a hidden "website" field.
  if (req.body.website) {
    return res.status(200).json({ ok: true }); // pretend success, silently drop
  }

  const validationError = validate(config, req.body);
  if (validationError) {
    return res.status(400).json({ ok: false, error: validationError });
  }

  if (!supabase) {
    return res.status(503).json({
      ok: false,
      error: 'Backend is not yet connected to a database. Add SUPABASE_URL and SUPABASE_SERVICE_KEY as Space secrets.'
    });
  }

  // Drop the honeypot field and anything not expected before inserting.
  const { website, ...payload } = req.body;

  try {
    const { error } = await supabase.from(config.table).insert([payload]);
    if (error) throw error;
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error(`Insert into ${config.table} failed:`, err.message);
    return res.status(500).json({ ok: false, error: 'Could not save your submission. Please try again shortly.' });
  }
});

module.exports = router;
