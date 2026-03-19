import fs from 'fs';
import { MISSION_TEMPLATES } from '../src/lib/mission-templates-seed';

const sqlLines = ['\n-- Insert Seed Data for mission_templates\n'];

for (const m of MISSION_TEMPLATES) {
  const criteriaJson = JSON.stringify(m.criteria).replace(/'/g, "''");
  const title = m.title.replace(/'/g, "''");
  const desc = m.description.replace(/'/g, "''");
  
  const line = `INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('${m.key}', '${m.type}', '${title}', '${desc}', '${m.icon_emoji}', ${m.xp_reward}, ${m.mastery_points_reward}, ${m.target}, '${criteriaJson}'::jsonb, '${m.category}') ON CONFLICT (key) DO NOTHING;`;
  sqlLines.push(line);
}

fs.appendFileSync('supabase/migrations/20260319120000_create_active_missions.sql', sqlLines.join('\n') + '\n');
console.log('Seed SQL appended!');
