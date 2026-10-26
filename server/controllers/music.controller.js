import httpError from "../utils/httpError.js";
import { destroyAudio } from "../utils/cloudinaryCleanup.js";
import { toBool } from "../utils/validate.js";
import { getMusicSettings, updateMusicSettings } from "../models/music.model.js";

// Any upload (even a video) is served as an mp3: Cloudinary converts by file extension
const asMp3 = (url) => url.replace(/\.[a-z0-9]+$/i, ".mp3");

// Public: only what the website player needs, and nothing when music is off
export async function getMusic(req, res) {
  const music = await getMusicSettings();
  const on = music?.enabled && music.music_url;
  res.json({
    success: true,
    data: on ? { url: music.music_url, title: music.title, volume: music.volume, autostart: !!music.autostart } : null,
  });
}

export async function getMusicAdmin(req, res) {
  res.json({ success: true, data: await getMusicSettings() });
}

// multipart/form-data: music (file, optional), remove_music, enabled, title, volume, autostart
export async function updateMusic(req, res) {
  const body = req.body ?? {};
  const current = await getMusicSettings();
  const data = {};

  if (body.title !== undefined) data.title = String(body.title).trim() || null;
  if (body.enabled !== undefined) data.enabled = toBool(body.enabled);
  if (body.autostart !== undefined) data.autostart = toBool(body.autostart);
  if (body.volume !== undefined) {
    const volume = Number(body.volume);
    if (!Number.isInteger(volume) || volume < 5 || volume > 100) throw httpError(400, "Volume must be 5 to 100");
    data.volume = volume;
  }

  if (req.file) {
    data.music_url = asMp3(req.file.path);
    data.music_public_id = req.file.filename;
  } else if (toBool(body.remove_music, false)) {
    data.music_url = null;
    data.music_public_id = null;
  }

  const hasMusic = data.music_url !== undefined ? data.music_url : current?.music_url;
  if ((data.enabled ?? current?.enabled) && !hasMusic) throw httpError(400, "Upload a music file before switching music on");

  const music = await updateMusicSettings(data);
  if (data.music_url !== undefined) await destroyAudio(current?.music_public_id);

  res.json({ success: true, data: music });
}
