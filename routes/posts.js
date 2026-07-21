const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

const ALLOWED_TYPES = ['devotional', 'article', 'testimony', 'episode'];

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return res.status(503).json({ ok: false, error: 'Admin posting is not configured yet on the server.' });
  }
  if (!token || token !== expected) {
    return res.status(401).json({ ok: false, error: 'Wrong admin password.' });
  }
  next();
}

// ---- Public: list posts by type, newest first ----
// GET /api/posts?type=devotional  (or ?type=article)
router.get('/', async (req, res) => {
  const { type } = req.query;
  if (!type || !ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ ok: false, error: 'Provide a valid ?type= (devotional or article).' });
  }
  if (!supabase) {
    return res.status(503).json({ ok: false, error: 'Backend is not yet connected to a database.' });
  }
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, type, title, scripture_ref, body, author, link, published_at')
      .eq('type', String(type))
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return res.json({ ok: true, posts: data || [] });
  } catch (err) {
    console.error('Fetch posts failed:', err.message);
    return res.status(500).json({ ok: false, error: 'Could not load posts right now.' });
  }
});

// ---- Admin: create a post ----
// POST /api/posts   headers: { 'x-admin-token': '...' }
router.post('/', requireAdmin, async (req, res) => {
  const { type, title, body, scripture_ref, published_at, author, link } = req.body;
  if (!type || !ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ ok: false, error: 'type must be "devotional", "article", "testimony", or "episode".' });
  }
  if (!title || !String(title).trim() || !body || !String(body).trim()) {
    return res.status(400).json({ ok: false, error: 'Title and body are required.' });
  }
  if (!supabase) {
    return res.status(503).json({ ok: false, error: 'Backend is not yet connected to a database.' });
  }
  try {
    const payload = {
      type,
      title: String(title).trim(),
      body: String(body).trim(),
      scripture_ref: scripture_ref ? String(scripture_ref).trim() : null
    };
    if (published_at) payload.published_at = published_at;
    if (author && String(author).trim()) payload.author = String(author).trim();
    if (link && String(link).trim()) payload.link = String(link).trim();
    const { data, error } = await supabase.from('posts').insert([payload]).select().single();
    if (error) throw error;
    return res.status(201).json({ ok: true, post: data });
  } catch (err) {
    console.error('Create post failed:', err.message);
    return res.status(500).json({ ok: false, error: 'Could not save the post. Please try again.' });
  }
});

// ---- Admin: delete a post ----
// DELETE /api/posts/:id   headers: { 'x-admin-token': '...' }
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (!supabase) {
    return res.status(503).json({ ok: false, error: 'Backend is not yet connected to a database.' });
  }
  try {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (err) {
    console.error('Delete post failed:', err.message);
    return res.status(500).json({ ok: false, error: 'Could not delete the post.' });
  }
});

module.exports = router;
