const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envLocal.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length) {
    env[key.trim()] = value.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearProcessedEmails() {
  console.log('Clearing processed_email_ids for all users...');
  
  const { data, error } = await supabase
    .from('user_tokens')
    .update({ processed_email_ids: [] })
    .not('user_id', 'is', null);

  if (error) {
    console.error('Error updating records:', error);
  } else {
    console.log('Successfully cleared processed emails.');
  }
}

clearProcessedEmails();
