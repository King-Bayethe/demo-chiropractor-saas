import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
)

const { data, error } = await supabase.functions.invoke('ghl-api', {
  body: { action: 'getAll' },
})

if (error) {
  console.error('Error calling ghl-api:', error)
} else {
  console.log('Success:', data)
}